// Register page.
(function () {
  if (window.Auth.currentUser()) { location.href = 'index.html'; return; }
  const form = document.getElementById('register-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.password.value !== form.confirm.value) {
      window.toast('Passwords do not match', 'error'); return;
    }
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Creating...';
    try {
      const user = await window.Auth.register(form.name.value.trim(), form.email.value.trim(), form.password.value);
      window.toast(`Welcome, ${user.name.split(' ')[0]}! Account created.`, 'success');
      setTimeout(() => (location.href = 'index.html'), 600);
    } catch (err) {
      btn.disabled = false; btn.innerHTML = 'Create Account';
      window.toast(err.message, 'error');
    }
  });
})();
