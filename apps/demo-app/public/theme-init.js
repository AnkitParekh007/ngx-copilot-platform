// Theme initialisation — runs before Angular boots to prevent flash of wrong theme.
(function () {
  try {
    var t = localStorage.getItem('ngx-copilot-sdk:theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();
