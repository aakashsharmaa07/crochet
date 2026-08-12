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

  // Outside click handler to collapse expandable header search capsule
  document.addEventListener('click', (e) => {
    const capsule = document.getElementById('headerSearchCapsule');
    if (capsule && !capsule.contains(e.target)) {
      collapseHeaderSearch();
    }
  });
});

window.showView = function(viewName) {
  currentView = viewName;

  const mainShopView = document.getElementById('mainShopView');
  const checkoutView = document.getElementById('checkoutView');
  const orderSuccessView = document.getElementById('orderSuccessView');

  if (mainShopView) mainShopView.style.display = viewName === 'shop' ? 'block' : 'none';
  if (checkoutView) checkoutView.style.display = viewName === 'checkout' ? 'block' : 'none';
  if (orderSuccessView) orderSuccessView.style.display = viewName === 'order-success' ? 'block' : 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  const isWishlisted = cartStore.wishlist.includes(p.id);
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
      <div class="card-img-wrapper" onclick="openQuickView('${p.id}')" style="cursor: pointer;">
        <img src="${p.image}" alt="${p.name}" class="card-img" />
        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" id="wishlist-btn-${prefix}${p.id}" onclick="event.stopPropagation(); cartStore.toggleWishlist('${p.id}')" title="Save to Wishlist">
          ${isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="product-meta">
        <span>${p.category}</span>
        <span class="crafting-tag">🧶 ${p.craftingDays || 'Made to order'}</span>
      </div>
      <h3 class="product-title" onclick="openQuickView('${p.id}')" style="cursor: pointer;">${p.name}</h3>
      
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
  const inCartQty = cartStore.getProductTotalQuantity(p.id);

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
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 16px;">${p.description}</p>
        
        <div style="background: var(--sandstone-light); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 16px;">
          <strong>🧶 Handcrafting Lead Time:</strong> ${p.craftingDays || 'Ships in 3-5 days'}
        </div>

        <div class="form-group">
          <label>Select Custom Yarn Color:</label>
          <select id="quickViewColorSelect" class="form-control">
            ${colorOptions}
          </select>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 20px; align-items: center;">
          ${inCartQty > 0 ? `
            <div class="card-qty-selector" style="flex: 1; justify-content: space-around; padding: 6px 14px;">
              <button class="qty-btn-card" onclick="cartStore.updateCardItemQuantity('${p.id}', -1)">-</button>
              <span class="qty-count-val" style="font-size: 1.1rem;">${inCartQty} in Basket</span>
              <button class="qty-btn-card" onclick="cartStore.updateCardItemQuantity('${p.id}', 1)">+</button>
            </div>
          ` : `
            <button class="btn-primary" style="flex: 1; justify-content: center;" onclick="addQuickViewToCart('${p.id}')">Add to Cart 🛒</button>
          `}
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('active');
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
    openQuickView(productId);
  }
};

window.toggleCartDrawer = function(open = true) {
  const overlay = document.getElementById('cartDrawerOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (open) {
    cartStore.renderCartDrawer();
    overlay.classList.add('active');
    drawer.classList.add('active');
  } else {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
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
window.openCheckoutPage = function() {
  if (cartStore.cart.length === 0) {
    return;
  }
  toggleCartDrawer(false);
  showView('checkout');
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
        <button class="btn-primary" onclick="showView('shop'); document.getElementById('shop').scrollIntoView({behavior: 'smooth'})">
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
            <input type="text" id="fullCustName" class="form-control" placeholder="e.g. Aakash Sharma" value="Aakash Sharma" required />
          </div>

          <!-- Row 2: Phone & Email -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label>WhatsApp Phone Number *</label>
              <input type="tel" id="fullCustPhone" class="form-control" placeholder="9355415171" value="9355415171" required />
            </div>
            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" id="fullCustEmail" class="form-control" placeholder="aakashs.studentbca24@dspsr.in" value="aakashs.studentbca24@dspsr.in" required />
            </div>
          </div>

          <!-- Row 3: Address -->
          <div class="form-group">
            <label>Complete House / Shipping Address *</label>
            <input type="text" id="fullCustAddress" class="form-control" placeholder="Flat No, House Name, Street, Landmark" required />
          </div>

          <!-- Row 4: PIN Code & City -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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
