import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const host = process.env.PGHOST || `db.${process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID}.supabase.co`;
const port = parseInt(process.env.PGPORT || '5432', 10);
const user = process.env.PGUSER || 'postgres';
const database = process.env.PGDATABASE || 'postgres';
const password = process.env.PGPASSWORD;
if (!password) {
  console.error('Missing PGPASSWORD environment variable.');
  process.exit(1);
}

const tables = [
  'reseller_profiles',
  'retail_shops',
  'orders',
  'products',
  'sla_admins',
  'sla_staff',
  'reseller_payout_requests',
  'vip_levels',
  'transactions'
];

async function tryBackup() {
  console.log(`[watchdog] Checking if database is awake at ${new Date().toISOString()}...`);
  
  // 1. Quick probe to REST API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
    const res = await fetch(`${process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL}/rest/v1/reseller_profiles?select=reseller_id&limit=1`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (res.ok) {
      console.log('[watchdog] ★ DATABASE IS ONLINE AND RESPONDING VIA API!');
      await performFullBackup();
      return true;
    }
  } catch (e) {
    // API not yet up
  }

  // 2. Direct probe via PostgreSQL port
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log('[watchdog] ★ CONNECTED DIRECTLY TO POSTGRESQL!');
    await performFullBackup(client);
    return true;
  } catch (err) {
    console.log(`[watchdog] Still waiting for Supabase to unpause compute (${err.message.slice(0, 50)})...`);
    try { await client.end(); } catch(_) {}
    return false;
  }
}

async function performFullBackup(existingClient) {
  const client = existingClient || new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  if (!existingClient) {
    await client.connect();
  }

  const backupDir = './backups';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('[watchdog] Starting full backup of all tables...');
  let totalRows = 0;

  for (const table of tables) {
    try {
      const res = await client.query(`SELECT * FROM ${table};`);
      const file = `${backupDir}/${table}.json`;
      fs.writeFileSync(file, JSON.stringify(res.rows, null, 2));
      console.log(`[watchdog] ✓ Backed up ${table}: ${res.rows.length} rows -> ${file}`);
      totalRows += res.rows.length;
    } catch (e) {
      console.warn(`[watchdog] Table ${table} skip/error:`, e.message);
    }
  }

  console.log(`[watchdog] ★★★ SUCCESS! Total ${totalRows} rows backed up to ./backups/ directory.`);
  try { await client.end(); } catch(_) {}
  process.exit(0);
}

tryBackup();
