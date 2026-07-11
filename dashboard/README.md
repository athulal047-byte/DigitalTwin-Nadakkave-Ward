# React Dashboard UI

This directory contains the Vite/React application that serves as the interactive data panel within the Unreal Engine environment.

## Architecture
- Built with **React 18** and **TypeScript** for type safety.
- Bundled via **Vite** for incredibly fast HMR and optimized production builds.
- Designed to run within the Chromium-based embedded browser of UE5.

## Integration
When a user clicks a building in UE5, the Blueprint fires an event that calls a JavaScript function exposed in this React app, passing the building's semantic metadata (category, floor count) to be rendered on screen.

## Build Instructions
```bash
npm install
npm run build
```
*Note: Ensure you build this project before launching the UE5 environment so the widget has compiled HTML/JS to load.*
