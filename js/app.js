/* ==========================================================================
   Cozy Loops Crochet - Main Application Controller & UI Renderer
   ========================================================================== */

let activeCategory = 'All';
let searchQuery = '';
let currentView = 'shop'; // 'shop', 'checkout', 'order-success'

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
];

document.addEventListener('DOMContentLoaded', () => {
  window.renderApp();
  setupEventListeners();
  checkAdminSecretTrigger();
  handleUrlHashRoute();

  window.addEventListener('hashchange', () => {
    handleUrlHashRoute();
  });

  // Outside click handler to collapse expandable header search capsule
  document.addEventListener('click', (e) => {
    const capsule = document.getElementById('headerSearchCapsule');
    if (capsule && !capsule.contains(e.target)) {
      collapseHeaderSearch();
    }
  });
});

window.handleUrlHashRoute = function() {
  const hash = window.location.hash || '';
  if (hash.includes('product/')) {
    const productId = hash.split('product/')[1];
    if (productId && productStore.getProductById(productId)) {
      openProductDetailPage(productId, false);
      return;
    }
  } else if (hash.includes('checkout')) {
    if (cartStore.cart.length > 0) {
      openCheckoutPage(false);
      return;
    }
  } else if (hash.includes('order-success')) {
    showView('order-success', false, false);
    return;
  }
  showView('shop', false, false);
};

window.showView = function(viewName, restoreScroll = false, updateHash = true, preserveCurrentScroll = false) {
  currentView = viewName;

  const mainShopView = document.getElementById('mainShopView');
  const productDetailView = document.getElementById('productDetailView');
  const checkoutView = document.getElementById('checkoutView');
  const orderSuccessView = document.getElementById('orderSuccessView');

  if (mainShopView) mainShopView.style.display = viewName === 'shop' ? 'block' : 'none';
  if (productDetailView) productDetailView.style.display = viewName === 'product-detail' ? 'block' : 'none';
  if (checkoutView) checkoutView.style.display = viewName === 'checkout' ? 'block' : 'none';
  if (orderSuccessView) orderSuccessView.style.display = viewName === 'order-success' ? 'block' : 'none';

  if (updateHash) {
    if (viewName === 'shop') {
      try {
        history.pushState(null, '', window.location.pathname + window.location.search);
      } catch(e) {
        window.location.hash = '';
      }
    } else if (viewName === 'checkout') {
      try {
        history.pushState(null, '', '#checkout');
      } catch(e) {
        window.location.hash = 'checkout';
      }
    } else if (viewName === 'order-success') {
      try {
        history.pushState(null, '', '#order-success');
      } catch(e) {
        window.location.hash = 'order-success';
      }
    }
  }

  if (!preserveCurrentScroll) {
    if (viewName === 'shop' && restoreScroll && lastShopScrollY > 0) {
      window.scrollTo(0, lastShopScrollY);
    } else {
      window.scrollTo(0, 0);
    }
  }
};

window.scrollToSection = function(sectionId, categoryName = null) {
  if (currentView !== 'shop') {
    showView('shop', false, true, true);
  }
  if (categoryName && typeof window.setCategory === 'function') {
    window.setCategory(categoryName);
  }
  const elem = document.getElementById(sectionId);
  if (elem) {
    const headerOffset = 80;
    const elementPosition = elem.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth'
    });
  }
};

window.renderApp = function() {
  renderAnnouncementBar();
  renderCategoryPills();
  renderProductsGrid();
  renderBestsellersGrid();
  renderCustomGiftsGrid();
  cartStore.updateCartBadge();
};

function checkAdminSecretTrigger() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true') {
    adminDashboard.renderAdminView();
  }

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      adminDashboard.renderAdminView();
    }
  });
}

function renderAnnouncementBar() {
  const bar = document.getElementById('announcementText');
  if (bar) {
    const settings = cartStore.getSettings();
    bar.textContent = settings.announcementText || '🧶 100% Handcrafted with Love | Free Gift on Orders above ₹999 | Ships All India';
  }
}

function renderCategoryPills() {
  const categories = [
    'All',
    'Plushies & Amigurumi',
    'Bags & Totes',
    'Wearables & Tops',
    'Home & Coasters',
    'Accessories & Keychains'
  ];

  const container = document.getElementById('categoryPillsContainer');
  if (!container) return;

  let html = '';
  categories.forEach(cat => {
    const activeClass = cat === activeCategory ? 'active' : '';
    html += `<button class="pill-btn ${activeClass}" onclick="setCategory('${cat}')">${cat}</button>`;
  });

  container.innerHTML = html;
}

window.setCategory = function(category) {
  activeCategory = category;
  renderCategoryPills();
  renderProductsGrid();
};

window.handleSearch = function(query) {
  searchQuery = query.toLowerCase().trim();
  renderProductsGrid();
};

// Toggle Header Expandable Search Capsule
window.toggleHeaderSearch = function(e) {
  if (e) e.stopPropagation();
  const capsule = document.getElementById('headerSearchCapsule');
  const input = document.getElementById('headerSearchInput');
  if (capsule) {
    if (capsule.classList.contains('expanded')) {
      if (input && input.value.trim() !== '') {
        // Keep expanded if active search query exists
      } else {
        capsule.classList.remove('expanded');
      }
    } else {
      capsule.classList.add('expanded');
      if (input) input.focus();
    }
  }
};

window.collapseHeaderSearch = function() {
  const capsule = document.getElementById('headerSearchCapsule');
  const input = document.getElementById('headerSearchInput');
  if (capsule && input && input.value.trim() === '') {
    capsule.classList.remove('expanded');
  }
};

