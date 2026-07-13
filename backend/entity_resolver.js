const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'nadakkave',
  user: 'postgres',
  password: 'athuldb47',
  port: 5432
});

async function resolveEntity(entityType, entityId) {
  const typeMap = {
    'Citizen': { table: 'users', idCol: 'user_id' },
    'Asset': { table: 'assets', idCol: 'asset_id' },
    'WorkOrder': { table: 'work_orders', idCol: 'work_order_id' }
  };

  const map = typeMap[entityType];
  if (!map) return null;

  try {
    const result = await pool.query(`SELECT * FROM ${map.table} WHERE ${map.idCol} = $1`, [entityId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error(`Error resolving entity ${entityType} ${entityId}:`, err);
    return null;
  }
}

module.exports = { resolveEntity };
