# OpenMarble

> *Imagining a World* — a spatial computing interface for turning images into explorable 3D worlds.

![How To Frame It for Maximum Impact](frontend/public/chatgpt-moment.png)

## Vision

OpenMarble is an experiment in what a personal spatial OS might look like if it were built around generative 3D. Upload a photo, and OpenMarble reconstructs it as a navigable Gaussian Splat — viewable, shareable, and editable right in the browser. The interface takes its aesthetic cues from visionOS: glassmorphism, depth, spring animations, and a window-based app model.

The goal is to make 3D scene generation feel as natural as taking a photo.

## Architecture

The project is organized into three layers:

```
frontend/       Next.js 16 — VisionOS-style shell + OpenMarble app
backend/        FastAPI — wraps Apple SHARP for inference
supersplat/     Gaussian Splat editor (embedded via iframe)
```

**Frontend** (`localhost:3080`) — a Next.js app built on the `vision-ui` template. The home grid launches individual apps; OpenMarble lives at `/openmarble` with Create and Gallery tabs. State is managed with Jotai atoms (`lib/marble-atoms.ts`). UI components follow the VisionOS design system: `Material`, `Ornament`, `Stack`, spring-based motion.

**Backend** (`localhost:8000`) — a FastAPI server (`backend/main.py`) that accepts an image, runs it through Apple's SHARP model, and returns a `.ply` Gaussian Splat file and a preview `.mp4`. The SHARP model lives in `Apple-Sharp-Image-to-3D-View-Synthesis/` and is imported via `sys.path` without code duplication.

**SuperSplat** (`localhost:3090`) — an open-source Gaussian Splat editor embedded as an iframe. Receives the generated `.ply` via a `?load=<url>` query parameter for in-browser 3D inspection.

### Data flow

```
User uploads image
  → POST /api/generate (FastAPI)
  → Apple SHARP model → .ply + .mp4
  → SuperSplat iframe loads .ply via URL
  → Gallery tab stores and lists past generations
```

## Running locally

```bash
# Frontend
cd frontend && npm install && npm run dev        # :3080

# Backend
cd backend && uvicorn main:app --reload          # :8000

# SuperSplat (separate repo)
cd ../supersplat && npm install && npm run dev   # :3090
```

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See [`frontend/LICENSE.md`](frontend/LICENSE.md) for the full text.

In short: you are free to use, modify, and distribute this software, but any modified version deployed over a network must also make its source code available under the same license.

## Acknowledgements

- **[vision-ui](https://github.com/ibelick/vision-ui)** — the visionOS-inspired React component system and app shell that forms the frontend foundation.
- **[Apple SHARP](https://github.com/apple/ml-vision-view-synthesis)** — *Spatial High-fidelity Adaptive Rendering Pipeline*, Apple's model for single-image 3D Gaussian Splat reconstruction.
- **[SuperSplat](https://github.com/playcanvas/supersplat)** — the open-source Gaussian Splat editor by PlayCanvas, embedded for in-browser 3D viewing and editing.
