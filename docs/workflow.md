# Engineering Workflow

I engineered a strict, automated data pipeline to convert flat, static 2D municipal records into a highly optimized, interactive 3D simulation. This pipeline ensured I maintained exact geographic accuracy while aggressively minimizing the computational overhead needed for real-time rendering.

## Step 1: Geographic Data Evaluation (ArcGIS Pro)
*   **Source Data:** I initially tried crowdsourced OSM data and Deep Learning models, but the topology was atrocious. I scrapped that and secured the authoritative Official Town Planner dataset (proprietary Shapefiles) directly from the Kozhikode Corporation.
*   **Processing:** I pulled the dataset into ArcGIS Pro to verify the Coordinate Reference System (CRS).
*   **Attribute Calculation:** Because flat 2D shapes obviously don't have physical height, I had to generate a Z-axis value. I wrote a Python script in ArcGIS to mathematically approximate absolute building height by taking the integer `floor_count` attribute and multiplying it by 3.5 meters (a standard residential ceiling height offset).

## Step 2: Procedural 3D Extrusion (Blender)
*   **Ingestion:** I exported the clean `.shp` files from ArcGIS and imported them directly into Blender.
*   **Python Scripting (`bpy`):** Manually modeling thousands of buildings was out of the question. Instead, I wrote a custom Python script utilizing the `bmesh` library. This script iterated through the Shapefile data and automatically executed a Z-axis extrusion on every single 2D polygon footprint, pulling the exact height attribute I calculated in Step 1.
*   **Semantic Materials:** To make the map visually readable, the script programmatically assigned basic building materials (e.g., residential zones get one color, commercial districts get another) based entirely on the municipal zoning code attributes tied to the polygons.
*   **Optimization:** The script executed a final cleanup pass to merge redundant vertices before exporting the entire ward as a massive, but highly optimized, `.fbx` model.

## Step 3: Interactive Visualization (Unreal Engine 5)
*   **Import:** I dropped the compiled `.fbx` model into the Unreal Engine 5 level.
*   **Environment Setup:** I enabled Unreal's dynamic lighting system (Lumen) to cast physically accurate shadows and generated collision meshes for the entire urban environment.
*   **Interaction Logic:** I wrote Blueprint logic to execute a `LineTraceByChannel` raycast straight from the user's camera. When the ray intersects a building's collision mesh, the engine instantly grabs that specific building's unique identifier.
*   **UI Invocation:** Finally, UE5 passes that captured building ID directly to an embedded Chromium Web Browser Widget. The widget loads the React Dashboard, fires a GET request to the Node.js API, and fetches live municipal data for that exact structure directly from PostGIS.