// Reviews Carousel Scroll Controls
window.scrollReviews = function(direction) {
  const wrapper = document.getElementById('testimonialsScrollWrapper');
  if (wrapper) {
    const scrollAmount = 360 * direction;
    wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

// Targeted Card Quantity UI Update
window.updateCardQuantityUI = function(productId) {
  const container = document.getElementById('card-action-' + productId);
  if (container) {
    const inCartQty = cartStore.getProductTotalQuantity(productId);
    if (inCartQty > 0) {
      container.innerHTML = `
        <div class="card-qty-selector">
          <button class="qty-btn-card" onclick="event.stopPropagation(); cartStore.updateCardItemQuantity('${productId}', -1)" title="Decrease Quantity">-</button>
          <span class="qty-count-val">${inCartQty}</span>
          <button class="qty-btn-card" onclick="event.stopPropagation(); cartStore.updateCardItemQuantity('${productId}', 1)" title="Increase Quantity">+</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <button class="btn-add-cart" onclick="event.stopPropagation(); cartStore.addToCart(productStore.getProductById('${productId}'))">+ Add to Cart</button>
      `;
    }
  }

  const bsContainer = document.getElementById('card-action-bs-' + productId);
  if (bsContainer) {
    const inCartQty = cartStore.getProductTotalQuantity(productId);
    if (inCartQty > 0) {
      bsContainer.innerHTML = `
        <div class="card-qty-selector">
          <button class="qty-btn-card" onclick="event.stopPropagation(); cartStore.updateCardItemQuantity('${productId}', -1)" title="Decrease Quantity">-</button>
          <span class="qty-count-val">${inCartQty}</span>
          <button class="qty-btn-card" onclick="event.stopPropagation(); cartStore.updateCardItemQuantity('${productId}', 1)" title="Increase Quantity">+</button>
        </div>
      `;
    } else {
      bsContainer.innerHTML = `
        <button class="btn-add-cart" onclick="event.stopPropagation(); cartStore.addToCart(productStore.getProductById('${productId}'))">+ Add to Cart</button>
      `;
    }
  }

  const cgContainer = document.getElementById('card-action-cg-' + productId);
  if (cgContainer) {
    const inCartQty = cartStore.getProductTotalQuantity(productId);
    if (inCartQty > 0) {
      cgContainer.innerHTML = `
        <div class="card-qty-selector">
          <button class="qty-btn-card" onclick="event.stopPropagation(); cartStore.updateCardItemQuantity('${productId}', -1)" title="Decrease Quantity">-</button>
          <span class="qty-count-val">${inCartQty}</span>
          <button class="qty-btn-card" onclick="event.stopPropagation(); cartStore.updateCardItemQuantity('${productId}', 1)" title="Increase Quantity">+</button>
        </div>
      `;
    } else {
      cgContainer.innerHTML = `
        <button class="btn-add-cart" onclick="event.stopPropagation(); cartStore.addToCart(productStore.getProductById('${productId}'))">+ Add to Cart</button>
      `;
    }
  }

  cartStore.updateCartBadge();
};

// Targeted Wishlist UI Update
window.updateWishlistUI = function(productId) {
  const btn = document.getElementById('wishlist-btn-' + productId);
  if (btn) {
    const isWishlisted = cartStore.wishlist.includes(productId);
    btn.classList.toggle('active', isWishlisted);
    btn.innerHTML = isWishlisted ? '❤️' : '🤍';
  }
};

// Main Catalog Grid Renderer
function renderProductsGrid() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let products = productStore.getAllProducts();

  if (activeCategory !== 'All') {
    products = products.filter(p => p.category === activeCategory);
  }

  if (searchQuery) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery)
    );
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; color: var(--text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 8px;">🔍</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: var(--onyx-black); margin-bottom: 6px;">No Crochet Items Found</h3>
        <p>Try searching for another keyword or clearing your category filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => createProductCardHtml(p, '')).join('');
}

// Bestsellers Grid Renderer
function renderBestsellersGrid() {
  const grid = document.getElementById('bestsellersGrid');
  if (!grid) return;

  let products = productStore.getAllProducts().filter(p => 
    p.badge === 'Bestseller' || p.price >= 350 || p.id === 'crochet-1' || p.id === 'crochet-2' || p.id === 'crochet-3'
  );

  grid.innerHTML = products.map(p => createProductCardHtml(p, 'bs-')).join('');
}

// Custom Gifts Grid Renderer
function renderCustomGiftsGrid() {
  const grid = document.getElementById('customGiftsGrid');
  if (!grid) return;

  let products = productStore.getAllProducts().filter(p => 
    p.category === 'Plushies & Amigurumi' || p.category === 'Bags & Totes' || p.category === 'Home & Coasters'
  );

  grid.innerHTML = products.map(p => createProductCardHtml(p, 'cg-')).join('');
}

