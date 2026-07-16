// Cart state. Stored in localStorage; synced to the server when logged in.
// Each item: { id, name, price, image, qty }
(function () {
  const KEY = 'fh_cart';

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
  function write(items) { localStorage.setItem(KEY, JSON.stringify(items)); updateBadge(); syncToServer(items); }

  function count() { return read().reduce((s, i) => s + i.qty, 0); }
  function subtotal() { return read().reduce((s, i) => s + i.price * i.qty, 0); }

  function add(product, qty = 1) {
    const items = read();
    const id = product._id || product.id;
    const found = items.find((i) => i.id === id);
    if (found) found.qty += qty;
    else items.push({ id, name: product.name, price: product.price, image: product.image, qty });
    write(items);
    bumpBadge();
    window.toast && window.toast(`${product.name} added to cart`, 'success');
  }

  function update(id, qty) {
    let items = read();
    if (qty <= 0) items = items.filter((i) => i.id !== id);
    else { const it = items.find((i) => i.id === id); if (it) it.qty = qty; }
    write(items);
  }

  function remove(id) { write(read().filter((i) => i.id !== id)); }
  function clear() { write([]); }

  function updateBadge() {
    document.querySelectorAll('.cart-count').forEach((el) => { el.textContent = count(); });
  }
  function bumpBadge() {
    document.querySelectorAll('.cart-count').forEach((el) => {
      el.classList.remove('cart-bump'); void el.offsetWidth; el.classList.add('cart-bump');
    });
  }

  // Persist cart to the server for logged-in users (best effort).
  let syncTimer;
  function syncToServer(items) {
    if (!window.API || !window.API.getToken()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      window.API.put('/auth/cart', { items: items.map((i) => ({ product: i.id, qty: i.qty })) }, true).catch(() => {});
    }, 500);
  }

  // On login, merge the server cart into the local cart.
  async function mergeServerCart() {
    if (!window.API || !window.API.getToken()) return;
    try {
      const serverCart = await window.API.get('/auth/cart', true);
      const local = read();
      const map = new Map(local.map((i) => [i.id, i]));
      serverCart.forEach((s) => {
        const id = s.product._id;
        if (map.has(id)) map.get(id).qty = Math.max(map.get(id).qty, s.qty);
        else map.set(id, { id, name: s.product.name, price: s.product.price, image: s.product.image, qty: s.qty });
      });
      write(Array.from(map.values()));
    } catch { /* ignore */ }
  }

  window.Cart = { read, add, update, remove, clear, count, subtotal, updateBadge, mergeServerCart };
  document.addEventListener('DOMContentLoaded', updateBadge);
})();
