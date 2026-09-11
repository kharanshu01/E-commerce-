window.APP = {
  // The frontend is served by Express on port 5000.
  API_BASE: '/api',
  CURRENCY: '₹',
};

// Format a number as currency.
window.fmt = (n) => `${window.APP.CURRENCY}${Number(n || 0).toLocaleString('en-IN')}`;

// Read query string params.
window.qs = (key) => new URLSearchParams(location.search).get(key);