// Helper to generate Card HTML
function createProductCardHtml(p, prefix = '') {
  const inCartQty = cartStore.getProductTotalQuantity(p.id);
  const colorDots = (p.colors || []).map(c => `<span class="color-dot" title="${c}" style="background: ${getColorHex(c)};"></span>`).join('');

  let actionBtnHtml = '';
  if (inCartQty > 0) {
    actionBtnHtml = `
      <div class="card-qty-selector">
        <button class="qty-btn-card" onclick="event.stopPropagation(); cartStore.updateCardItemQuantity('${p.id}', -1)" title="Decrease Quantity">-</button>
        <span class="qty-count-val">${inCartQty}</span>
        <button class="qty-btn-card" onclick="event.stopPropagation(); cartStore.updateCardItemQuantity('${p.id}', 1)" title="Increase Quantity">+</button>
      </div>
    `;
  } else {
    actionBtnHtml = `
      <button class="btn-add-cart" onclick="event.stopPropagation(); cartStore.addToCart(productStore.getProductById('${p.id}'))">+ Add to Cart</button>
    `;
  }

  return `
    <div class="product-card" id="product-card-${prefix}${p.id}">
      <div class="card-img-wrapper" onclick="openProductDetailPage('${p.id}')" style="cursor: pointer;">
        <img src="${p.image}" alt="${p.name}" class="card-img" />
        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
      </div>
      <div class="product-meta">
        <span>${p.category}</span>
      </div>
      <h3 class="product-title" onclick="openProductDetailPage('${p.id}')" style="cursor: pointer;">${p.name}</h3>
      
      <div class="product-colors-preview">
        <span style="font-size: 0.75rem; color: var(--text-muted); margin-right: 4px;">Colors:</span>
        ${colorDots}
      </div>

      <div class="product-footer">
        <div class="price-box">
          <span class="current-price">₹${p.price}</span>
          ${p.originalPrice ? `<span class="original-price">₹${p.originalPrice}</span>` : ''}
        </div>
        <div id="card-action-${prefix}${p.id}">
          ${actionBtnHtml}
        </div>
      </div>
    </div>
  `;
}

function getColorHex(name) {
  const map = {
    'Porcelain White': '#F1ECE6',
    'Oat Cream': '#F7F1E8',
    'Sandstone Beige': '#DECDB6',
    'Ruby Velvet': '#7D253A',
    'Pastel Pink': '#F2C6CE',
    'Ruby Red': '#7D253A',
    'Sage Green & White': '#889C86',
    'Sage Green': '#889C86',
    'Forest Sage': '#5A6B58',
    'Vintage Mustard': '#E0A942',
    'Soft Violet & White': '#D4C4FB',
    'Sunset Yellow': '#F8C844',
    'Earth Tones': '#C86D51',
    'Dusty Rose': '#E2AC9B'
  };
  return map[name] || '#DECDB6';
}

