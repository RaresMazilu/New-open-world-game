# New Open World Game (Unity scaffold)

This repository now contains a web-based 3D driving prototype inspired by open-world racers (Forza Horizon-like) with a summer vibe.

Key choices
- Stack: Three.js (vanilla ES modules), GLTF loader for region assets
- Target: Web (desktop browsers)
- Prototype features: simple kinematic vehicle controller, third-person chase camera, large warm ground, road strip, and scattered summer trees

What's included
- `index.html` — entry page
- `src/main.js` — driving prototype, scene setup, camera follow
- `src/vehicle.js` — kinematic Vehicle class (box car)
- `src/worldstreamer.js` — GLTF region load/unload placeholder
- `src/storyManager.js` — basic quest manager

How to run locally
1. Serve the folder on a local HTTP server. Example:
```bash
npx http-server -c-1 . -p 8080
```
2. Open http://localhost:8080 in a modern desktop browser.

Notes & next steps
- This prototype uses a simple kinematic model; for realistic driving, integrate a physics engine (Cannon.js / ammo.js) and proper wheel constraints.
- I can add a free car GLTF model, racing HUD, road network, AI traffic, weather cycles, and audio (engine / ambience).

Tell me which feature to add next: improved physics, AI traffic, map/regions, or visuals (skybox, post-processing, particles). 
