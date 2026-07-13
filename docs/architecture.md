# Decoupled System Architecture

Directly connecting a 3D game engine to an enterprise database is a terrible architectural pattern. It freezes the main rendering thread while waiting for network responses, and it exposes secure database credentials directly inside the client binary. 

To completely avoid this, I designed the Nadakkavu Ward Digital Twin using a strict, decoupled three-tier architecture. 

## 1. Presentation Layer (Unreal Engine 5 & React)
This layer handles all the visuals and user interactions. I split it into two specialized components:
*   **Unreal Engine 5 (3D Client):** UE5 handles the heavy lifting—pushing high-poly meshes, calculating physically accurate Lumen lighting, and running collision detection. 
*   **React Dashboard (UI Client):** I embedded a Chromium-based Web Browser Widget directly into the UE5 viewport. I built the actual dashboard using React 19, TypeScript, and Tailwind CSS v4. When a user fires a `LineTraceByChannel` raycast at a building in the 3D world, UE5 grabs the building's unique ID and passes it to the React app. The React app then dynamically updates the UI to show that specific building's municipal data.

## 2. Application Layer (Node.js API)
To keep the database secure, the React Dashboard never talks to PostgreSQL directly. Instead, it fires HTTP REST requests to my backend middleware.
*   **Express Server:** A lightweight Node.js API that acts as the absolute gatekeeper. It intercepts requests from the React dashboard, executes the parameterized SQL queries, and returns serialized JSON payloads. Because this happens asynchronously, the main UE5 rendering thread never drops a frame while waiting for data.
*   **Authentication & Security:** I implemented standard JWT authentication and strict Role-Based Access Control (RBAC). This ensures that a standard citizen cannot hit administrative endpoints or alter municipal records.

## 3. Data Layer (PostgreSQL + PostGIS)
*   **Relational Database:** I deployed a massive PostgreSQL 17 database to act as the single source of truth. It handles everything from static asset registries to dynamic citizen grievances.
*   **Spatial Queries:** By leveraging the PostGIS extension, I pushed heavy spatial calculations (like bounding box intersections) down to the database level. This saves massive amounts of bandwidth because the API only transmits the exact JSON records requested, rather than sending bulk geographic data over the wire.
*   **Schema Scale:** The database relies on 113 highly relational tables, handling 5 distinct municipal domains. You can find the exact schema setups in the `database/migrations/` directory.
