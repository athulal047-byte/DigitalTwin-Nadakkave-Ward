# Contributing to the Nadakkavu Ward Digital Twin

First, thank you for your interest in expanding this platform! I built this during my summer internship at NIT Calicut to establish a highly scalable, decoupled baseline for municipal digital twins. There are many massive avenues for future development (like Cloud Pixel Streaming and Live IoT telemetry).

## System Boundaries
Because this project utilizes a strict decoupled architecture to protect rendering performance, please keep the following rules in mind:

1. **Do NOT Connect UE5 to PostgreSQL Directly:** 
   Never write Blueprint or C++ logic in Unreal Engine that talks directly to the database. Always route requests through the Node.js API middleware. If you block the rendering thread while waiting for a slow network request, the 3D application will freeze.
   
2. **Keep the Spatial Geometry Decoupled:** 
   If you update the physical topology (e.g., adding a new building mesh), you must update the core Shapefiles, run the procedural Blender script, and re-export the `.fbx`. The spatial collision relies entirely on static compilation right now.

3. **Respect Data Privacy:** 
   Never commit raw Town Planner Shapefiles or citizen `.dbf` records to this repository. The database should only ever be populated using the anonymized mock seeders found in `database/migrations`.

## How to Contribute
1. Fork the repository.
2. Spin up the Node.js backend (`cd backend && npm start`) and ensure your local PostgreSQL 17 instance is running the migrations.
3. Test your React UI changes inside the `dashboard/` folder using `npm run dev` before testing them inside the Unreal Engine Web Browser Widget.
4. Submit a Pull Request documenting exactly what architectural module you modified.
