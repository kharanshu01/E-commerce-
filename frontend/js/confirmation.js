// Order confirmation page.
(async function () {
  const id = window.qs('id');
  const container = document.getElementById('confirm-container');
  if (!window.Auth.currentUser()) { location.href = 'login.html'; return; }
  if (!id) { container.innerHTML = '<div class="empty-state"><h4>No order specified.</h4></div>'; return; }

  try {
    const o = await window.API.get(`/orders/${id}`, true);
    const date = new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    container.innerHTML = `
      <div class="row justify-content-center">
        <div class="col-lg-8 text-center">
          <img src="assets/images/success_tick.svg" alt="Success" width="120" class="mb-4" style="animation:pulse 1s ease">
          <h2 class="mb-2">Thank you for your purchase! 🎉</h2>
          <p class="text-muted">A confirmation has been sent to <strong>${o.shipping.email || ''}</strong></p>

          <div class="order-summary text-left mt-4" style="position:static">
            <div class="d-flex justify-content-between flex-wrap mb-3">
              <div><small class="text-muted d-block">Order No.</small><strong>#${o._id.slice(-8).toUpperCase()}</strong></div>
              <div><small class="text-muted d-block">Date</small><strong>${date}</strong></div>
              <div><small class="text-muted d-block">Payment</small><strong class="text-success">Paid</strong></div>
              <div><small class="text-muted d-block">Status</small><span class="badge badge-status status-${o.status}">${o.status}</span></div>
            </div>
            <hr>
            ${o.items.map((i) => `
              <div class="d-flex align-items-center mb-3">
                <img src="${i.image}" width="54" height="54" class="rounded mr-3 object-cover" alt="${i.name}">
                <div class="flex-grow-1"><div>${i.name}</div><small class="text-muted">Qty: ${i.qty}</small></div>
                <div class="font-weight-bold">${window.fmt(i.price * i.qty)}</div>
              </div>`).join('')}
            <hr>
            <div class="d-flex justify-content-between mb-2"><span>Subtotal</span><span>${window.fmt(o.itemsPrice)}</span></div>
            <div class="d-flex justify-content-between mb-2"><span>Tax</span><span>${window.fmt(o.taxPrice)}</span></div>
            <div class="d-flex justify-content-between mb-2"><span>Shipping</span><span>${o.shippingPrice === 0 ? 'FREE' : window.fmt(o.shippingPrice)}</span></div>
            <div class="d-flex justify-content-between"><strong>Total</strong><strong class="text-gradient" style="font-size:1.2rem">${window.fmt(o.totalPrice)}</strong></div>
          </div>

          <div class="mt-4">
            <a href="orders.html" class="btn btn-outline-primary mr-2">View My Orders</a>
            <a href="product.html" class="btn btn-primary">Continue Shopping</a>
          </div>
        </div>
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h4>${err.message}</h4><a href="index.html" class="btn btn-primary mt-3">Home</a></div>`;
  }
})();
