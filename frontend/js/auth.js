// Auth session helpers.
(function () {
  const USER_KEY = 'fh_user';

  function currentUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } }
  function setSession(token, user) {
    window.API.setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  function clearSession() { window.API.setToken(null); localStorage.removeItem(USER_KEY); }

  async function login(email, password) {
    const { token, user } = await window.API.post('/auth/login', { email, password });
    setSession(token, user);
    await window.Cart.mergeServerCart();
    return user;
  }

  async function register(name, email, password) {
    const { token, user } = await window.API.post('/auth/register', { name, email, password });
    setSession(token, user);
    return user;
  }

  async function logout() {
    try { await window.API.post('/auth/logout', {}, true); } catch {}
    clearSession();
  }

  // Redirect to login if not authenticated; returns the user or null.
  function requireAuth(redirect = true) {
    const u = currentUser();
    if (!u && redirect) {
      location.href = `login.html?next=${encodeURIComponent(location.pathname.split('/').pop() + location.search)}`;
    }
    return u;
  }

  window.Auth = { currentUser, login, register, logout, clearSession, requireAuth };
})();
