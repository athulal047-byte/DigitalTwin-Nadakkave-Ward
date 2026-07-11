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
    console.log('Running Module 5 Migration: Enterprise Citizen Portal...');

    // 1. Property Ownership & History
    await client.query(`
      CREATE TABLE IF NOT EXISTS citizen_profiles (
        profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        aadhar_number VARCHAR(20) UNIQUE,
        dob DATE,
        primary_contact VARCHAR(20),
        emergency_contact VARCHAR(20),
        blood_group VARCHAR(5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS citizen_properties (
        relation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,
        ownership_type VARCHAR(50) NOT NULL, -- Owner, Joint Owner, Tenant, Occupant, Rep
        ownership_percentage NUMERIC(5,2) DEFAULT 100.00,
        is_primary BOOLEAN DEFAULT false,
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, asset_id)
      );

      CREATE TABLE IF NOT EXISTS property_ownership_history (
        history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        ownership_type VARCHAR(50),
        ownership_percentage NUMERIC(5,2),
        start_date DATE,
        end_date DATE,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Family Management
    await client.query(`
      CREATE TABLE IF NOT EXISTS family_members (
        member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        relation VARCHAR(100),
        dob DATE,
        blood_group VARCHAR(5),
        emergency_contact BOOLEAN DEFAULT false,
        occupation VARCHAR(255),
        mobile VARCHAR(20),
        email VARCHAR(255),
        government_id VARCHAR(50),
        resident_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Unified Document Management
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(100) NOT NULL, -- Property, Application, Tax, Bill, Grievance...
        entity_id UUID NOT NULL,
        doc_type VARCHAR(100),
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        mime_type VARCHAR(100),
        uploaded_by UUID REFERENCES users(user_id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS document_versions (
        version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID REFERENCES documents(document_id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_by UUID REFERENCES users(user_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS document_permissions (
        permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID REFERENCES documents(document_id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        access_level VARCHAR(50) DEFAULT 'Read',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_docs_entity ON documents(entity_type, entity_id);
    `);

    // 4. Unified Payment Ledger & Utilities
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id),
        asset_id UUID REFERENCES assets(asset_id),
        total_amount NUMERIC(15,2) NOT NULL,
        payment_method VARCHAR(50),
        payment_gateway_ref VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed, Failed
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payment_items (
        item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        payment_id UUID REFERENCES payments(payment_id) ON DELETE CASCADE,
        entity_type VARCHAR(50), -- Property Tax, Utility Bill, Permit Fee
        entity_id UUID,
        amount NUMERIC(15,2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS utility_connections (
        connection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,
        utility_type VARCHAR(50) NOT NULL, -- Electricity, Water, Sewerage, Telecom
        consumer_number VARCHAR(100) UNIQUE,
        provider VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Active',
        installation_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meter_readings (
        reading_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        connection_id UUID REFERENCES utility_connections(connection_id) ON DELETE CASCADE,
        reading_date DATE NOT NULL,
        reading_value NUMERIC(15,2) NOT NULL,
        consumption NUMERIC(15,2) NOT NULL,
        recorded_by UUID REFERENCES users(user_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS utility_bills (
        bill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        connection_id UUID REFERENCES utility_connections(connection_id) ON DELETE CASCADE,
        reading_id UUID REFERENCES meter_readings(reading_id),
        billing_period VARCHAR(50),
        amount_due NUMERIC(15,2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Unpaid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS property_assessments (
        assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID REFERENCES assets(asset_id) ON DELETE CASCADE,
        financial_year VARCHAR(20),
        area_sqft NUMERIC(10,2),
        usage_type VARCHAR(100),
        assessed_value NUMERIC(15,2),
        annual_tax NUMERIC(15,2),
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tax_invoices (
        invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assessment_id UUID REFERENCES property_assessments(assessment_id) ON DELETE CASCADE,
        amount_due NUMERIC(15,2),
        due_date DATE,
        status VARCHAR(50) DEFAULT 'Unpaid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Unified Notification Center
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(50) DEFAULT 'Normal',
        category VARCHAR(100), -- General, Emergency, Billing, Application
        status VARCHAR(50) DEFAULT 'Unread', -- Unread, Read, Archived
        delivery_email BOOLEAN DEFAULT false,
        delivery_sms BOOLEAN DEFAULT false,
        delivery_push BOOLEAN DEFAULT true,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Citizen Applications (Reusing Module 4 Workflow)
    await client.query(`
      CREATE TABLE IF NOT EXISTS citizen_applications (
        application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        asset_id UUID REFERENCES assets(asset_id),
        application_type VARCHAR(100) NOT NULL, -- New Connection, Building Permit...
        status_id UUID REFERENCES workflow_status(status_id),
        description TEXT,
        payment_id UUID REFERENCES payments(payment_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(user_id),
        updated_by UUID REFERENCES users(user_id)
      );
    `);

    // Modify existing grievances to support rating
    await client.query(`
      ALTER TABLE grievances ADD COLUMN IF NOT EXISTS resolution_rating INTEGER CHECK (resolution_rating >= 1 AND resolution_rating <= 5);
      ALTER TABLE grievances ADD COLUMN IF NOT EXISTS rating_comments TEXT;
    `);

    await client.query('COMMIT');
    console.log('Module 5 Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
