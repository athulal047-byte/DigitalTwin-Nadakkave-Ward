# Blender Procedural Generation

This directory contains the Python automation scripts and `.blend` files used to convert 2D GIS data into 3D geometry.

## Workflow
Because manual modeling of thousands of buildings is inefficient, this project utilizes Blender's Python API (`bpy`) to procedurally generate the ward.

1. **Import:** The script ingests the pre-processed ESRI Shapefile.
2. **Extrusion:** It reads the `Height` attribute of each polygon and extrudes it along the Z-axis.
3. **Material Assignment:** It reads the zoning category and applies the corresponding predefined semantic material.
4. **Export:** The optimized mesh is automatically exported to `exports/ward_mesh.fbx` for UE5 ingestion.
