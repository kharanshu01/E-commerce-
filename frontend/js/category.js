// Category landing page: one card per category with a representative image.
(async function () {
  const grid = document.getElementById('category-grid');
  const icons = {
    Women: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    Men: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    Accessories: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    Toys: 'https://images.unsplash.com/photo-1516627434852-ccf0d0a9b215?auto=format&fit=crop&w=900&q=80',
    Mobiles: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80',
    Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
    Appliances: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    Home: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
    Food: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
    Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80',
    Furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  };
  const blurbs = {
    Women: 'Dresses, heels and more — elegance for every occasion.',
    Men: 'Shirts, hoodies and essentials for the modern man.',
    Accessories: 'Bags, watches and finishing touches.',
    Toys: 'Fun and safe toys the little ones will love.',
    Mobiles: 'Smartphones, accessories, and everyday connectivity.',
    Electronics: 'Audio, screens, gadgets, and smart technology.',
    Beauty: 'Skincare, makeup, and self-care essentials.',
    Appliances: 'Helpful kitchen and home appliances.',
    Home: 'Comfort, lighting, decor, and everyday living.',
    Food: 'Pantry favorites, snacks, and wholesome choices.',
    Sports: 'Gear and essentials for your active lifestyle.',
    Furniture: 'Thoughtful pieces for work, rest, and living.',
  };

  try {
    const cats = await window.API.get('/products/categories');
    if (!cats.length) { grid.innerHTML = '<div class="col-12"><div class="empty-state"><h4>No categories yet.</h4></div></div>'; return; }
    grid.innerHTML = cats.map((c) => `
      <div class="col-md-4 col-sm-6 mb-4 reveal">
        <div class="single_product text-center h-100">
          <div class="product_img">
            <a href="product.html?category=${encodeURIComponent(c)}"><img src="${icons[c] || 'assets/images/category1.svg'}" alt="${c}" style="height:260px"></a>
          </div>
          <div class="product-caption p-4">
            <h4><a href="product.html?category=${encodeURIComponent(c)}">${c}</a></h4>
            <p class="text-muted">${blurbs[c] || 'Browse our ' + c + ' collection.'}</p>
            <a href="product.html?category=${encodeURIComponent(c)}" class="btn btn-outline-primary btn-sm">Explore <i class="fas fa-arrow-right ml-1"></i></a>
          </div>
        </div>
      </div>`).join('');
    window.refreshReveal && window.refreshReveal();
  } catch (err) {
    grid.innerHTML = `<div class="col-12"><div class="empty-state"><i class="fas fa-plug"></i><h4>${err.message}</h4></div></div>`;
  }
})();
