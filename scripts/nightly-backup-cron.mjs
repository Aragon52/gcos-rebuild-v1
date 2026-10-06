import { exportAllTablesToCsv, getYangonTimeString } from './export-all-csv.mjs';

let lastRunDate = '';

console.log('[cron-daemon] Initializing Nightly Database CSV Backup Monitor (Yangon Time GMT+6:30)...');

async function checkAndTrigger() {
  const yangon = getYangonTimeString();
  const [hours, minutes] = yangon.timeStr.split(':').map(Number);

  // Check if it's 12:00 AM (00:00 - 00:05) in Yangon and hasn't run today yet
  if (hours === 0 && minutes <= 5 && lastRunDate !== yangon.dateStr) {
    console.log(`[cron-daemon] ⏰ Yangon Midnight (12:00 AM MMT) reached on ${yangon.dateStr}! Executing backup...`);
    lastRunDate = yangon.dateStr;
    try {
      const summary = await exportAllTablesToCsv();
      console.log(`[cron-daemon] ✓ Backup completed: ${summary.tablesExported} tables, ${summary.totalRecords} records.`);
    } catch (err) {
      console.error('[cron-daemon] ✗ Backup error:', err);
    }
  }
}

// Initial check
checkAndTrigger();

// Interval check every 30 seconds keeps the event loop active and responsive
setInterval(checkAndTrigger, 30000);