// Quick View Modal
window.openQuickView = function(productId) {
  const p = productStore.getProductById(productId);
  if (!p) return;

  const overlay = document.getElementById('quickViewOverlay');
  const card = document.getElementById('quickViewContent');
  if (!overlay || !card) return;

  const colorOptions = (p.colors || ['Standard']).map(c => `<option value="${c}">${c}</option>`).join('');

  card.innerHTML = `
    <button class="modal-close" onclick="closeQuickView()">&times;</button>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center;">
      <div>
        <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 320px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--sandstone-border);" />
      </div>
      <div>
        <div style="font-size: 0.8rem; color: var(--ruby-velvet); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">${p.category}</div>
        <h2 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 8px;">${p.name}</h2>
        <div style="font-size: 1.4rem; font-weight: 700; color: var(--ruby-velvet); margin-bottom: 12px;">₹${p.price} <span style="font-size: 0.9rem; color: var(--text-muted); text-decoration: line-through;">₹${p.originalPrice || ''}</span></div>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">${p.description}</p>

        <div class="form-group">
          <label>Select Custom Yarn Color:</label>
          <select id="quickViewColorSelect" class="form-control" onchange="updateQuickViewActionUI('${p.id}')">
            ${colorOptions}
          </select>
        </div>

        <div id="quickViewActionContainer-${p.id}" style="display: flex; gap: 12px; margin-top: 20px; align-items: center;">
          <!-- Rendered via updateQuickViewActionUI -->
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('active');
  updateQuickViewActionUI(p.id);
};

window.updateQuickViewActionUI = function(productId) {
  const container = document.getElementById('quickViewActionContainer-' + productId);
  if (!container) return;

  const colorSelect = document.getElementById('quickViewColorSelect');
  const p = productStore.getProductById(productId);
  const selectedColor = colorSelect ? colorSelect.value : (p && p.colors ? p.colors[0] : 'Standard');
  const colorQty = cartStore.getItemQuantityByColor(productId, selectedColor);

  if (colorQty > 0) {
    container.innerHTML = `
      <div class="card-qty-selector" style="flex: 1; justify-content: space-around; padding: 8px 16px;">
        <button class="qty-btn-card" onclick="cartStore.updateItemQuantityByColor('${productId}', '${selectedColor}', -1)" title="Decrease Quantity">-</button>
        <span class="qty-count-val" style="font-size: 1.1rem;">${colorQty} in Basket</span>
        <button class="qty-btn-card" onclick="cartStore.updateItemQuantityByColor('${productId}', '${selectedColor}', 1)" title="Increase Quantity">+</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="btn-primary" style="flex: 1; justify-content: center; padding: 13px 24px;" onclick="addQuickViewToCart('${productId}')">Add to Cart 🛒</button>
    `;
  }
};

window.closeQuickView = function() {
  const overlay = document.getElementById('quickViewOverlay');
  if (overlay) overlay.classList.remove('active');
};

window.addQuickViewToCart = function(productId) {
  const p = productStore.getProductById(productId);
  const colorSelect = document.getElementById('quickViewColorSelect');
  const chosenColor = colorSelect ? colorSelect.value : null;

  if (p) {
    cartStore.addToCart(p, chosenColor, 1);
    updateQuickViewActionUI(productId);
  }
};

// FULL-PAGE DEDICATED PRODUCT DETAILS CONTROLLER
let currentDetailProductId = null;
let currentDetailSelectedColor = null;
let lastShopScrollY = 0;

window.openProductDetailPage = function(productId, updateHash = true) {
  if (currentView === 'shop') {
    lastShopScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  }
  currentDetailProductId = productId;
  const p = productStore.getProductById(productId);
  if (!p) return;

  currentDetailSelectedColor = (p.colors && p.colors.length > 0) ? p.colors[0] : 'Standard';
  showView('product-detail', false, false);
  if (updateHash) {
    try {
      history.pushState(null, '', '#product/' + productId);
    } catch(e) {
      window.location.hash = 'product/' + productId;
    }
  }
  renderFullPageProductDetail();
};

window.backToCatalog = function() {
  try {
    history.pushState(null, '', window.location.pathname + window.location.search);
  } catch(e) {
    window.location.hash = '';
  }
  showView('shop', true, false);
};

window.renderFullPageProductDetail = function() {
  const container = document.getElementById('fullPageProductDetailContainer');
  if (!container || !currentDetailProductId) return;

  const p = productStore.getProductById(currentDetailProductId);
  if (!p) return;

  const colors = p.colors || ['Standard'];
  if (!currentDetailSelectedColor) {
    currentDetailSelectedColor = colors[0];
  }

  // Recommended Products from Catalog
  const recommended = productStore.getAllProducts()
    .filter(item => item.id !== p.id)
    .slice(0, 3);
  
  const recommendedCardsHtml = recommended.map(rec => createProductCardHtml(rec, 'pdp-rec-')).join('');

  // Interactive Color Swatches HTML
  const colorPillsHtml = colors.map(c => {
    const isActive = c === currentDetailSelectedColor;
    const hex = getColorHex(c);
    return `
      <button class="detail-color-pill ${isActive ? 'active' : ''}" onclick="updateDetailColorSelection('${c}')">
        <span class="color-dot" style="background: ${hex}; width: 18px; height: 18px;"></span>
        <span>${c}</span>
      </button>
    `;
  }).join('');

  const discountPercent = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

  container.innerHTML = `
    <!-- Top Breadcrumb & Navigation -->
    <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <button class="btn-back-premium" onclick="backToCatalog()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Back to Catalog</span>
      </button>
      <div style="font-size: 0.88rem; color: var(--text-muted);">
        <a href="javascript:void(0)" onclick="backToCatalog()" style="color: var(--ruby-velvet); font-weight: 600;">Home</a> / 
        <span>${p.category}</span> / 
        <strong style="color: var(--onyx-black);">${p.name}</strong>
      </div>
    </div>

    <!-- Main Product Detail Card (2-Column Grid) -->
    <div class="pdp-main-card" style="background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--sandstone-border); padding: 36px; box-shadow: var(--shadow-md); margin-bottom: 48px;">
      <div class="product-detail-grid">
        
        <!-- LEFT COLUMN: Product Gallery Image & Desktop Trust Box -->
        <div>
          <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; border: 2px dashed var(--ruby-velvet); box-shadow: var(--shadow-sm); background: var(--porcelain-white); margin-bottom: 20px;">
            <img src="${p.image}" alt="${p.name}" class="pdp-hero-img" style="width: 100%; height: 420px; object-fit: cover; transition: transform 0.5s ease;" />
            ${p.badge ? `<span class="card-badge" style="top: 16px; left: 16px; font-size: 0.85rem; padding: 6px 18px;">${p.badge}</span>` : ''}
          </div>

          <!-- Trust Feature Badges Box (Desktop Only - Fills Left Column) -->
          <div class="pdp-trust-box desktop-only-trust-box">
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: var(--onyx-black);">
              <span style="font-size: 1.2rem; color: var(--ruby-velvet);">🧶</span> 100% Cotton Yarn
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: var(--onyx-black);">
              <span style="font-size: 1.2rem; color: var(--ruby-velvet);">✨</span> 100% Handcrafted
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: var(--onyx-black);">
              <span style="font-size: 1.2rem; color: var(--ruby-velvet);">📦</span> Safe India Express
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: var(--onyx-black);">
              <span style="font-size: 1.2rem; color: var(--ruby-velvet);">🧼</span> Washable & Durable
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Details, Color Selection, Actions, Badges & Accordions -->
        <div style="display: flex; flex-direction: column;">
          
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--ruby-velvet); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">
            ${p.category}
          </div>

          <h1 style="font-family: var(--font-heading); font-size: 2.5rem; line-height: 1.2; color: var(--onyx-black); margin-bottom: 12px; font-weight: 700;">
            ${p.name}
          </h1>

          <!-- Reviews rating badge -->
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 0.9rem;">
            <span style="color: #E6A100;">★★★★★</span>
            <span style="font-weight: 700; color: var(--onyx-black);">4.9</span>
            <span style="color: var(--text-muted);">(48 Verified Handcrafted Reviews)</span>
          </div>

          <!-- Price Row -->
          <div style="display: flex; align-items: baseline; gap: 14px; margin-bottom: 18px;">
            <span style="font-size: 2.1rem; font-weight: 800; color: var(--ruby-velvet);">₹${p.price}</span>
            ${p.originalPrice ? `
              <span style="font-size: 1.1rem; color: var(--text-muted); text-decoration: line-through;">₹${p.originalPrice}</span>
              <span style="background: #E8F8F0; color: #1E8449; font-size: 0.82rem; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-full); border: 1px solid #27AE60;">Save ${discountPercent}%</span>
            ` : ''}
          </div>

          <!-- Description -->
          <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">
            ${p.description}
          </p>

          <!-- Interactive Color Selector -->
          <div style="margin-bottom: 28px;">
            <label style="display: block; font-weight: 700; font-size: 0.95rem; color: var(--onyx-black); margin-bottom: 10px;">
              Select Custom Yarn Color: <span id="detailSelectedColorName" style="color: var(--ruby-velvet); font-weight: 600;">${currentDetailSelectedColor}</span>
            </label>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${colorPillsHtml}
            </div>
          </div>

          <!-- Dynamic Action & Quantity Bar -->
          <div id="detailActionBox" style="margin-bottom: 24px;">
            <!-- Rendered via updateDetailActionUI -->
          </div>

          <!-- Trust Feature Badges Box (Mobile Only - Positioned Directly Above Accordions) -->
          <div class="pdp-trust-box mobile-only-trust-box">
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: var(--onyx-black);">
              <span style="font-size: 1.2rem; color: var(--ruby-velvet);">🧶</span> 100% Cotton Yarn
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: var(--onyx-black);">
              <span style="font-size: 1.2rem; color: var(--ruby-velvet);">✨</span> 100% Handcrafted
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: var(--onyx-black);">
              <span style="font-size: 1.2rem; color: var(--ruby-velvet);">📦</span> Safe India Express
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: var(--onyx-black);">
              <span style="font-size: 1.2rem; color: var(--ruby-velvet);">🧼</span> Washable & Durable
            </div>
          </div>

          <!-- Accordion Feature Details -->
          <div style="margin-top: 8px; border-top: 1px dashed var(--sandstone-border); padding-top: 20px;">
            <details class="pdp-accordion-details" open>
              <summary class="pdp-accordion-summary">
                <span>✨ Yarn Quality & Specifications</span>
                <span class="pdp-accordion-icon">🧶</span>
              </summary>
              <div class="pdp-accordion-content">
                Crocheted stitch-by-stitch using 100% hypoallergenic cotton yarn. Soft to touch, durable, and crafted to retain its plush shape forever.
              </div>
            </details>
            <details class="pdp-accordion-details">
              <summary class="pdp-accordion-summary">
                <span>🎁 Eco Packaging & Gifting</span>
                <span class="pdp-accordion-icon">🧶</span>
              </summary>
              <div class="pdp-accordion-content">
                Every item is packed in rustic eco-friendly kraft packaging tied with a yarn bow for your loved ones.
              </div>
            </details>
          </div>

        </div>
      </div>
    </div>

    <!-- Recommended Products Section -->
    <div style="margin-top: 48px;">
      <div style="text-align: center; margin-bottom: 28px;">
        <span class="section-tag">Handcrafted Favorites</span>
        <h2 style="font-family: var(--font-heading); font-size: 2rem; color: var(--onyx-black);">You May Also Love 🌸</h2>
      </div>
      <div class="products-grid">
        ${recommendedCardsHtml}
      </div>
    </div>
  `;

  updateDetailActionUI();
};

window.updateDetailColorSelection = function(color) {
  currentDetailSelectedColor = color;
  const label = document.getElementById('detailSelectedColorName');
  if (label) label.textContent = color;

  const container = document.getElementById('fullPageProductDetailContainer');
  if (container) {
    const pills = container.querySelectorAll('.detail-color-pill');
    pills.forEach(pill => {
      const text = pill.querySelector('span:last-child').textContent;
      if (text === color) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  updateDetailActionUI();
};

window.updateDetailActionUI = function() {
  const actionBox = document.getElementById('detailActionBox');
  if (!actionBox || !currentDetailProductId || !currentDetailSelectedColor) return;

  const colorQty = cartStore.getItemQuantityByColor(currentDetailProductId, currentDetailSelectedColor);

  if (colorQty > 0) {
    actionBox.innerHTML = `
      <div style="display: flex; gap: 14px; align-items: center;">
        <div class="card-qty-selector pdp-qty-selector" style="flex: 1; justify-content: space-around; padding: 12px 20px; font-size: 1.1rem;">
          <button class="qty-btn-card" style="width: 34px; height: 34px; font-size: 1.2rem;" onclick="cartStore.updateItemQuantityByColor('${currentDetailProductId}', '${currentDetailSelectedColor}', -1)" title="Decrease">-</button>
          <span class="qty-count-val" style="font-size: 1.15rem;">
            <span>${colorQty}</span><span class="qty-label-desktop"> in Basket</span>
          </span>
          <button class="qty-btn-card" style="width: 34px; height: 34px; font-size: 1.2rem;" onclick="cartStore.updateItemQuantityByColor('${currentDetailProductId}', '${currentDetailSelectedColor}', 1)" title="Increase">+</button>
        </div>
        <button class="btn-primary pdp-cart-btn" style="padding: 14px 28px; font-size: 1rem;" onclick="toggleCartDrawer(true)" title="View Basket">
          <span class="cart-btn-text-desktop">View Basket </span>🛒
        </button>
      </div>
    `;
  } else {
    actionBox.innerHTML = `
      <button class="btn-primary" style="width: 100%; justify-content: center; padding: 15px 32px; font-size: 1.05rem;" onclick="addCurrentDetailToCart()">
        Add to Cart 🛒
      </button>
    `;
  }
};

window.addCurrentDetailToCart = function() {
  if (!currentDetailProductId || !currentDetailSelectedColor) return;
  const p = productStore.getProductById(currentDetailProductId);
  if (p) {
    cartStore.addToCart(p, currentDetailSelectedColor, 1);
    updateDetailActionUI();
  }
};

window.orderProductViaWhatsApp = function(productId) {
  const p = productStore.getProductById(productId);
  if (!p) return;
  const color = currentDetailSelectedColor || 'Standard';
  const settings = cartStore.getSettings();
  const text = `Hi Priya! I want to order the handcrafted *${p.name}* (Color: ${color}) for ₹${p.price}. Please confirm my order! 🧶`;
  const url = `https://wa.me/${settings.whatsappPhone || '919355415171'}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

