const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'nadakkave',
  user: 'postgres',
  password: 'athuldb47',
  port: 5432
});

function startWorker() {
  console.log('[Command Worker] Started polling command_queue...');
  
  setInterval(async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Select FOR UPDATE SKIP LOCKED to ensure safe concurrency
      const res = await client.query(`
        SELECT * FROM command_queue 
        WHERE status = 'PENDING' 
        ORDER BY created_at ASC 
        LIMIT 1 
        FOR UPDATE SKIP LOCKED
      `);

      if (res.rows.length > 0) {
        const command = res.rows[0];
        console.log(`[Command Worker] Processing command ${command.command_id}: ${command.command_type}`);
        
        // Mark as PROCESSING
        await client.query(
          `UPDATE command_queue SET status = 'PROCESSING', updated_at = NOW() WHERE command_id = $1`,
          [command.command_id]
        );

        // Execute command logic based on type (Mock for recreation)
        await new Promise(resolve => setTimeout(resolve, 50));

        // Mark as COMPLETED
        await client.query(
          `UPDATE command_queue SET status = 'COMPLETED', updated_at = NOW() WHERE command_id = $1`,
          [command.command_id]
        );
        console.log(`[Command Worker] Command ${command.command_id} completed.`);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[Command Worker] Error:', err);
    } finally {
      client.release();
    }
  }, 1000);
}

module.exports = { startWorker };
