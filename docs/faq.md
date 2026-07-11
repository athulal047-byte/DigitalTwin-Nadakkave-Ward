# Frequently Asked Questions (FAQ)

### 1. Does this project include live traffic or pedestrian simulations?
No. This repository represents a Visualization Minimum Viable Product (MVP). The scope is strictly limited to static infrastructure (buildings, roads, terrain) and semantic data retrieval.

### 2. Can I get the raw Nadakkave Ward shapefiles?
No. The official Town Planner dataset used for the thesis is proprietary to the Kozhikode Corporation. We have provided synthesized sample data in `gis/sample_data/` so you can test the pipeline.

### 3. Why was Blender used instead of importing Datasmith/Shapefiles directly into UE5?
While UE5 has Datasmith plugins for CAD data, processing the geometry through Blender's Python API allowed us to aggressively optimize the mesh topology (removing duplicate vertices on shared walls) and procedurally assign semantic materials *before* it reached the game engine, resulting in vastly superior runtime performance.

### 4. What is the overarching goal of this project?
To prove that modern game engine technology (UE5) can dramatically lower the barrier of entry for municipal visualization, allowing urban planners to interact with dense spatial data more intuitively than flat 2D GIS mapping.
