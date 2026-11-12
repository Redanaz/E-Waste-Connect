const router = require('express').Router();
const supabase = require('../config/supabase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { geocode } = require('../services/nominatim');
const { HttpError, asyncHandler, must } = require('../utils/errors');

const FIELDS = 'id,name,address,pincode,phone,lat,lng,pickup_available,dropoff_available,is_verified';
const num = (v) => (v === undefined || v === null || v === '' ? NaN : Number(v));
const ewkt = (lat, lng) => `SRID=4326;POINT(${lng} ${lat})`;

async function resolveLocation(body) {
  const lat = num(body.lat), lng = num(body.lng);
  if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  const g = await geocode([body.address, body.pincode, 'India'].filter(Boolean).join(', '));
  if (!g) throw new HttpError(400, 'Could not find that address. Check the address and PIN code.');
  return { lat: g.lat, lng: g.lng };
}

async function ownCenter(userId, centerId) {
  const c = must(await supabase.from('centers').select('*').eq('id', centerId).maybeSingle());
  if (!c) throw new HttpError(404, 'Center not found');
  if (c.admin_id !== userId) throw new HttpError(403, 'This is not your center');
  return c;
}

// Search verified centers near a point, location text or PIN code
router.get('/nearby', asyncHandler(async (req, res) => {
  let lat = num(req.query.lat), lng = num(req.query.lng);
  if (isNaN(lat) || isNaN(lng)) {
    const q = req.query.pincode ? `${req.query.pincode}, India` : req.query.q;
    if (!q) throw new HttpError(400, 'Provide lat/lng, a PIN code or a location');
    const g = await geocode(q);
    if (!g) throw new HttpError(404, 'Location not found');
    ({ lat, lng } = g);
  }
  const radius = Math.min(num(req.query.radius) || 10, 100);
  const category = req.query.category ? parseInt(req.query.category, 10) : null;
  const { data, error } = await supabase.rpc('nearby_centers', {
    p_lat: lat, p_lng: lng, p_radius_km: radius, p_category: category
  });
  if (error) throw new HttpError(500, error.message);
  res.json({ origin: { lat, lng }, centers: data });
}));

// The logged-in center admin's own center
router.get('/mine', verifyToken, requireRole('center_admin'), asyncHandler(async (req, res) => {
  const center = must(await supabase.from('centers').select(FIELDS).eq('admin_id', req.user.id).maybeSingle());
  if (!center) return res.json({ center: null });
  const cats = must(await supabase.from('center_categories').select('category_id').eq('center_id', center.id));
  res.json({ center: { ...center, category_ids: cats.map((c) => c.category_id) } });
}));
router.get('/analytics', verifyToken, requireRole('center_admin'), asyncHandler(async (req, res) => {
  const blank = { total_requests: 0, completed_requests: 0, pending_requests: 0, categories_count: 0 };
  const center = must(await supabase.from('centers').select('id').eq('admin_id', req.user.id).maybeSingle());
  if (!center) return res.json({ kpis: blank, ...blank, monthly: [], categories: [], recent: [] });

  const rows = must(await supabase.from('requests')
    .select('id,quantity,status,created_at,waste_categories(name)')
    .eq('center_id', center.id).order('created_at', { ascending: false }).limit(5000));
  const accepted = must(await supabase.from('center_categories').select('category_id').eq('center_id', center.id));

  // Pending = requested + accepted + processing (not yet completed or rejected)
  const kpis = {
    total_requests: rows.length,
    completed_requests: rows.filter((r) => r.status === 'completed').length,
    pending_requests: rows.filter((r) => ['requested', 'accepted', 'processing'].includes(r.status)).length,
    categories_count: accepted.length
  };

  const now = new Date();
  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    monthly.push({ key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, label: d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), count: 0 });
  }
  rows.forEach((r) => {
    const d = new Date(r.created_at);
    const m = monthly.find((x) => x.key === `${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    if (m) m.count++;
  });

  const byCategory = {};
  rows.forEach((r) => { byCategory[r.waste_categories.name] = (byCategory[r.waste_categories.name] || 0) + 1; });
  const categories = Object.entries(byCategory)
    .map(([name, count]) => ({ name, count, percent: rows.length ? Math.round((count / rows.length) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  const recent = rows.slice(0, 5).map((r) => ({
    ref: '#' + r.id.slice(0, 8).toUpperCase(), category: r.waste_categories.name, quantity: r.quantity, status: r.status
  }));

  res.json({ kpis, ...kpis, monthly: monthly.map(({ label, count }) => ({ label, count })), categories, recent });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const center = must(await supabase.from('centers').select(FIELDS).eq('id', req.params.id).maybeSingle());
  if (!center || !center.is_verified) throw new HttpError(404, 'Center not found');
  const cats = must(await supabase.from('center_categories')
    .select('category_id, waste_categories(name)').eq('center_id', center.id));
  res.json({ ...center, categories: cats.map((c) => ({ id: c.category_id, name: c.waste_categories.name })) });
}));

router.post('/', verifyToken, requireRole('center_admin'), asyncHandler(async (req, res) => {
  const { name, address, pincode, phone, pickup_available = false, dropoff_available = true } = req.body;
  if (!name || !address) throw new HttpError(400, 'Name and address are required');
  const existing = must(await supabase.from('centers').select('id').eq('admin_id', req.user.id).maybeSingle());
  if (existing) throw new HttpError(409, 'You have already registered a center');
  const { lat, lng } = await resolveLocation(req.body);
  const center = must(await supabase.from('centers').insert({
    admin_id: req.user.id, name, address, pincode, phone, lat, lng, location: ewkt(lat, lng),
    pickup_available: !!pickup_available, dropoff_available: !!dropoff_available
  }).select(FIELDS).single());
  res.status(201).json(center);
}));

router.put('/:id', verifyToken, requireRole('center_admin'), asyncHandler(async (req, res) => {
  const current = await ownCenter(req.user.id, req.params.id);
  const update = {};
  ['name', 'address', 'pincode', 'phone'].forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  ['pickup_available', 'dropoff_available'].forEach((k) => { if (req.body[k] !== undefined) update[k] = !!req.body[k]; });

  const moved = (update.address && update.address !== current.address) || (update.pincode && update.pincode !== current.pincode)
    || !isNaN(num(req.body.lat));
  if (moved) {
    const { lat, lng } = await resolveLocation({ ...current, ...update, lat: req.body.lat, lng: req.body.lng });
    Object.assign(update, { lat, lng, location: ewkt(lat, lng) });
  }
  const center = must(await supabase.from('centers').update(update).eq('id', current.id).select(FIELDS).single());
  res.json(center);
}));

router.put('/:id/categories', verifyToken, requireRole('center_admin'), asyncHandler(async (req, res) => {
  const center = await ownCenter(req.user.id, req.params.id);
  const ids = Array.isArray(req.body.category_ids) ? [...new Set(req.body.category_ids.map(Number))].filter(Number.isInteger) : null;
  if (!ids) throw new HttpError(400, 'category_ids must be an array');
  must(await supabase.from('center_categories').delete().eq('center_id', center.id));
  if (ids.length) must(await supabase.from('center_categories').insert(ids.map((category_id) => ({ center_id: center.id, category_id }))));
  res.json({ category_ids: ids });
}));

module.exports = router;
