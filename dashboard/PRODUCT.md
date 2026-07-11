# Product

## Register

product

## Users

Four roles share equal importance in the current phase: system administrators, municipal administrators, department officers, and public users. The application serves as a spatial overlay within a UE5 visualization. The interface balances spatial exploration with the intense data density required by municipal officers, avoiding both the trap of "too simple to be useful" and "too cluttered to see the city."

## Product Purpose

Nadakkavu Digital Twin Platform is a UE5-integrated Digital Twin platform for Kozhikode Municipal Corporation. The Unreal Engine 5 city visualization is the primary experience, while the React application runs inside a UE5 Web Browser Widget as a true spatial UI overlay. The UI projects data panels directly onto the 3D world, maintaining contextual linkage between infrastructure data and physical locations without obscuring the environment.

## Brand Personality

High-end spatial data instrument. It blends the elegance of spatial computing (smooth motion, translucent glass, rounded forms) with the uncompromising utility of a municipal command center (legible data, dense tables, clear navigation). It feels like a premium HUD built for serious work, prioritizing function while retaining a polished, modern aesthetic.

## Anti-references

- **Dribbble Reality Distortion** — hyper-minimalist "Apple Vision Pro" concepts that rely on illegible white translucent panels over bright backgrounds and hide features behind unlabelled icons.
- **Traditional Pinned HUDs** — pinning all panels to the absolute left/right edges of the screen, breaking the connection to the 3D world.
- **Opaque Context Switches** — "Focus modes" that cover the entire screen and completely block the 3D city to show a table.
- **Legacy Command Centers** — neon overload, aggressive borders, or dark terminal looks.

## Design Principles

1. **True Spatial Anchoring** — Data panels related to physical objects should float near those objects in screen-space, derived from world-space coordinates, not pinned to the right edge of the screen.
2. **Contrast Above Aesthetics** — "Glass" must be heavily tinted (dark backplates) with aggressive edge lighting to guarantee WCAG 4.5:1 text legibility against any 3D background (sky or shadows).
3. **Recognition Over Recall** — Navigation must include text labels. Icons alone are insufficient for navigating 16 complex municipal domains.
4. **Fluid Coexistence** — Heavy tabular data lives in resizable, draggable floating windows, allowing users to analyze tables *while* viewing the 3D city, rather than switching contexts entirely.
5. **Non-Blocking Architecture** — The center of the screen must remain transparent and strictly `pointer-events-none` to allow unobstructed 3D camera controls.

## Accessibility & Inclusion

Guaranteed high legibility against dynamic 3D backgrounds through dark, heavily blurred backplates and pure white text. Navigation is explicitly labeled. Ensure smooth animations respect `prefers-reduced-motion` settings where applicable.
