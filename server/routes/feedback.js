const router = require('express').Router();
const supabase = require('../config/supabase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { HttpError, asyncHandler, must } = require('../utils/errors');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const day = (d) => new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });

router.use(verifyToken, requireRole('user'));

// Completed requests the user has not reviewed yet
router.get('/eligible', asyncHandler(async (req, res) => {
  const done = must(await supabase.from('requests')
    .select('id,quantity,updated_at,centers(name),waste_categories(name)')
    .eq('user_id', req.user.id).eq('status', 'completed').order('updated_at', { ascending: false }));
  const given = must(await supabase.from('feedback').select('request_id').eq('user_id', req.user.id));
  const used = new Set(given.map((g) => g.request_id));
  res.json(done.filter((r) => !used.has(r.id)).map((r) => ({
    request_id: r.id, center_name: r.centers.name, category_name: r.waste_categories.name,
    quantity: r.quantity, date: day(r.updated_at)
  })));
}));

// The user's own reviews
router.get('/mine', asyncHandler(async (req, res) => {
  const rows = must(await supabase.from('feedback')
    .select('id,rating,comment,created_at,centers(name),requests(quantity,waste_categories(name))')
    .eq('user_id', req.user.id).order('created_at', { ascending: false }));
  res.json(rows.map((f) => ({
    id: f.id, centre: f.centers.name,
    request: `${f.requests.waste_categories.name} x ${f.requests.quantity}`,
    rating: f.rating, comment: f.comment, date: day(f.created_at)
  })));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { request_id } = req.body;
  const rating = parseInt(req.body.rating, 10);
  const comment = String(req.body.comment || '').trim();
  if (!UUID.test(request_id || '')) throw new HttpError(400, 'Choose one of your completed requests');
  if (!(rating >= 1 && rating <= 5)) throw new HttpError(400, 'Rating must be between 1 and 5');
  if (!comment) throw new HttpError(400, 'Please write a short comment');
  if (comment.length > 1000) throw new HttpError(400, 'Comment must be 1000 characters or fewer');

  const r = must(await supabase.from('requests').select('id,user_id,center_id,status').eq('id', request_id).maybeSingle());
  if (!r || r.user_id !== req.user.id) throw new HttpError(404, 'Request not found');
  if (r.status !== 'completed') throw new HttpError(400, 'You can review a request only after it is completed');
  const exists = must(await supabase.from('feedback').select('id').eq('request_id', r.id).maybeSingle());
  if (exists) throw new HttpError(409, 'You have already reviewed this request');

  const created = must(await supabase.from('feedback')
    .insert({ request_id: r.id, user_id: req.user.id, center_id: r.center_id, rating, comment })
    .select('id,rating,comment,created_at').single());
  res.status(201).json(created);
}));

module.exports = router;
