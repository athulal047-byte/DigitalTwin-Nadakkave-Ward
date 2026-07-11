# Engineering Workflow

The Digital Twin project employs a structured data pipeline to convert static 2D municipal records into an interactive 3D simulation. This pipeline ensures that geographic accuracy is maintained while minimizing the computational overhead for real-time rendering.

## Step 1: Geographic Data Evaluation (ArcGIS Pro)
*   **Source Data:** The Official Town Planner dataset (proprietary Shapefiles containing ward infrastructure).
*   **Processing:** The dataset is imported into ArcGIS Pro to verify the Coordinate Reference System (CRS).
*   **Attribute Calculation:** Since real-world heights are rarely recorded, the absolute building height is mathematically approximated using the `floor_count` attribute multiplied by a standard residential ceiling height offset.

## Step 2: Procedural 3D Extrusion (Blender)
*   **Ingestion:** The processed `.shp` files are imported into Blender.
*   **Python Scripting (`bpy`):** A custom Python script automates the Z-axis extrusion of every 2D polygon footprint based on the height attribute calculated in Step 1.
*   **Semantic Materials:** The script automatically assigns basic building materials (e.g., residential, commercial, industrial colors) based on the municipal zoning code attributes.
*   **Optimization:** The extruded geometry is cleaned (removing redundant vertices) and exported as an optimized `.fbx` model.

## Step 3: Interactive Visualization (Unreal Engine 5)
*   **Import:** The `.fbx` model is imported into the UE5 level.
*   **Environment Setup:** Unreal's dynamic lighting system (Lumen) and collision meshes are applied to the urban environment.
*   **Interaction Logic:** Blueprints are configured to cast a ray from the user's camera to the environment. When a ray collides with a building mesh, the building's unique identifier is captured.
*   **UI Invocation:** The captured building ID is passed to an embedded Web Browser Widget, which loads the React Dashboard to fetch live municipal data for that specific building.
