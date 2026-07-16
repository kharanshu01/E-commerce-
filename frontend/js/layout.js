// Injects the shared navbar + footer so markup lives in one place.
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';

  function navLink(href, label) {
    const active = page === href ? ' active' : '';
    return `<li class="nav-item${active}"><a class="nav-link" href="${href}">${label}</a></li>`;
  }

  function authArea() {
    const u = window.Auth && window.Auth.currentUser();
    if (!u) {
      return `
        <a href="login.html" class="btn btn-sm btn-outline-primary mr-2">Login</a>
        <a href="register.html" class="btn btn-sm btn-primary mr-3">Sign Up</a>`;
    }
    const adminLink = u.role === 'admin'
      ? '<a class="dropdown-item" href="admin.html"><i class="fas fa-tools mr-2"></i>Admin Panel</a>' : '';
    return `
      <div class="dropdown mr-3">
        <a class="btn btn-sm btn-outline-primary dropdown-toggle" href="#" role="button" data-toggle="dropdown">
          <i class="fas fa-user-circle mr-1"></i>${u.name.split(' ')[0]}
        </a>
        <div class="dropdown-menu dropdown-menu-right shadow">
          <h6 class="dropdown-header">${u.email}</h6>
          <a class="dropdown-item" href="orders.html"><i class="fas fa-box mr-2"></i>My Orders</a>
          ${adminLink}
          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt mr-2"></i>Logout</a>
        </div>
      </div>`;
  }

  function header() {
    return `
    <section class="header_menu fixed-top" id="header_menu">
      <div class="container-fluid px-0">
        <nav class="navbar navbar-expand-lg navbar-light py-3">
          <a class="navbar-brand pl-lg-4" href="index.html">FashionHub</a>
          <span class="ml-2 text-muted small">Owner: Kharanshu Sekhar Das</span>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#nav"
            aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="nav">
            <ul class="navbar-nav mx-auto">
              ${navLink('index.html', 'Home')}
              ${navLink('product.html', 'Shop')}
              ${navLink('category.html', 'Categories')}
              ${navLink('about.html', 'About')}
              ${navLink('contact.html', 'Contact')}
            </ul>
            <div class="d-flex align-items-center">
              <a href="search.html" class="btn btn-sm btn-light mr-2" title="Search"><i class="fas fa-search"></i></a>
              ${authArea()}
              <div class="cart pr-lg-4">
                <a href="cart.html" title="Cart">
                  <i class="fas fa-shopping-cart fa-lg"></i>
                  <span class="badge badge-pill cart-count">0</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </section>
    <div style="height:78px"></div>`; // spacer for fixed navbar
  }

  function footer() {
    const year = document.currentScript ? '' : '';
    return `
    <section class="footer_section pt-5 pb-3" id="footer_section">
      <footer>
        <div class="container">
          <div class="row">
            <div class="col-md-4 col-12 mb-4">
              <a href="index.html" class="navbar-brand" style="font-size:1.7rem">FashionHub</a>
              <p class="mt-3">Owned by <strong>Kharanshu Sekhar Das</strong>.</p>
              <p>Discover the latest trends in fashion. Quality products, fast delivery, and a shopping experience you'll love.</p>
              <div class="social mt-3">
                <a href="javascript:;"><i class="fab fa-facebook-f"></i></a>
                <a href="javascript:;"><i class="fab fa-instagram"></i></a>
                <a href="javascript:;"><i class="fab fa-twitter"></i></a>
                <a href="javascript:;"><i class="fab fa-pinterest"></i></a>
              </div>
            </div>
            <div class="col-md-2 col-6 mb-4">
              <div class="footer_title mb-3"><h3>Shop</h3></div>
              <div class="footer_links"><ul>
                <li><a href="product.html">All Products</a></li>
                <li><a href="category.html">Categories</a></li>
                <li><a href="product.html?sort=newest">New Arrivals</a></li>
                <li><a href="product.html?sort=rating">Top Rated</a></li>
              </ul></div>
            </div>
            <div class="col-md-3 col-6 mb-4">
              <div class="footer_title mb-3"><h3>Support</h3></div>
              <div class="footer_links"><ul>
                <li><a href="contact.html">Contact Us</a></li>
                <li><a href="about.html">About Us</a></li>
                <li><a href="javascript:;">FAQs</a></li>
                <li><a href="javascript:;">Privacy Policy</a></li>
              </ul></div>
            </div>
            <div class="col-md-3 col-12 mb-4">
              <div class="footer_title mb-3"><h3>Newsletter</h3></div>
              <p>Subscribe for offers & updates.</p>
              <form id="newsletter-signup" class="input-group">
                <input type="email" class="form-control" placeholder="Your email" required>
                <div class="input-group-append">
                  <button class="btn btn-primary" type="submit">Go</button>
                </div>
              </form>
            </div>
          </div>
          <div class="border-top border-secondary pt-3 mt-2 text-center">
            <small>&copy; <span id="year"></span> FashionHub — Owned by Kharanshu Sekhar Das. All rights reserved.</small>
          </div>
        </div>
      </footer>
    </section>
    <div class="backtop">
      <a id="button" href="#top" role="button"><i class="fas fa-chevron-up"></i></a>
    </div>`;
  }

  function attachNewsletterSignup() {
    const form = document.getElementById('newsletter-signup');
    if (!form) return;
    const input = form.querySelector('input[type="email"]');
    const handleSubmit = (e) => {
      e.preventDefault();
      const value = (input?.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        window.toast && window.toast('Please enter a valid email address.', 'error');
        input?.focus();
        return;
      }
      window.toast && window.toast(`Thanks, ${value.split('@')[0]}! You’re on the list.`, 'success');
      if (input) input.value = '';
    };
    form.addEventListener('submit', handleSubmit);
  }

  function mount() {
    const h = document.getElementById('site-header');
    const f = document.getElementById('site-footer');
    if (h) h.innerHTML = header();
    if (f) f.innerHTML = footer();
    const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    window.Cart && window.Cart.updateBadge();
    attachNewsletterSignup();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await window.Auth.logout();
      window.toast('Logged out', 'info');
      setTimeout(() => (location.href = 'index.html'), 500);
    });
  }

  document.addEventListener('DOMContentLoaded', mount);
})();
