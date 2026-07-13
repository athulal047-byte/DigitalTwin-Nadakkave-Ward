# Digital Twin Dashboard (React UI)

This directory contains the source code for the presentation layer overlay. I engineered this dashboard specifically to run embedded inside an Unreal Engine 5 Web Browser Widget, providing an immersive, Heads-Up Display (HUD) experience for the digital twin.

## Core Stack
*   **Framework:** React 19 + TypeScript
*   **Styling:** Tailwind CSS v4 (utilizing heavy glass-morphism and strict contrast ratios)
*   **Build Tool:** Vite

## Architectural Role
This dashboard never speaks directly to the PostgreSQL database. It relies entirely on firing asynchronous GET/POST requests to the Node.js API middleware located in the `backend/` folder. 

When a user in Unreal Engine executes a `LineTraceByChannel` raycast and clicks on a building, the engine captures that unique building ID and passes it to this React application. The dashboard immediately fires a request to the backend, pulls the live municipal statistics for that structure, and renders a floating data panel directly over the 3D environment.

## Design Philosophy
To ensure the 3D environment remains the primary focal point:
1.  **No Global Scrolling:** Page-level scrolling is strictly disabled. The core layout relies on a fixed `w-screen h-screen overflow-hidden` canvas to act as a static window.
2.  **Unobstructed Center:** The center of the screen is permanently empty and set to `pointer-events-none`. All heavy tabular data and navigation panels are pinned to the absolute left and right columns, allowing the user to seamlessly navigate the 3D camera without accidentally interacting with the DOM.
3.  **High-Contrast Glass UI:** To guarantee WCAG 4.5:1 text legibility against dynamic 3D backgrounds (like bright skies or dark shadows), the panels utilize heavily tinted `.glass-panel` backgrounds with intense `backdrop-blur-2xl`.

## Local Development
To test the UI outside of Unreal Engine:
1. Ensure the Node.js backend is running.
2. Run `npm install`
3. Run `npm run dev`
4. The dashboard will mock the UE5 data injection for standalone testing.
