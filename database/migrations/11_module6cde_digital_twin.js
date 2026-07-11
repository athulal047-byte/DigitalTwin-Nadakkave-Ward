const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'nadakkave',
  user: 'postgres',
  password: 'athuldb47',
  port: 5432
});

async function up() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Starting Migration: 11_module6cde_digital_twin.js...');

    // ==============================================================
    // MODULE 6C: UNIVERSAL RESOLUTION & SEARCH
    // ==============================================================
    console.log('Creating Universal Search FTS Materialized View...');
    // We assume citizens, assets, work_orders exist from Modules 1-5
    await client.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS universal_search_index AS
      SELECT 
        'Citizen' as entity_type,
        user_id::text as entity_id,
        full_name as title,
        phone as subtitle,
        setweight(to_tsvector('english', coalesce(full_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(email, '')), 'B') as document
      FROM users WHERE role_id = (SELECT role_id FROM roles WHERE role_name = 'citizen')
      UNION ALL
      SELECT
        'Asset' as entity_type,
        asset_id::text as entity_id,
        asset_name as title,
        asset_category as subtitle,
        setweight(to_tsvector('english', coalesce(asset_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(asset_category, '')), 'B') as document
      FROM assets
      UNION ALL
      SELECT
        'WorkOrder' as entity_type,
        work_order_id::text as entity_id,
        title as title,
        status as subtitle,
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') as document
      FROM work_orders;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_universal_search_entity ON universal_search_index(entity_id);
      CREATE INDEX IF NOT EXISTS idx_universal_search_document ON universal_search_index USING GIN (document);
    `);

    // ==============================================================
    // MODULE 6D: OPERATIONS COMMAND CENTER
    // ==============================================================
    console.log('Creating Dashboard & GIS Schema...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS dashboard_layouts (
        layout_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(tenant_id),
        name VARCHAR(255) NOT NULL,
        is_default BOOLEAN DEFAULT false,
        layout_config JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dashboard_widgets (
        widget_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        widget_type VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        default_config JSONB,
        component_key VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS widget_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        widget_id UUID REFERENCES dashboard_widgets(widget_id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(role_id) ON DELETE CASCADE,
        can_view BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS gis_layers (
        layer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(tenant_id),
        layer_name VARCHAR(255) NOT NULL,
        layer_type VARCHAR(100) NOT NULL, -- e.g., 'WMS', 'GeoJSON', 'UE5'
        url TEXT,
        style_config JSONB,
        is_default_visible BOOLEAN DEFAULT true,
        department VARCHAR(100)
      );
    `);

    // ==============================================================
    // MODULE 6E: AI, SENSORS, SIMULATION, STORAGE
    // ==============================================================
    console.log('Creating Sensors Schema...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_types (
        sensor_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        unit VARCHAR(50),
        data_schema JSONB
      );

      CREATE TABLE IF NOT EXISTS sensors (
        sensor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(tenant_id),
        sensor_type_id UUID REFERENCES sensor_types(sensor_type_id),
        asset_id UUID REFERENCES assets(asset_id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        location JSONB, -- GeoJSON Point
        installation_date DATE
      );

      CREATE TABLE IF NOT EXISTS sensor_readings (
        reading_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sensor_id UUID REFERENCES sensors(sensor_id),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        payload JSONB NOT NULL
      );
      -- Recommended to partition sensor_readings in the future
      CREATE INDEX IF NOT EXISTS idx_sensor_readings_time ON sensor_readings(sensor_id, timestamp DESC);

      CREATE TABLE IF NOT EXISTS sensor_alerts (
        alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sensor_id UUID REFERENCES sensors(sensor_id),
        alert_type VARCHAR(100),
        message TEXT,
        is_resolved BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating AI Sandbox Schema...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_predictions (
        prediction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(tenant_id),
        model_name VARCHAR(100),
        target_entity_type VARCHAR(100),
        target_entity_id UUID,
        predicted_outcome JSONB,
        confidence FLOAT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_recommendations (
        recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prediction_id UUID REFERENCES ai_predictions(prediction_id) ON DELETE SET NULL,
        title VARCHAR(255),
        description TEXT,
        suggested_action JSONB,
        status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Executed
        reviewed_by UUID REFERENCES users(user_id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS prediction_jobs (
        job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Running',
        result_summary JSONB,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `);

    console.log('Creating Simulation Engine Schema...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS simulation_scenarios (
        scenario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(tenant_id),
        name VARCHAR(255),
        description TEXT,
        parameters JSONB,
        created_by UUID REFERENCES users(user_id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS simulation_runs (
        run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scenario_id UUID REFERENCES simulation_scenarios(scenario_id),
        status VARCHAR(50) DEFAULT 'Initializing',
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS simulation_results (
        result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id UUID REFERENCES simulation_runs(run_id) ON DELETE CASCADE,
        entity_type VARCHAR(100),
        entity_id UUID,
        simulated_state JSONB,
        timestamp_offset INTEGER -- Time offset in simulation from start
      );
    `);

    console.log('Creating Storage Providers Schema...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS storage_providers (
        provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_type VARCHAR(50), -- Local, S3, MinIO, Azure
        config JSONB,
        is_active BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS storage_files (
        file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID REFERENCES storage_providers(provider_id),
        entity_type VARCHAR(100),
        entity_id UUID,
        file_name VARCHAR(255),
        mime_type VARCHAR(100),
        file_size BIGINT,
        storage_path TEXT,
        url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed basic Dashboard Widgets
    console.log('Seeding Dashboard Widgets...');
    await client.query(`
      INSERT INTO dashboard_widgets (widget_type, name, component_key) VALUES 
      ('SystemHealth', 'System Health Monitor', 'SystemHealthWidget'),
      ('EventFeed', 'Live Event Feed', 'EventFeedWidget'),
      ('AlertFeed', 'Critical Alerts', 'AlertFeedWidget'),
      ('TimelinePlayback', 'Timeline Playback', 'TimelinePlaybackWidget'),
      ('GISManager', 'GIS Layers', 'GISManagerWidget')
      ON CONFLICT DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Migration 11_module6cde_digital_twin.js completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS storage_files CASCADE;');
    await client.query('DROP TABLE IF EXISTS storage_providers CASCADE;');
    await client.query('DROP TABLE IF EXISTS simulation_results CASCADE;');
    await client.query('DROP TABLE IF EXISTS simulation_runs CASCADE;');
    await client.query('DROP TABLE IF EXISTS simulation_scenarios CASCADE;');
    await client.query('DROP TABLE IF EXISTS prediction_jobs CASCADE;');
    await client.query('DROP TABLE IF EXISTS ai_recommendations CASCADE;');
    await client.query('DROP TABLE IF EXISTS ai_predictions CASCADE;');
    await client.query('DROP TABLE IF EXISTS sensor_alerts CASCADE;');
    await client.query('DROP TABLE IF EXISTS sensor_readings CASCADE;');
    await client.query('DROP TABLE IF EXISTS sensors CASCADE;');
    await client.query('DROP TABLE IF EXISTS sensor_types CASCADE;');
    await client.query('DROP TABLE IF EXISTS gis_layers CASCADE;');
    await client.query('DROP TABLE IF EXISTS widget_permissions CASCADE;');
    await client.query('DROP TABLE IF EXISTS dashboard_widgets CASCADE;');
    await client.query('DROP TABLE IF EXISTS dashboard_layouts CASCADE;');
    await client.query('DROP MATERIALIZED VIEW IF EXISTS universal_search_index CASCADE;');
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  const action = process.argv[2];
  if (action === 'down') {
    down().then(() => process.exit(0)).catch(() => process.exit(1));
  } else {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
  }
}

module.exports = { up, down };
