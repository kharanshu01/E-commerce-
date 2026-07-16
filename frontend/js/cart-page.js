// Cart page: list items, edit quantities, live totals.
(function () {
  const itemsEl = document.getElementById('cart-items');
  const summaryEl = document.getElementById('cart-summary');
  const TAX_RATE = 0.05;
  const FREE_SHIP = 500;
  const SHIP_FLAT = 40;

  function render() {
    const items = window.Cart.read();
    if (!items.length) {
      itemsEl.innerHTML = `<div class="empty-state"><i class="fas fa-shopping-cart"></i><h4>Your cart is empty</h4>
        <p>Looks like you haven't added anything yet.</p>
        <a href="product.html" class="btn btn-primary mt-2">Start Shopping</a></div>`;
      summaryEl.innerHTML = '';
      return;
    }

    itemsEl.innerHTML = `<h5 class="mb-3">${items.length} item${items.length > 1 ? 's' : ''} in cart</h5>` +
      items.map((i) => `
        <div class="cart-item">
          <div class="row align-items-center">
            <div class="col-3 col-md-2"><img src="${i.image}" alt="${i.name}"></div>
            <div class="col-9 col-md-4">
              <h6 class="mb-1">${i.name}</h6>
              <div class="price" style="font-size:1rem">${window.fmt(i.price)}</div>
            </div>
            <div class="col-6 col-md-3 mt-2 mt-md-0">
              <div class="qty-control">
                <button data-act="dec" data-id="${i.id}">&minus;</button>
                <input type="number" min="1" value="${i.qty}" data-id="${i.id}" data-act="set">
                <button data-act="inc" data-id="${i.id}">+</button>
              </div>
            </div>
            <div class="col-4 col-md-2 mt-2 mt-md-0 text-right font-weight-bold">${window.fmt(i.price * i.qty)}</div>
            <div class="col-2 col-md-1 text-right">
              <button class="btn btn-link text-danger p-0" data-act="remove" data-id="${i.id}" title="Remove"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
        </div>`).join('') +
      '<a href="product.html" class="btn btn-outline-primary mt-2"><i class="fas fa-arrow-left mr-1"></i>Continue Shopping</a>';

    const subtotal = window.Cart.subtotal();
    const tax = Math.round(subtotal * TAX_RATE);
    const shipping = subtotal >= FREE_SHIP ? 0 : SHIP_FLAT;
    const total = subtotal + tax + shipping;

    summaryEl.innerHTML = `
      <div class="order-summary">
        <h5 class="mb-4">Order Summary</h5>
        <div class="d-flex justify-content-between mb-2"><span>Subtotal</span><span>${window.fmt(subtotal)}</span></div>
        <div class="d-flex justify-content-between mb-2"><span>Tax (5%)</span><span>${window.fmt(tax)}</span></div>
        <div class="d-flex justify-content-between mb-2"><span>Shipping</span><span>${shipping === 0 ? '<span class="text-success">FREE</span>' : window.fmt(shipping)}</span></div>
        ${subtotal < FREE_SHIP ? `<small class="text-muted d-block mb-2">Add ${window.fmt(FREE_SHIP - subtotal)} more for free shipping!</small>` : ''}
        <hr>
        <div class="d-flex justify-content-between mb-4"><strong>Total</strong><strong class="text-gradient" style="font-size:1.3rem">${window.fmt(total)}</strong></div>
        <a href="checkout.html" class="btn btn-primary btn-block btn-lg">Proceed to Checkout</a>
      </div>`;

    wire();
  }

  function wire() {
    itemsEl.querySelectorAll('[data-act]').forEach((el) => {
      const id = el.dataset.id;
      const act = el.dataset.act;
      if (act === 'inc') el.onclick = () => { bump(id, 1); };
      if (act === 'dec') el.onclick = () => { bump(id, -1); };
      if (act === 'remove') el.onclick = () => { window.Cart.remove(id); render(); window.toast('Item removed', 'info'); };
      if (act === 'set') el.onchange = () => { window.Cart.update(id, Math.max(1, parseInt(el.value) || 1)); render(); };
    });
  }

  function bump(id, delta) {
    const item = window.Cart.read().find((i) => i.id === id);
    if (!item) return;
    window.Cart.update(id, item.qty + delta);
    render();
  }

  render();
})();
