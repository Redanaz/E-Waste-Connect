require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../server/config/supabase');

async function ensureUser(name, email, password, role) {
  const { data: found } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (found) return found.id;
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('users').insert({ name, email, password_hash, role }).select('id').single();
  if (error) throw error;
  return data.id;
}

(async () => {
  const accounts = [
    ['System Admin', 'admin@ewaste.test', 'Admin@123', 'system_admin'],
    ['Sample Center Admin', 'center@ewaste.test', 'Center@123', 'center_admin'],
    ['Sample User', 'user@ewaste.test', 'User@123', 'user']
  ];
  const ids = {};
  for (const [name, email, password, role] of accounts) ids[role] = await ensureUser(name, email, password, role);

  const { data: existing } = await supabase.from('centers').select('id').eq('admin_id', ids.center_admin).maybeSingle();
  let centerId = existing?.id;
  if (!centerId) {
    const lat = 17.4435, lng = 78.3772;
    const { data, error } = await supabase.from('centers').insert({
      admin_id: ids.center_admin, name: 'Green Loop Recyclers (sample)', address: 'HITEC City, Hyderabad',
      pincode: '500081', phone: '9000000000', lat, lng, location: `SRID=4326;POINT(${lng} ${lat})`,
      pickup_available: true, dropoff_available: true, is_verified: true
    }).select('id').single();
    if (error) throw error;
    centerId = data.id;
    const { data: cats } = await supabase.from('waste_categories').select('id');
    await supabase.from('center_categories').insert(cats.map((c) => ({ center_id: centerId, category_id: c.id })));
  }

  console.log('Seed complete. Sample logins (change these after testing):');
  accounts.forEach(([, email, password, role]) => console.log(`  ${role.padEnd(13)} ${email}  /  ${password}`));
})().catch((e) => { console.error('Seed failed:', e.message || e); process.exit(1); });
