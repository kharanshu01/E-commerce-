// Shared UI helpers: toasts, scroll reveal, navbar shrink, back-to-top.
(function () {
  // ---- Toast notifications ----
  function ensureContainer() {
    let c = document.getElementById('toast-container');
    if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
    return c;
  }
  window.toast = function (message, type = 'info', ms = 3000) {
    const c = ensureContainer();
    const el = document.createElement('div');
    el.className = `toast-msg ${type}`;
    el.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>${message}`;
    c.appendChild(el);
    setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 350); }, ms);
  };

  // ---- Scroll reveal ----
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !items.length) {
      items.forEach((i) => i.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach((i) => io.observe(i));
  }

  // ---- Navbar shrink + back-to-top ----
  function initScrollFx() {
    const header = document.querySelector('.header_menu');
    const backBtn = document.getElementById('button');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (header) header.classList.toggle('scrolled', y > 30);
      if (backBtn) backBtn.classList.toggle('show', y > 400);
    });
    if (backBtn) backBtn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  function initScrollProgress() {
    let bar = document.getElementById('scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scroll-progress';
      document.body.prepend(bar);
    }
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (window.scrollY / height) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  document.addEventListener('DOMContentLoaded', () => { initReveal(); initScrollFx(); initScrollProgress(); });
  // Re-run reveal after dynamic content loads.
  window.refreshReveal = initReveal;
})();
