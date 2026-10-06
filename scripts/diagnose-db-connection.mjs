import pg from 'pg';
import dns from 'dns/promises';
import net from 'net';
import tls from 'tls';
import fs from 'fs';

const { Client } = pg;

const PROJECT_REF = process.env.SUPABASE_PROJECT_ID || 'hreotqowulxpchyxjlai';
const DB_PASSWORD = process.env.PGPASSWORD || 'Aragon$27726&1226';
const REGION = 'ap-southeast-2'; // AWS Sydney (detected via DNS/IP routing)
const DIRECT_HOST = `db.${PROJECT_REF}.supabase.co`;
const POOLER_HOST = `aws-0-${REGION}.pooler.supabase.com`;
const REST_URL = `https://${PROJECT_REF}.supabase.co/rest/v1/`;
const ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZW90cW93dWx4cGNoeXhqbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDk5NTYsImV4cCI6MjA5NDc4NTk1Nn0.BAjcUlh_--eDtKwLAA51kDcoJPd0vujQ9sqBdM6K7EY';

const logLines = [];
function log(msg = '') {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  logLines.push(line);
}

async function testDnsResolution(hostname) {
  log(`--- DNS Resolution Check: ${hostname} ---`);
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    log(`✓ DNS Resolved successfully (${addresses.length} record(s)):`);
    addresses.forEach((addr, i) => {
      log(`  Record #${i + 1}: ${addr.address} (IPv${addr.family})`);
    });
    return addresses;
  } catch (err) {
    log(`✗ DNS Resolution failed for ${hostname}: ${err.code || err.message}`);
    return [];
  }
}

function testTcpSocket(host, port, timeoutMs = 5000) {
  return new Promise((resolve) => {
    log(`Probing TCP connection to ${host}:${port} (timeout: ${timeoutMs}ms)...`);
    const startTime = Date.now();
    const socket = new net.Socket();
    let isResolved = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      const elapsed = Date.now() - startTime;
      log(`✓ TCP handshake established with ${host}:${port} in ${elapsed}ms`);
      socket.destroy();
      if (!isResolved) {
        isResolved = true;
        resolve({ success: true, elapsed, status: 'CONNECTED' });
      }
    });

    socket.on('timeout', () => {
      const elapsed = Date.now() - startTime;
      log(`✗ TCP connection to ${host}:${port} TIMED OUT after ${elapsed}ms`);
      socket.destroy();
      if (!isResolved) {
        isResolved = true;
        resolve({ success: false, elapsed, status: 'TIMEOUT' });
      }
    });

    socket.on('error', (err) => {
      const elapsed = Date.now() - startTime;
      log(`✗ TCP connection error on ${host}:${port} (${err.code || err.message}) in ${elapsed}ms`);
      socket.destroy();
      if (!isResolved) {
        isResolved = true;
        resolve({ success: false, elapsed, status: err.code || err.message });
      }
    });

    socket.connect(port, host);
  });
}

async function testPostgresClient({ label, host, port, user, password, database = 'postgres', timeoutMs = 8000 }) {
  log(`\n--- Attempting PostgreSQL Direct Connection: ${label} ---`);
  log(`Target: ${user}@${host}:${port}/${database}`);

  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: timeoutMs,
  });

  const startTime = Date.now();
  try {
    log(`Initiating PostgreSQL handshake & SSL negotiation...`);
    await client.connect();
    const elapsed = Date.now() - startTime;
    log(`★ SUCCESS: Authenticated and connected in ${elapsed}ms!`);

    // Execute standard verification query
    log(`Executing handshake verification query (SELECT version, now)...`);
    const queryStart = Date.now();
    const res = await client.query(`
      SELECT 
        version() AS pg_version,
        current_database() AS db_name,
        current_user AS session_user,
        now() AS server_time;
    `);
    const queryElapsed = Date.now() - queryStart;
    log(`✓ Query executed in ${queryElapsed}ms. Server Response:`);
    log(`  Database Name: ${res.rows[0].db_name}`);
    log(`  Session User:  ${res.rows[0].session_user}`);
    log(`  Server Time:   ${res.rows[0].server_time}`);
    log(`  Engine:        ${res.rows[0].pg_version.split(' on ')[0]}`);

    await client.end();
    return { success: true, elapsed, info: res.rows[0] };
  } catch (err) {
    const elapsed = Date.now() - startTime;
    log(`✗ Handshake/Authentication failed after ${elapsed}ms:`);
    log(`  Error Code:    ${err.code || 'N/A'}`);
    log(`  Error Routine: ${err.routine || 'N/A'}`);
    log(`  Error Message: ${err.message}`);

    if (err.message.includes('password authentication failed')) {
      log(`  ANALYSIS: The database server is online, but the provided password was rejected by PostgreSQL.`);
    } else if (err.message.includes('timeout expired') || err.code === 'ETIMEDOUT') {
      log(`  ANALYSIS: Connection timed out. The compute instance or port firewall is unresponsive/paused.`);
    } else if (err.message.includes('tenant') || err.message.includes('not found')) {
      log(`  ANALYSIS: The pooler cannot find an active compute container for tenant '${PROJECT_REF}' (Project is Paused).`);
    }

    try { await client.end(); } catch (_) {}
    return { success: false, elapsed, error: err.message, code: err.code };
  }
}

