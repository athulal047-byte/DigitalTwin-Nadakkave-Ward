# Nadakkave Ward Digital Twin

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Unreal Engine](https://img.shields.io/badge/Unreal_Engine-5.4-000000?logo=unrealengine&logoColor=white)](https://www.unrealengine.com/)

## Project Overview

This repository contains the source code for the Nadakkave Ward Digital Twin. The system processes municipal geographic data into an interactive 3D simulation using Unreal Engine 5. 

To bridge the 3D environment with the project database, the engine embeds a React-based web dashboard. When a user interacts with a building in the simulation, the dashboard interactively queries a Node.js/PostgreSQL backend to retrieve building and municipal information stored in the project database.

## System Architecture

The project follows a decoupled, three-tier architecture separating the rendering engine from the data layer:

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

- **Presentation (UE5 & React):** Unreal Engine handles high-poly rendering, lighting, and collision. The React frontend handles UI state and data visualization.
- **Application (Node.js):** An Express REST API that manages routing and database transactions.
- **Data (PostgreSQL & PostGIS):** A PostgreSQL + PostGIS database containing 113 relational tables for spatial and municipal information.

## Engineering Workflow

The pipeline for converting 2D geographic data into the real-time simulation consists of three phases:

1. **GIS Processing:** Evaluated OSM and ArcGIS Deep Learning before receiving the official Town Planner dataset. Processed the dataset in ArcGIS Pro to verify the coordinate reference systems (CRS), generated a mathematically approximated building height attribute using floor counts, and exported the final Shapefile.
2. **Procedural Generation:** Imported the processed `.shp` data into Blender. A custom Python script (`bpy`) automated the 3D extrusion of building footprints and programmatically assigned semantic materials based on zoning codes, exporting the result as optimized `.fbx` meshes.
3. **Engine Integration:** Imported the geometry into UE5. Configured Lumen lighting, collision meshes, and Raycasting blueprints to pass selected building IDs directly to the embedded web widget.

## Technologies Used

*   **GIS & Modeling:** ArcGIS Pro, Blender, Python
*   **Engine:** Unreal Engine 5.4 (Blueprints, Web Browser Widget)
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
├── gis/              # GIS workspace and shapefile references
├── unreal_engine/    # UE5 project source files
└── README.md
```

## Installation

Detailed guides for each module are located in the `docs/` directory.

### 1. Database & Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure DB_USER, DB_PASS, and JWT_SECRET
node server.js
```
*Note: Ensure PostgreSQL 17 is running locally and the `nadakkave` database schemas have been migrated.*

### 2. Dashboard
```bash
cd dashboard
npm install
npm run dev
```

### 3. Unreal Engine
1. Launch Unreal Engine 5.4 via the Epic Games Launcher.
2. Open `unreal_engine/nadakkave.uproject`.
3. Allow shaders to compile before entering Play-In-Editor (PIE) mode.

## Screenshots

Screenshots demonstrating the GIS workflow, Unreal Engine environment, dashboard, and system architecture will be added in a future update.

## Data Privacy

This repository contains the software architecture, database schemas, and procedural frameworks. The official Town Planner dataset and live municipal records are proprietary to the Kozhikode Corporation and are strictly excluded. The database and visualizer use sample or anonymized structural data for demonstration purposes.

## Current Scope

The current build successfully renders the static built environment of Nadakkave Ward and provides a functional UI to query associated municipal records stored in the project database.

## Future Work

*   **IoT Integration:** Pipe live sensor data (traffic, air quality, water flow) into the event broker.
*   **Disaster Simulation:** Overlay dynamic weather and flood level predictions within the UE5 environment.
*   **Cloud Deployment:** Migrate the local Node.js API and PostgreSQL database to a managed cloud infrastructure (AWS/Azure).

## Author

**Athul A L**  
B.Tech Computer Science and Engineering (Artificial Intelligence & Machine Learning)  
Sree Chitra Thirunal College of Engineering  
Summer Internship – National Institute of Technology Calicut  

## License

Released under the [MIT License](LICENSE).