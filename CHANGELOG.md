# Changelog

All notable changes to the Nadakkavu Ward Digital Twin project will be documented in this file. 

## [1.0.0] - Summer Internship Release
### Added
*   **Procedural 3D Workflow:** Automated Blender (`bpy`) script that successfully extrudes flat polygons into 3D buildings by dynamically pulling a 3.5m-multiplied height attribute straight from ArcGIS Pro Shapefiles.
*   **Decoupled Architecture:** Strict separation between the Unreal Engine 5 rendering thread and the PostgreSQL database to ensure absolute system stability.
*   **Node.js API Middleware:** Express server handling all database queries to protect PostGIS credentials from exposing within the UE5 client binary.
*   **React Dashboard Overlay:** A Chromium-based HUD embedded directly into UE5, utilizing `LineTraceByChannel` raycasting to pull real-time building statistics from the backend.
*   **113-Table Database Schema:** Fully relational PostgreSQL schema utilizing the PostGIS extension to handle 5 distinct municipal domains (Asset Registry, Work Orders, Citizen Portal, Administration, and Digital Twin Operations).

### Removed
*   **OSM & Deep Learning Models:** Completely scrapped initial crowdsourced data approaches due to massive topological errors, pivoting successfully to the authoritative Official Town Planner dataset.

### Security
*   **JWT Implementation:** Hardened the API routes with HttpOnly cookies and Role-Based Access Control (RBAC) to ensure unauthenticated users cannot manipulate municipal records.
