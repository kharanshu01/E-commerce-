// Product detail page.
(async function () {
  const id = window.qs('id');
  const container = document.getElementById('detail-container');
  if (!id) { container.innerHTML = '<div class="empty-state"><h4>No product specified.</h4></div>'; return; }

  try {
    const { product: p, related } = await window.API.get(`/products/${id}`);
    document.title = `${p.name} — FashionHub`;

    const inStock = p.countInStock > 0;
    container.innerHTML = `
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb bg-transparent px-0">
          <li class="breadcrumb-item"><a href="index.html">Home</a></li>
          <li class="breadcrumb-item"><a href="product.html?category=${encodeURIComponent(p.category)}">${p.category}</a></li>
          <li class="breadcrumb-item active">${p.name}</li>
        </ol>
      </nav>
      <div class="row">
        <div class="col-lg-6 mb-4">
          <div class="detail-hero">
            <div class="detail-badge">${p.category}</div>
            <img src="${p.image}" alt="${p.name}">
          </div>
        </div>
        <div class="col-lg-6">
          <div class="detail-panel">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <h2 class="mb-2">${p.name}</h2>
                <div class="product-ratting mb-2" style="font-size:1rem">${window.Render.stars(p.rating)} <small class="text-muted ml-1">${p.rating} (${p.numReviews} reviews)</small></div>
              </div>
              <span class="product-badge">${p.rating >= 4.5 ? 'Best seller' : 'Top rated'}</span>
            </div>
            <div class="price mb-3" style="font-size:2rem">${window.fmt(p.price)}</div>
            <p class="text-muted">${p.description}</p>
            <div class="mb-3">
              ${inStock
                ? `<span class="badge status-Delivered badge-status"><i class="fas fa-check-circle mr-1"></i>In Stock (${p.countInStock})</span>`
                : '<span class="badge status-Cancelled badge-status">Out of Stock</span>'}
            </div>
            <div class="detail-highlights mb-4">
              <div><i class="fas fa-shipping-fast"></i>Free delivery above ₹500</div>
              <div><i class="fas fa-undo-alt"></i>Easy returns within 30 days</div>
              <div><i class="fas fa-shield-alt"></i>Secure checkout</div>
            </div>
            <div class="d-flex align-items-center mb-4">
              <label class="mr-3 mb-0 font-weight-bold">Quantity</label>
              <div class="qty-control">
                <button id="dec">&minus;</button>
                <input id="qty" type="number" value="1" min="1" max="${p.countInStock || 1}">
                <button id="inc">+</button>
              </div>
            </div>
            <div class="d-flex flex-wrap" style="gap:.75rem">
              <button id="add-btn" class="btn btn-primary btn-lg" ${inStock ? '' : 'disabled'}><i class="fas fa-cart-plus mr-2"></i>Add to Cart</button>
              <button id="buy-btn" class="btn btn-outline-primary btn-lg" ${inStock ? '' : 'disabled'}>Buy Now</button>
            </div>
          </div>
        </div>
      </div>`;

    const qtyEl = document.getElementById('qty');
    const clamp = () => { let v = parseInt(qtyEl.value) || 1; v = Math.max(1, Math.min(v, p.countInStock || 1)); qtyEl.value = v; return v; };
    document.getElementById('inc').onclick = () => { qtyEl.value = clamp() + 1; clamp(); };
    document.getElementById('dec').onclick = () => { qtyEl.value = clamp() - 1; clamp(); };
    qtyEl.oninput = clamp;
    document.getElementById('add-btn').onclick = () => window.Cart.add(p, clamp());
    document.getElementById('buy-btn').onclick = () => { window.Cart.add(p, clamp()); setTimeout(() => (location.href = 'cart.html'), 400); };

    if (related && related.length) {
      document.getElementById('related-wrap').style.display = 'block';
      window.Render.renderProducts(document.getElementById('related-grid'), related);
    }
    window.refreshReveal && window.refreshReveal();
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h4>${err.message}</h4><a href="product.html" class="btn btn-primary mt-3">Back to Shop</a></div>`;
  }
})();
