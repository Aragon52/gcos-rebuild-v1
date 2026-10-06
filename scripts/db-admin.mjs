import pg from 'pg';
const { Client } = pg;

const host = process.env.PGHOST || 'db.hreotqowulxpchyxjlai.supabase.co';
const port = parseInt(process.env.PGPORT || '5432', 10);
const user = process.env.PGUSER || 'postgres';
const database = process.env.PGDATABASE || 'postgres';
const password = process.env.PGPASSWORD || process.argv[3];
const action = process.argv[2] || 'diagnose';

if (!password) {
  console.error('Usage: node scripts/db-admin.mjs <diagnose|unlock|reload|backup|fix-all> <password>');
  console.error('Or set PGPASSWORD=your_password');
  process.exit(1);
}

const client = new Client({
  host,
  port,
  user,
  password,
  database,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

async function main() {
  console.log(`[db-admin] Connecting to PostgreSQL at ${host}:${port}/${database} as ${user}...`);
  try {
    await client.connect();
    console.log('[db-admin] ✓ Connected successfully to PostgreSQL!');
  } catch (err) {
    console.error('[db-admin] ✗ Connection failed:', err.message);
    process.exit(1);
  }

  try {
    if (action === 'diagnose' || action === 'fix-all') {
      console.log('\n--- 1. Connection & Server Info ---');
      const verRes = await client.query('SELECT version();');
      console.log('PostgreSQL version:', verRes.rows[0].version.split(' on ')[0]);

      console.log('\n--- 2. Active Connections & Queries ---');
      const actRes = await client.query(`
        SELECT pid, usename, client_addr, state, 
               age(clock_timestamp(), query_start) AS duration,
               wait_event_type, wait_event,
               substr(query, 1, 80) AS query_preview
        FROM pg_stat_activity
        WHERE pid <> pg_backend_pid()
        ORDER BY state DESC, duration DESC
        LIMIT 25;
      `);
      console.table(actRes.rows);

      console.log('\n--- 3. Checking for Locks/Blocking Queries ---');
      const lockRes = await client.query(`
        SELECT blocked_locks.pid AS blocked_pid,
               blocked_activity.usename AS blocked_user,
               blocking_locks.pid AS blocking_pid,
               blocking_activity.usename AS blocking_user,
               blocked_activity.query AS blocked_statement,
               blocking_activity.query AS current_statement_in_blocking_process
        FROM pg_catalog.pg_locks blocked_locks
        JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
        JOIN pg_catalog.pg_locks blocking_locks 
            ON blocking_locks.locktype = blocked_locks.locktype
            AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
            AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
            AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
            AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
            AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
            AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
            AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
            AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
            AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
            AND blocking_locks.pid != blocked_locks.pid
        JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
        WHERE NOT blocked_locks.granted;
      `);
      if (lockRes.rows.length === 0) {
        console.log('✓ No blocked locks detected.');
      } else {
        console.warn('⚠ Blocked locks found:');
        console.table(lockRes.rows);
      }
    }

    if (action === 'unlock' || action === 'fix-all') {
      console.log('\n--- Terminating Stuck & Idle In Transaction Connections ---');
      const termRes = await client.query(`
        SELECT pid, pg_terminate_backend(pid) AS terminated,
               state, age(clock_timestamp(), state_change) AS idle_duration,
               substr(query, 1, 60) AS query
        FROM pg_stat_activity
        WHERE pid <> pg_backend_pid()
          AND (
            state = 'idle in transaction'
            OR (state != 'idle' AND age(clock_timestamp(), query_start) > interval '1 minute')
          );
      `);
      console.log(`Terminated ${termRes.rows.length} stuck connection(s).`);
      if (termRes.rows.length > 0) {
        console.table(termRes.rows);
      }
    }

    if (action === 'reload' || action === 'fix-all') {
      console.log('\n--- Reloading PostgREST Schema Cache & Config ---');
      await client.query("NOTIFY pgrst, 'reload schema';");
      await client.query("NOTIFY pgrst, 'reload config';");
      console.log('✓ PostgREST reload signals sent successfully.');
    }

    if (action === 'backup') {
      console.log('\n--- Exporting Critical Tables ---');
      const tables = ['reseller_profiles', 'retail_shops', 'orders', 'products', 'sla_admins', 'sla_staff'];
      const fs = await import('fs');
      for (const table of tables) {
        try {
          const res = await client.query(`SELECT * FROM ${table};`);
          const filename = `backup_${table}.json`;
          fs.writeFileSync(filename, JSON.stringify(res.rows, null, 2));
          console.log(`✓ Exported ${res.rows.length} rows from ${table} -> ${filename}`);
        } catch (e) {
          console.warn(`Could not export ${table}:`, e.message);
        }
      }
    }

    console.log('\n[db-admin] All requested actions completed successfully.');
  } catch (err) {
    console.error('[db-admin] Error executing action:', err);
  } finally {
    await client.end();
  }
}

main();
