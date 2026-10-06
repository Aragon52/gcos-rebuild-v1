import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const AdmZip = require('adm-zip');
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

export const ALL_TABLES = [
  'reseller_profiles',
  'retail_shops',
  'orders',
  'order_items',
  'products',
  'categories',
  'deposit_requests',
  'withdrawal_requests',
  'sla_admins',
  'sla_staff',
  'users',
  'virtual_customer_profiles',
  'admin_audit_logs',
  'broadcast_notifications',
  'reseller_notifications',
  'reseller_chat_sessions',
  'reseller_chat_messages',
  'support_sessions',
  'support_messages',
  'reviews',
  'seasonal_themes',
  'system_settings',
  'reseller_product_selection'
];

/**
 * Convert an array of row objects into valid CSV format (RFC 4180)
 */
export function rowsToCsv(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      val = JSON.stringify(val);
    } else {
      val = String(val);
    }
    if (val.includes('"') || val.includes(',') || val.includes('\n') || val.includes('\r')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvHeader = headers.map(escapeCell).join(',');
  const csvRows = rows.map(row => headers.map(h => escapeCell(row[h])).join(','));
  return [csvHeader, ...csvRows].join('\r\n');
}

/**
 * Get current time in Yangon Standard Time (MMT, UTC+06:30)
 */
export function getYangonTimeString(date = new Date()) {
  const yangonTime = new Date(date.getTime() + (6.5 * 60 * 60 * 1000));
  const iso = yangonTime.toISOString();
  return {
    dateStr: iso.slice(0, 10),
    timeStr: iso.slice(11, 19),
    stamp: iso.slice(0, 19).replace(/[:T]/g, '-'),
    full: iso,
    display: `${iso.slice(0, 10)} ${iso.slice(11, 19)} MMT (UTC+06:30)`
  };
}

/**
 * Run full CSV export of all tables and zip them
 */
export async function exportAllTablesToCsv() {
  const yangon = getYangonTimeString();
  console.log(`[csv-export] Starting export for Yangon Time: ${yangon.display}...`);

  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  await client.connect();

  const baseDir = './backups/csv';
  const publicDir = './public/backups';
  const snapshotDir = path.join(baseDir, yangon.dateStr);

  fs.mkdirSync(snapshotDir, { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });

  const summary = {
    yangonDate: yangon.dateStr,
    yangonTime: yangon.timeStr,
    yangonDisplay: yangon.display,
    executedAt: new Date().toISOString(),
    tablesExported: 0,
    totalRecords: 0,
    files: []
  };

  for (const table of ALL_TABLES) {
    try {
      const res = await client.query(`SELECT * FROM ${table};`);
      const csvContent = rowsToCsv(res.rows);
      const filePath = path.join(snapshotDir, `${table}.csv`);
      fs.writeFileSync(filePath, csvContent, 'utf8');

      summary.tablesExported++;
      summary.totalRecords += res.rows.length;
      summary.files.push({
        table,
        rows: res.rows.length,
        fileName: `${table}.csv`,
        sizeBytes: Buffer.byteLength(csvContent),
        sizeKb: (Buffer.byteLength(csvContent) / 1024).toFixed(1)
      });
      console.log(`[csv-export] ✓ ${table}: ${res.rows.length} rows (${(Buffer.byteLength(csvContent)/1024).toFixed(1)} KB)`);
    } catch (err) {
      console.warn(`[csv-export] ⚠ Error exporting ${table}:`, err.message);
    }
  }

  // Create ZIP archive using AdmZip
  console.log('[csv-export] Compressing tables into ZIP archive...');
  const zip = new AdmZip();
  zip.addLocalFolder(snapshotDir);

  const zipName = `backup-yangon-${yangon.stamp}.zip`;
  const datedZipPath = path.join(baseDir, zipName);
  const latestZipPath = path.join(baseDir, 'latest-yangon-backup.zip');
  const publicLatestZipPath = path.join(publicDir, 'latest-yangon-backup.zip');

  zip.writeZip(datedZipPath);
  zip.writeZip(latestZipPath);
  zip.writeZip(publicLatestZipPath);

  const stats = fs.statSync(publicLatestZipPath);
  summary.zipName = zipName;
  summary.zipSizeBytes = stats.size;
  summary.zipSizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  summary.downloadUrl = '/backups/latest-yangon-backup.zip';

  // Save manifests
  const manifestContent = JSON.stringify(summary, null, 2);
  fs.writeFileSync(path.join(baseDir, 'latest-backup-manifest.json'), manifestContent);
  fs.writeFileSync(path.join(publicDir, 'latest-backup-manifest.json'), manifestContent);

  // Update backup history
  const historyPath = path.join(baseDir, 'backup-history.json');
  let history = [];
  try {
    if (fs.existsSync(historyPath)) {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    }
  } catch (_) {}
  history.unshift({
    timestamp: new Date().toISOString(),
    yangonDisplay: yangon.display,
    zipName,
    tablesCount: summary.tablesExported,
    totalRecords: summary.totalRecords,
    sizeMb: summary.zipSizeMb
  });
  // Keep last 30 backups in history
  if (history.length > 30) history = history.slice(0, 30);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  fs.writeFileSync(path.join(publicDir, 'backup-history.json'), JSON.stringify(history, null, 2));

  await client.end();
  console.log(`[csv-export] ★★★ COMPLETED: ${summary.tablesExported} tables, ${summary.totalRecords} records (${summary.zipSizeMb} MB ZIP).`);
  return summary;
}

if (process.argv[1]?.endsWith('export-all-csv.mjs')) {
  exportAllTablesToCsv()
    .then((s) => {
      console.log(`[csv-export] Done. Download path: ${s.downloadUrl}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('[csv-export] Fatal error:', err);
      process.exit(1);
    });
}
