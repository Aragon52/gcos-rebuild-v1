import pg from 'pg';

const { Client } = pg;

const host = process.env.PGHOST || 'db.hreotqowulxpchyxjlai.supabase.co';
const port = parseInt(process.env.PGPORT || '5432', 10);
const user = process.env.PGUSER || 'postgres';
const database = process.env.PGDATABASE || 'postgres';
const password = process.env.PGPASSWORD || 'Aragon$27726&1226';

async function moveReseller() {
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  await client.connect();

  console.log('Connected to PostgreSQL database.');

  // 1. Get Admin Myo Gyi and Staff
  const adminRes = await client.query(`SELECT id, name, email, account_id FROM sla_admins WHERE name ILIKE '%Myo%' OR email ILIKE '%myogyi%' LIMIT 1;`);
  const myoAdmin = adminRes.rows[0];

  const staffRes = await client.query(`SELECT id, name, email, referral_id, staff_id FROM sla_staff WHERE created_by_admin_id = $1 LIMIT 1;`, [myoAdmin.id]);
  const myoStaff = staffRes.rows[0];

  console.log('Admin Myo Gyi:', myoAdmin.name, `(${myoAdmin.id})`);
  console.log('Staff Myo Gyi:', myoStaff?.name, `(${myoStaff?.id})`, 'Referral Code:', myoStaff?.referral_id);

  // 2. Fetch Reseller 25374
  const beforeRes = await client.query(`SELECT id, reseller_id, shop_name, first_name, last_name, email, member_of_admin_id, referred_by_staff_id, referral_id, referral_code FROM reseller_profiles WHERE reseller_id = 25374;`);
  console.log('BEFORE Update (Reseller 25374):', beforeRes.rows[0]);

  // 3. Update reseller_profiles
  const updateRes = await client.query(`
    UPDATE reseller_profiles
    SET member_of_admin_id = $1,
        referred_by_staff_id = $2,
        referral_code = $3,
        updated_at = NOW()
    WHERE reseller_id = 25374
    RETURNING id, reseller_id, shop_name, first_name, last_name, email, member_of_admin_id, referred_by_staff_id, referral_id, referral_code;
  `, [
    myoAdmin.id,
    myoStaff ? myoStaff.id : null,
    myoStaff ? myoStaff.referral_id : myoAdmin.account_id
  ]);

  console.log('AFTER Update (Reseller 25374):', updateRes.rows[0]);
  console.log('SUCCESS: Reseller ID 25374 successfully moved under Admin Myo Gyi!');

  await client.end();
}

moveReseller().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
