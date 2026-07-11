const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'nadakkave',
  user: 'postgres',
  password: 'athuldb47',
  port: 5432
});

async function migrate() {
  try {
    console.log('Starting RBAC migration...');

    // 1. Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS permissions (
        permission_id SERIAL PRIMARY KEY,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        description VARCHAR(255),
        UNIQUE(resource, action)
      );

      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
        permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );
    `);

    console.log('Tables created successfully.');

    // 2. Insert Roles
    const rolesToInsert = [
      ['admin', 'Administrator'],
      ['corporation', 'Corporation'],
      ['electricity_dept', 'Electricity Department'],
      ['water_dept', 'Water Department'],
      ['road_dept', 'Road Department'],
      ['telecom_dept', 'Telecommunication Department'],
      ['solid_waste_dept', 'Solid Waste Department'],
      ['environment_dept', 'Environment Department'],
      ['disaster_dept', 'Disaster Management Department'],
      ['health_dept', 'Health Department'],
      ['citizen', 'Citizen']
    ];

    for (const [roleName, desc] of rolesToInsert) {
      await pool.query(`
        INSERT INTO roles (role_name, description) 
        VALUES ($1, $2)
        ON CONFLICT (role_name) DO NOTHING;
      `, [roleName, desc]);
    }
    console.log('Roles inserted.');

    // 3. Define Resources & Actions
    // Resources: buildings, roads, water, electricity, grievances, notifications, users, reports, taxes
    // Actions: read, write, delete
    const permissionsToInsert = [
      // Global Read
      ['buildings', 'read'], ['roads', 'read'], ['grievances', 'read'], ['notifications', 'read'],
      // Specific Writes
      ['buildings', 'write'], ['roads', 'write'],
      ['electricity', 'read'], ['electricity', 'write'],
      ['water', 'read'], ['water', 'write'],
      ['telecom', 'read'], ['telecom', 'write'],
      ['solid_waste', 'read'], ['solid_waste', 'write'],
      ['environment', 'read'], ['environment', 'write'],
      ['disaster', 'read'], ['disaster', 'write'],
      ['health', 'read'], ['health', 'write'],
      ['grievances', 'write'], ['grievances', 'delete'],
      ['notifications', 'write'], ['notifications', 'delete'],
      ['users', 'read'], ['users', 'write'], ['users', 'delete'],
      ['reports', 'read'], ['taxes', 'read'], ['taxes', 'write']
    ];

    for (const [resource, action] of permissionsToInsert) {
      await pool.query(`
        INSERT INTO permissions (resource, action, description) 
        VALUES ($1, $2, $3)
        ON CONFLICT (resource, action) DO NOTHING;
      `, [resource, action, `Can ${action} ${resource}`]);
    }
    console.log('Permissions inserted.');

    // 4. Map Permissions to Roles
    // We will build a matrix mapping below
    const getRoleId = async (name) => {
      const res = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', [name]);
      return res.rows[0].role_id;
    };

    const assignPermission = async (roleName, resource, action) => {
      await pool.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.role_id, p.permission_id
        FROM roles r, permissions p
        WHERE r.role_name = $1 AND p.resource = $2 AND p.action = $3
        ON CONFLICT DO NOTHING;
      `, [roleName, resource, action]);
    };

    const roles = await pool.query('SELECT role_name FROM roles');
    
    for (const roleRow of roles.rows) {
      const rName = roleRow.role_name;

      if (rName === 'admin' || rName === 'corporation') {
        // Admin & Corporation get everything
        for (const [res, act] of permissionsToInsert) {
          await assignPermission(rName, res, act);
        }
      } else if (rName === 'citizen') {
        // Citizen gets basic read and grievance write
        await assignPermission(rName, 'buildings', 'read');
        await assignPermission(rName, 'roads', 'read');
        await assignPermission(rName, 'grievances', 'read');
        await assignPermission(rName, 'grievances', 'write');
        await assignPermission(rName, 'notifications', 'read');
        await assignPermission(rName, 'taxes', 'read');
      } else {
        // Department roles (e.g., water_dept)
        // Give base read access to infra
        await assignPermission(rName, 'buildings', 'read');
        await assignPermission(rName, 'roads', 'read');
        await assignPermission(rName, 'grievances', 'read');
        await assignPermission(rName, 'grievances', 'write');
        await assignPermission(rName, 'notifications', 'read');
        
        // Give specific write access based on dept name
        const deptPrefix = rName.replace('_dept', '');
        
        // E.g. water_dept gets water read/write
        if (permissionsToInsert.some(p => p[0] === deptPrefix && p[1] === 'read')) {
          await assignPermission(rName, deptPrefix, 'read');
          await assignPermission(rName, deptPrefix, 'write');
        }
        
        if (rName === 'road_dept') {
            await assignPermission(rName, 'roads', 'write');
        }
      }
    }
    console.log('Role Matrix mapped.');

    // 5. Update Users Table
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT REFERENCES roles(role_id);
    `);

    // Map existing string 'role' + 'department' to new 'role_id'
    // 'admin' -> 'admin'
    // 'public' -> 'citizen'
    // 'department' + department='electricity' -> 'electricity_dept'
    
    const users = await pool.query('SELECT user_id, role, department FROM users');
    for (const u of users.rows) {
      let targetRole = 'citizen';
      if (u.role === 'admin') targetRole = 'admin';
      if (u.role === 'municipal') targetRole = 'corporation';
      if (u.role === 'public') targetRole = 'citizen';
      if (u.role === 'department') {
        if (u.department) {
           targetRole = u.department.toLowerCase() + '_dept';
        } else {
           targetRole = 'citizen'; // fallback
        }
      }

      // Check if role exists, else default to citizen
      try {
          const roleIdRes = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', [targetRole]);
          if(roleIdRes.rows.length > 0) {
              await pool.query('UPDATE users SET role_id = $1 WHERE user_id = $2', [roleIdRes.rows[0].role_id, u.user_id]);
          } else {
              const citIdRes = await pool.query("SELECT role_id FROM roles WHERE role_name = 'citizen'");
              await pool.query('UPDATE users SET role_id = $1 WHERE user_id = $2', [citIdRes.rows[0].role_id, u.user_id]);
          }
      } catch (e) {
          console.error("Failed to map role for user", u.user_id, e.message);
      }
    }
    console.log('Users table updated with role_id.');

    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
