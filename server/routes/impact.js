const router = require('express').Router();
const supabase = require('../config/supabase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { asyncHandler, must } = require('../utils/errors');

// Definitions: items submitted = all non-rejected requests; recycled = completed requests only.
router.get('/mine', verifyToken, requireRole('user'), asyncHandler(async (req, res) => {
  const rows = must(await supabase.from('requests')
    .select('quantity,status,waste_categories(name)').eq('user_id', req.user.id));
  const active = rows.filter((r) => r.status !== 'rejected');
  const done = rows.filter((r) => r.status === 'completed');
  const sum = (list) => list.reduce((s, r) => s + r.quantity, 0);

  const byCategory = {};
  active.forEach((r) => { byCategory[r.waste_categories.name] = (byCategory[r.waste_categories.name] || 0) + r.quantity; });

  res.json({
    total_items: sum(active),
    recycled_items: sum(done),
    completed_requests: done.length,
    categories_count: Object.keys(byCategory).length,
    breakdown: Object.entries(byCategory).map(([name, items]) => ({ name, items })).sort((a, b) => b.items - a.items)
  });
}));

module.exports = router;
