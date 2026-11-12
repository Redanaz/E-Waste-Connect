const router = require('express').Router();
const supabase = require('../config/supabase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { asyncHandler, must } = require('../utils/errors');

// A certificate exists for every COMPLETED request handled by a VERIFIED center.
router.get('/mine', verifyToken, requireRole('user'), asyncHandler(async (req, res) => {
  const me = must(await supabase.from('users').select('name').eq('id', req.user.id).maybeSingle());
  const rows = must(await supabase.from('requests')
    .select('id,quantity,updated_at,centers(name,is_verified),waste_categories(name)')
    .eq('user_id', req.user.id).eq('status', 'completed').order('updated_at', { ascending: false }));

  res.json(rows.filter((r) => r.centers && r.centers.is_verified).map((r) => ({
    id: r.id,
    certificate_number: `EWC-${new Date(r.updated_at).getUTCFullYear()}-${r.id.slice(0, 8).toUpperCase()}`,
    user_name: me ? me.name : 'User',
    center_name: r.centers.name,
    category_name: r.waste_categories.name,
    quantity: r.quantity,
    completed_at: r.updated_at
  })));
}));

module.exports = router;
