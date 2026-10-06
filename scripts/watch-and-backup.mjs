import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const host = process.env.PGHOST || 'db.hreotqowulxpchyxjlai.supabase.co';
const port = parseInt(process.env.PGPORT || '5432', 10);
const user = process.env.PGUSER || 'postgres';
const database = process.env.PGDATABASE || 'postgres';
const password = process.env.PGPASSWORD || 'Aragon$27726&1226';

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
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZW90cW93dWx4cGNoeXhqbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDk5NTYsImV4cCI6MjA5NDc4NTk1Nn0.BAjcUlh_--eDtKwLAA51kDcoJPd0vujQ9sqBdM6K7EY';
    const res = await fetch('https://hreotqowulxpchyxjlai.supabase.co/rest/v1/reseller_profiles?select=reseller_id&limit=1', {
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
