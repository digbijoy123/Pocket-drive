# Pocket Drive 3D

A lightweight, stylized browser-based driving simulator MVP.

## Features
- Three.js 3D scene with a curving road, low-poly trees, hills, clouds, and a stylized car
- Arcade acceleration, braking, steering, and off-road slowdown
- Keyboard controls (WASD / arrows, Space to brake, R to reset)
- Mobile touch steering, gas, and brake buttons
- Responsive HUD, pause, reset, and start screen
- Static-site friendly; no backend or build step

## Run locally
Because the app uses JavaScript ES modules, serve this folder over HTTP rather than opening `index.html` directly.

For example, with Python installed:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Deploy free on Vercel
1. Create a GitHub repository and upload `index.html` (and this README).
2. In Vercel, import the repository.
3. Choose **Other** as framework preset if prompted.
4. Leave build command blank and output directory as `.`.
5. Deploy.

The Three.js library is loaded from jsDelivr CDN, so the first load requires an internet connection.

## Current MVP limitations
- Arcade driving model, not a full rigid-body vehicle simulation
- The road scenery is intentionally lightweight and mostly decorative
- No traffic, missions, persistent save data, or multiplayer yet
- Please test on target devices; mobile GPU performance varies