window.toggleCartDrawer = function(open = true) {
  const overlay = document.getElementById('cartDrawerOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (open) {
    cartStore.renderCartDrawer();
    if (overlay) overlay.classList.add('active');
    if (drawer) drawer.classList.add('active');
    document.body.classList.add('cart-open');
  } else {
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
    document.body.classList.remove('cart-open');
  }
};

// Automatic City & State Fetching via India Post Official API
window.handlePincodeInput = function(val) {
  const cleanVal = val.trim();
  const statusElem = document.getElementById('pincodeStatus');
  const cityInput = document.getElementById('fullCustCity');
  const stateSelect = document.getElementById('fullCustState');

  if (cleanVal.length === 6 && /^\d+$/.test(cleanVal)) {
    if (statusElem) {
      statusElem.innerHTML = `<span style="color: var(--ruby-velvet); font-weight: 600;">🔍 Auto-fetching City & State...</span>`;
    }

    fetch(`https://api.postalpincode.in/pincode/${cleanVal}`)
      .then(res => res.json())
      .then(data => {
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          const district = po.District || po.Name;
          const state = po.State;
          
          if (cityInput) {
            cityInput.value = district;
          }

          if (stateSelect) {
            for (let i = 0; i < stateSelect.options.length; i++) {
              if (stateSelect.options[i].value.toLowerCase() === state.toLowerCase()) {
                stateSelect.selectedIndex = i;
                break;
              }
            }
          }

          if (statusElem) {
            statusElem.innerHTML = `<span style="color: #27AE60; font-weight: 700;">✓ City: ${district} | State: ${state}</span>`;
          }
        } else {
          if (statusElem) {
            statusElem.innerHTML = `<span style="color: #C0392B; font-weight: 600;">⚠️ Invalid pincode</span>`;
          }
        }
      })
      .catch(err => {
        if (statusElem) {
          statusElem.innerHTML = `<span style="color: var(--text-muted);">Please select state & enter city manually</span>`;
        }
      });
  } else {
    if (statusElem) statusElem.innerHTML = '';
  }
};

