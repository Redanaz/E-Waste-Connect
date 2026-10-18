const API = '/api';

const getToken = () => localStorage.getItem('token');
function getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }
function saveSession(token, user) { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); }
function logout() { localStorage.clear(); location.href = '/login.html'; }

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(API + path, { method: opts.method || 'GET', headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) logout();
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

function dashboardFor(role) {
  return { user: '/user-dashboard.html', center_admin: '/center-dashboard.html', system_admin: '/admin-dashboard.html' }[role] || '/';
}

function requireRole(role) {
  const u = getUser();
  if (!u || !getToken()) { location.href = '/login.html'; return null; }
  if (role && u.role !== role) { location.href = dashboardFor(u.role); return null; }
  return u;
}

function renderNav() {
  const u = getUser();
  const el = document.getElementById('nav');
  if (!el) return;
  el.className = 'nav';
  el.innerHTML = '<a class="brand" href="/">E-Waste Connect</a><nav>' + (u
    ? `<a href="${dashboardFor(u.role)}">Dashboard</a><a href="#" id="logout-link">Log out (${esc(u.name)})</a>`
    : '<a href="/login.html">Log in</a><a href="/register.html">Register</a>') + '</nav>';
  const out = document.getElementById('logout-link');
  if (out) out.onclick = (e) => { e.preventDefault(); logout(); };
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const statusBadge = (s) => `<span class="badge ${esc(s)}">${esc(s)}</span>`;
const yesNo = (v) => `<span class="badge ${v ? 'yes' : 'no'}">${v ? 'Yes' : 'No'}</span>`;
function showMsg(id, text, type = 'error') {
  const el = document.getElementById(id);
  if (el) el.innerHTML = text ? `<div class="msg ${type}">${esc(text)}</div>` : '';
}
const fmtDate = (d) => new Date(d).toLocaleString();
