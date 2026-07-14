"""Standalone WorldGen image-to-scene test.

Usage:
    source /media/Storage/OpenMarble/.env.storage
    .venv/bin/python test_i2s.py <input_image> [output.ply]

Requires the gated HF repos to be accepted on the logged-in account:
    https://huggingface.co/black-forest-labs/FLUX.1-dev
    https://huggingface.co/black-forest-labs/FLUX.1-Fill-dev
"""
import sys
import time

import torch
from PIL import Image

from worldgen import WorldGen

image_path = sys.argv[1]
out_path = sys.argv[2] if len(sys.argv) > 2 else "test_world.ply"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"device: {device}")

t0 = time.time()
wg = WorldGen(mode="i2s", device=device)  # low_vram auto-enables (<24GB)
print(f"models loaded in {time.time() - t0:.1f}s")

image = Image.open(image_path).convert("RGB")
t0 = time.time()
splat = wg.generate_world(image=image)
print(f"generated in {time.time() - t0:.1f}s")

splat.save(out_path)
print(f"saved: {out_path}")
