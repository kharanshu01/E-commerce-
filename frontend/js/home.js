// Homepage: load featured products.
(async function () {
  const container = document.getElementById('featured-products');
  const heroInner = document.querySelector('#heroCarousel .carousel-inner');
  const departmentGrid = document.getElementById('department-grid');
  const departmentIcons = {
    Mobiles: 'fa-mobile-alt', Electronics: 'fa-headphones', Beauty: 'fa-sparkles', Home: 'fa-home',
    Appliances: 'fa-blender', Toys: 'fa-gamepad', Food: 'fa-utensils', Sports: 'fa-dumbbell',
    Furniture: 'fa-couch', Women: 'fa-female', Men: 'fa-male', Accessories: 'fa-gem', Books: 'fa-book',
  };
  const fallbackProducts = [
    { _id: 'fallback-1', name: 'Classic Cotton T-Shirt', category: 'T-Shirts', price: 499, rating: 4.5, numReviews: 120, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', isNew: true, featured: true, countInStock: 60, description: 'Soft everyday tee for casual wear and layering.' },
    { _id: 'fallback-2', name: 'Slim Fit Formal Shirt', category: 'Shirts', price: 799, rating: 4.2, numReviews: 68, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', featured: true, countInStock: 35, description: 'Tailored shirt for office, meetings, and polished outings.' },
    { _id: 'fallback-3', name: 'Cargo Jogger Pants', category: 'Pants', price: 1099, rating: 4.3, numReviews: 74, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', featured: true, countInStock: 24, description: 'Comfort-first joggers with plenty of utility pockets.' },
    { _id: 'fallback-4', name: 'Atomic Habits', category: 'Books', price: 349, rating: 4.8, numReviews: 210, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80', isNew: true, featured: true, countInStock: 50, description: 'Build better routines with practical habit-building guidance.' },
    { _id: 'fallback-5', name: 'Premium Polo Tee', category: 'T-Shirts', price: 699, rating: 4.5, numReviews: 82, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', featured: true, countInStock: 33, description: 'Polished polo tee that works for casual and smart-casual looks.' },
    { _id: 'fallback-6', name: 'Linen Blend Shirt', category: 'Shirts', price: 899, rating: 4.4, numReviews: 54, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', isNew: true, countInStock: 28, description: 'Breathable shirt crafted for comfort in warm weather.' },
    { _id: 'fallback-7', name: 'Straight Fit Jeans', category: 'Pants', price: 1299, rating: 4.6, numReviews: 96, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', isNew: true, countInStock: 22, description: 'Classic denim with a timeless straight cut.' },
    { _id: 'fallback-8', name: 'The Alchemist', category: 'Books', price: 299, rating: 4.7, numReviews: 176, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80', countInStock: 45, description: 'A powerful story about following your dreams.' },
  ];

  window.Render.skeletons(container, 8);
  try {
    if (departmentGrid) {
      const categories = await window.API.get('/products/categories');
      departmentGrid.innerHTML = categories.map((category) => `<a class="department-tile reveal" href="product.html?category=${encodeURIComponent(category)}"><i class="fas ${departmentIcons[category] || 'fa-store'}"></i><span>${category}</span><small>Explore now</small></a>`).join('');
    }
    const { items } = await window.API.get('/products?featured=true&limit=12');
    if (heroInner && items && items.length) {
      const ads = items.slice(0, 5);
      heroInner.innerHTML = ads.map((product, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''} product-ad-slide">
          <img src="${product.image}" alt="${product.name}">
          <div class="carousel-caption">
            <span class="hero-badge">${product.category} · ${product.rating || 0}★ rated</span>
            <h5>${product.name}</h5>
            <p>${product.description || 'Discover a customer favourite from our latest collection.'}</p>
            <strong class="product-ad-price">${window.fmt(product.price)}</strong>
            <a href="product_detail.html?id=${product._id}" class="btn btn-primary btn-lg hero-cta ml-2">View deal <i class="fas fa-arrow-right ml-2"></i></a>
          </div>
        </div>`).join('');
      const indicators = document.querySelector('#heroCarousel .carousel-indicators');
      if (indicators) indicators.innerHTML = ads.map((product, index) => `<li data-target="#heroCarousel" data-slide-to="${index}" class="${index === 0 ? 'active' : ''}"></li>`).join('');
    }
    const products = items && items.length ? items : (await window.API.get('/products?sort=newest&limit=8')).items;
    window.Render.renderProducts(container, (products && products.length ? products : fallbackProducts).slice(0, 8));
    window.refreshReveal && window.refreshReveal();
  } catch (err) {
    window.Render.renderProducts(container, fallbackProducts.slice(0, 8));
    if (departmentGrid) departmentGrid.innerHTML = '<div class="department-loading">Departments will appear when the catalog API is available.</div>';
  }
})();
