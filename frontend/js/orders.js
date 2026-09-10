// Order history with delivery progress.
(function () {
  const list = document.getElementById('orders-list');
  const steps = ['Pending', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered'];
  const labels = { OutForDelivery: 'Out for delivery' };

  function renderOrder(order) {
    const current = steps.indexOf(order.status);
    const cancelled = ['Cancelled', 'Returned', 'Refunded'].includes(order.status);
    const timeline = cancelled
      ? `<div class="alert alert-secondary mb-3">Order status: ${labels[order.status] || order.status}</div>`
      : `<div class="order-tracking mb-3">${steps.map((step, index) => `<div class="tracking-step ${index <= current ? 'complete' : ''}"><span>${index < current ? '<i class="fas fa-check"></i>' : index + 1}</span><small>${labels[step] || step}</small></div>`).join('')}</div>`;
    return `<article class="order-summary mb-4"><div class="d-flex justify-content-between align-items-start flex-wrap"><div><h5>Order #${String(order._id).slice(-8).toUpperCase()}</h5><p class="text-muted mb-2">Placed ${new Date(order.createdAt).toLocaleDateString()}</p></div><strong>${window.fmt(order.totalPrice)}</strong></div>${timeline}<div class="row">${order.items.map((item) => `<div class="col-md-6 mb-2"><div class="d-flex align-items-center"><img src="${item.image}" alt="${item.name}" style="width:56px;height:56px;object-fit:cover;border-radius:8px;margin-right:10px"><span>${item.name} <small class="text-muted">×${item.qty}</small></span></div></div>`).join('')}</div>${order.trackingNumber ? `<p class="small text-muted mb-0">Tracking: ${order.trackingNumber}${order.courier ? ` · ${order.courier}` : ''}</p>` : ''}</article>`;
  }

  (async function load() {
    if (!window.Auth.requireAuth()) return;
    try {
      const orders = await window.API.get('/orders/mine', true);
      list.innerHTML = orders.length ? orders.map(renderOrder).join('') : '<div class="empty-state"><i class="fas fa-box-open"></i><h4>No orders yet</h4><a href="product.html" class="btn btn-primary mt-2">Start shopping</a></div>';
    } catch (err) {
      list.innerHTML = `<div class="empty-state"><h4>${err.message}</h4></div>`;
    }
  })();
})();