async function testRestApi() {
  log(`\n--- Probing REST Gateway (HTTPS / Cloudflare Edge) ---`);
  log(`URL: ${REST_URL}`);
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${REST_URL}reseller_profiles?select=reseller_id&limit=1`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const elapsed = Date.now() - startTime;
    log(`HTTP Response: ${res.status} ${res.statusText} in ${elapsed}ms`);
    log(`Cloudflare Ray: ${res.headers.get('cf-ray') || 'N/A'}`);
    log(`Server Header:  ${res.headers.get('server') || 'N/A'}`);

    const text = await res.text();
    log(`Response Body:  ${text.slice(0, 160)}`);
    return { status: res.status, elapsed };
  } catch (err) {
    const elapsed = Date.now() - startTime;
    log(`✗ REST Gateway Probe failed after ${elapsed}ms: ${err.message}`);
    if (err.name === 'AbortError') {
      log(`  ANALYSIS: Gateway did not respond within 6s (typical PostgREST upstream compute freeze).`);
    }
    return { error: err.message, elapsed };
  }
}

async function run() {
  log(`========================================================================`);
  log(`SUPABASE DIRECT CONNECTION DIAGNOSTIC & HANDSHAKE AUDIT`);
  log(`Project Reference: ${PROJECT_REF}`);
  log(`Hosting Region:    ${REGION} (AWS Sydney)`);
  log(`Direct Host:       ${DIRECT_HOST}`);
  log(`Pooler Host:       ${POOLER_HOST}`);
  log(`========================================================================\n`);

  // Step 1: DNS Resolution
  await testDnsResolution(DIRECT_HOST);
  await testDnsResolution(POOLER_HOST);

  // Step 2: TCP Socket Handshakes
  log(`\n--- TCP Port Probing ---`);
  await testTcpSocket(DIRECT_HOST, 5432, 4000);
  await testTcpSocket(POOLER_HOST, 6543, 4000);
  await testTcpSocket(POOLER_HOST, 5432, 4000);

  // Step 3: REST API Test
  await testRestApi();

  // Step 4: Direct PostgreSQL Handshake Attempts
  // A. Direct host on 5432 with standard user 'postgres'
  await testPostgresClient({
    label: 'Direct Host (db.hreotqowulxpchyxjlai.supabase.co:5432)',
    host: DIRECT_HOST,
    port: 5432,
    user: 'postgres',
    password: DB_PASSWORD,
    timeoutMs: 6000,
  });

  // B. Pooler host on 6543 (Transaction Mode) with user 'postgres.hreotqowulxpchyxjlai'
  await testPostgresClient({
    label: 'Transaction Pooler (aws-0-ap-southeast-2.pooler.supabase.com:6543)',
    host: POOLER_HOST,
    port: 6543,
    user: `postgres.${PROJECT_REF}`,
    password: DB_PASSWORD,
    timeoutMs: 6000,
  });

  // C. Pooler host on 5432 (Session Mode) with user 'postgres.hreotqowulxpchyxjlai'
  await testPostgresClient({
    label: 'Session Pooler (aws-0-ap-southeast-2.pooler.supabase.com:5432)',
    host: POOLER_HOST,
    port: 5432,
    user: `postgres.${PROJECT_REF}`,
    password: DB_PASSWORD,
    timeoutMs: 6000,
  });

  log(`\n========================================================================`);
  log(`DIAGNOSTIC AUDIT COMPLETE`);
  log(`========================================================================`);

  // Write results to disk for support ticket export
  const reportPath = 'supabase-diagnostic-report.log';
  fs.writeFileSync(reportPath, logLines.join('\n'));
  log(`Saved comprehensive audit report to: ${reportPath}`);
}

run();
