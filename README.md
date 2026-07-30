# Presentation1 — 3D Cinematic Showcase

A single-page 3D presentation built with **three.js** and **Vite**. Showcases a model with multiple camera views, a procedural 360° panoramic mode, cinematic post-processing FX, synthesized ambient sound, and a screenshot gallery — all with no external audio/image assets required (sky and sound are generated procedurally).

## Features

- **Multiple views** — Orbit, Front, Side, Top, Detail close-up and an auto-rotating Cinematic dolly, with smooth eased camera transitions.
- **Panoramic 360° mode** — first-person look-around inside a procedurally generated night-sky environment (canvas-based equirectangular texture, no HDRI file needed).
- **Post-processing FX** — bloom (`UnrealBloomPass`), chromatic aberration, film grain and vignette via a custom shader pass, plus a toggle-able cinematic letterbox.
- **Sound** — background music (`public/audio/theme.mp3`, "BalloonPlanet — From Memory to Destiny (No Backing Vocals)") plays through the Web Audio graph, layered under a synthesized sub-bass drone; camera-shutter SFX on screenshots and a UI blip on view changes are generated procedurally.
- **Screenshot gallery** — capture the current camera view with a cinematic letterbox + timestamp burned in, browse a filmstrip, and download any shot as a PNG.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL (Vite opens it automatically).

### Windows

Double-click `start.bat` — it installs dependencies on first run and launches the dev server.

## Build

```bash
npm run build
npm run preview
```

Output goes to `dist/`.

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the site with Vite and publishes `dist/` to GitHub Pages on every push to `main`. Enable Pages once in the repo settings (Settings → Pages → Source: **GitHub Actions**) and it deploys automatically after that.

## About the 3D model

`public/model/scene.gltf` is a Sketchfab sample model ("(FREE) Merc Hovercar" by Karol Miklas, CC-BY-SA-4.0). Its binary geometry buffer (`scene.bin`) was not present in the source folder, so the app automatically falls back to a procedurally generated placeholder showcase mesh if the GLTF fails to load. Drop a valid `scene.bin` next to `scene.gltf` to display the real model instead.

## Tech stack

- [three.js](https://threejs.org/) (r169) — WebGL rendering, `EffectComposer` post-processing, `OrbitControls`, `GLTFLoader`
- [Vite](https://vitejs.dev/) — dev server & build
- Vanilla JS, no framework
