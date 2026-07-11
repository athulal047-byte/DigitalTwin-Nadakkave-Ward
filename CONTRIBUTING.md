# Contributing to the Nadakkave Ward Digital Twin

Thank you for your interest in contributing to this project! This Digital Twin was originally developed as a B.Tech Summer Internship Project, but open-source contributions to expand its capabilities are welcome.

## How to Contribute

### 1. Reporting Bugs
If you find a bug in the procedural Blender scripts, the Unreal Engine blueprints, or the React dashboard, please open an issue using the GitHub Issue Tracker. Include:
- A clear description of the issue.
- Steps to reproduce it.
- Your OS and software versions (UE5, Blender, Node).

### 2. Suggesting Enhancements
The current project scope is **visualization only**. Features like Live IoT, Traffic Simulation, and Disaster Analytics were explicitly excluded from the MVP. However, architectural proposals to integrate these are welcome. Please open an issue to discuss major architectural changes before submitting a Pull Request.

### 3. Submitting Pull Requests
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes in the appropriate directory (`unreal_engine/`, `dashboard/`, `blender/`, etc.).
4. Commit your changes with descriptive messages (`git commit -m 'feat: Add dynamic sun positioning'`).
5. Push to your branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

## Data Policy
**DO NOT** submit Pull Requests containing proprietary municipal GIS data. All development and testing must be performed using the synthesized `.shp` files provided in `gis/sample_data/` or publicly available OpenStreetMap (OSM) exports. PRs containing official Kozhikode Corporation records will be immediately rejected and deleted to comply with data privacy policies.
