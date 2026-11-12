const router = require('express').Router();
const supabase = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');
const { HttpError, asyncHandler, must } = require('../utils/errors');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const when = (d) => new Date(d).toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
});

router.use(verifyToken);

router.get('/mine', asyncHandler(async (req, res) => {
  const rows = must(await supabase.from('notifications')
    .select('id,title,body,kind,href,is_read,created_at').eq('user_id', req.user.id)
    .order('created_at', { ascending: false }).limit(100));
  res.json(rows.map((n) => ({
    id: n.id, title: n.title, body: n.body, kind: n.kind,
    href: n.href || '/track-requests.html', read: n.is_read,
    time: when(n.created_at), created_at: n.created_at
  })));
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
  must(await supabase.from('notifications').update({ is_read: true })
    .eq('user_id', req.user.id).eq('is_read', false));
  res.json({ ok: true });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  if (!UUID.test(req.params.id)) throw new HttpError(404, 'Notification not found');
  const n = must(await supabase.from('notifications').update({ is_read: true })
    .eq('id', req.params.id).eq('user_id', req.user.id).select('id').maybeSingle());
  if (!n) throw new HttpError(404, 'Notification not found');
  res.json({ ok: true });
}));

module.exports = router;
