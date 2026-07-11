# System Architecture

The Nadakkave Ward Digital Twin utilizes a modern, decoupled three-tier architecture to process spatial data into real-time 3D environments.

## 1. Data Layer (GIS)
**Tools:** ArcGIS Pro, QGIS
**Function:** 
- Ingestion of municipal records (Official Town Planner Dataset).
- Attribute enrichment (calculating absolute metric height from floor counts).
- Export to unified CRS `.shp` format.

## 2. Processing Layer (Procedural Generation)
**Tools:** Blender, Python (`bpy`)
**Function:**
- Automated ingestion of geographic polygons.
- Z-axis extrusion via mathematical attributes.
- Application of predefined semantic materials based on zoning designations.
- Geometry optimization and FBX export.

## 3. Presentation Layer (Visualization & UI)
**Tools:** Unreal Engine 5, React/Vite, HTML/CSS
**Function:**
- Real-time rendering of high-poly urban geometry.
- Dynamic environmental simulation (Sky Atmosphere, Directional Light).
- Interactive user event handling (Raycast / LineTrace).
- Rendering the embedded UI overlay via the Web Browser Widget.
