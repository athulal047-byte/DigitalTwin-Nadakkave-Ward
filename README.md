# Digital Twin of Nadakkave Ward 🏙️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Unreal Engine](https://img.shields.io/badge/Unreal_Engine-5.0+-black?logo=unrealengine)](https://www.unrealengine.com/)
[![Blender](https://img.shields.io/badge/Blender-3.6+-orange?logo=blender)](https://www.blender.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

An interactive, high-fidelity 3D Digital Twin of Nadakkave Ward (Kozhikode Corporation), bridging the gap between raw 2D Geographic Information Systems (GIS) and real-time visualization.

## 📖 Project Overview
Traditional municipal planning relies heavily on flat, 2D GIS mapping, which often fails to convey the volumetric density and spatial complexity of modern infrastructure. This project engineers a complete data-to-visualization pipeline that translates official 2D municipal records into an immersive 3D environment using **Unreal Engine 5**. 

By leveraging procedural generation in **Blender** and a **React-based UI**, this tool allows urban planners to visually analyze infrastructure categories and retrieve semantic building metadata dynamically.

## ✨ Implemented Features
- **Procedural 3D Generation:** Algorithmic extrusion of 2D GIS footprints into accurate 3D volumetric structures based on municipal floor-count data.
- **Category-Based Semantic Materials:** Dynamic color-coding of buildings based on zoning designations (e.g., residential, commercial, educational) for rapid visual analysis.
- **High-Fidelity UE5 Rendering:** Utilizes Unreal Engine 5's dynamic Directional Light, Sky Light, and Sky Atmosphere for physically accurate environmental shadowing.
- **Interactive Information Dashboard:** A raycast-driven React application running natively inside UE5 (via the Web Browser Widget) that displays semantic metadata when structures are clicked.

> **Note on Scope:** This repository represents the V1 Visualization Minimum Viable Product (MVP). It explicitly *excludes* dynamic data simulations such as Live IoT, traffic simulation, water physics, and disaster prediction.

## 🏗️ System Architecture & Workflow

The architecture is built on a robust, unidirectional data pipeline:

1. **GIS Processing (ArcGIS Pro):** 
   - Evaluated crowdsourced OpenStreetMap (OSM) data and found it sparse.
   - Tested Deep Learning footprint extraction (produced rooftop artifacts).
   - *Final Solution:* Processed the Official Town Planner Dataset, adding explicit `Height` attributes via floor-count multiplication.
2. **Procedural Generation (Blender):**
   - Ingested the ESRI Shapefile using a Python API.
   - Procedurally extruded footprints and assigned category-based semantic materials.
   - Exported optimized `.fbx` assets.
3. **Real-time Rendering & UI (Unreal Engine 5 & React):**
   - Imported meshes, mapped terrain, and established road networks.
   - Built an interactive overlay using Vite/React, embedded via the UE5 Web Browser Widget.

## 📂 Repository Structure

This is a monorepo containing all discrete components of the pipeline:

```text
DigitalTwin-Nadakkave-Ward-GitHub/
├── blender/          # Procedural extrusion Python scripts and .blend templates
├── dashboard/        # React/Vite/TypeScript source code for the interactive UI
├── docs/             # Technical architecture and workflow documentation
├── gis/              # GIS evaluation scripts and sample datasets
├── thesis/           # Full LaTeX source code for the B.Tech internship report
└── unreal_engine/    # Unreal Engine 5 project files (Content, Config, Source)
```

## 🚀 Quick Start & Installation

### 1. Dashboard UI
The interactive UI panel must be built before Unreal Engine can load it.
```bash
cd dashboard
npm install
npm run build
```

### 2. Unreal Engine 5
1. Launch Unreal Engine 5.
2. Open the project file located in `unreal_engine/DigitalTwin.uproject`.
3. The engine will automatically detect the built React assets in the `dashboard/dist` folder for the Web Browser Widget.

## 📸 Screenshots
*(Note: Replace these placeholder paths with actual image links after pushing to GitHub)*

- **Final UE5 Bird's-eye View:** `assets/screenshots/ue5_overview.png` - Demonstrates the scale and density of the extruded ward.
- **Street-level Lighting:** `assets/screenshots/ue5_lighting.png` - Highlights the real-time shadow computation.
- **Interactive Dashboard UI:** `assets/screenshots/ue5_ui.png` - Shows the Raycast selection and the embedded React widget.
- **ArcGIS Attribute Processing:** `assets/screenshots/arcgis_height.png` - Proves the mathematical derivation of Z-axis data from 2D records.

## 🛡️ Data Privacy & Licensing
**Codebase:** The scripts, UE5 project, and React dashboard are released under the [MIT License](LICENSE).
**GIS Data:** The Official Town Planner Dataset used in the final thesis is proprietary to the Kozhikode Corporation and is **not included** in this repository. All provided scripts operate on the synthesized open-source datasets located in `gis/sample_data/`.

## 🔮 Future Scope
- Live API integration for real-time GIS database synchronization.
- Integration of IoT sensor arrays for structural health monitoring.
- Pixel Streaming deployment to WebGL for zero-install municipal access.

---
*Developed as a B.Tech Summer Internship Project at the National Institute of Technology, Calicut.*
