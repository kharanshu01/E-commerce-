// Login page.
(function () {
  if (window.Auth.currentUser()) { location.href = 'index.html'; return; }
  const form = document.getElementById('login-form');
  const next = window.qs('next') || 'index.html';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Signing in...';
    try {
      const user = await window.Auth.login(form.email.value.trim(), form.password.value);
      window.toast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      setTimeout(() => (location.href = next), 500);
    } catch (err) {
      btn.disabled = false; btn.innerHTML = 'Sign In';
      window.toast(err.message, 'error');
    }
  });
})();
