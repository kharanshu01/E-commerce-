// Central config + tiny helpers shared by every page.
const localPreview = window.location.protocol === 'file:'
  || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    && window.location.port !== '5000');

window.APP = {
  // Use the Express server when the frontend is opened directly or via Live Server.
  API_BASE: localPreview ? 'http://localhost:5000/api' : '/api',
  CURRENCY: '₹',
};

// Format a number as currency.
window.fmt = (n) => `${window.APP.CURRENCY}${Number(n || 0).toLocaleString('en-IN')}`;

// Read query string params.
window.qs = (key) => new URLSearchParams(location.search).get(key);
