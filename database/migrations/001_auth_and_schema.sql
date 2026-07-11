-- ============================================================
-- NADAKKAVU SMART CITY PLATFORM — DATABASE MIGRATION 001
-- Auth Foundation + Schema Expansion
-- ============================================================

-- Run this file against your nadakkave database:
--   psql -U postgres -d nadakkave -f migrations/001_auth_and_schema.sql

BEGIN;

-- ─── PHASE 1: AUTH TABLES ────────────────────────────────────

-- Expand users table (safe IF NOT EXISTS for each column)
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS building_id VARCHAR(50);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Sessions table for JWT refresh tokens
CREATE TABLE IF NOT EXISTS sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id SERIAL PRIMARY KEY,
  user_id UUID,
  username VARCHAR(100),
  action VARCHAR(50) NOT NULL,      -- 'login', 'logout', 'create', 'update', 'delete', 'approve'
  entity_type VARCHAR(50),           -- 'building', 'grievance', 'notification', etc.
  entity_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ─── PHASE 2: CORE DOMAIN TABLES ────────────────────────────

-- Building Owners
CREATE TABLE IF NOT EXISTS building_owners (
  owner_id SERIAL PRIMARY KEY,
  bldg_id VARCHAR(50) REFERENCES buildings(bldg_id) ON DELETE CASCADE,
  owner_name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  aadhaar_no VARCHAR(20),
  address TEXT,
  ownership_type VARCHAR(50) DEFAULT 'owner',  -- 'owner', 'tenant', 'government'
  since_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_building_owners_bldg ON building_owners(bldg_id);

-- Building Tax
CREATE TABLE IF NOT EXISTS building_tax (
  tax_id SERIAL PRIMARY KEY,
  bldg_id VARCHAR(50) REFERENCES buildings(bldg_id) ON DELETE CASCADE,
  financial_year VARCHAR(10) NOT NULL,           -- '2025-26'
  tax_type VARCHAR(50) NOT NULL,                 -- 'building_tax', 'land_tax', 'library_cess', 'health_cess'
  amount NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  due_date DATE,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pending',          -- 'pending', 'paid', 'overdue', 'partial'
  receipt_no VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_building_tax_bldg ON building_tax(bldg_id);
CREATE INDEX IF NOT EXISTS idx_building_tax_status ON building_tax(status);
CREATE INDEX IF NOT EXISTS idx_building_tax_year ON building_tax(financial_year);

-- Utility Bills
CREATE TABLE IF NOT EXISTS utility_bills (
  bill_id SERIAL PRIMARY KEY,
  bldg_id VARCHAR(50) REFERENCES buildings(bldg_id) ON DELETE CASCADE,
  utility_type VARCHAR(30) NOT NULL,             -- 'water', 'electricity', 'sewerage'
  bill_month VARCHAR(7) NOT NULL,                -- '2025-06'
  units_consumed NUMERIC(10,2),
  bill_amount NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  due_date DATE,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  meter_no VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_utility_bills_bldg ON utility_bills(bldg_id);
CREATE INDEX IF NOT EXISTS idx_utility_bills_type ON utility_bills(utility_type);
CREATE INDEX IF NOT EXISTS idx_utility_bills_status ON utility_bills(status);

-- Grievances
CREATE TABLE IF NOT EXISTS grievances (
  grievance_id SERIAL PRIMARY KEY,
  ticket_no VARCHAR(20) UNIQUE NOT NULL,
  bldg_id VARCHAR(50),
  complainant_name VARCHAR(255),
  phone VARCHAR(20),
  department VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  subject VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',         -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(30) DEFAULT 'open',             -- 'open', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'
  assigned_to UUID,
  ward_no VARCHAR(10),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  images TEXT[],
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grievances_dept ON grievances(department);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_bldg ON grievances(bldg_id);
CREATE INDEX IF NOT EXISTS idx_grievances_priority ON grievances(priority);
CREATE INDEX IF NOT EXISTS idx_grievances_created ON grievances(created_at DESC);

-- Grievance Comments / Timeline
CREATE TABLE IF NOT EXISTS grievance_comments (
  comment_id SERIAL PRIMARY KEY,
  grievance_id INTEGER REFERENCES grievances(grievance_id) ON DELETE CASCADE,
  user_id UUID,
  username VARCHAR(100),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grievance_comments_gid ON grievance_comments(grievance_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,                     -- 'power_outage', 'water_shutdown', 'road_closure', 'tax_reminder', 'emergency', 'weather', 'announcement', 'maintenance'
  priority VARCHAR(20) DEFAULT 'info',           -- 'info', 'warning', 'critical', 'success'
  department VARCHAR(100),
  target_role VARCHAR(30),                       -- NULL = all, 'public', 'department', 'admin'
  target_ward VARCHAR(10),
  target_building VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_dept ON notifications(department);

-- Notification read status
CREATE TABLE IF NOT EXISTS notification_reads (
  user_id UUID,
  notification_id INTEGER REFERENCES notifications(notification_id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, notification_id)
);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
  inspection_id SERIAL PRIMARY KEY,
  entity_type VARCHAR(30) NOT NULL,              -- 'building', 'road', 'utility'
  entity_id VARCHAR(50) NOT NULL,
  inspector_name VARCHAR(255),
  inspector_id UUID,
  department VARCHAR(100),
  inspection_type VARCHAR(100),                  -- 'structural', 'fire_safety', 'occupancy', 'routine', 'tax_assessment'
  status VARCHAR(30) DEFAULT 'scheduled',        -- 'scheduled', 'completed', 'failed', 'cancelled'
  findings TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  photos TEXT[],
  scheduled_date DATE,
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inspections_entity ON inspections(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_inspections_dept ON inspections(department);

-- Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
  work_order_id SERIAL PRIMARY KEY,
  wo_number VARCHAR(20) UNIQUE NOT NULL,
  entity_type VARCHAR(30) NOT NULL,              -- 'road', 'building', 'utility', 'drainage'
  entity_id VARCHAR(50),
  department VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(30) DEFAULT 'pending',          -- 'pending', 'approved', 'in_progress', 'completed', 'cancelled'
  assigned_to VARCHAR(255),
  estimated_cost NUMERIC(12,2),
  actual_cost NUMERIC(12,2),
  start_date DATE,
  end_date DATE,
  completed_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_work_orders_dept ON work_orders(department);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_entity ON work_orders(entity_type, entity_id);

-- ─── SAMPLE DATA ─────────────────────────────────────────────

-- Sample Users (password is plain text for dev — will be hashed by app)
INSERT INTO users (user_id, username, password_hash, full_name, role, department, is_active, email, phone)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'admin123', 'Municipal Administrator', 'admin', NULL, true, 'admin@nadakkavu.gov.in', '9876543210'),
  ('a0000000-0000-0000-0000-000000000002', 'electricity_dept', 'dept123', 'Electricity Department', 'department', 'Electricity', true, 'electricity@nadakkavu.gov.in', '9876543211'),
  ('a0000000-0000-0000-0000-000000000003', 'water_dept', 'dept123', 'Water Supply Department', 'department', 'Water', true, 'water@nadakkavu.gov.in', '9876543212'),
  ('a0000000-0000-0000-0000-000000000004', 'road_dept', 'dept123', 'Road Department', 'department', 'Road', true, 'road@nadakkavu.gov.in', '9876543213'),
  ('a0000000-0000-0000-0000-000000000005', 'telecom_dept', 'dept123', 'Telecom Department', 'department', 'Telecommunication', true, 'telecom@nadakkavu.gov.in', '9876543214'),
  ('a0000000-0000-0000-0000-000000000006', 'corporation', 'dept123', 'Corporation Office', 'department', 'Corporation', true, 'corporation@nadakkavu.gov.in', '9876543215'),
  ('a0000000-0000-0000-0000-000000000007', 'env_dept', 'dept123', 'Environment Department', 'department', 'Environment', true, 'env@nadakkavu.gov.in', '9876543216'),
  ('a0000000-0000-0000-0000-000000000008', 'disaster_dept', 'dept123', 'Disaster Management', 'department', 'Disaster Management', true, 'disaster@nadakkavu.gov.in', '9876543217'),
  ('a0000000-0000-0000-0000-000000000009', 'waste_dept', 'dept123', 'Solid Waste Department', 'department', 'Solid Waste', true, 'waste@nadakkavu.gov.in', '9876543218'),
  ('a0000000-0000-0000-0000-000000000010', 'sewerage_dept', 'dept123', 'Sewerage Department', 'department', 'Sewerage', true, 'sewerage@nadakkavu.gov.in', '9876543219'),
  ('a0000000-0000-0000-0000-000000000011', 'health_dept', 'dept123', 'Health Department', 'department', 'Health', true, 'health@nadakkavu.gov.in', '9876543220')
ON CONFLICT (username) DO NOTHING;

-- Sample Notifications
INSERT INTO notifications (title, message, type, priority, department, target_role, created_at)
VALUES
  ('Scheduled Power Maintenance', 'Power supply will be interrupted in Ward 65 on July 5th from 10 AM to 2 PM for transformer maintenance.', 'power_outage', 'warning', 'Electricity', NULL, NOW() - INTERVAL '2 hours'),
  ('Water Pipeline Repair', 'Water supply will be disrupted in Ward 66 area on July 3rd due to pipeline repair works.', 'water_shutdown', 'warning', 'Water', NULL, NOW() - INTERVAL '5 hours'),
  ('Road Resurfacing Notice', 'MG Road resurfacing work starting July 4th. Expect traffic diversions for 3 days.', 'road_closure', 'info', 'Road', NULL, NOW() - INTERVAL '1 day'),
  ('Property Tax Reminder Q2', 'Property tax for Q2 2025-26 is due by July 31st. Pay online to avoid late fees.', 'tax_reminder', 'info', 'Corporation', 'public', NOW() - INTERVAL '3 days'),
  ('Emergency: Heavy Rainfall Alert', 'IMD has issued heavy rainfall warning for Kozhikode district. Stay indoors. Emergency helpline: 1077.', 'emergency', 'critical', 'Disaster Management', NULL, NOW() - INTERVAL '30 minutes'),
  ('New Solid Waste Collection Schedule', 'Updated waste collection schedule effective from July 1st. Check ward-wise timings.', 'announcement', 'info', 'Solid Waste', NULL, NOW() - INTERVAL '2 days'),
  ('IoT Sensor Maintenance', 'Air quality sensors in Ward 67 will be offline for calibration on July 6th.', 'maintenance', 'info', 'Environment', 'admin', NOW() - INTERVAL '6 hours'),
  ('Street Light Complaint Resolved', 'Street light issue near Bus Stop, Ward 68 has been resolved. 12 LED lights replaced.', 'announcement', 'success', 'Electricity', NULL, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Sample Grievances (using first few building IDs from the buildings table)
INSERT INTO grievances (ticket_no, bldg_id, complainant_name, phone, department, category, subject, description, priority, status, ward_no, created_at)
SELECT
  'GRV-2025-' || LPAD(ROW_NUMBER() OVER()::TEXT, 4, '0'),
  b.bldg_id,
  CASE (ROW_NUMBER() OVER()) % 5
    WHEN 0 THEN 'Ramesh Kumar'
    WHEN 1 THEN 'Priya Menon'
    WHEN 2 THEN 'Abdul Rahman'
    WHEN 3 THEN 'Lakshmi Nair'
    WHEN 4 THEN 'Suresh Babu'
  END,
  '98765' || LPAD((ROW_NUMBER() OVER())::TEXT, 5, '0'),
  CASE (ROW_NUMBER() OVER()) % 6
    WHEN 0 THEN 'Electricity'
    WHEN 1 THEN 'Water'
    WHEN 2 THEN 'Road'
    WHEN 3 THEN 'Sewerage'
    WHEN 4 THEN 'Solid Waste'
    WHEN 5 THEN 'Environment'
  END,
  CASE (ROW_NUMBER() OVER()) % 6
    WHEN 0 THEN 'Street Light'
    WHEN 1 THEN 'Water Leakage'
    WHEN 2 THEN 'Pothole'
    WHEN 3 THEN 'Drainage Block'
    WHEN 4 THEN 'Waste Collection'
    WHEN 5 THEN 'Tree Cutting'
  END,
  CASE (ROW_NUMBER() OVER()) % 6
    WHEN 0 THEN 'Street light not working near building'
    WHEN 1 THEN 'Water pipe leaking near compound wall'
    WHEN 2 THEN 'Large pothole on access road causing accidents'
    WHEN 3 THEN 'Drainage blocked causing waterlogging'
    WHEN 4 THEN 'Waste not collected for 3 days'
    WHEN 5 THEN 'Dangerous tree branch needs cutting'
  END,
  CASE (ROW_NUMBER() OVER()) % 6
    WHEN 0 THEN 'The street light near my building has been non-functional for the past week. It is causing safety concerns at night.'
    WHEN 1 THEN 'There is a significant water leak from the main pipeline near my compound wall. Water is being wasted continuously.'
    WHEN 2 THEN 'A large pothole has developed on the road near my building. Two-wheelers have already met with minor accidents.'
    WHEN 3 THEN 'The drainage near my building is completely blocked. During rain, water enters my compound.'
    WHEN 4 THEN 'Municipal waste collection vehicle has not visited our area for the last 3 days. Waste is piling up.'
    WHEN 5 THEN 'A large tree branch is hanging dangerously over the road near my building. It may fall during rain or wind.'
  END,
  CASE (ROW_NUMBER() OVER()) % 4
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    WHEN 2 THEN 'high'
    WHEN 3 THEN 'critical'
  END,
  CASE (ROW_NUMBER() OVER()) % 5
    WHEN 0 THEN 'open'
    WHEN 1 THEN 'assigned'
    WHEN 2 THEN 'in_progress'
    WHEN 3 THEN 'resolved'
    WHEN 4 THEN 'closed'
  END,
  b.ward_no,
  NOW() - ((ROW_NUMBER() OVER()) || ' days')::INTERVAL
FROM buildings b
ORDER BY b.bldg_id
LIMIT 30
ON CONFLICT DO NOTHING;

-- Sample Building Tax (for first 50 buildings)
INSERT INTO building_tax (bldg_id, financial_year, tax_type, amount, paid_amount, due_date, paid_date, status)
SELECT
  b.bldg_id,
  '2025-26',
  CASE (ROW_NUMBER() OVER()) % 3
    WHEN 0 THEN 'building_tax'
    WHEN 1 THEN 'land_tax'
    WHEN 2 THEN 'library_cess'
  END,
  ROUND((RANDOM() * 5000 + 500)::NUMERIC, 2),
  CASE WHEN (ROW_NUMBER() OVER()) % 3 = 0 THEN ROUND((RANDOM() * 5000 + 500)::NUMERIC, 2) ELSE 0 END,
  '2025-07-31'::DATE,
  CASE WHEN (ROW_NUMBER() OVER()) % 3 = 0 THEN (NOW() - (RANDOM() * 30 || ' days')::INTERVAL)::DATE ELSE NULL END,
  CASE (ROW_NUMBER() OVER()) % 4
    WHEN 0 THEN 'paid'
    WHEN 1 THEN 'pending'
    WHEN 2 THEN 'overdue'
    WHEN 3 THEN 'pending'
  END
FROM buildings b
ORDER BY b.bldg_id
LIMIT 50
ON CONFLICT DO NOTHING;

-- Sample Utility Bills (for first 30 buildings)
INSERT INTO utility_bills (bldg_id, utility_type, bill_month, units_consumed, bill_amount, paid_amount, due_date, status, meter_no)
SELECT
  b.bldg_id,
  CASE (ROW_NUMBER() OVER()) % 3
    WHEN 0 THEN 'water'
    WHEN 1 THEN 'electricity'
    WHEN 2 THEN 'sewerage'
  END,
  '2025-06',
  ROUND((RANDOM() * 500 + 50)::NUMERIC, 2),
  ROUND((RANDOM() * 2000 + 200)::NUMERIC, 2),
  CASE WHEN (ROW_NUMBER() OVER()) % 2 = 0 THEN ROUND((RANDOM() * 2000 + 200)::NUMERIC, 2) ELSE 0 END,
  '2025-07-15'::DATE,
  CASE WHEN (ROW_NUMBER() OVER()) % 2 = 0 THEN 'paid' ELSE 'pending' END,
  'MTR-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0')
FROM buildings b
ORDER BY b.bldg_id
LIMIT 30
ON CONFLICT DO NOTHING;

-- Sample Building Owners (for first 40 buildings)
INSERT INTO building_owners (bldg_id, owner_name, father_name, phone, email, ownership_type, since_date)
SELECT
  b.bldg_id,
  CASE (ROW_NUMBER() OVER()) % 8
    WHEN 0 THEN 'Rajesh Menon'
    WHEN 1 THEN 'Aisha Beevi'
    WHEN 2 THEN 'Thomas Mathew'
    WHEN 3 THEN 'Sreelatha K'
    WHEN 4 THEN 'Mohammed Haris'
    WHEN 5 THEN 'Geetha Kumari'
    WHEN 6 THEN 'Vijayan Nair'
    WHEN 7 THEN 'Fathima Zahra'
  END,
  CASE (ROW_NUMBER() OVER()) % 4
    WHEN 0 THEN 'Krishnan Nair'
    WHEN 1 THEN 'Ibrahim'
    WHEN 2 THEN 'Mathew Thomas'
    WHEN 3 THEN 'Gopalan Kutty'
  END,
  '98765' || LPAD((ROW_NUMBER() OVER())::TEXT, 5, '0'),
  LOWER(REPLACE(
    CASE (ROW_NUMBER() OVER()) % 8
      WHEN 0 THEN 'Rajesh Menon'
      WHEN 1 THEN 'Aisha Beevi'
      WHEN 2 THEN 'Thomas Mathew'
      WHEN 3 THEN 'Sreelatha K'
      WHEN 4 THEN 'Mohammed Haris'
      WHEN 5 THEN 'Geetha Kumari'
      WHEN 6 THEN 'Vijayan Nair'
      WHEN 7 THEN 'Fathima Zahra'
    END, ' ', '.')) || '@email.com',
  CASE (ROW_NUMBER() OVER()) % 3
    WHEN 0 THEN 'owner'
    WHEN 1 THEN 'tenant'
    WHEN 2 THEN 'owner'
  END,
  (NOW() - ((RANDOM() * 3650 + 365) || ' days')::INTERVAL)::DATE
FROM buildings b
ORDER BY b.bldg_id
LIMIT 40
ON CONFLICT DO NOTHING;

-- Sample Inspections
INSERT INTO inspections (entity_type, entity_id, inspector_name, department, inspection_type, status, findings, score, scheduled_date, completed_date, created_at)
SELECT
  'building',
  b.bldg_id,
  CASE (ROW_NUMBER() OVER()) % 3
    WHEN 0 THEN 'K. Suresh (AE)'
    WHEN 1 THEN 'P. Radhika (JE)'
    WHEN 2 THEN 'M. Anwar (SI)'
  END,
  CASE (ROW_NUMBER() OVER()) % 3
    WHEN 0 THEN 'Corporation'
    WHEN 1 THEN 'Electricity'
    WHEN 2 THEN 'Water'
  END,
  CASE (ROW_NUMBER() OVER()) % 4
    WHEN 0 THEN 'structural'
    WHEN 1 THEN 'fire_safety'
    WHEN 2 THEN 'tax_assessment'
    WHEN 3 THEN 'routine'
  END,
  CASE (ROW_NUMBER() OVER()) % 3
    WHEN 0 THEN 'completed'
    WHEN 1 THEN 'scheduled'
    WHEN 2 THEN 'completed'
  END,
  CASE WHEN (ROW_NUMBER() OVER()) % 3 != 1 THEN 'Building inspected. All parameters within acceptable limits. Minor maintenance recommended.' ELSE NULL END,
  CASE WHEN (ROW_NUMBER() OVER()) % 3 != 1 THEN (RANDOM() * 40 + 60)::INTEGER ELSE NULL END,
  (NOW() + ((ROW_NUMBER() OVER()) || ' days')::INTERVAL)::DATE,
  CASE WHEN (ROW_NUMBER() OVER()) % 3 != 1 THEN (NOW() - ((ROW_NUMBER() OVER()) || ' days')::INTERVAL)::DATE ELSE NULL END,
  NOW() - ((ROW_NUMBER() OVER()) * 2 || ' days')::INTERVAL
FROM buildings b
ORDER BY b.bldg_id
LIMIT 20
ON CONFLICT DO NOTHING;

-- Sample Work Orders
INSERT INTO work_orders (wo_number, entity_type, entity_id, department, title, description, priority, status, estimated_cost, start_date, end_date, created_at)
VALUES
  ('WO-2025-0001', 'road', NULL, 'Road', 'MG Road Resurfacing', 'Complete resurfacing of MG Road from Junction A to Junction B. Length: 2.5 km.', 'high', 'in_progress', 1500000.00, '2025-07-04', '2025-07-15', NOW() - INTERVAL '5 days'),
  ('WO-2025-0002', 'utility', NULL, 'Water', 'Pipeline Replacement Ward 66', 'Replace corroded water pipeline in Ward 66 sector B. 500m pipeline.', 'high', 'approved', 800000.00, '2025-07-10', '2025-07-20', NOW() - INTERVAL '3 days'),
  ('WO-2025-0003', 'utility', NULL, 'Electricity', 'Transformer Installation Ward 65', 'Install new 250 KVA transformer at Ward 65 substation.', 'medium', 'pending', 350000.00, NULL, NULL, NOW() - INTERVAL '1 day'),
  ('WO-2025-0004', 'road', NULL, 'Road', 'Pothole Repair — Beach Road', 'Repair 15 potholes identified on Beach Road stretch.', 'critical', 'in_progress', 120000.00, '2025-07-01', '2025-07-05', NOW() - INTERVAL '4 days'),
  ('WO-2025-0005', 'utility', NULL, 'Sewerage', 'Manhole Repair Ward 67', 'Repair 3 damaged manholes in Ward 67 residential area.', 'medium', 'completed', 45000.00, '2025-06-25', '2025-06-28', NOW() - INTERVAL '7 days'),
  ('WO-2025-0006', 'building', NULL, 'Corporation', 'Community Hall Renovation', 'Renovation of Ward 68 community hall. Painting, electrical, plumbing.', 'low', 'approved', 500000.00, '2025-07-15', '2025-08-15', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

COMMIT;

-- Print summary
DO $$ BEGIN
  RAISE NOTICE 'Migration 001 completed successfully!';
  RAISE NOTICE 'Tables created: sessions, audit_logs, building_owners, building_tax, utility_bills, grievances, grievance_comments, notifications, notification_reads, inspections, work_orders';
END $$;
