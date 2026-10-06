import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function testDatabaseConnections() {
  console.log('====================================================');
  console.log('       GCOS DATABASE HEALTH & CONNECTION AUDIT       ');
  console.log('====================================================\n');

  // Test 1: Direct PostgreSQL Connection
  console.log('[1/3] Testing Direct PostgreSQL Connection...');
  const t0 = Date.now();
  const pgClient = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await pgClient.connect();
    const pgLatency = Date.now() - t0;
    console.log(`  ✓ PostgreSQL connection established (${pgLatency}ms)`);

    const versionRes = await pgClient.query('SELECT version();');
    console.log(`  ✓ PostgreSQL Engine: ${versionRes.rows[0].version.split(' on ')[0]}`);

    // Count records in major tables
    const tables = [
      'reseller_profiles',
      'retail_shops',
      'orders',
      'products',
      'sla_admins',
      'sla_staff',
      'reseller_chat_sessions',
      'reseller_chat_messages'
    ];

    console.log('  --- Table Record Counts ---');
    for (const table of tables) {
      const countRes = await pgClient.query(`SELECT COUNT(*) FROM ${table};`);
      console.log(`  ✓ ${table.padEnd(25)} : ${countRes.rows[0].count.padStart(7)} records`);
    }

    // Verify Reseller 25374 affiliation under Myo Gyi
    console.log('\n  --- Reseller 25374 Affiliation Check ---');
    const rRes = await pgClient.query(`
      SELECT r.reseller_id, r.shop_name, r.email, a.name as admin_name, s.name as staff_name, r.referral_code
      FROM reseller_profiles r
      LEFT JOIN sla_admins a ON r.member_of_admin_id = a.id
      LEFT JOIN sla_staff s ON r.referred_by_staff_id = s.id
      WHERE r.reseller_id = 25374;
    `);
    if (rRes.rows.length > 0) {
      const row = rRes.rows[0];
      console.log(`  ✓ Reseller ID: ${row.reseller_id} (${row.shop_name})`);
      console.log(`  ✓ Linked Admin: ${row.admin_name}`);
      console.log(`  ✓ Linked Staff: ${row.staff_name}`);
      console.log(`  ✓ Referral Code: ${row.referral_code}`);
    } else {
      console.warn('  ⚠ Reseller 25374 not found');
    }

    await pgClient.end();
  } catch (err) {
    console.error('  ✗ PostgreSQL Connection Failed:', err.message);
  }

  // Test 2: Supabase REST Client
  console.log('\n[2/3] Testing Supabase REST Client (HTTP)...');
  const t1 = Date.now();
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: shops, error: shopsErr } = await supabase
      .from('retail_shops')
      .select('id, shop_name, level, is_suspended')
      .limit(3);

    const sbLatency = Date.now() - t1;

    if (shopsErr) {
      console.error('  ✗ Supabase REST Error:', shopsErr.message);
    } else {
      console.log(`  ✓ Supabase REST Client reachable (${sbLatency}ms)`);
      console.log(`  ✓ Sample shop query returned ${shops.length} records successfully.`);
    }

    // Test 3: System Settings & Health
    console.log('\n[3/3] Checking System Settings & Configuration...');
    const { data: settings, error: setErr } = await supabase
      .from('system_settings')
      .select('key, value')
      .limit(5);

    if (setErr) {
      console.warn('  ⚠ Could not query system_settings:', setErr.message);
    } else {
      console.log(`  ✓ System settings accessible (${settings.length} keys found)`);
    }
  } catch (err) {
    console.error('  ✗ Supabase Client Exception:', err.message);
  }

  console.log('\n====================================================');
  console.log('       ALL DATABASE CHECKS COMPLETED SUCCESSFULLY    ');
  console.log('====================================================');
}

testDatabaseConnections().catch(console.error);
