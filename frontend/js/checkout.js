// Checkout page: requires auth, submits order to the backend.
(function () {
  const user = window.Auth.requireAuth(); // redirects if not logged in
  if (!user) return;

  const items = window.Cart.read();
  const form = document.getElementById('checkout-form');
  const summaryEl = document.getElementById('checkout-summary');
  const TAX_RATE = 0.05, FREE_SHIP = 500, SHIP_FLAT = 40;

  if (!items.length) {
    document.querySelector('main .container').innerHTML =
      '<div class="empty-state"><i class="fas fa-shopping-cart"></i><h4>Your cart is empty</h4><a href="product.html" class="btn btn-primary mt-2">Shop Now</a></div>';
    return;
  }

  // Prefill email/name from the logged-in user.
  form.email.value = user.email || '';
  const [fn, ...rest] = (user.name || '').split(' ');
  form.firstName.value = fn || '';
  form.lastName.value = rest.join(' ');

  const subtotal = window.Cart.subtotal();
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = subtotal >= FREE_SHIP ? 0 : SHIP_FLAT;
  const total = subtotal + tax + shipping;

  summaryEl.innerHTML = `
    <h5 class="mb-4">Order Summary</h5>
    ${items.map((i) => `<div class="d-flex justify-content-between mb-2"><span class="text-truncate mr-2">${i.name} <small class="text-muted">×${i.qty}</small></span><span>${window.fmt(i.price * i.qty)}</span></div>`).join('')}
    <hr>
    <div class="d-flex justify-content-between mb-2"><span>Subtotal</span><span>${window.fmt(subtotal)}</span></div>
    <div class="d-flex justify-content-between mb-2"><span>Tax</span><span>${window.fmt(tax)}</span></div>
    <div class="d-flex justify-content-between mb-2"><span>Shipping</span><span>${shipping === 0 ? '<span class="text-success">FREE</span>' : window.fmt(shipping)}</span></div>
    <div class="form-group mt-3 mb-3"><label class="small font-weight-bold" for="coupon-code">Coupon code</label><input id="coupon-code" class="form-control" placeholder="Try WELCOME10"></div>
    <hr>
    <div class="d-flex justify-content-between mb-4"><strong>Total</strong><strong class="text-gradient" style="font-size:1.3rem">${window.fmt(total)}</strong></div>
    <button type="submit" form="checkout-form" class="btn btn-primary btn-block btn-lg" id="place-order">
      <i class="fas fa-lock mr-2"></i>Place Order
    </button>`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const btn = document.getElementById('place-order');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Processing...';

    const shippingData = Object.fromEntries(new FormData(form).entries());
    const paymentMethod = shippingData.pay === 'on' && document.getElementById('pay2').checked
      ? 'Card (Simulated)'
      : 'Cash on Delivery';
    delete shippingData.pay;
    const payload = {
      items: items.map((i) => ({ product: i.id, qty: i.qty })),
      shipping: shippingData,
      paymentMethod,
      couponCode: document.getElementById('coupon-code').value.trim(),
    };

    try {
      const order = await window.API.post('/orders', payload, true);
      window.Cart.clear();
      location.href = `order_confirmation.html?id=${order._id}`;
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-lock mr-2"></i>Place Order';
      window.toast(err.message, 'error');
      if (err.status === 401) setTimeout(() => (location.href = 'login.html?next=checkout.html'), 1000);
    }
  });
})();
