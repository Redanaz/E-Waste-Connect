const router = require('express').Router();
const supabase = require('../config/supabase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { HttpError, asyncHandler, must } = require('../utils/errors');

const TRANSITIONS = {
  requested: ['accepted', 'rejected'],
  accepted: ['processing'],
  processing: ['completed']
};

router.use(verifyToken);

router.post('/', requireRole('user'), asyncHandler(async (req, res) => {
  const { center_id, category_id, mode, pickup_address, description = '' } = req.body;
  const quantity = parseInt(req.body.quantity ?? 1, 10);
  if (!center_id || !category_id || !mode) throw new HttpError(400, 'center_id, category_id and mode are required');
  if (!['pickup', 'dropoff'].includes(mode)) throw new HttpError(400, 'mode must be pickup or dropoff');
  if (!(quantity > 0)) throw new HttpError(400, 'quantity must be at least 1');

  const center = must(await supabase.from('centers')
    .select('id,is_verified,pickup_available,dropoff_available').eq('id', center_id).maybeSingle());
  if (!center || !center.is_verified) throw new HttpError(404, 'Center not found');
  if (mode === 'pickup' && !center.pickup_available) throw new HttpError(400, 'This center does not offer pickup');
  if (mode === 'dropoff' && !center.dropoff_available) throw new HttpError(400, 'This center does not accept drop-off');
  if (mode === 'pickup' && !pickup_address) throw new HttpError(400, 'Pickup address is required for pickup');

  const accepts = must(await supabase.from('center_categories').select('center_id')
    .eq('center_id', center_id).eq('category_id', category_id).maybeSingle());
  if (!accepts) throw new HttpError(400, 'This center does not accept that waste category');

  const created = must(await supabase.from('requests').insert({
    user_id: req.user.id, center_id, category_id, mode, quantity, description,
    pickup_address: mode === 'pickup' ? pickup_address : null
  }).select().single());
  res.status(201).json(created);
}));

router.get('/mine', requireRole('user'), asyncHandler(async (req, res) => {
  res.json(must(await supabase.from('requests')
    .select('id,quantity,description,mode,pickup_address,status,created_at,updated_at,centers(name),waste_categories(name)')
    .eq('user_id', req.user.id).order('created_at', { ascending: false })));
}));

router.get('/center', requireRole('center_admin'), asyncHandler(async (req, res) => {
  const center = must(await supabase.from('centers').select('id').eq('admin_id', req.user.id).maybeSingle());
  if (!center) return res.json([]);
  res.json(must(await supabase.from('requests')
    .select('id,quantity,description,mode,pickup_address,status,created_at,users(name,email),waste_categories(name)')
    .eq('center_id', center.id).order('created_at', { ascending: false })));
}));

router.patch('/:id/status', requireRole('center_admin'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  const reqRow = must(await supabase.from('requests').select('id,status,centers(admin_id)').eq('id', req.params.id).maybeSingle());
  if (!reqRow) throw new HttpError(404, 'Request not found');
  if (reqRow.centers.admin_id !== req.user.id) throw new HttpError(403, 'This request is not for your center');
  if (!(TRANSITIONS[reqRow.status] || []).includes(status)) {
    throw new HttpError(400, `Cannot change status from ${reqRow.status} to ${status}`);
  }
  const updated = must(await supabase.from('requests')
    .update({ status, updated_at: new Date().toISOString() }).eq('id', reqRow.id).select('id,status').single());
  res.json(updated);
}));

module.exports = router;
