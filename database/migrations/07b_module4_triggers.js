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
    console.log('Running Module 4 Migration: Triggers...');

    // Trigger function to log work order history and activity feed when status changes
    await client.query(`
      CREATE OR REPLACE FUNCTION log_work_order_status_change()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
          -- Log to work_order_history
          INSERT INTO work_order_history(work_order_id, previous_status, new_status, changed_by, change_reason, timestamp)
          VALUES (NEW.work_order_id, OLD.status, NEW.status, NEW.updated_by, 'Status changed via trigger', CURRENT_TIMESTAMP);
          
          -- Log to activity_feed
          INSERT INTO activity_feed (event_type, description, department, user_id, entity_type, entity_id, severity, metadata)
          VALUES (
            'WORK_ORDER_STATUS_CHANGED', 
            'Work Order ' || NEW.wo_number || ' status changed from ' || COALESCE(OLD.status, 'none') || ' to ' || NEW.status,
            NEW.department,
            NEW.updated_by,
            'work_order',
            NEW.work_order_id,
            'info',
            jsonb_build_object('previous_status', OLD.status, 'new_status', NEW.status)
          );
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_work_order_status_change ON work_orders;
      CREATE TRIGGER trg_work_order_status_change
      AFTER UPDATE OF status ON work_orders
      FOR EACH ROW
      EXECUTE FUNCTION log_work_order_status_change();
    `);

    await client.query('COMMIT');
    console.log('Triggers migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