// FULL-PAGE CHECKOUT FLOW
window.openCheckoutPage = function(updateHash = true) {
  if (cartStore.cart.length === 0) {
    return;
  }
  toggleCartDrawer(false);
  showView('checkout', false, updateHash);
  renderFullPageCheckout();
};

window.renderFullPageCheckout = function() {
  const container = document.getElementById('fullPageCheckoutContainer');
  if (!container) return;

  if (cartStore.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--sandstone-border); box-shadow: var(--shadow-sm);">
        <div style="font-size: 4rem; margin-bottom: 16px;">🧶</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: var(--onyx-black); margin-bottom: 8px;">Your Yarn Basket is Empty</h3>
        <p style="color: var(--text-muted); margin-bottom: 24px;">Add some handmade crochet items to your cart before proceeding to checkout!</p>
        <button class="btn-primary" onclick="showView('shop')">
          Explore Collection 🧶
        </button>
      </div>
    `;
    return;
  }

  let itemsHtml = '';
  cartStore.cart.forEach((item, idx) => {
    itemsHtml += `
      <div style="display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--sandstone-border); align-items: center;">
        <img src="${item.image}" alt="${item.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 10px;" />
        <div style="flex: 1;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--onyx-black); margin-bottom: 2px;">${item.name}</h4>
          <div style="font-size: 0.8rem; color: var(--ruby-velvet); font-weight: 500;">Color: ${item.selectedColor}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Qty: ${item.quantity} × ₹${item.price}</div>
        </div>
        <div style="font-weight: 700; color: var(--ruby-velvet); font-size: 1.05rem;">₹${item.price * item.quantity}</div>
      </div>
    `;
  });

  const subtotal = cartStore.getCartSubtotal();

  const stateOptionsHtml = INDIAN_STATES.map(st => `<option value="${st}">${st}</option>`).join('');

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; align-items: start;">
      
      <!-- LEFT COLUMN: Customer Information Form Matching User's Image Layout -->
      <div style="background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--sandstone-border); padding: 36px; box-shadow: var(--shadow-sm);">
        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--onyx-black); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
          <span>👤</span> Delivery & Contact Details
        </h3>

        <form id="fullCheckoutForm" onsubmit="handleFullPageCheckoutSubmit(event)">
          <!-- Row 1: Full Name -->
          <div class="form-group">
            <label>Your Full Name *</label>
            <input type="text" id="fullCustName" class="form-control" placeholder="Enter your full name" required />
          </div>

          <!-- Row 2: Phone & Email -->
          <div class="form-grid-row">
            <div class="form-group">
              <label>WhatsApp Number *</label>
              <input type="tel" id="fullCustPhone" class="form-control" placeholder="10-digit mobile number" required />
            </div>
            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" id="fullCustEmail" class="form-control" placeholder="name@example.com" required />
            </div>
          </div>

          <!-- Row 3: Address -->
          <div class="form-group">
            <label>Complete House / Shipping Address *</label>
            <input type="text" id="fullCustAddress" class="form-control" placeholder="Flat No, House Name, Street, Landmark" required />
          </div>

          <!-- Row 4: PIN Code & City -->
          <div class="form-grid-row">
            <div class="form-group">
              <label>PIN Code *</label>
              <input type="text" id="fullCustPincode" class="form-control" placeholder="6-digit PIN" maxlength="6" oninput="handlePincodeInput(this.value)" required />
              <div id="pincodeStatus" style="font-size: 0.8rem; margin-top: 4px;"></div>
            </div>
            <div class="form-group">
              <label>City *</label>
              <input type="text" id="fullCustCity" class="form-control" placeholder="City" required />
            </div>
          </div>

          <!-- Row 5: State Dropdown -->
          <div class="form-group">
            <label>State *</label>
            <select id="fullCustState" class="form-control" required>
              <option value="" disabled selected>Select state</option>
              ${stateOptionsHtml}
            </select>
          </div>

          <!-- Row 6: Custom Gift Note -->
          <div class="form-group">
            <label>Custom Gift Note or Special Instructions (Optional)</label>
            <textarea id="fullCustNotes" class="form-control" placeholder="e.g. Please add a birthday note for Priya!"></textarea>
          </div>

          <div class="upi-notice-box" style="margin-top: 24px;">
            <div class="upi-icon">💬</div>
            <div style="font-size: 0.88rem; color: var(--onyx-black); line-height: 1.5;">
              <strong>Direct WhatsApp Order Placement</strong><br/>
              When you click <em>Place Order</em>, your order details will open on WhatsApp directly with artisan Priya to confirm your order!
            </div>
          </div>

          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 16px; font-size: 1.05rem; margin-top: 24px; box-shadow: 0 10px 28px rgba(125, 37, 58, 0.35);">
            Place Order & Chat on WhatsApp 🚀
          </button>
        </form>
      </div>

      <!-- RIGHT COLUMN: Order Summary Box -->
      <div style="background: var(--sandstone-light); border-radius: var(--radius-lg); border: 1px solid var(--sandstone-border); padding: 32px; box-shadow: var(--shadow-sm); position: sticky; top: 100px;">
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--onyx-black); margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
          <span>Order Summary</span>
          <span style="font-size: 0.9rem; color: var(--ruby-velvet); font-weight: 700;">${cartStore.cart.length} Items</span>
        </h3>

        <div style="max-height: 320px; overflow-y: auto; margin-bottom: 20px;">
          ${itemsHtml}
        </div>

        <div style="border-top: 2px dashed var(--sandstone-border); padding-top: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95rem;">
            <span style="color: var(--text-muted);">Cart Subtotal</span>
            <span style="font-weight: 700;">₹${subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95rem;">
            <span style="color: var(--text-muted);">Handcrafting & Packing</span>
            <span style="color: #27AE60; font-weight: 600;">FREE</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95rem;">
            <span style="color: var(--text-muted);">Standard All-India Shipping</span>
            <span style="color: #27AE60; font-weight: 600;">FREE</span>
          </div>
        </div>

        <div style="border-top: 2px solid var(--onyx-black); padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 1.1rem; font-weight: 700; color: var(--onyx-black);">Total Amount</span>
          <span style="font-size: 1.6rem; font-weight: 700; color: var(--ruby-velvet);">₹${subtotal}</span>
        </div>

        <div style="margin-top: 24px; text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          🔒 100% Secure Order Processing with Direct Artisan Support
        </div>
      </div>

    </div>
  `;
};

