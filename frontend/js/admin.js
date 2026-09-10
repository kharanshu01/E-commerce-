// Admin dashboard: customer, order, and inventory overview.
(function () {
  const user = window.Auth.currentUser();
  if (!user) {
    location.href = 'login.html?next=admin.html';
    return;
  }
  if (user.role !== 'admin') {
    window.Auth.clearSession();
    location.href = 'login.html?next=admin.html';
    return;
  }

  const stats = document.getElementById('admin-stats');
  const ordersEl = document.getElementById('admin-orders');
  const usersEl = document.getElementById('admin-users');
  const productsEl = document.getElementById('admin-products');
  const errorEl = document.getElementById('admin-error');
  const statuses = ['Pending', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];

  const date = (value) => new Date(value).toLocaleDateString();
  const statusLabel = (value) => value === 'OutForDelivery' ? 'Out for delivery' : value;

  function renderStats(users, orders, products) {
    const revenue = orders.filter((order) => order.isPaid).reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
    const lowStock = products.filter((product) => Number(product.countInStock) < 10).length;
    stats.innerHTML = [
      ['fa-users', users.length, 'Customers'],
      ['fa-shopping-bag', orders.length, 'Orders'],
      ['fa-rupee-sign', window.fmt(revenue), 'Paid revenue'],
      ['fa-exclamation-triangle', lowStock, 'Low-stock products'],
    ].map(([icon, value, label]) => `<div class="col-md-3 mb-3"><div class="stat-card h-100"><div class="feature-icon"><i class="fas ${icon}"></i></div><h3>${value}</h3><p>${label}</p></div></div>`).join('');
  }

  function renderOrders(orders) {
    ordersEl.innerHTML = orders.length ? orders.map((order) => `<tr><td>#${String(order._id).slice(-8).toUpperCase()}</td><td>${order.user?.name || 'Unknown'}<br><small class="text-muted">${order.user?.email || ''}</small></td><td>${date(order.createdAt)}</td><td>${window.fmt(order.totalPrice)}</td><td><span class="badge badge-light">${statusLabel(order.status)}</span></td><td><select class="form-control form-control-sm status-change" data-id="${order._id}">${statuses.map((status) => `<option value="${status}" ${status === order.status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}</select></td></tr>`).join('') : '<tr><td colspan="6" class="text-center text-muted">No orders yet.</td></tr>';
    ordersEl.querySelectorAll('.status-change').forEach((select) => select.addEventListener('change', async () => {
      try {
        await window.API.put(`/orders/${select.dataset.id}/status`, { status: select.value }, true);
        window.toast('Order status updated.', 'success');
      } catch (err) { window.toast(err.message, 'error'); }
    }));
  }

  function renderUsers(users) {
    usersEl.innerHTML = users.length ? users.map((item) => `<tr><td>${item.name}</td><td>${item.email}</td><td>${item.role}</td><td>${date(item.createdAt)}</td></tr>`).join('') : '<tr><td colspan="4" class="text-center text-muted">No customers yet.</td></tr>';
  }

  function renderProducts(products) {
    productsEl.innerHTML = products.length ? products.map((item) => `<tr><td>${item.name}</td><td class="${item.countInStock < 10 ? 'text-danger font-weight-bold' : ''}">${item.countInStock}</td><td>${window.fmt(item.price)}</td></tr>`).join('') : '<tr><td colspan="3" class="text-center text-muted">No products found.</td></tr>';
  }

  async function load() {
    errorEl.innerHTML = '';
    try {
      const [users, orderData, productData] = await Promise.all([
        window.API.get('/auth/users', true),
        window.API.get('/orders', true),
        window.API.get('/products?limit=60'),
      ]);
      renderStats(users, orderData, productData.items || []);
      renderOrders(orderData);
      renderUsers(users);
      renderProducts(productData.items || []);
    } catch (err) {
      errorEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  }

  document.getElementById('refresh-admin').addEventListener('click', load);
  load();
})();
