/* ==========================================================================
   Cozy Loops Crochet - Cart, Wishlist & Order Placement Engine
   ========================================================================== */

class CartStore {
  constructor() {
    this.cartKey = 'cozy_loops_cart';
    this.wishlistKey = 'cozy_loops_wishlist';
    this.ordersKey = 'cozy_loops_orders';
    this.settingsKey = 'cozy_loops_settings';
    
    this.cart = this.loadCart();
    this.wishlist = this.loadWishlist();
    this.initDefaultSettings();
  }

  initDefaultSettings() {
    const defaultSettings = {
      storeName: 'Cozy Loops Crochet',
      whatsappPhone: '919355415171',
      sellerEmail: 'aakashs.studentbca24@dspsr.in',
      announcementText: '🧶 100% Handcrafted with Love | Free Gift on Orders above ₹999 | Ships All India',
      artisanName: 'Priya',
      bioText: 'Hi! I am Priya, the creator behind Cozy Loops. Every plushie, tote, and coaster is handmade stitch by stitch with premium cotton yarn.'
    };
    
    const stored = localStorage.getItem(this.settingsKey);
    if (!stored) {
      localStorage.setItem(this.settingsKey, JSON.stringify(defaultSettings));
    } else {
      try {
        const parsed = JSON.parse(stored);
        parsed.whatsappPhone = '919355415171';
        parsed.sellerEmail = 'aakashs.studentbca24@dspsr.in';
        localStorage.setItem(this.settingsKey, JSON.stringify(parsed));
      } catch(e) {
        localStorage.setItem(this.settingsKey, JSON.stringify(defaultSettings));
      }
    }
  }

  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(this.settingsKey));
    } catch(e) {
      return {
        whatsappPhone: '919355415171',
        sellerEmail: 'aakashs.studentbca24@dspsr.in'
      };
    }
  }

  saveSettings(newSettings) {
    localStorage.setItem(this.settingsKey, JSON.stringify(newSettings));
  }

  loadCart() {
    try {
      return JSON.parse(localStorage.getItem(this.cartKey)) || [];
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
    this.updateCartBadge();
  }

  loadWishlist() {
    try {
      return JSON.parse(localStorage.getItem(this.wishlistKey)) || [];
    } catch (e) {
      return [];
    }
  }

  saveWishlist() {
    localStorage.setItem(this.wishlistKey, JSON.stringify(this.wishlist));
  }

  getProductTotalQuantity(productId) {
    return this.cart
      .filter(item => item.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  addToCart(product, selectedColor = null, quantity = 1) {
    const color = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : 'Standard');
    const existingIndex = this.cart.findIndex(item => item.id === product.id && item.selectedColor === color);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        selectedColor: color,
        quantity: quantity,
        craftingDays: product.craftingDays || '3-4 Days'
      });
    }

    this.saveCart();
    if (window.updateCardQuantityUI) {
      window.updateCardQuantityUI(product.id);
    }
  }

  updateCardItemQuantity(productId, delta) {
    const items = this.cart.filter(item => item.id === productId);
    if (items.length === 0 && delta > 0) {
      const product = window.productStore.getProductById(productId);
      if (product) this.addToCart(product, null, 1);
      return;
    }

    if (items.length > 0) {
      const targetItem = items[items.length - 1];
      const globalIndex = this.cart.indexOf(targetItem);
      if (globalIndex > -1) {
        this.cart[globalIndex].quantity += delta;
        if (this.cart[globalIndex].quantity <= 0) {
          this.cart.splice(globalIndex, 1);
        }
      }
    }

    this.saveCart();
    if (window.updateCardQuantityUI) {
      window.updateCardQuantityUI(productId);
    }
  }

  removeFromCart(index) {
    const item = this.cart[index];
    const productId = item ? item.id : null;
    this.cart.splice(index, 1);
    this.saveCart();
    this.renderCartDrawer();
    if (productId && window.updateCardQuantityUI) {
      window.updateCardQuantityUI(productId);
    }
    if (window.renderFullPageCheckout) {
      window.renderFullPageCheckout();
    }
  }

  updateQuantity(index, delta) {
    if (this.cart[index]) {
      const productId = this.cart[index].id;
      this.cart[index].quantity += delta;
      if (this.cart[index].quantity <= 0) {
        this.removeFromCart(index);
      } else {
        this.saveCart();
        this.renderCartDrawer();
        if (window.updateCardQuantityUI) {
          window.updateCardQuantityUI(productId);
        }
        if (window.renderFullPageCheckout) {
          window.renderFullPageCheckout();
        }
      }
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    if (window.renderApp) window.renderApp();
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  toggleWishlist(productId) {
    // Wishlist completely removed
  }

  updateCartBadge() {
    const badge = document.getElementById('cartBadgeCount');
    if (badge) {
      const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'flex' : 'none';
    }
  }

  renderCartDrawer() {
    const drawerBody = document.getElementById('cartDrawerBody');
    const drawerFooter = document.getElementById('cartDrawerFooter');
    const subtotalElem = document.getElementById('cartSubtotal');
    if (!drawerBody) return;

    if (this.cart.length === 0) {
      drawerBody.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
          <div style="font-size: 3.5rem; margin-bottom: 16px;">🧶</div>
          <h4 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--onyx-black); margin-bottom: 8px;">Your Yarn Basket is Empty</h4>
          <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 28px; max-width: 260px;">Explore our handmade crochet collection and pick something cozy!</p>
          
          <button class="btn-primary" onclick="toggleCartDrawer(false); showView('shop'); document.getElementById('shop').scrollIntoView({behavior: 'smooth'})" style="padding: 14px 32px; font-size: 1rem;">
            Explore Collection 🧶
          </button>
        </div>
      `;
      if (drawerFooter) drawerFooter.style.display = 'none';
      return;
    }

    if (drawerFooter) drawerFooter.style.display = 'block';

    let html = '';
    this.cart.forEach((item, index) => {
      html += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-color">Color: ${item.selectedColor}</div>
            <div style="font-weight: 700; color: var(--ruby-velvet); margin-bottom: 8px;">₹${item.price}</div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="cartStore.updateQuantity(${index}, -1)">-</button>
              <span style="font-weight: 600; font-size: 0.9rem;">${item.quantity}</span>
              <button class="qty-btn" onclick="cartStore.updateQuantity(${index}, 1)">+</button>
            </div>
          </div>
          <!-- Red Trash Can SVG Button -->
          <button class="btn-remove-item" onclick="cartStore.removeFromCart(${index})" title="Remove Item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      `;
    });

    drawerBody.innerHTML = html;
    if (subtotalElem) subtotalElem.textContent = `₹${this.getCartSubtotal()}`;
  }

  processCheckout(customerData) {
    if (this.cart.length === 0) {
      return false;
    }

    const orderId = 'CR-' + Math.floor(1000 + Math.random() * 9000);
    const orderDate = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const subtotal = this.getCartSubtotal();
    const settings = this.getSettings();

    const newOrder = {
      orderId: orderId,
      date: orderDate,
      customer: customerData,
      items: [...this.cart],
      totalAmount: subtotal,
      status: 'Pending Order Confirmation',
      notes: customerData.notes || ''
    };

    try {
      const existingOrders = JSON.parse(localStorage.getItem(this.ordersKey)) || [];
      existingOrders.unshift(newOrder);
      localStorage.setItem(this.ordersKey, JSON.stringify(existingOrders));
    } catch(e) {
      console.error('Error saving order', e);
    }

    let itemsText = '';
    this.cart.forEach(item => {
      itemsText += `• ${item.quantity}x ${item.name} (Color: ${item.selectedColor}) - ₹${item.price * item.quantity}\n`;
    });

    const waText = 
`✨ NEW CROCHET ORDER #${orderId} ✨
--------------------------------
🛍️ ITEMS:
${itemsText}
💰 TOTAL AMOUNT: ₹${subtotal}
--------------------------------
👤 CUSTOMER DETAILS:
Name: ${customerData.name}
Phone: ${customerData.phone}
Email: ${customerData.email}
Address: ${customerData.address}, ${customerData.city}, ${customerData.state} - ${customerData.pincode}
${customerData.notes ? `Note: ${customerData.notes}\n` : ''}--------------------------------
Hi Priya! Please confirm my handcrafted order! 🧶`;

    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${settings.whatsappPhone || '919355415171'}?text=${encodedText}`;

    const completedOrderData = {
      orderId: orderId,
      orderDate: orderDate,
      totalAmount: subtotal,
      waUrl: waUrl,
      customer: customerData,
      items: [...this.cart]
    };

    this.clearCart();

    return completedOrderData;
  }
}

window.cartStore = new CartStore();
