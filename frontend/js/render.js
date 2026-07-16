// Shared render helpers used across product listing pages.
(function () {
  function stars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) html += '<i class="fas fa-star"></i>';
      else if (rating >= i - 0.5) html += '<i class="fas fa-star-half-alt"></i>';
      else html += '<i class="far fa-star low-star"></i>';
    }
    return html;
  }

  // Build a single product card. `p` is a product document from the API.
  function productCard(p) {
    const badge = p.isNew ? '<div class="new_product"><span class="badge py-1 px-2 badge-pill">New</span></div>' : '';
    const hotTag = (p.rating || 0) >= 4.6 || (p.price || 0) < 600 ? 'Hot deal' : 'Top pick';
    const stockText = Number(p.countInStock || 0) > 30 ? 'In stock' : Number(p.countInStock || 0) > 0 ? `Only ${p.countInStock} left` : 'Sold out';
    const deliveryTag = Number(p.price || 0) >= 1000 ? 'Free delivery' : 'Fast delivery';
    const price = Number(p.price || 0);
    const offerPrice = price > 0 ? price - Math.round(price * 0.12) : price;
    return `
      <div class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 reveal">
        <div class="single_product amazon-style-card">
          <div class="product_img">
            ${badge}
            <a href="product_detail.html?id=${p._id}"><img src="${p.image}" alt="${p.name}"></a>
            <div class="product_hover">
              <a href="product_detail.html?id=${p._id}" class="btn btn-sm btn-outline-primary"><i class="fas fa-eye"></i></a>
              <button class="btn btn-sm btn-primary add-to-cart" data-id="${p._id}"><i class="fas fa-cart-plus mr-1"></i>Add</button>
            </div>
          </div>
          <div class="product-caption p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="product-ratting">${stars(p.rating)} <small class="text-muted">(${p.numReviews})</small></div>
              <span class="product-badge">${hotTag}</span>
            </div>
            <h5><a href="product_detail.html?id=${p._id}">${p.name}</a></h5>
            <div class="text-muted small mb-2">${p.category}</div>
            <div class="product-meta">
              <span class="meta-pill"><i class="fas fa-shipping-fast"></i> ${deliveryTag}</span>
              <span class="meta-pill"><i class="fas fa-box"></i> ${stockText}</span>
            </div>
            <div class="price-row">
              <div class="price">₹${window.fmt(price)}</div>
              <div class="offer-pill">Save ${Math.round(price * 0.12)}%</div>
            </div>
            <div class="price-hint">₹${window.fmt(offerPrice)} with coupon</div>
          </div>
        </div>
      </div>`;
  }

  // Render an array of products into a container, wiring add-to-cart buttons.
  function renderProducts(container, products, emptyMsg = 'No products found.') {
    if (!container) return;
    if (!products.length) {
      container.innerHTML = `<div class="col-12"><div class="empty-state"><i class="fas fa-box-open"></i><h4>${emptyMsg}</h4></div></div>`;
      return;
    }
    container.innerHTML = products.map(productCard).join('');
    container.querySelectorAll('.add-to-cart').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const prod = products.find((p) => p._id === id);
        if (prod) window.Cart.add(prod, 1);
      });
    });
    window.refreshReveal && window.refreshReveal();
  }

  function skeletons(container, n = 8) {
    if (!container) return;
    container.innerHTML = Array.from({ length: n })
      .map(() => '<div class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4"><div class="skeleton skeleton-card"></div></div>')
      .join('');
  }

  window.Render = { stars, productCard, renderProducts, skeletons };
})();
