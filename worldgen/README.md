# WorldGen — engine #2

This directory holds the OpenMarble-side pieces of the [WorldGen](https://github.com/ZiYang-xie/WorldGen)
integration. WorldGen itself is a separate checkout (Apache-2.0) — these files are copied into /
applied onto it.

| File | Purpose |
|---|---|
| `serve.py` | FastAPI wrapper exposing WorldGen on **:7861** (`POST /generate`, `GET /health`). Copy to the WorldGen checkout root. Lazy model load, one job at a time, input downscaling, VRAM cleanup per job, equirectangular (2:1) auto-detection. |
| `test_i2s.py` | Standalone smoke test: `python test_i2s.py <image> [out.ply]`. |
| `0001-worldgen-fixes.patch` | **Required.** Fixes four upstream bugs (as of upstream `main`, July 2026): (1) `batch_nearest_dot` materialises a ~48 GiB similarity matrix — chunked to ≤2 GiB; (2) **`pred_depth` returns 360° pano rays for perspective inputs** (regression from the UniK3D→DA-2 migration) — the input smears over the whole sphere and every "world" degenerates into the same blob; replaced with pinhole rays (assumed 65° HFOV); (3) depth normalised by raw max — outliers crush the scene into a tiny ball; now p99-based; (4) saved `.ply` breaks standard viewers — `log(0)` pole scales and linear opacity where the format expects logit. |

## Setup (summary)

```bash
git clone --recursive https://github.com/ZiYang-xie/WorldGen.git
cd WorldGen
git apply path/to/0001-worldgen-fixes.patch
uv venv .venv --python 3.11          # 3.11 required: nunchaku wheel is cp311 + torch 2.7
uv pip install -p .venv/bin/python torch==2.7.0 torchvision==0.22.0
uv pip install -p .venv/bin/python .
# Pin the diffusion stack to the versions upstream was written against —
# newer diffusers/transformers silently break the custom FLUX pano pipelines:
uv pip install -p .venv/bin/python "diffusers==0.33.1" "transformers==4.48.3" "peft==0.7.1" "xformers==0.0.30" "einops==0.7.0"
uv pip install -p .venv/bin/python "git+https://github.com/EnVision-Research/DA-2.git#subdirectory=src" --no-deps
uv pip install -p .venv/bin/python -e submodules/ml-sharp
FORCE_CUDA=0 uv pip install -p .venv/bin/python "git+https://github.com/facebookresearch/pytorch3d.git" --no-build-isolation
uv pip install -p .venv/bin/python fastapi "uvicorn[standard]" python-multipart
cp path/to/serve.py .

# Gated models — accept licenses once on your HF account:
#   https://huggingface.co/black-forest-labs/FLUX.1-dev
#   https://huggingface.co/black-forest-labs/FLUX.1-Fill-dev

.venv/bin/uvicorn serve:app --host 0.0.0.0 --port 7861
```

The backend (`backend/main.py`) reaches this service via `WORLDGEN_URL` (default `http://localhost:7861`).

Note: FLUX.1-dev weights are under the Black Forest Labs non-commercial license; WorldGen code is Apache-2.0.
