const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'nadakkave',
  user: 'postgres',
  password: 'athuldb47',
  port: 5432
});

async function evaluateEvent(event) {
  const { event_id, event_type, payload } = event;
  
  if (!event_id || !event_type) return;

  const client = await pool.connect();
  let timeoutId;
  
  try {
    // 1. Idempotency Guard
    try {
      await client.query(
        'INSERT INTO processed_events (event_id, event_type, processed_at) VALUES ($1, $2, NOW())',
        [event_id, event_type]
      );
    } catch (err) {
      if (err.code === '23505') { // unique violation
        console.log(`[Automation Engine] Event ${event_id} already processed. Skipping.`);
        return;
      }
      throw err;
    }

    // Strict 500ms timeout logic
    const MAX_EXECUTION_TIME_MS = 500;
    
    const evaluationPromise = (async () => {
      // 2. Rule Fetch
      const rulesRes = await client.query(
        'SELECT * FROM automation_rules WHERE trigger_event_type = $1 AND is_active = true',
        [event_type]
      );
      
      const rules = rulesRes.rows;
      if (rules.length === 0) return;

      // 3. Transaction Context
      await client.query('BEGIN');

      // 4. Evaluation 
      for (let rule of rules) {
        let conditionMet = true; // In a full impl, we evaluate rule.conditions against payload
        
        // 5. Execution
        if (conditionMet) {
          const actionRes = await client.query(
            'SELECT * FROM automation_actions WHERE rule_id = $1',
            [rule.rule_id]
          );
          
          for (let action of actionRes.rows) {
            await client.query(
              'INSERT INTO command_queue (command_type, payload, status) VALUES ($1, $2, $3)',
              [action.action_type, action.payload || {}, 'PENDING']
            );
          }
        }
      }

      // 6. Commit
      await client.query('COMMIT');
    })();

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('EXECUTION_TIMEOUT')), MAX_EXECUTION_TIME_MS);
    });

    await Promise.race([evaluationPromise, timeoutPromise]);
    clearTimeout(timeoutId);

  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    await client.query('ROLLBACK');
    if (error.message === 'EXECUTION_TIMEOUT') {
      console.warn(`[Automation Engine] Event ${event_id} evaluation exceeded 500ms timeout.`);
    } else {
      console.error(`[Automation Engine] Error processing event ${event_id}:`, error);
    }
  } finally {
    client.release();
  }
}

module.exports = { evaluateEvent };
