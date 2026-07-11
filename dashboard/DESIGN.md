# Digital Twin Dashboard Design System

This document outlines the exact architectural and design specifications of the current Kozhikode Municipal Digital Twin frontend.

## 1. System Architecture
The application is a React-based frontend designed to act as an immersive Heads-Up Display (HUD) overlaying a real-time 3D visualization engine (e.g., Mapbox, Three.js, or Unreal). 
- **Data Flow:** REST APIs (`services/api`) populate the database-driven UI tables and KPIs.
- **Real-Time Engine Sync:** A Socket.IO connection (`services/socket`) serves as the bridge between the React UI and the 3D engine. 
  - Emitting `dashboard:fly_to` commands the 3D engine to move the camera.
  - Listening to `dashboard:show_building` enables the 3D engine to command the React UI to open an info panel.

## 2. Global Layout & Scrolling Architecture
The application abandons traditional "web page" scrolling to maintain full 3D immersion.
- **Fixed Canvas:** Page-level scrolling (`body`) is strictly disabled. The core layout `w-screen h-screen overflow-hidden` creates a static window.
- **Isolated Component Scrolling:** Overflowing content is handled strictly inside internal component wrappers using `overflow-y-auto no-scrollbar`. This ensures the user can scroll a list of roads without shifting the entire HUD.
- **Split-HUD Dashboard:** The main Dashboard acts as a framing mechanism. It features an absolute Left Column (`left-32 w-[420px]`) and an absolute Right Column (`right-6 w-[420px]`). The center of the screen is permanently empty, preserving visibility of the underlying 3D twin.

## 3. Component Behavior
- **Sidebar:** A vertical `w-[72px]` navigation bar pinned to the left edge. It routes to 16 specialized operational modules. Active modules feature a glowing gradient background (`var(--accent-glow)`).
- **Topbar:** Pinned to the top edge (`h-16`). It displays real-time global aggregates (Total Buildings, Total Roads, Active Sensors), API system status via a pulsing indicator, and a User Profile dropdown.
- **User Roles:** The profile system supports role-switching to demonstrate access controls:
  - System Administrator (Full Management Access)
  - Department User (Admin Tools)
  - Public User (Citizen View)
- **Overlay Panels (Modules):** Sub-modules (like Roads or Water) do not take over the screen. They render as floating panels pinned next to the sidebar (`absolute top-24 left-32 bottom-24 w-[420px]`), allowing the 3D map to remain the primary focal point.

## 4. Glass UI Design Language
The UI relies heavily on a "Dark Glass" aesthetic to feel like a high-tech command center.
- **Surface:** `.glass-panel` utilities apply `rgba(15, 18, 25, 0.75)` backgrounds paired with intense `backdrop-blur-2xl`.
- **Depth:** Cards achieve depth through a dual-shadow system: an aggressive outer drop shadow (`0 25px 50px -12px rgba(0,0,0,0.7)`) and a subtle inner white stroke (`inset 0 1px 0 rgba(255,255,255,0.1)`).
- **Accents:** A deep violet/indigo primary accent (`#5b21b6`) provides glowing hover states.

## 5. Universal KPI Card System
KPIs are handled by a single, strictly typed global component (`src/components/KPI.tsx`) designed to prevent UI breakage within extremely tight layouts (e.g., 86px wide cards in a 4-column grid).
- **Top-and-Bottom Anchoring:** The Flexbox layout utilizes `flex-1 justify-start` for the label and `justify-end shrink-0` for the value. This geometrically guarantees that all labels sit on a perfectly flat top edge, and all values sit on a perfectly flat bottom baseline, solving all vertical misalignment.
- **Anti-Clipping Typography:** Truncation and ellipses (`...`) are strictly forbidden. 
  - Labels use `text-balance leading-tight` and `break-words` with a tightened letter spacing (`0.02em`) to naturally wrap multi-word or extremely long single-word labels (e.g., "CONNECTIONS").
  - Values utilize CSS Container Queries and fluid typography `clamp(0.75rem, 20cqw, 1.75rem)` to natively shrink massive numbers (e.g., "46.99 km") to perfectly fit the card width without overlapping edges.

## 6. Interaction Workflow (Buildings/Roads)
When an operator interacts with the digital twin, a synchronized workflow triggers:
1. **User Action:** The user clicks a row in the DataGrid or a list item in the panel.
2. **State Update:** The React component sets the `selected` state (e.g., `setSelected(bldg.bldg_id)`).
3. **Engine Command:** The component emits `socket.emit('dashboard:fly_to', bldg.bldg_id)`.
4. **UI Response:** An `<InfoPanel />` slides into view, fetching and displaying deep metrics about that specific asset while the 3D camera simultaneously flies to its physical coordinate.
