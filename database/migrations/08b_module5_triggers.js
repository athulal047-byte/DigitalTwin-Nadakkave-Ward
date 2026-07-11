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
    console.log('Running Module 5 Triggers Migration...');

    await client.query(`
      CREATE OR REPLACE FUNCTION log_ownership_history()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (TG_OP = 'INSERT') THEN
          INSERT INTO property_ownership_history (asset_id, user_id, ownership_type, ownership_percentage, start_date, end_date)
          VALUES (NEW.asset_id, NEW.user_id, NEW.ownership_type, NEW.ownership_percentage, NEW.start_date, NEW.end_date);
          RETURN NEW;
        ELSIF (TG_OP = 'UPDATE' AND (NEW.ownership_type != OLD.ownership_type OR NEW.ownership_percentage != OLD.ownership_percentage OR NEW.end_date != OLD.end_date)) THEN
          INSERT INTO property_ownership_history (asset_id, user_id, ownership_type, ownership_percentage, start_date, end_date)
          VALUES (NEW.asset_id, NEW.user_id, NEW.ownership_type, NEW.ownership_percentage, NEW.start_date, NEW.end_date);
          RETURN NEW;
        ELSIF (TG_OP = 'DELETE') THEN
          -- Log the end of ownership if hard deleted
          INSERT INTO property_ownership_history (asset_id, user_id, ownership_type, ownership_percentage, start_date, end_date)
          VALUES (OLD.asset_id, OLD.user_id, OLD.ownership_type, OLD.ownership_percentage, OLD.start_date, CURRENT_DATE);
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS property_ownership_trigger ON citizen_properties;
      CREATE TRIGGER property_ownership_trigger
      AFTER INSERT OR UPDATE OR DELETE ON citizen_properties
      FOR EACH ROW EXECUTE FUNCTION log_ownership_history();
    `);

    await client.query('COMMIT');
    console.log('Module 5 Triggers completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Trigger Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
