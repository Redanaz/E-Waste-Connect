const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');
const { HttpError, asyncHandler, must } = require('../utils/errors');

const sign = (u) => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  if (!name || !email || !password) throw new HttpError(400, 'Name, email and password are required');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'Enter a valid email');
  if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
  if (!['user', 'center_admin'].includes(role)) throw new HttpError(400, 'Invalid role');

  const mail = email.toLowerCase();
  const exists = must(await supabase.from('users').select('id').eq('email', mail).maybeSingle());
  if (exists) throw new HttpError(409, 'Email already registered');

  const password_hash = await bcrypt.hash(password, 10);
  const user = must(await supabase.from('users').insert({ name, email: mail, password_hash, role })
    .select('id,name,email,role').single());
  res.status(201).json({ token: sign(user), user });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email and password are required');
  const row = must(await supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle());
  if (!row || !(await bcrypt.compare(password, row.password_hash))) throw new HttpError(400, 'Invalid email or password');
  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  res.json({ token: sign(user), user });
}));

router.get('/me', verifyToken, asyncHandler(async (req, res) => {
  const user = must(await supabase.from('users').select('id,name,email,role').eq('id', req.user.id).maybeSingle());
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ user });
}));

module.exports = router;
