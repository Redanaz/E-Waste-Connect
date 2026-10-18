const router = require('express').Router();
const supabase = require('../config/supabase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { HttpError, asyncHandler, must } = require('../utils/errors');

router.use(verifyToken, requireRole('system_admin'));

router.get('/users', asyncHandler(async (req, res) => {
  res.json(must(await supabase.from('users').select('id,name,email,role,created_at').order('created_at', { ascending: false }).limit(500)));
}));

router.get('/centers', asyncHandler(async (req, res) => {
  res.json(must(await supabase.from('centers')
    .select('id,name,address,pincode,phone,is_verified,created_at,users(name,email)').order('created_at', { ascending: false }).limit(500)));
}));

router.get('/requests', asyncHandler(async (req, res) => {
  res.json(must(await supabase.from('requests')
    .select('id,status,mode,quantity,created_at,users(name),centers(name),waste_categories(name)')
    .order('created_at', { ascending: false }).limit(500)));
}));

router.patch('/centers/:id/verify', asyncHandler(async (req, res) => {
  if (typeof req.body.verified !== 'boolean') throw new HttpError(400, 'verified must be true or false');
  const c = must(await supabase.from('centers').update({ is_verified: req.body.verified })
    .eq('id', req.params.id).select('id,is_verified').maybeSingle());
  if (!c) throw new HttpError(404, 'Center not found');
  res.json(c);
}));

module.exports = router;
