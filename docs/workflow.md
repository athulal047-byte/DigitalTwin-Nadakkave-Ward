# Project Workflow Pipeline

This document details the exact sequence of operations required to reproduce the Digital Twin generation.

## Phase 1: Data Acquisition
1. Obtain 2D building footprints. *(For testing, use `gis/sample_data/ward_sample.shp`)*.
2. Ensure the attribute table contains a `Number_of_Floors` column and a `Category` column.
3. Open ArcGIS Pro, create a new `Height` column. Use the Field Calculator: `Height = Number_of_Floors * 3.0` (meters).
4. Export as ESRI Shapefile ensuring a unified Coordinate Reference System (CRS).

## Phase 2: Mesh Generation
1. Open Blender.
2. Execute the `blender/scripts/extrude_ward.py` script.
3. The script will prompt for the input `.shp` file path.
4. Verify the geometry in the Blender viewport.
5. Execute the export script to generate `exports/ward_mesh.fbx`.

## Phase 3: Unreal Engine Setup
1. Launch `unreal_engine/DigitalTwin.uproject`.
2. Import `ward_mesh.fbx` into the Content Browser (ensure "Combine Meshes" is checked).
3. Drag the mesh into the level at coordinate `(0,0,0)`.
4. Ensure the Web Browser Widget UI Blueprint is referencing `dashboard/dist/index.html`.
5. Play in Editor (PIE) to test raycast functionality.
