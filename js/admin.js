/* ==========================================================================
   Cozy Loops Crochet - Admin Dashboard Module
   ========================================================================== */

class AdminDashboard {
  constructor() {
    this.isAuthenticated = false;
    this.currentTab = 'orders';
  }

  login(passcode) {
    if (passcode === 'admin' || passcode === 'admin123' || passcode === '1234') {
      this.isAuthenticated = true;
      cartStore.showToast('Welcome to Admin Panel! 👑');
      return true;
    }
    return false;
  }

  renderAdminView() {
    if (!this.isAuthenticated) {
      this.renderLoginModal();
      return;
    }

    const modalOverlay = document.getElementById('adminModalOverlay');
    const adminContent = document.getElementById('adminModalContent');

    if (!modalOverlay || !adminContent) return;

    modalOverlay.classList.add('active');

    adminContent.innerHTML = `
      <div class="drawer-header" style="margin-bottom: 20px; padding: 0 0 16px 0; border-bottom: 1px solid var(--sandstone-border);">
        <div>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--ruby-velvet);">Store Admin Dashboard</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Manage your orders, products, and WhatsApp store settings</p>
        </div>
        <button class="modal-close" onclick="adminDashboard.closeAdminModal()">&times;</button>
      </div>

      <div class="admin-tabs">
        <button class="admin-tab-btn ${this.currentTab === 'orders' ? 'active' : ''}" onclick="adminDashboard.switchTab('orders')">🛍️ Orders</button>
        <button class="admin-tab-btn ${this.currentTab === 'products' ? 'active' : ''}" onclick="adminDashboard.switchTab('products')">📦 Products Catalog</button>
        <button class="admin-tab-btn ${this.currentTab === 'settings' ? 'active' : ''}" onclick="adminDashboard.switchTab('settings')">⚙️ Store Settings</button>
      </div>

      <div id="adminTabBody" style="min-height: 350px;">
        ${this.renderTabContent()}
      </div>
    `;
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    this.renderAdminView();
  }

