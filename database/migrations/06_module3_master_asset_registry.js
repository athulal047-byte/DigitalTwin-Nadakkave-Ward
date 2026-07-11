const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nadakkave',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'athuldb47',
  port: process.env.DB_PORT || 5432
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Running Module 3 Migration: Master Asset Registry...');

    // 1. Create Master Assets Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assets (
        asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_code VARCHAR(100) UNIQUE,
        asset_name VARCHAR(255) NOT NULL,
        asset_category VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        condition VARCHAR(50) DEFAULT 'good',
        installation_date DATE DEFAULT CURRENT_DATE,
        expected_life INTEGER,
        latitude NUMERIC(10,8),
        longitude NUMERIC(11,8),
        geometry geometry(Point, 4326),
        building_id VARCHAR(50),
        road_id VARCHAR(50),
        parent_asset_id UUID REFERENCES assets(asset_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        updated_by UUID
      );
      CREATE INDEX idx_assets_department ON assets(department);
      CREATE INDEX idx_assets_category ON assets(asset_category);
      CREATE INDEX idx_assets_geometry ON assets USING GIST(geometry);
    `);

    // 2. Modify Buildings and Roads to link to Assets
    await client.query(`ALTER TABLE buildings ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE;`);
    await client.query(`ALTER TABLE roads ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE;`);

    // 3. Backfill Data: Generate Assets for existing Buildings
    await client.query(`
      DO $$
      DECLARE
        b_row RECORD;
        new_asset_id UUID;
      BEGIN
        FOR b_row IN SELECT * FROM buildings WHERE asset_id IS NULL LOOP
          new_asset_id := gen_random_uuid();
          INSERT INTO assets (asset_id, asset_code, asset_name, asset_category, department, status, building_id)
          VALUES (new_asset_id, b_row.bldg_id, 'Building ' || b_row.bldg_id, 'building', 'corporation', 'active', b_row.bldg_id);
          
          UPDATE buildings SET asset_id = new_asset_id WHERE bldg_id = b_row.bldg_id;
        END LOOP;
      END $$;
    `);

    // 4. Backfill Data: Generate Assets for existing Roads
    await client.query(`
      DO $$
      DECLARE
        r_row RECORD;
        new_asset_id UUID;
      BEGIN
        FOR r_row IN SELECT * FROM roads WHERE asset_id IS NULL LOOP
          new_asset_id := gen_random_uuid();
          INSERT INTO assets (asset_id, asset_code, asset_name, asset_category, department, status, road_id)
          VALUES (new_asset_id, r_row.road_id, r_row.road_name, 'road', 'road_dept', 'active', r_row.road_id);
          
          UPDATE roads SET asset_id = new_asset_id WHERE road_id = r_row.road_id;
        END LOOP;
      END $$;
    `);

    // 5. Update Work Orders and Inspections
    await client.query(`
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE;
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
    `);

    await client.query(`
      ALTER TABLE inspections ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE;
      ALTER TABLE inspections ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE inspections ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
    `);

    // 6. Create Department-Specific Asset Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS electric_transformers (
        transformer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
        capacity_kva NUMERIC(10,2),
        voltage_rating VARCHAR(50),
        oil_level VARCHAR(20),
        last_maintenance DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS water_pipelines (
        pipeline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
        pipe_material VARCHAR(50),
        diameter_mm INTEGER,
        pressure_rating VARCHAR(50),
        flow_rate NUMERIC(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create some mock transformers and pipelines for testing Dashboards
    await client.query(`
      DO $$
      DECLARE
        t_asset UUID;
        p_asset UUID;
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM assets WHERE asset_category = 'transformer') THEN
          t_asset := gen_random_uuid();
          INSERT INTO assets (asset_id, asset_code, asset_name, asset_category, department, status, latitude, longitude)
          VALUES (t_asset, 'TR-001', 'Main City Transformer', 'transformer', 'electricity_dept', 'active', 11.2588, 75.7804);
          
          INSERT INTO electric_transformers (asset_id, capacity_kva, voltage_rating, oil_level)
          VALUES (t_asset, 500, '11kV', 'Normal');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM assets WHERE asset_category = 'pipeline') THEN
          p_asset := gen_random_uuid();
          INSERT INTO assets (asset_id, asset_code, asset_name, asset_category, department, status, latitude, longitude)
          VALUES (p_asset, 'WP-001', 'Central Water Main', 'pipeline', 'water_dept', 'active', 11.2590, 75.7810);
          
          INSERT INTO water_pipelines (asset_id, pipe_material, diameter_mm, pressure_rating)
          VALUES (p_asset, 'HDPE', 300, 'PN10');
        END IF;
      END $$;
    `);

    await client.query('COMMIT');
    console.log('Module 3 Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
