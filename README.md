# Nadakkavu Ward Digital Twin

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Unreal Engine](https://img.shields.io/badge/Unreal_Engine-5.4-000000?logo=unrealengine&logoColor=white)](https://www.unrealengine.com/)

## Project Overview

This repository contains the full source code and engineering documentation for the **Nadakkavu Ward Digital Twin**. I built this system during my summer internship at the Center of Excellence in AI at NIT Calicut to resolve the massive limitations of flat, traditional 2D geographic mapping. 

The core objective was simple but technically demanding: ingest raw municipal records and translate them into a high-fidelity, interactive 3D environment. I achieved this by building a strictly decoupled three-tier architecture. I housed the heavy 3D meshes inside Unreal Engine 5's dynamic Lumen lighting system, and embedded a React Single Page Application (SPA) directly into the game engine UI. When a user clicks a building, that React app fires a secure HTTP request to a Node.js REST API, which instantly queries a 113-table PostgreSQL/PostGIS database and returns live municipal records.

## System Architecture

Directly connecting a game engine to an enterprise database is a terrible architectural pattern—it freezes the UI thread and exposes secure credentials. To avoid this, I built a strictly decoupled workflow:

```text
[ Unreal Engine 5 ] <--- Raycast ID ---> [ React Dashboard ]
      (3D Client)                             (UI Client)
                                                  │
                                            HTTP REST API
                                                  ▼
                                       [ Node.js / Express ]
                                            (API Server)
                                                  │
                                             SQL Queries
                                                  ▼
                                      [ PostgreSQL + PostGIS ]
                               (113-Table Spatial and Municipal DB)
```

- **Presentation (UE5 & React):** Unreal Engine handles the high-poly mesh rendering, physically accurate lighting, and raycast collision detection. The Chromium-based Web Browser Widget runs the React frontend, rendering the UI state and parsing JSON payloads.
- **Application (Node.js/Express):** Acts as the secure middleware. It intercepts unauthenticated requests using JWTs and handles the actual parameterized SQL querying, keeping the massive PostgreSQL database safe from direct exposure.
- **Data (PostgreSQL & PostGIS):** A highly relational 113-table database organizing everything from the core Asset Registry to a mock Citizen Portal. The PostGIS extension handles all spatial intersections (like `ST_Intersects`) directly at the database level to save bandwidth.

## Engineering Workflow

Building this required overcoming significant data acquisition hurdles:

1. **GIS Processing:** I originally tried to use crowdsourced OpenStreetMap (OSM) data and pre-trained Mask R-CNN deep learning models to extract building footprints. Both failed—the topological geometry was a mess. I pivoted and secured the authoritative Official Town Planner Dataset from the Kozhikode Corporation. Because 2D shapes don't have height, I wrote an algorithmic Python script in ArcGIS Pro to generate a Z-axis value, multiplying the integer `floor_count` by a standard 3.5 meters per floor.
2. **Procedural 3D Generation:** I pulled the clean Shapefile into Blender and wrote a custom Python (`bpy`) script to procedurally extrude thousands of flat polygons into 3D geometry in seconds. The script also mapped semantic material categories (e.g., Residential vs. Commercial) to the buildings based on zoning codes before exporting a unified, optimized `.fbx` file.
3. **Engine Integration:** I dropped the compiled mesh into UE5, configured the Sky Atmosphere to cast accurate shadows, and wrote the Blueprint logic required to execute a `LineTraceByChannel`. This raycast grabs a building's unique ID and passes it to the React dashboard overlay.

## Technologies Used

*   **GIS & Modeling:** ArcGIS Pro, Blender, Python (`bpy`)
*   **Engine:** Unreal Engine 5.4 (C++, Blueprints, Web Browser Widget)
*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL 17, PostGIS

## Repository Structure

```text
DigitalTwin-Nadakkave-Ward-GitHub/
├── backend/          # Node.js API server, routes, and config
├── blender/          # Procedural generation scripts and .blend files
├── dashboard/        # React frontend codebase
├── database/         # PostgreSQL schema and migration scripts
├── docs/             # Technical architecture and setup documentation
│   └── thesis/       # Full LaTeX source of the internship thesis
├── gis/              # GIS workspace and shapefile references
├── unreal_engine/    # UE5 project source files
└── README.md
```

## Installation

### 1. Database & Backend
```bash
cd backend
npm install
cp .env.example .env  # You MUST configure DB_USER, DB_PASS, and JWT_SECRET here.
node server.js
```
*Note: You need PostgreSQL 17 running locally with PostGIS enabled. Run the schema migrations in the `database/` folder to spawn the 113 tables.*

### 2. Dashboard
```bash
cd dashboard
npm install
npm run dev
```

### 3. Unreal Engine
1. Launch Unreal Engine 5.4 via the Epic Games Launcher.
2. Open `unreal_engine/nadakkave.uproject`.
3. Give it a minute to compile shaders before hitting Play-In-Editor (PIE) mode.

## Data Privacy Disclaimer

The codebase here contains the software architecture, database schemas, and procedural Python scripts I built. However, the raw, official Town Planner dataset and the live municipal citizen records are proprietary to the Kozhikode Corporation. I have strictly excluded them from this repository. If you spin up the database locally, it will populate with anonymized, generated sample data just to prove the pipeline works.

## Future Scope

Because I strictly decoupled the architecture, it is incredibly easy to expand:
*   **Cloud Deployment:** We can bypass local hardware limits by pushing the UE5 app to an AWS GPU instance and using WebRTC Pixel Streaming to broadcast the engine to standard web browsers.
*   **IoT Integration:** I've built the event brokers in PostgreSQL. All we need to do is hook up an Apache Kafka stream to pipe live telemetry data (like traffic or grid loads) straight into the database.

## Author

**Athul A L**  
B.Tech Computer Science and Engineering (Artificial Intelligence & Machine Learning)  
Sree Chitra Thirunal College of Engineering  
Summer Internship Project – National Institute of Technology Calicut (NITC)  
Department of Center of Excellence of AI

## License

Released under the [MIT License](LICENSE).