// FULL-PAGE CHECKOUT SUBMIT: INSTANT WHATSAPP REDIRECTION ONLY
window.handleFullPageCheckoutSubmit = function(e) {
  e.preventDefault();

  const stateElem = document.getElementById('fullCustState');
  const selectedState = stateElem ? stateElem.value : '';

  const customerData = {
    name: document.getElementById('fullCustName').value,
    phone: document.getElementById('fullCustPhone').value,
    email: document.getElementById('fullCustEmail').value,
    address: document.getElementById('fullCustAddress').value,
    city: document.getElementById('fullCustCity').value,
    state: selectedState,
    pincode: document.getElementById('fullCustPincode').value,
    notes: document.getElementById('fullCustNotes').value
  };

  const completedOrder = cartStore.processCheckout(customerData);

  if (completedOrder) {
    // 1. Direct Instant WhatsApp Redirection
    window.open(completedOrder.waUrl, '_blank');

    // 2. Show Full Page Order Thank You Page!
    showView('order-success');
    renderFullPageOrderSuccess(completedOrder);
  }
};

window.renderFullPageOrderSuccess = function(order) {
  const container = document.getElementById('fullPageSuccessContainer');
  if (!container) return;

  let itemsSummaryHtml = '';
  order.items.forEach(item => {
    itemsSummaryHtml += `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed var(--sandstone-border); font-size: 0.95rem;">
        <div>
          <strong>${item.quantity}x ${item.name}</strong>
          <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Color: ${item.selectedColor}</span>
        </div>
        <div style="font-weight: 700; color: var(--ruby-velvet);">₹${item.price * item.quantity}</div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="order-success-card">
      <div style="font-size: 3.6rem; margin-bottom: 8px; animation: bounce 1s infinite alternate;">🎉</div>
      <div style="display: inline-block; background: var(--ruby-velvet-light); color: var(--ruby-velvet); padding: 6px 18px; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 16px;">
        ORDER CONFIRMED #${order.orderId}
      </div>
      
      <h1 class="order-success-title">
        Thank You, ${order.customer.name}! 🧶
      </h1>

      <p class="order-success-subtext">
        WhatsApp has been opened in a new tab! Press <strong>Send</strong> on WhatsApp to share your order details with artisan Priya.
      </p>

      <!-- Instant Re-open WhatsApp Notice Box (Fully Mobile Optimized) -->
      <div class="order-wa-notice-box">
        <div class="wa-notice-info">
          <h4>💬 WhatsApp Chat Triggered</h4>
          <p>Order message ready to send to +91 9355415171.</p>
        </div>
        <a href="${order.waUrl}" target="_blank" class="btn-primary wa-notice-btn">
          Open WhatsApp Now 💬
        </a>
      </div>

      <!-- Order Details Card -->
      <div class="order-breakdown-box">
        <div class="order-breakdown-header">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--onyx-black); margin-bottom: 2px;">Order Breakdown</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${order.orderDate}</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">Total Amount</span>
            <div style="font-size: 1.4rem; font-weight: 700; color: var(--ruby-velvet);">₹${order.totalAmount}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          ${itemsSummaryHtml}
        </div>

        <div class="order-breakdown-details-grid">
          <div>
            <strong style="color: var(--onyx-black); display: block; margin-bottom: 4px;">Delivery Address:</strong>
            <div style="color: var(--text-muted); line-height: 1.5;">
              ${order.customer.address}<br/>
              ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}<br/>
              Phone: ${order.customer.phone}
            </div>
          </div>
          <div>
            <strong style="color: var(--onyx-black); display: block; margin-bottom: 4px;">Order Status:</strong>
            <div style="color: var(--ruby-velvet); font-weight: 700;">
              Pending WhatsApp Confirmation
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
              Artisan Priya will confirm your order on WhatsApp!
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <button class="btn-primary" onclick="showView('shop'); document.getElementById('shop').scrollIntoView({behavior: 'smooth'})" style="padding: 14px 32px; font-size: 1rem; width: auto;">
          Continue Shopping 🧶
        </button>
      </div>
    </div>
  `;
};

// Clickable Policy Modals
window.openPolicyModal = function(type) {
  const overlay = document.getElementById('policyOverlay');
  const content = document.getElementById('policyContent');
  if (!overlay || !content) return;

  let title = '';
  let bodyHtml = '';

  if (type === 'privacy') {
    title = '🔒 Privacy Policy';
    bodyHtml = `
      <p><strong>Last Updated: August 2026</strong></p>
      <p>At <strong>Cozy Loops Crochet</strong>, we deeply respect your personal privacy. Because we run a boutique, small-scale direct craft store, here is how your data is handled:</p>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>Customer Details Collected:</strong> Name, WhatsApp Number, Email Address, and Shipping Address entered during checkout are used strictly for processing your order and communicating order updates.</li>
        <li><strong>No Third-Party Selling:</strong> We never share, sell, or rent your personal information to third-party advertisers.</li>
        <li><strong>WhatsApp Order Data:</strong> Orders are routed directly to our official WhatsApp business number (9355415171).</li>
      </ul>
    `;
  } else if (type === 'terms') {
    title = '📜 Terms of Service';
    bodyHtml = `
      <p><strong>Handmade Store Terms & Conditions</strong></p>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>100% Handcrafted Nature:</strong> Every plushie, tote bag, and bouquet is crocheted by hand. Subtle variations in stitch size or color batch are part of the authentic handmade charm!</li>
        <li><strong>Crafting Lead Time:</strong> Standard orders take 2 to 4 crafting days before shipment unless marked as instant stock.</li>
        <li><strong>Order Confirmation:</strong> Orders are confirmed once verified with Priya on WhatsApp.</li>
        <li><strong>Custom Orders:</strong> Made-to-order custom yarn requests cannot be cancelled after yarn cutting begins.</li>
      </ul>
    `;
  } else if (type === 'faq') {
    title = '❓ Frequently Asked Questions';
    bodyHtml = `
      <div style="line-height: 1.8;">
        <h4 style="color: var(--ruby-velvet); margin-top: 10px;">Q1: How do I place an order?</h4>
        <p style="color: var(--text-muted);">Fill in your details at checkout and click "Place Order". It will open WhatsApp with your pre-filled order message!</p>

        <h4 style="color: var(--ruby-velvet); margin-top: 12px;">Q2: Can I wash my crochet plushies & bags?</h4>
        <p style="color: var(--text-muted);">Yes! Use gentle handwash in cold water with mild soap, rinse gently, and dry flat in shade. Do not wring tightly.</p>

        <h4 style="color: var(--ruby-velvet); margin-top: 12px;">Q3: Do you customize yarn colors?</h4>
        <p style="color: var(--text-muted);">Absolutely! You can choose custom colors from the product page dropdown or message us directly on WhatsApp (+91 9355415171).</p>
      </div>
    `;
  } else if (type === 'shipping') {
    title = '📦 Shipping & Delivery Policy';
    bodyHtml = `
      <p>We deliver handcrafted orders all across India via trusted courier partners.</p>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>Crafting Time:</strong> 2 to 4 business days.</li>
        <li><strong>Delivery Time:</strong> 3 to 6 business days after dispatch.</li>
        <li><strong>Tracking:</strong> Tracking link and status updates are sent directly to your WhatsApp once shipped!</li>
      </ul>
    `;
  } else if (type === 'returns') {
    title = '🔄 Returns & Refund Policy';
    bodyHtml = `
      <p>Because all our crochet creations are crafted to order with love, we do not accept returns for change of mind.</p>
      <p style="margin-top: 10px;">However, if your item arrives damaged or incomplete during transit, please share an unboxing video within 24 hours on WhatsApp (+91 9355415171), and we will happily send a replacement!</p>
    `;
  } else if (type === 'contact') {
    title = '💬 Contact Us';
    bodyHtml = `
      <p>We are always happy to help you pick the perfect crochet gift!</p>
      <div style="background: var(--sandstone-light); padding: 16px; border-radius: var(--radius-sm); margin-top: 14px;">
        <div><strong>📱 WhatsApp Support:</strong> +91 9355415171</div>
        <div><strong>✉️ Email:</strong> aakashs.studentbca24@dspsr.in</div>
        <div><strong>🕒 Hours:</strong> Monday - Saturday (10:00 AM - 7:00 PM IST)</div>
      </div>
    `;
  }

  content.innerHTML = `
    <button class="modal-close" onclick="closePolicyModal()">&times;</button>
    <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: var(--ruby-velvet); margin-bottom: 16px;">${title}</h3>
    <div style="font-size: 0.95rem; color: var(--onyx-black); max-height: 60vh; overflow-y: auto;">
      ${bodyHtml}
    </div>
    <div style="margin-top: 24px; text-align: right;">
      <button class="btn-primary" onclick="closePolicyModal()">Got It</button>
    </div>
  `;

  overlay.classList.add('active');
};

window.closePolicyModal = function() {
  const overlay = document.getElementById('policyOverlay');
  if (overlay) overlay.classList.remove('active');
};

function setupEventListeners() {
  // Navigation scrolling
}
