// Central config + tiny helpers shared by every page.
window.APP = {
  // API base. Empty string means "same origin" (server serves the frontend).
  API_BASE: '/api',
  CURRENCY: '₹',
};

// Format a number as currency.
window.fmt = (n) => `${window.APP.CURRENCY}${Number(n || 0).toLocaleString('en-IN')}`;

// Read query string params.
window.qs = (key) => new URLSearchParams(location.search).get(key);
