"""
MarbleOS Backend — FastAPI proxy to the SHARP Gradio app running on port 7860.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import logging
import shutil
import traceback
import uuid
from pathlib import Path

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from gradio_client import Client, handle_file

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("marbleos")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
GRADIO_URL = "http://localhost:7860"
WORLDGEN_URL = "http://localhost:7861"
WORLDGEN_TIMEOUT_S = 600.0  # first request also pays ~10s model load

UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"
OUTPUTS_DIR = Path(__file__).resolve().parent / "outputs"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="MarbleOS API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3080",
        "http://localhost:3090",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated .ply / .mp4 files
app.mount("/files", StaticFiles(directory=str(OUTPUTS_DIR)), name="files")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/health")
async def health():
    sharp_ok = False
    worldgen_ok = False
    try:
        client = Client(GRADIO_URL)
        _ = client.view_api(print_info=False)
        sharp_ok = True
    except Exception:
        pass
    try:
        async with httpx.AsyncClient(timeout=5.0) as hc:
            r = await hc.get(f"{WORLDGEN_URL}/health")
            worldgen_ok = r.status_code == 200
    except Exception:
        pass
    return {
        "status": "ok" if sharp_ok else "degraded",
        "gradio_connected": sharp_ok,
        "worldgen_connected": worldgen_ok,
    }


async def _generate_worldgen(
    upload_path: Path, upload_id: str, ext: str, prompt: str, pano: str = "auto"
) -> JSONResponse:
    """Route a generation to the WorldGen service (engine #2, 360° worlds)."""
    logger.info("[worldgen] Sending %s to %s ...", upload_path, WORLDGEN_URL)
    async with httpx.AsyncClient(timeout=WORLDGEN_TIMEOUT_S) as hc:
        with open(upload_path, "rb") as f:
            resp = await hc.post(
                f"{WORLDGEN_URL}/generate",
                files={"image": (upload_path.name, f)},
                data={"prompt": prompt, "pano": pano},
            )
    if resp.status_code != 200:
        detail = resp.text[:500]
        logger.error("[worldgen] Service error %s: %s", resp.status_code, detail)
        raise HTTPException(status_code=502, detail=f"WorldGen service: {detail}")

    payload = resp.json()
    ply_source = Path(payload["ply_path"])
    if not ply_source.exists():
        raise HTTPException(
            status_code=500,
            detail=f"WorldGen reported output at {ply_source} but file is missing",
        )

    ply_filename = f"{upload_id}.ply"
    shutil.copy2(ply_source, OUTPUTS_DIR / ply_filename)

    thumbnail_filename = f"{upload_id}{ext}"
    shutil.copy2(upload_path, OUTPUTS_DIR / thumbnail_filename)

    logger.info(
        "[worldgen] Done in %ss — %s", payload.get("elapsed_seconds"), ply_filename
    )
    return JSONResponse(
        {
            "id": upload_id,
            "engine": "worldgen",
            "ply_url": f"http://localhost:8000/files/{ply_filename}",
            "ply_filename": ply_filename,
            "video_url": None,
            "thumbnail_url": f"http://localhost:8000/files/{thumbnail_filename}",
        }
    )


@app.post("/api/generate")
async def generate(
    image: UploadFile = File(...),
    engine: str = "sharp",
    prompt: str = "",
    pano: str = "auto",
    render_video: bool = True,
    trajectory_type: str = "rotate_forward",
    num_frames: int = 60,
    fps: int = 30,
    output_resolution: int = 0,
):
    if engine not in ("sharp", "worldgen"):
        raise HTTPException(
            status_code=400,
            detail=f"Unknown engine: {engine}. Allowed: sharp, worldgen",
        )

    ext = Path(image.filename or "upload.png").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    upload_id = uuid.uuid4().hex[:12]
    upload_path = UPLOADS_DIR / f"{upload_id}{ext}"

    try:
        content = await image.read()
        upload_path.write_bytes(content)
        logger.info(
            "[1/5] Saved upload: %s (%d bytes)", upload_path, len(content)
        )

        if engine == "worldgen":
            return await _generate_worldgen(upload_path, upload_id, ext, prompt, pano)

        # Call the Gradio app's run_sharp function
        # Inputs: [image_in, trajectory, output_res, frames, fps_in, render_toggle]
        # Outputs: [video_out, ply_download, status_md]
        logger.info("[2/5] Connecting to Gradio at %s ...", GRADIO_URL)
        client = Client(GRADIO_URL)

        logger.info(
            "[3/5] Calling /run_sharp — trajectory=%s, resolution=%s, "
            "frames=%s, fps=%s, render_video=%s",
            trajectory_type,
            output_resolution,
            num_frames,
            fps,
            render_video,
        )
        result = client.predict(
            image_path=handle_file(str(upload_path)),
            trajectory_type=trajectory_type,
            output_long_side=output_resolution,
            num_frames=num_frames,
            fps=fps,
            render_video=render_video,
            api_name="/run_sharp",
        )
        logger.info("[3/5] Gradio returned: %s", repr(result))

        # result is a tuple: (video_path, ply_file_info, status_markdown)
        video_result = result[0]
        ply_result = result[1]
        status_msg = result[2]

        logger.info(
            "[4/5] Parsing results — video_result=%s (type=%s), "
            "ply_result=%s (type=%s), status=%s",
            video_result,
            type(video_result).__name__,
            ply_result,
            type(ply_result).__name__,
            status_msg,
        )

        # Check for error in status
        if "Error" in str(status_msg):
            logger.error("Gradio reported error: %s", status_msg)
            raise HTTPException(status_code=500, detail=str(status_msg))

        # The ply_result may be a string path, a dict with 'value', or other
        ply_source_path: str | None = None
        if isinstance(ply_result, str):
            ply_source_path = ply_result
        elif isinstance(ply_result, dict):
            # Gradio DownloadButton returns dict like {"value": "/path/to/file", ...}
            ply_source_path = ply_result.get("value") or ply_result.get("path")
            logger.info("ply_result is dict, extracted path: %s", ply_source_path)
        elif isinstance(ply_result, (list, tuple)) and len(ply_result) > 0:
            ply_source_path = str(ply_result[0])
            logger.info("ply_result is list/tuple, using first element: %s", ply_source_path)

        # Copy .ply file to our outputs directory
        ply_url = None
        ply_filename = None
        thumbnail_url = None

        if ply_source_path:
            ply_source = Path(ply_source_path)
            logger.info(
                "PLY source: %s — exists=%s", ply_source, ply_source.exists()
            )
            if ply_source.exists():
                ply_filename = f"{upload_id}.ply"
                ply_dest = OUTPUTS_DIR / ply_filename
                shutil.copy2(ply_source, ply_dest)
                ply_url = f"http://localhost:8000/files/{ply_filename}"
                logger.info("Copied PLY to %s", ply_dest)

                # Persist source image alongside the .ply so the gallery can use
                # it as a thumbnail. The stem is the same as the .ply file so the
                # mapping is purely filename-based (no separate DB needed).
                thumbnail_filename = f"{upload_id}{ext}"
                thumbnail_dest = OUTPUTS_DIR / thumbnail_filename
                shutil.copy2(upload_path, thumbnail_dest)
                thumbnail_url = f"http://localhost:8000/files/{thumbnail_filename}"
                logger.info("Copied thumbnail to %s", thumbnail_dest)
        else:
            logger.warning("Could not extract PLY path from result")

        # Copy video file if available
        video_url = None
        video_source_path: str | None = None
        if isinstance(video_result, str):
            video_source_path = video_result
        elif isinstance(video_result, dict):
            video_source_path = video_result.get("value") or video_result.get("video", {}).get("path") if isinstance(video_result, dict) else None

        if video_source_path:
            video_source = Path(video_source_path)
            if video_source.exists():
                video_filename = f"{upload_id}.mp4"
                video_dest = OUTPUTS_DIR / video_filename
                shutil.copy2(video_source, video_dest)
                video_url = f"http://localhost:8000/files/{video_filename}"
                logger.info("Copied video to %s", video_dest)

        if not ply_url:
            logger.error(
                "No PLY file produced. Full Gradio result: %s", repr(result)
            )
            raise HTTPException(
                status_code=500,
                detail="Generation failed: no .ply file produced",
            )

        logger.info("[5/5] Success — ply_url=%s, video_url=%s, thumbnail_url=%s", ply_url, video_url, thumbnail_url)
        return JSONResponse(
            {
                "id": upload_id,
                "ply_url": ply_url,
                "ply_filename": ply_filename,
                "video_url": video_url,
                "thumbnail_url": thumbnail_url,
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unhandled error in /api/generate:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        upload_path.unlink(missing_ok=True)


@app.get("/api/gallery")
async def gallery():
    items = []
    for ply in sorted(
        OUTPUTS_DIR.glob("*.ply"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    ):
        # Resolve thumbnail by finding a same-stem image file in outputs/.
        # e.g. abc123.ply → abc123.jpg (or .png, .webp, .jpeg)
        thumbnail_url = None
        for img_ext in IMAGE_EXTENSIONS:
            candidate = OUTPUTS_DIR / f"{ply.stem}{img_ext}"
            if candidate.exists():
                thumbnail_url = f"http://localhost:8000/files/{candidate.name}"
                break

        video_url = None
        video_candidate = OUTPUTS_DIR / f"{ply.stem}.mp4"
        if video_candidate.exists():
            video_url = f"http://localhost:8000/files/{video_candidate.name}"

        items.append(
            {
                "id": ply.stem,
                "ply_url": f"http://localhost:8000/files/{ply.name}",
                "ply_filename": ply.name,
                "created_at": ply.stat().st_mtime,
                "thumbnail_url": thumbnail_url,
                "video_url": video_url,
            }
        )
    return {"items": items}


@app.get("/api/worlds")
async def worlds():
    """Return all generated worlds that have both a .mp4 preview and a .ply file."""
    items = []
    for mp4 in sorted(
        OUTPUTS_DIR.glob("*.mp4"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    ):
        ply = OUTPUTS_DIR / f"{mp4.stem}.ply"
        if not ply.exists():
            continue

        thumbnail_url = None
        for img_ext in IMAGE_EXTENSIONS:
            candidate = OUTPUTS_DIR / f"{mp4.stem}{img_ext}"
            if candidate.exists():
                thumbnail_url = f"http://localhost:8000/files/{candidate.name}"
                break

        items.append(
            {
                "id": mp4.stem,
                "ply_url": f"http://localhost:8000/files/{ply.name}",
                "video_url": f"http://localhost:8000/files/{mp4.name}",
                "thumbnail_url": thumbnail_url,
                "created_at": mp4.stat().st_mtime,
            }
        )
    return {"items": items}
