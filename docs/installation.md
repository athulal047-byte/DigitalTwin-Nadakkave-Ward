# Installation & Setup Guide

## Prerequisites
- **Unreal Engine 5.0+**
- **Blender 3.6+**
- **Node.js 18+** (for the dashboard)
- **Git**

## Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/DigitalTwin-Nadakkave-Ward-GitHub.git
cd DigitalTwin-Nadakkave-Ward-GitHub
```

## Step 2: Build the Dashboard UI
Unreal Engine requires the dashboard to be pre-built.
```bash
cd dashboard
npm install
npm run build
```

## Step 3: Run Unreal Engine
1. Launch Unreal Engine 5.
2. Select "Browse" and locate the `unreal_engine/DigitalTwin.uproject` file.
3. If prompted to rebuild missing modules, select "Yes".
4. Once loaded, press **Play** to explore the environment.

## Optional: Reprocess Data
If you wish to run the procedural generation yourself:
1. Open Blender.
2. Open the scripting tab and load `blender/scripts/extrude_ward.py`.
3. Point the script to the sample data in `gis/sample_data/`.
