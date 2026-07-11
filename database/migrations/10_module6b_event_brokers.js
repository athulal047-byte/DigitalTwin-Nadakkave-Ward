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
    console.log('Starting Migration: 10_module6b_event_brokers.js...');

    // 1. Update event_bus envelope
    console.log('Updating event_bus for Event Envelope...');
    await client.query(`
      ALTER TABLE event_bus 
      ADD COLUMN IF NOT EXISTS sequence_number BIGSERIAL,
      ADD COLUMN IF NOT EXISTS schema_version VARCHAR(10) DEFAULT '1.0',
      ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id);
      
      CREATE INDEX IF NOT EXISTS idx_event_bus_sequence ON event_bus(sequence_number);
    `);

    // 2. Add pg_notify trigger to event_bus
    console.log('Creating pg_notify trigger for event_bus...');
    await client.query(`
      CREATE OR REPLACE FUNCTION notify_smart_city_events()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM pg_notify(
          'smart_city_events',
          json_build_object(
            'event_id', NEW.event_id,
            'sequence_number', NEW.sequence_number,
            'schema_version', NEW.schema_version,
            'correlation_id', NEW.correlation_id,
            'tenant_id', NEW.tenant_id,
            'event_type', NEW.event_type,
            'entity_type', NEW.entity_type,
            'entity_id', NEW.entity_id,
            'department', NEW.department,
            'priority', NEW.priority,
            'created_at', NEW.created_at,
            'payload', NEW.payload
          )::text
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_notify_smart_city_events ON event_bus;
      
      CREATE TRIGGER trigger_notify_smart_city_events
      AFTER INSERT ON event_bus
      FOR EACH ROW EXECUTE FUNCTION notify_smart_city_events();
    `);

    // 3. Update command_queue for Worker Processing
    console.log('Updating command_queue for Worker Processing...');
    await client.query(`
      ALTER TABLE command_queue
      ADD COLUMN IF NOT EXISTS leased_until TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS leased_by VARCHAR(255),
      ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_error TEXT;
      
      CREATE INDEX IF NOT EXISTS idx_command_queue_lease ON command_queue(status, leased_until);
    `);

    // 4. Create dead_letter_commands
    console.log('Creating dead_letter_commands...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS dead_letter_commands (
        dlq_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        original_command_id UUID,
        command_type VARCHAR(100),
        payload JSONB,
        failed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_error TEXT,
        retry_count INTEGER,
        is_resolved BOOLEAN DEFAULT false
      );
    `);

    // 5. Create processed_events (Idempotency)
    console.log('Creating processed_events...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS processed_events (
        idempotency_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL,
        consumer_name VARCHAR(100) NOT NULL,
        processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_event_consumer UNIQUE (event_id, consumer_name)
      );
    `);

    // 6. Create Automation Engine Tables
    console.log('Creating Automation Engine Tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS automation_rules (
        rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        trigger_event_type VARCHAR(100) NOT NULL,
        conditions JSONB NOT NULL,
        priority INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        tenant_id UUID REFERENCES tenants(tenant_id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS automation_actions (
        action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rule_id UUID REFERENCES automation_rules(rule_id) ON DELETE CASCADE,
        action_type VARCHAR(100) NOT NULL,
        action_payload JSONB NOT NULL,
        execution_order INTEGER DEFAULT 0
      );
    `);

    // 7. Create Alerts Tables
    console.log('Creating Alerts Tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES event_bus(event_id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(50) DEFAULT 'High',
        status VARCHAR(50) DEFAULT 'New', -- New, Acknowledged, Resolved, Closed
        assigned_to UUID,
        tenant_id UUID REFERENCES tenants(tenant_id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS alert_acknowledgements (
        ack_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_id UUID REFERENCES alerts(alert_id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed some mock automation rules for testing
    console.log('Seeding default automation rules...');
    await client.query(`
      INSERT INTO automation_rules (name, trigger_event_type, conditions, priority)
      VALUES (
        'Critical Sensor Alert', 
        'SensorReading', 
        '{"operator": "==", "field": "payload.level", "value": "Critical"}', 
        100
      )
      ON CONFLICT DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Migration 10_module6b_event_brokers.js completed successfully.');
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
    await client.query('DROP TABLE IF EXISTS alert_acknowledgements CASCADE;');
    await client.query('DROP TABLE IF EXISTS alerts CASCADE;');
    await client.query('DROP TABLE IF EXISTS automation_actions CASCADE;');
    await client.query('DROP TABLE IF EXISTS automation_rules CASCADE;');
    await client.query('DROP TABLE IF EXISTS processed_events CASCADE;');
    await client.query('DROP TABLE IF EXISTS dead_letter_commands CASCADE;');
    await client.query('ALTER TABLE command_queue DROP COLUMN IF EXISTS leased_until, DROP COLUMN IF EXISTS leased_by, DROP COLUMN IF EXISTS retry_count, DROP COLUMN IF EXISTS last_error;');
    await client.query('DROP TRIGGER IF EXISTS trigger_notify_smart_city_events ON event_bus CASCADE;');
    await client.query('DROP FUNCTION IF EXISTS notify_smart_city_events CASCADE;');
    await client.query('ALTER TABLE event_bus DROP COLUMN IF EXISTS sequence_number, DROP COLUMN IF EXISTS schema_version, DROP COLUMN IF EXISTS tenant_id;');
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
