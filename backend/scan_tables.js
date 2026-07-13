const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'nadakkave',
  password: 'athuldb47',
  port: 5432,
});

async function scan() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log(`Total Tables: ${res.rows.length}`);
  res.rows.forEach(r => console.log(r.table_name));
  await client.end();
}

scan().catch(console.error);
