// Thin fetch wrapper that attaches the JWT and normalizes errors.
(function () {
  const TOKEN_KEY = 'fh_token';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); }

  async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

    let res;
    try {
      res = await fetch(`${window.APP.API_BASE}${path}`, {
        method,
        headers,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw new Error('Cannot reach the server. Is the backend running?');
    }

    let data = null;
    const text = await res.text();
    if (text) { try { data = JSON.parse(text); } catch { data = { message: text }; } }

    if (!res.ok) {
      const msg = (data && data.message) || `Request failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  window.API = {
    getToken, setToken,
    get: (p, auth) => request(p, { auth }),
    post: (p, body, auth) => request(p, { method: 'POST', body, auth }),
    put: (p, body, auth) => request(p, { method: 'PUT', body, auth }),
    del: (p, auth) => request(p, { method: 'DELETE', auth }),
  };
})();
