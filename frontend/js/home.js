// Homepage: load featured products.
(async function () {
  const container = document.getElementById('featured-products');
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
    const { items } = await window.API.get('/products?featured=true&limit=8');
    const products = items && items.length ? items : (await window.API.get('/products?sort=newest&limit=8')).items;
    window.Render.renderProducts(container, (products && products.length ? products : fallbackProducts).slice(0, 8));
  } catch (err) {
    window.Render.renderProducts(container, fallbackProducts.slice(0, 8));
  }
})();
