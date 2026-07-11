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
    console.log('Starting Migration: 09_module6_digital_twin_operations.js...');

    // 1. Multi-Tenancy Foundation
    console.log('Creating Multi-Tenancy Foundation...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // Insert default tenant
    const tenantRes = await client.query(`
      INSERT INTO tenants (name, domain)
      VALUES ('Kozhikode Corporation', 'kozhikode.gov.in')
      ON CONFLICT DO NOTHING
      RETURNING tenant_id;
    `);

    // 2. Event Bus (Immutable)
    console.log('Creating Event Bus...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_bus (
        event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        correlation_id UUID,
        parent_event_id UUID REFERENCES event_bus(event_id) ON DELETE SET NULL,
        event_type VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id UUID NOT NULL,
        department VARCHAR(100),
        priority VARCHAR(50) DEFAULT 'Low',
        created_by UUID, -- References users(user_id) loosely
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        payload JSONB NOT NULL,
        version INTEGER DEFAULT 1,
        source VARCHAR(100) DEFAULT 'system'
      );
      
      CREATE INDEX IF NOT EXISTS idx_event_bus_entity ON event_bus(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_event_bus_correlation ON event_bus(correlation_id);
      CREATE INDEX IF NOT EXISTS idx_event_bus_created_at ON event_bus(created_at);
    `);

    // Event Bus Triggers to enforce immutability
    await client.query(`
      CREATE OR REPLACE FUNCTION prevent_event_bus_modification()
      RETURNS TRIGGER AS $$
      BEGIN
          RAISE EXCEPTION 'event_bus is an immutable append-only ledger. Updates and deletes are strictly prohibited.';
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS enforce_event_bus_immutable_update ON event_bus;
      CREATE TRIGGER enforce_event_bus_immutable_update
      BEFORE UPDATE ON event_bus
      FOR EACH ROW EXECUTE FUNCTION prevent_event_bus_modification();
      
      DROP TRIGGER IF EXISTS enforce_event_bus_immutable_delete ON event_bus;
      CREATE TRIGGER enforce_event_bus_immutable_delete
      BEFORE DELETE ON event_bus
      FOR EACH ROW EXECUTE FUNCTION prevent_event_bus_modification();
    `);

    // 3. Command Queue
    console.log('Creating Command Queue...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS command_queue (
        command_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        command_type VARCHAR(100) NOT NULL,
        target_entity_type VARCHAR(100),
        target_entity_id UUID,
        payload JSONB,
        status VARCHAR(50) DEFAULT 'Pending',
        requested_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP WITH TIME ZONE
      );
      
      CREATE INDEX IF NOT EXISTS idx_command_queue_status ON command_queue(status);
    `);

    // 4. Digital Twin State
    console.log('Creating Digital Twin State...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS digital_twin_state (
        state_key VARCHAR(100) PRIMARY KEY,
        state_value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_by UUID
      );
    `);

    // Seed Digital Twin State
    await client.query(`
      INSERT INTO digital_twin_state (state_key, state_value)
      VALUES 
        ('emergency_mode', '{"active": false, "level": "None"}'),
        ('weather', '{"condition": "Clear", "temperature": 28}'),
        ('traffic_state', '{"level": "Normal"}'),
        ('simulation_time', '{"active": false, "timestamp": null}')
      ON CONFLICT (state_key) DO NOTHING;
    `);

    // 5. Digital Twin Sessions
    console.log('Creating Digital Twin Sessions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS digital_twin_sessions (
        session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        current_asset UUID,
        camera_position JSONB,
        selected_layers JSONB,
        selected_time TIMESTAMP WITH TIME ZONE,
        connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_digital_twin_sessions_user ON digital_twin_sessions(user_id);
    `);

    // 6. Semantic Graph (Entity Relationships)
    console.log('Creating Semantic Graph...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS entity_relationships (
        relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_entity_type VARCHAR(100) NOT NULL,
        source_entity_id UUID NOT NULL,
        relationship_type VARCHAR(50) NOT NULL,
        target_entity_type VARCHAR(100) NOT NULL,
        target_entity_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_entity_relationship UNIQUE (source_entity_id, relationship_type, target_entity_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_entity_relationships_source ON entity_relationships(source_entity_type, source_entity_id);
      CREATE INDEX IF NOT EXISTS idx_entity_relationships_target ON entity_relationships(target_entity_type, target_entity_id);
    `);

    // 7. Entity Versioning
    console.log('Creating Entity Versioning...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS entity_versions (
        version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(100) NOT NULL,
        entity_id UUID NOT NULL,
        version_number INTEGER NOT NULL,
        snapshot JSONB NOT NULL,
        change_reason TEXT,
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_entity_version UNIQUE (entity_type, entity_id, version_number)
      );
    `);

    // 8. System Configuration
    console.log('Creating System Configurations...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_configurations (
        config_key VARCHAR(100) PRIMARY KEY,
        config_value JSONB NOT NULL,
        category VARCHAR(100),
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_by UUID
      );
    `);

    // Seed System Configurations
    await client.query(`
      INSERT INTO system_configurations (config_key, config_value, category, description)
      VALUES 
        ('theme_colors', '{"primary": "#0ea5e9", "secondary": "#6366f1", "danger": "#ef4444", "warning": "#f59e0b"}', 'UI', 'Global application theme colors'),
        ('sla_defaults', '{"critical": 4, "high": 24, "medium": 72, "low": 168}', 'Workflow', 'SLA resolution times in hours'),
        ('map_defaults', '{"center": [11.2588, 75.7804], "zoom": 14}', 'GIS', 'Default map position for Kozhikode')
      ON CONFLICT (config_key) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Migration 09_module6_digital_twin_operations.js completed successfully.');
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
    await client.query('DROP TABLE IF EXISTS system_configurations CASCADE;');
    await client.query('DROP TABLE IF EXISTS entity_versions CASCADE;');
    await client.query('DROP TABLE IF EXISTS entity_relationships CASCADE;');
    await client.query('DROP TABLE IF EXISTS digital_twin_sessions CASCADE;');
    await client.query('DROP TABLE IF EXISTS digital_twin_state CASCADE;');
    await client.query('DROP TABLE IF EXISTS command_queue CASCADE;');
    await client.query('DROP TABLE IF EXISTS event_bus CASCADE;');
    await client.query('DROP TABLE IF EXISTS tenants CASCADE;');
    await client.query('DROP FUNCTION IF EXISTS prevent_event_bus_modification() CASCADE;');
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
