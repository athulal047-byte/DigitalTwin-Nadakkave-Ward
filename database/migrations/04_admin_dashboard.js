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
    console.log('Running Module 2 DB Migration...');

    // 1. Create activity_feed table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_feed (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        department VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create triggers to populate activity_feed automatically
    await client.query(`
      CREATE OR REPLACE FUNCTION log_grievance_activity() RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          INSERT INTO activity_feed (entity_type, entity_id, action, description, department)
          VALUES ('grievance', NEW.grievance_id, 'created', 'New grievance reported: ' || NEW.title, NEW.department);
        ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
          INSERT INTO activity_feed (entity_type, entity_id, action, description, department)
          VALUES ('grievance', NEW.grievance_id, 'status_changed', 'Grievance status changed to ' || NEW.status, NEW.department);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_log_grievance ON grievances;
      CREATE TRIGGER trigger_log_grievance
      AFTER INSERT OR UPDATE ON grievances
      FOR EACH ROW EXECUTE FUNCTION log_grievance_activity();
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION log_work_order_activity() RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          INSERT INTO activity_feed (entity_type, entity_id, action, description, department)
          VALUES ('work_order', NEW.work_order_id, 'created', 'New work order created: ' || NEW.title, NEW.department);
        ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
          INSERT INTO activity_feed (entity_type, entity_id, action, description, department)
          VALUES ('work_order', NEW.work_order_id, 'status_changed', 'Work order status changed to ' || NEW.status, NEW.department);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_log_work_order ON work_orders;
      CREATE TRIGGER trigger_log_work_order
      AFTER INSERT OR UPDATE ON work_orders
      FOR EACH ROW EXECUTE FUNCTION log_work_order_activity();
    `);

    // 2. Department Performance View
    await client.query(`
      CREATE OR REPLACE VIEW admin_department_performance AS
      SELECT 
        d.dept_name,
        COUNT(DISTINCT g.grievance_id) FILTER (WHERE g.status IN ('open', 'assigned', 'in_progress')) as pending_grievances,
        COUNT(DISTINCT g.grievance_id) FILTER (WHERE g.status IN ('resolved', 'closed')) as resolved_grievances,
        COUNT(DISTINCT w.work_order_id) FILTER (WHERE w.status != 'completed') as pending_work_orders,
        COUNT(DISTINCT w.work_order_id) FILTER (WHERE w.status = 'completed') as completed_work_orders,
        COALESCE(AVG(EXTRACT(EPOCH FROM (g.resolved_at - g.created_at))/3600) FILTER (WHERE g.status = 'resolved'), 0) as avg_resolution_hours,
        CASE 
          WHEN COUNT(DISTINCT g.grievance_id) = 0 THEN 100
          ELSE ROUND((COUNT(DISTINCT g.grievance_id) FILTER (WHERE g.status IN ('resolved', 'closed')) * 100.0) / NULLIF(COUNT(DISTINCT g.grievance_id), 0), 2)
        END as resolution_rate
      FROM departments d
      LEFT JOIN grievances g ON d.dept_name = g.department
      LEFT JOIN work_orders w ON d.dept_name = w.department
      GROUP BY d.dept_name;
    `);

    // 3. Infrastructure Health View
    await client.query(`
      CREATE OR REPLACE VIEW admin_infrastructure_health AS
      SELECT 
        'Buildings' as category,
        COUNT(*) as total_assets,
        COUNT(*) FILTER (WHERE structural_condition = 'Poor' OR structural_condition = 'Critical') as critical_assets,
        ROUND((COUNT(*) FILTER (WHERE structural_condition = 'Good' OR structural_condition = 'Excellent') * 100.0) / NULLIF(COUNT(*), 0), 2) as health_percentage
      FROM buildings
      UNION ALL
      SELECT 
        'Roads' as category,
        COUNT(*) as total_assets,
        COUNT(*) FILTER (WHERE surface_condition IN ('Poor', 'Very Poor') OR maintenance_status = 'Maintenance Due') as critical_assets,
        ROUND((COUNT(*) FILTER (WHERE surface_condition IN ('Good', 'Excellent')) * 100.0) / NULLIF(COUNT(*), 0), 2) as health_percentage
      FROM roads
      UNION ALL
      SELECT 
        'Water Supply' as category,
        COUNT(*) as total_assets,
        0 as critical_assets,
        100 as health_percentage
      FROM water_supply;
    `);

    // 4. City Health Metrics View (Raw data for composite score)
    await client.query(`
      CREATE OR REPLACE VIEW admin_city_health_metrics AS
      SELECT
        (SELECT ROUND((COUNT(*) FILTER (WHERE structural_condition IN ('Good', 'Excellent')) * 100.0) / NULLIF(COUNT(*), 1), 2) FROM buildings) as building_health,
        (SELECT ROUND((COUNT(*) FILTER (WHERE surface_condition IN ('Good', 'Excellent', 'Fair')) * 100.0) / NULLIF(COUNT(*), 1), 2) FROM roads) as road_health,
        100 as water_health,
        (SELECT ROUND((COUNT(*) FILTER (WHERE status = 'resolved') * 100.0) / NULLIF(COUNT(*), 1), 2) FROM grievances) as citizen_satisfaction,
        (SELECT ROUND((SUM(paid_amount) * 100.0) / NULLIF(SUM(bill_amount), 1), 2) FROM utility_bills) as revenue_collection
      ;
    `);

    // 5. Ward Summary View
    await client.query(`
      CREATE OR REPLACE VIEW admin_ward_summary AS
      SELECT 
        w.ward_no,
        w.ward_name,
        COUNT(DISTINCT b.bldg_id) as total_buildings,
        SUM(b.population) as population,
        COUNT(DISTINCT g.grievance_id) as total_grievances,
        COUNT(DISTINCT g.grievance_id) FILTER (WHERE g.status = 'open') as open_grievances
      FROM wards w
      LEFT JOIN buildings b ON w.ward_no = b.ward_no
      LEFT JOIN grievances g ON b.bldg_id = g.bldg_id
      GROUP BY w.ward_no, w.ward_name
      ORDER BY w.ward_no;
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
