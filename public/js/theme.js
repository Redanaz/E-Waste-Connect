(function () {
  const KEY = 'ewaste-theme';
  const root = document.documentElement;

  function readTheme() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (_) {}
    return 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (_) {}
    const button = document.getElementById('theme-toggle');
    if (button) {
      const dark = theme === 'dark';
      button.innerHTML = dark ? '☀️ <span>Light mode</span>' : '🌙 <span>Dark mode</span>';
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  function addToggle() {
    if (document.getElementById('theme-toggle')) return;
    const header = document.getElementById('nav') || document.querySelector('header.nav');
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'theme-toggle';
    button.className = 'theme-toggle';
    button.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    if (header) header.appendChild(button);
    else document.body.appendChild(button);
    applyTheme(readTheme());
  }

  applyTheme(readTheme());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addToggle, { once: true });
  } else {
    addToggle();
  }
})();