  closeAdminModal() {
    const modalOverlay = document.getElementById('adminModalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
  }

  renderLoginModal() {
    const modalOverlay = document.getElementById('adminModalOverlay');
    const adminContent = document.getElementById('adminModalContent');

    if (!modalOverlay || !adminContent) return;

    modalOverlay.classList.add('active');
    adminContent.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🔒</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--onyx-black); margin-bottom: 8px;">Seller Admin Access</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 24px;">Enter your admin passcode to manage orders and store products</p>
        
        <div class="form-group" style="max-width: 320px; margin: 0 auto 20px auto;">
          <input type="password" id="adminPassInput" class="form-control" placeholder="Enter Passcode (Default: admin)" style="text-align: center; font-size: 1.1rem;" />
        </div>

        <div style="display: flex; justify-content: center; gap: 12px;">
          <button class="btn-secondary" onclick="adminDashboard.closeAdminModal()">Cancel</button>
          <button class="btn-primary" onclick="adminDashboard.handleLoginSubmit()">Login to Dashboard</button>
        </div>
      </div>
    `;
  }

  handleLoginSubmit() {
    const pass = document.getElementById('adminPassInput').value;
    if (this.login(pass)) {
      this.renderAdminView();
    } else {
      cartStore.showToast('Invalid passcode! Try "admin"');
    }
  }

  renderTabContent() {
    if (this.currentTab === 'orders') return this.renderOrdersTab();
    if (this.currentTab === 'products') return this.renderProductsTab();
    if (this.currentTab === 'settings') return this.renderSettingsTab();
    return '';
  }

  // ORDERS TAB
  renderOrdersTab() {
    const orders = JSON.parse(localStorage.getItem('cozy_loops_orders')) || [];

    if (orders.length === 0) {
      return `
        <div style="text-align: center; padding: 48px; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📋</div>
          <h4>No Orders Placed Yet</h4>
          <p>Orders submitted by customers via WhatsApp will appear here automatically!</p>
        </div>
      `;
    }

    let rows = '';
    orders.forEach((order, index) => {
      const itemsSummary = order.items.map(i => `${i.quantity}x ${i.name} (${i.selectedColor})`).join(', ');
      
      let statusClass = 'status-pending';
      if (order.status === 'Payment Confirmed') statusClass = 'status-paid';
      if (order.status === 'Shipped') statusClass = 'status-shipped';
      if (order.status === 'Completed') statusClass = 'status-completed';

      rows += `
        <tr>
          <td><strong>#${order.orderId}</strong><br/><span style="font-size: 0.75rem; color: var(--text-muted);">${order.date}</span></td>
          <td>
            <strong>${order.customer.name}</strong><br/>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${order.customer.phone}</span><br/>
            <span style="font-size: 0.75rem; color: var(--ruby-velvet);">${order.customer.email || 'No email'}</span>
          </td>
          <td style="max-width: 200px; font-size: 0.8rem;">${itemsSummary}</td>
          <td><strong>₹${order.totalAmount}</strong></td>
          <td>
            <select class="form-control" style="padding: 4px 8px; font-size: 0.8rem;" onchange="adminDashboard.updateOrderStatus('${order.orderId}', this.value)">
              <option value="Pending Payment" ${order.status === 'Pending Payment' ? 'selected' : ''}>Pending Payment</option>
              <option value="Payment Confirmed" ${order.status === 'Payment Confirmed' ? 'selected' : ''}>Payment Confirmed</option>
              <option value="In Crafting" ${order.status === 'In Crafting' ? 'selected' : ''}>In Crafting</option>
              <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </td>
          <td>
            <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="adminDashboard.notifyCustomerWhatsApp('${order.orderId}')">📱 WhatsApp</button>
          </td>
        </tr>
      `;
    });

    return `
      <div style="overflow-x: auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order ID & Date</th>
              <th>Customer</th>
              <th>Items Ordered</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('cozy_loops_orders')) || [];
    const index = orders.findIndex(o => o.orderId === orderId);
    if (index !== -1) {
      orders[index].status = newStatus;
      localStorage.setItem('cozy_loops_orders', JSON.stringify(orders));
      cartStore.showToast(`Order #${orderId} status updated to ${newStatus}`);
    }
  }

  notifyCustomerWhatsApp(orderId) {
    const orders = JSON.parse(localStorage.getItem('cozy_loops_orders')) || [];
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    let phone = order.customer.phone.replace(/[^0-9]/g, '');
    if (!phone.startsWith('91') && phone.length === 10) phone = '91' + phone;

    const message = `Hi ${order.customer.name}! 🧶\nYour Cozy Loops Crochet order #${order.orderId} status has been updated to: *${order.status}*!\n\nThank you for supporting small handmade businesses! ✨`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  // PRODUCTS TAB
  renderProductsTab() {
    const products = productStore.getAllProducts();

    let rows = '';
    products.forEach(p => {
      rows += `
        <tr>
          <td><img src="${p.image}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;" /></td>
          <td><strong>${p.name}</strong><br/><span style="font-size: 0.75rem; color: var(--text-muted);">${p.category}</span></td>
          <td><strong>₹${p.price}</strong> <span style="font-size: 0.75rem; text-decoration: line-through; color: var(--text-muted);">₹${p.originalPrice || ''}</span></td>
          <td><span class="status-badge ${p.inStock ? 'status-paid' : 'status-pending'}">${p.inStock ? 'In Stock' : 'Made to Order'}</span></td>
          <td>
            <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="adminDashboard.deleteProduct('${p.id}')">Delete</button>
          </td>
        </tr>
      `;
    });

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="font-family: var(--font-heading); font-size: 1.1rem;">All Catalog Products (${products.length})</h4>
        <button class="btn-primary" style="padding: 8px 18px; font-size: 0.85rem;" onclick="adminDashboard.renderAddProductForm()">+ Add New Product</button>
      </div>

      <div style="overflow-x: auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name & Category</th>
              <th>Price</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  renderAddProductForm() {
    const container = document.getElementById('adminTabBody');
    container.innerHTML = `
      <div style="background: var(--white); border: 1px solid var(--sandstone-border); padding: 20px; border-radius: var(--radius-md);">
        <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--ruby-velvet); margin-bottom: 16px;">Add New Crochet Item</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label>Product Name *</label>
            <input type="text" id="newProdName" class="form-control" placeholder="e.g. Handmade Strawberry Keychain" />
          </div>

          <div class="form-group">
            <label>Category *</label>
            <select id="newProdCat" class="form-control">
              <option>Plushies & Amigurumi</option>
              <option>Bags & Totes</option>
              <option>Wearables & Tops</option>
              <option>Home & Coasters</option>
              <option>Accessories & Keychains</option>
            </select>
          </div>

          <div class="form-group">
            <label>Selling Price (₹) *</label>
            <input type="number" id="newProdPrice" class="form-control" placeholder="e.g. 499" />
          </div>

          <div class="form-group">
            <label>Original MRP (₹)</label>
            <input type="number" id="newProdOrigPrice" class="form-control" placeholder="e.g. 699" />
          </div>

          <div class="form-group">
            <label>Image Asset / URL *</label>
            <input type="text" id="newProdImg" class="form-control" value="assets/bear_plushie.jpg" placeholder="Image file path or URL" />
          </div>

          <div class="form-group">
            <label>Crafting Days Badge</label>
            <input type="text" id="newProdDays" class="form-control" value="Ships in 2-3 Days" />
          </div>
        </div>

        <div class="form-group">
          <label>Available Custom Yarn Colors (Comma separated)</label>
          <input type="text" id="newProdColors" class="form-control" value="Porcelain White, Sandstone Beige, Ruby Velvet" />
        </div>

        <div class="form-group">
          <label>Product Description</label>
          <textarea id="newProdDesc" class="form-control" placeholder="Short detail about materials used, yarn softeness, size..."></textarea>
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button class="btn-secondary" onclick="adminDashboard.switchTab('products')">Cancel</button>
          <button class="btn-primary" onclick="adminDashboard.saveNewProduct()">Save & Publish Item</button>
        </div>
      </div>
    `;
  }

  saveNewProduct() {
    const name = document.getElementById('newProdName').value;
    const cat = document.getElementById('newProdCat').value;
    const price = parseFloat(document.getElementById('newProdPrice').value);
    const origPrice = parseFloat(document.getElementById('newProdOrigPrice').value) || price + 150;
    const img = document.getElementById('newProdImg').value || 'assets/bear_plushie.jpg';
    const days = document.getElementById('newProdDays').value || 'Ships in 3 Days';
    const colorsRaw = document.getElementById('newProdColors').value;
    const desc = document.getElementById('newProdDesc').value || 'Handcrafted crochet product made with soft cotton yarn.';

    if (!name || !price) {
      cartStore.showToast('Please fill product name and price!');
      return;
    }

    const colors = colorsRaw.split(',').map(c => c.trim()).filter(Boolean);

    productStore.addProduct({
      name,
      category: cat,
      price,
      originalPrice: origPrice,
      image: img,
      badge: 'New Collection',
      colors,
      craftingDays: days,
      description: desc,
      isFeatured: true,
      inStock: true
    });

    cartStore.showToast(`Published "${name}" to store! 🧶`);
    this.switchTab('products');
    if (window.renderApp) window.renderApp();
  }

  deleteProduct(id) {
    if (confirm('Are you sure you want to remove this product from the shop?')) {
      productStore.deleteProduct(id);
      cartStore.showToast('Product removed');
      this.switchTab('products');
      if (window.renderApp) window.renderApp();
    }
  }

  // SETTINGS TAB
  renderSettingsTab() {
    const settings = cartStore.getSettings();

    return `
      <div style="background: var(--white); border: 1px solid var(--sandstone-border); padding: 24px; border-radius: var(--radius-md);">
        <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--ruby-velvet); margin-bottom: 16px;">WhatsApp & Store Settings</h4>

        <div class="form-group">
          <label>Seller WhatsApp Number (with country code, e.g. 919876543210) *</label>
          <input type="text" id="setWaPhone" class="form-control" value="${settings.whatsappPhone || ''}" />
        </div>

        <div class="form-group">
          <label>Seller Email Address (for order mailto copy) *</label>
          <input type="email" id="setSellerEmail" class="form-control" value="${settings.sellerEmail || ''}" />
        </div>

        <div class="form-group">
          <label>Seller Payment UPI ID (e.g. sistername@upi) *</label>
          <input type="text" id="setUpiId" class="form-control" value="${settings.upiId || ''}" />
        </div>

        <div class="form-group">
          <label>Top Announcement Bar Banner Text</label>
          <input type="text" id="setAnnounce" class="form-control" value="${settings.announcementText || ''}" />
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
          <button class="btn-primary" onclick="adminDashboard.saveSettings()">Save Store Settings</button>
        </div>
      </div>
    `;
  }

  saveSettings() {
    const settings = {
      whatsappPhone: document.getElementById('setWaPhone').value,
      sellerEmail: document.getElementById('setSellerEmail').value,
      upiId: document.getElementById('setUpiId').value,
      announcementText: document.getElementById('setAnnounce').value
    };

    cartStore.saveSettings(settings);
    cartStore.showToast('Store settings updated! ✨');
    if (window.renderApp) window.renderApp();
  }
}

window.adminDashboard = new AdminDashboard();
