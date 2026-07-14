"""
WorldGen inference service — engine #2 for OpenMarble.

Wraps the WorldGen image-to-scene pipeline in a small FastAPI app, mirroring
the role the SHARP Gradio app (:7860) plays for engine #1. The model is loaded
lazily on the first request and kept resident afterwards (load ≈ 10 s, VRAM is
managed by nunchaku int4 + CPU offload). A lock serializes generations — one
GPU, one job at a time.

Run with:
    source /media/Storage/OpenMarble/.env.storage
    .venv/bin/uvicorn serve:app --host 0.0.0.0 --port 7861
"""

from __future__ import annotations

import gc
import io
import logging
import os
import threading
import time
import uuid
from pathlib import Path

# Must be set before torch initialises CUDA. The pipeline peaks near the full
# 16 GB card; expandable segments avoid fragmentation-induced OOMs.
os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")

import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worldgen-serve")

OUTPUTS_DIR = Path(__file__).resolve().parent / "outputs"
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# The pipeline works on a 1024x2048 panorama internally; anything much larger
# than this on input only inflates depth/ray tensors until the GPU OOMs.
MAX_INPUT_SIDE = 2048
MAX_PANO_WIDTH = 4096  # equirectangular input (2:1) is used more directly

# Aspect-ratio tolerance for treating an upload as an equirectangular pano.
PANO_RATIO_TOLERANCE = 0.02

app = FastAPI(title="WorldGen Service", version="0.1.0")

_lock = threading.Lock()
_model = None


def get_model():
    global _model
    if _model is None:
        from worldgen import WorldGen

        logger.info("Loading WorldGen (mode=i2s) ...")
        t0 = time.time()
        _model = WorldGen(mode="i2s", device=torch.device("cuda"))
        logger.info("WorldGen loaded in %.1fs", time.time() - t0)
    return _model


@app.get("/health")
def health():
    return {
        "status": "ok",
        "cuda_available": torch.cuda.is_available(),
        "model_loaded": _model is not None,
    }


@app.post("/generate")
async def generate(
    image: UploadFile = File(...),
    prompt: str = Form(""),
    pano: str = Form("auto"),
):
    """Generate a splat world.

    `pano` — "auto" (default): treat 2:1-aspect uploads as equirectangular
    panoramas; "true": force pano path; "false": always run image-to-scene.
    The pano path feeds the image straight to depth+splatting, skipping the
    FLUX panorama diffusion — much faster, and the whole 360° comes from the
    upload instead of being hallucinated.
    """
    if pano not in ("auto", "true", "false"):
        raise HTTPException(status_code=400, detail="pano must be auto|true|false")

    data = await image.read()
    try:
        pil_image = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    ratio = pil_image.width / pil_image.height
    is_pano = pano == "true" or (
        pano == "auto" and abs(ratio - 2.0) <= 2.0 * PANO_RATIO_TOLERANCE
    )

    if is_pano:
        if abs(ratio - 2.0) > 2.0 * PANO_RATIO_TOLERANCE:
            raise HTTPException(
                status_code=400,
                detail=f"Equirectangular input must have 2:1 aspect ratio, got {ratio:.3f}:1",
            )
        if pil_image.width > MAX_PANO_WIDTH:
            new_size = (MAX_PANO_WIDTH, MAX_PANO_WIDTH // 2)
            logger.info("Downscaling pano %dx%d → %dx%d",
                        pil_image.width, pil_image.height, *new_size)
            pil_image = pil_image.resize(new_size, Image.LANCZOS)
    elif max(pil_image.size) > MAX_INPUT_SIDE:
        scale = MAX_INPUT_SIDE / max(pil_image.size)
        new_size = (round(pil_image.width * scale), round(pil_image.height * scale))
        logger.info("Downscaling input %dx%d → %dx%d",
                    pil_image.width, pil_image.height, *new_size)
        pil_image = pil_image.resize(new_size, Image.LANCZOS)

    job_id = uuid.uuid4().hex[:12]
    out_path = OUTPUTS_DIR / f"{job_id}.ply"

    with _lock:
        model = get_model()
        logger.info("[%s] generating (input %dx%d, pano=%s, prompt=%r)",
                    job_id, pil_image.width, pil_image.height, is_pano, prompt[:80])
        t0 = time.time()
        try:
            if is_pano:
                splat = model._generate_world(pano_image=pil_image)
            else:
                splat = model.generate_world(prompt=prompt, image=pil_image)
            splat.save(str(out_path))
        except Exception:
            logger.exception("[%s] generation failed", job_id)
            raise HTTPException(status_code=500, detail="WorldGen generation failed")
        finally:
            # Release per-job tensors and the caching allocator's slack so a
            # failed or oversized job can't starve the next one (or SHARP).
            gc.collect()
            torch.cuda.empty_cache()
        elapsed = time.time() - t0

    logger.info("[%s] done in %.1fs → %s (%.1f MB)",
                job_id, elapsed, out_path, out_path.stat().st_size / 2**20)
    return {
        "id": job_id,
        "ply_path": str(out_path),
        "elapsed_seconds": round(elapsed, 1),
        "pano": is_pano,
    }
