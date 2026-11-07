const bcrypt = require('bcrypt');
const db = require('./config/db');
(async () => {
  const hash = await bcrypt.hash('MediCare@123', 12);
  const emails = ['admin@vyshnavimedicare.demo','ananya@example.com','rahul@example.com','meera@example.com'];
  for (const email of emails) await db.promise().execute('UPDATE users SET password=? WHERE email=?', [hash, email]);
  console.log('Demo account password hashes updated. Password: MediCare@123');
  await db.promise().end();
})().catch(async error => {
  console.error('Could not seed demo credentials:', error.message);
  try { await db.promise().end(); } catch {}
  process.exit(1);
});
