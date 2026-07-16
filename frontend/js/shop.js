// Shop page: filters, search, sort, pagination.
(function () {
  const grid = document.getElementById('product-grid');
  const fallbackProducts = [
    { _id: 'fallback-shop-1', name: 'Classic Cotton T-Shirt', category: 'T-Shirts', price: 499, rating: 4.5, numReviews: 120, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', isNew: true, countInStock: 60, description: 'Soft everyday tee for casual wear and layering.' },
    { _id: 'fallback-shop-2', name: 'Slim Fit Formal Shirt', category: 'Shirts', price: 799, rating: 4.2, numReviews: 68, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', countInStock: 35, description: 'Tailored shirt for office and polished occasions.' },
    { _id: 'fallback-shop-3', name: 'Cargo Jogger Pants', category: 'Pants', price: 1099, rating: 4.3, numReviews: 74, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', countInStock: 24, description: 'Comfort-first joggers with plenty of utility pockets.' },
    { _id: 'fallback-shop-4', name: 'Atomic Habits', category: 'Books', price: 349, rating: 4.8, numReviews: 210, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80', countInStock: 50, description: 'Build better routines with practical habit guidance.' },
    { _id: 'fallback-shop-5', name: 'Premium Polo Tee', category: 'T-Shirts', price: 699, rating: 4.5, numReviews: 82, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', countInStock: 33, description: 'Polished polo tee in a soft premium finish.' },
    { _id: 'fallback-shop-6', name: 'Linen Blend Shirt', category: 'Shirts', price: 899, rating: 4.4, numReviews: 54, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', countInStock: 28, description: 'Breathable shirt for warm weather and elevated casual wear.' },
    { _id: 'fallback-shop-7', name: 'Straight Fit Jeans', category: 'Pants', price: 1299, rating: 4.6, numReviews: 96, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', countInStock: 22, description: 'Classic denim with a timeless straight cut.' },
    { _id: 'fallback-shop-8', name: 'The Alchemist', category: 'Books', price: 299, rating: 4.7, numReviews: 176, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80', countInStock: 45, description: 'A timeless story about following your dreams.' },
    { _id: 'fallback-shop-9', name: 'The Psychology of Money', category: 'Books', price: 329, rating: 4.8, numReviews: 188, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80', countInStock: 42, description: 'Understand money behavior and long-term wealth.' },
  ];
  const state = {
    search: window.qs('search') || '',
    category: window.qs('category') || 'all',
    sort: window.qs('sort') || 'newest',
    page: 1,
  };

  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const catList = document.getElementById('category-filter');
  const countEl = document.getElementById('result-count');
  const pager = document.getElementById('pagination');

  searchInput.value = state.search;
  sortSelect.value = state.sort;

  async function loadCategories() {
    try {
      const cats = await window.API.get('/products/categories');
      cats.forEach((c) => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.style.cursor = 'pointer';
        li.dataset.cat = c;
        li.textContent = c;
        catList.appendChild(li);
      });
      highlightCategory();
      catList.addEventListener('click', (e) => {
        const li = e.target.closest('[data-cat]');
        if (!li) return;
        state.category = li.dataset.cat;
        state.page = 1;
        highlightCategory();
        load();
      });
    } catch {}
  }

  function highlightCategory() {
    catList.querySelectorAll('[data-cat]').forEach((li) => {
      li.classList.toggle('active', li.dataset.cat === state.category);
      if (li.dataset.cat === state.category) { li.style.background = 'var(--gradient)'; li.style.color = '#fff'; }
      else { li.style.background = ''; li.style.color = ''; }
    });
    const title = document.getElementById('page-title');
    title.textContent = state.category === 'all' ? 'All Products' : state.category;
  }

  async function load() {
    window.Render.skeletons(grid, 9);
    const params = new URLSearchParams();
    if (state.search) params.set('search', state.search);
    if (state.category !== 'all') params.set('category', state.category);
    params.set('sort', state.sort);
    params.set('page', state.page);
    params.set('limit', 9);
    try {
      const { items, page, pages, total } = await window.API.get(`/products?${params}`);
      const productList = items && items.length ? items : fallbackProducts;
      window.Render.renderProducts(grid, productList, 'No products match your filters.');
      countEl.textContent = `${productList.length} product${productList.length !== 1 ? 's' : ''} found`;
      renderPager(page || 1, pages || 1);
    } catch (err) {
      window.Render.renderProducts(grid, fallbackProducts, 'No products match your filters.');
      countEl.textContent = `${fallbackProducts.length} products found`;
      renderPager(1, 1);
    }
  }

  function renderPager(page, pages) {
    if (pages <= 1) { pager.innerHTML = ''; return; }
    let html = '';
    for (let i = 1; i <= pages; i++) {
      html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    pager.innerHTML = html;
    pager.querySelectorAll('[data-page]').forEach((a) => {
      a.addEventListener('click', (e) => { e.preventDefault(); state.page = +a.dataset.page; load(); window.scrollTo({ top: 200, behavior: 'smooth' }); });
    });
  }

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.search = searchInput.value.trim(); state.page = 1; load(); }, 350);
  });
  sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; state.page = 1; load(); });
  document.getElementById('reset-filters').addEventListener('click', () => {
    state.search = ''; state.category = 'all'; state.sort = 'newest'; state.page = 1;
    searchInput.value = ''; sortSelect.value = 'newest'; highlightCategory(); load();
  });

  loadCategories();
  load();
})();
