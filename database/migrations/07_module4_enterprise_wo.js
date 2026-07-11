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
    console.log('Running Module 4 Migration: Enterprise Work Order System...');

    // 1. Workflow Config Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow_status (
        status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status_name VARCHAR(100) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        display_order INTEGER DEFAULT 0,
        color VARCHAR(50),
        is_terminal BOOLEAN DEFAULT false,
        department VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        updated_by UUID
      );
      
      CREATE TABLE IF NOT EXISTS workflow_transitions (
        transition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_status UUID REFERENCES workflow_status(status_id) ON DELETE CASCADE,
        to_status UUID REFERENCES workflow_status(status_id) ON DELETE CASCADE,
        department VARCHAR(100),
        requires_approval BOOLEAN DEFAULT false,
        allowed_role UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        updated_by UUID,
        UNIQUE(from_status, to_status, department)
      );
    `);

    // 2. Work Order Types & Failure Codes
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_order_types (
        type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type_name VARCHAR(100) UNIQUE NOT NULL,
        default_priority VARCHAR(50) DEFAULT 'Medium',
        estimated_duration NUMERIC(10,2), -- in hours
        required_approval BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        updated_by UUID
      );
      
      CREATE TABLE IF NOT EXISTS failure_codes (
        code_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS repair_codes (
        code_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS root_cause_codes (
        code_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Maintenance Plans & Schedules
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_plans (
        plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_name VARCHAR(255) NOT NULL,
        asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,
        wo_type_id UUID REFERENCES work_order_types(type_id),
        department VARCHAR(100),
        frequency_type VARCHAR(50), -- e.g., 'calendar', 'operating_hours'
        frequency_value NUMERIC, -- e.g., 30 (days) or 500 (hours)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        updated_by UUID
      );

      CREATE TABLE IF NOT EXISTS maintenance_schedule (
        schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_id UUID REFERENCES maintenance_plans(plan_id) ON DELETE CASCADE,
        next_due_date DATE,
        last_completed_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. SLA Policies
    await client.query(`
      CREATE TABLE IF NOT EXISTS sla_policies (
        policy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        priority VARCHAR(50) NOT NULL,
        department VARCHAR(100),
        response_time NUMERIC(10,2), -- in hours
        resolution_time NUMERIC(10,2), -- in hours
        warning_threshold NUMERIC(5,2), -- percentage (e.g., 80)
        critical_threshold NUMERIC(5,2), -- percentage (e.g., 95)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Expand Work Orders Table
    await client.query(`
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS type_id UUID REFERENCES work_order_types(type_id);
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50) DEFAULT 'Low';
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS safety_level VARCHAR(50) DEFAULT 'Normal';
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS permit_required BOOLEAN DEFAULT false;
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS shutdown_required BOOLEAN DEFAULT false;
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS traffic_diversion_required BOOLEAN DEFAULT false;
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS emergency_flag BOOLEAN DEFAULT false;
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS failure_code_id UUID REFERENCES failure_codes(code_id);
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS repair_code_id UUID REFERENCES repair_codes(code_id);
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS root_cause_code_id UUID REFERENCES root_cause_codes(code_id);
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(10,2);
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(10,2);
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS assigned_team VARCHAR(100);
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS related_grievance_id INTEGER REFERENCES grievances(grievance_id);
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS updated_by UUID;
    `);

    // 6. Histories & Approvals
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_order_history (
        history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        work_order_id INTEGER REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
        previous_status VARCHAR(100),
        new_status VARCHAR(100),
        changed_by UUID REFERENCES users(user_id),
        change_reason TEXT,
        comments TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS approvals (
        approval_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        work_order_id INTEGER REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
        approver UUID REFERENCES users(user_id),
        status VARCHAR(50) DEFAULT 'Pending',
        approved_at TIMESTAMP,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Costs, Labour, Materials
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_order_costs (
        cost_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        work_order_id INTEGER REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
        cost_type VARCHAR(50), -- e.g., 'Labour', 'Material', 'Equipment'
        description TEXT,
        quantity NUMERIC(10,2),
        unit_cost NUMERIC(15,2),
        total_cost NUMERIC(15,2),
        entered_by UUID REFERENCES users(user_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS labour_logs (
        log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        work_order_id INTEGER REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(user_id),
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        hours NUMERIC(10,2),
        overtime NUMERIC(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS materials (
        material_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        material_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        unit_of_measure VARCHAR(50),
        default_unit_cost NUMERIC(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS material_inventory (
        inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        material_id UUID REFERENCES materials(material_id) ON DELETE CASCADE,
        department VARCHAR(100),
        quantity_on_hand NUMERIC(10,2),
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS material_usage (
        usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        work_order_id INTEGER REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
        material_id UUID REFERENCES materials(material_id),
        quantity_used NUMERIC(10,2),
        cost NUMERIC(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Polymorphic Attachments & Comments
    await client.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        mime_type VARCHAR(100),
        uploaded_by UUID REFERENCES users(user_id),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS comments (
        comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        user_id UUID REFERENCES users(user_id),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
      CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
    `);

    // 9. Inspection Templates
    await client.query(`
      CREATE TABLE IF NOT EXISTS inspection_templates (
        template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        department VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        updated_by UUID
      );

      CREATE TABLE IF NOT EXISTS inspection_template_items (
        item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES inspection_templates(template_id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        expected_type VARCHAR(50), -- e.g., 'boolean', 'string', 'numeric'
        is_mandatory BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inspection_results (
        result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inspection_id INTEGER REFERENCES inspections(inspection_id) ON DELETE CASCADE,
        item_id UUID REFERENCES inspection_template_items(item_id) ON DELETE CASCADE,
        string_value TEXT,
        boolean_value BOOLEAN,
        numeric_value NUMERIC,
        pass_fail VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Pre-seed basic workflow_status so UI renders
    await client.query(`
      INSERT INTO workflow_status (status_name, display_name, display_order, color, is_terminal) VALUES
      ('draft', 'Draft', 1, 'text-gray-400', false),
      ('assigned', 'Assigned', 2, 'text-blue-400', false),
      ('accepted', 'Accepted', 3, 'text-sky-400', false),
      ('scheduled', 'Scheduled', 4, 'text-indigo-400', false),
      ('in_progress', 'In Progress', 5, 'text-amber-400', false),
      ('paused', 'Paused', 6, 'text-orange-400', false),
      ('waiting_materials', 'Waiting for Materials', 7, 'text-orange-300', false),
      ('waiting_approval', 'Waiting for Approval', 8, 'text-pink-400', false),
      ('inspection_req', 'Inspection Required', 9, 'text-purple-400', false),
      ('completed', 'Completed', 10, 'text-emerald-400', true),
      ('rejected', 'Rejected', 11, 'text-red-400', true),
      ('cancelled', 'Cancelled', 12, 'text-red-500', true),
      ('archived', 'Archived', 13, 'text-gray-500', true)
      ON CONFLICT (status_name) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Module 4 Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
