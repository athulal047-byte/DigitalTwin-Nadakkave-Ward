# Troubleshooting Guide

### Issue: The Dashboard UI is a blank white screen in UE5.
**Cause:** The UE5 Web Browser Widget cannot find the built HTML files.
**Fix:** Ensure you have run `npm run build` inside the `dashboard/` folder. Verify that the Blueprint URL path points exactly to the absolute path of `dashboard/dist/index.html`.

### Issue: UE5 Frame Rate is extremely low (Lagging).
**Cause:** The FBX file was imported as thousands of individual actors (draw calls) instead of a combined static mesh, or Nanite is not enabled.
**Fix:** Re-import the FBX file. In the import dialogue, ensure **"Combine Meshes"** is checked. Alternatively, enable Nanite on the imported static mesh.

### Issue: Blender Python script fails with "KeyError: 'Height'".
**Cause:** The input GIS Shapefile does not have the mathematically calculated `Height` attribute in its table.
**Fix:** Return to ArcGIS/QGIS and ensure the field is created and calculated before exporting.

### Issue: Buildings are floating or clipping through the terrain.
**Cause:** Z-fighting or incorrect origin points during export.
**Fix:** Ensure the base terrain plane is exactly at Z=0, and that the Blender export applied all transforms (Location, Rotation, Scale) before generating the FBX.
