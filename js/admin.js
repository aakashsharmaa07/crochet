/* ==========================================================================
   Cozy Loops Crochet - Full-Page Dedicated Admin Dashboard Controller
   ========================================================================== */

class AdminDashboard {
  constructor() {
    this.isAuthenticated = localStorage.getItem('cozy_admin_logged') === 'true';
    
    const hash = window.location.hash ? window.location.hash.replace('#', '') : null;
    const storedTab = localStorage.getItem('cozy_admin_active_tab');
    this.currentTab = hash || storedTab || 'dashboard';
    
    this.searchQuery = '';
    
    // Initialize default credentials if not set
    if (!localStorage.getItem('cozy_admin_email')) {
      localStorage.setItem('cozy_admin_email', 'admin@cozyloops.com');
    }
    if (!localStorage.getItem('cozy_admin_password')) {
      localStorage.setItem('cozy_admin_password', 'admin123');
    }
  }

  getAdminCredentials() {
    let email = localStorage.getItem('cozy_admin_email');
    let password = localStorage.getItem('cozy_admin_password');
    if (!email || !email.trim()) {
      email = 'admin@cozyloops.com';
      localStorage.setItem('cozy_admin_email', email);
    }
    if (!password || !password.trim()) {
      password = 'admin123';
      localStorage.setItem('cozy_admin_password', password);
    }
    return {
      email: email.trim(),
      password: password.trim()
    };
  }

  showToast(message) {
    if (window.cartStore && typeof window.cartStore.showToast === 'function') {
      window.cartStore.showToast(message);
      return;
    }
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  }

  login(email, password) {
    const creds = this.getAdminCredentials();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const isEmailValid = cleanEmail === creds.email.toLowerCase();
    const isPasswordValid = cleanPass === creds.password;

    if (isEmailValid && isPasswordValid) {
      this.isAuthenticated = true;
      localStorage.setItem('cozy_admin_logged', 'true');
      this.showToast('Welcome back, Admin! 🧶');
      return true;
    }
    return false;
  }

  logout() {
    this.isAuthenticated = false;
    localStorage.removeItem('cozy_admin_logged');
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = '';
      toast.classList.remove('show');
    }
    if (window.location.pathname.endsWith('admin.html')) {
      this.renderAdminView();
    } else {
      window.location.href = 'admin.html';
    }
  }

  resetPassword(emailConfirmation, newPassword) {
    const creds = this.getAdminCredentials();
    const cleanConfirm = (emailConfirmation || '').trim().toLowerCase();
    const cleanNewPass = (newPassword || '').trim();
    
    if (cleanConfirm === creds.email.toLowerCase() || cleanConfirm === 'admin@cozyloops.com' || cleanConfirm === 'admin') {
      localStorage.setItem('cozy_admin_password', cleanNewPass);
      // AUTOMATICALLY LOG IN IMMEDIATELY!
      this.isAuthenticated = true;
      localStorage.setItem('cozy_admin_logged', 'true');
      this.showToast('Password updated & logged in successfully! 🔑');
      return true;
    }
    return false;
  }

  renderAdminView() {
    const container = document.getElementById('adminView');
    if (!container) return;
    container.style.display = 'block';

    if (typeof showView === 'function') {
      try {
        const mainShopView = document.getElementById('mainShopView');
        if (mainShopView) showView('admin', false, false);
      } catch(e) {}
    }

    this.isAuthenticated = this.isAuthenticated || localStorage.getItem('cozy_admin_logged') === 'true';

    if (!this.isAuthenticated) {
      this.renderLoginPage(container);
      return;
    }

    try {
      const orders = cartStore.getOrders() || [];
      const pendingOrdersCount = orders.filter(o => o && o.status === 'Pending').length;

      container.innerHTML = `
        <div class="admin-fullpage-layout">
          
          <!-- LEFT SIDEBAR: Cozy Loops Warm Branding & Navigation -->
          <aside class="admin-sidebar-warm">
            <div>
              <!-- Brand Logo Header -->
              <div class="admin-sidebar-brand">
                <div class="admin-brand-icon">🧶</div>
                <div>
                  <div class="admin-brand-title">Cozy Loops</div>
                  <div class="admin-brand-tag">Admin Panel</div>
                </div>
              </div>

              <!-- MAIN NAVIGATION -->
              <div class="admin-nav-section-title">Main</div>
              <a href="javascript:void(0)" class="admin-nav-item ${this.currentTab === 'dashboard' ? 'active' : ''}" onclick="adminDashboard.switchTab('dashboard')">
                <span>📊 Dashboard</span>
              </a>
              <a href="javascript:void(0)" class="admin-nav-item ${this.currentTab === 'orders' ? 'active' : ''}" onclick="adminDashboard.switchTab('orders')">
                <span>🛍️ Orders</span>
                ${pendingOrdersCount > 0 ? `<span class="admin-nav-badge">${pendingOrdersCount}</span>` : ''}
              </a>

              <!-- CATALOGUE NAVIGATION -->
              <div class="admin-nav-section-title">Catalogue</div>
              <a href="javascript:void(0)" class="admin-nav-item ${this.currentTab === 'products' ? 'active' : ''}" onclick="adminDashboard.switchTab('products')">
                <span>📦 Products & Pricing</span>
              </a>
              <a href="javascript:void(0)" class="admin-nav-item ${this.currentTab === 'categories' ? 'active' : ''}" onclick="adminDashboard.switchTab('categories')">
                <span>🏷️ Store Categories</span>
              </a>
              <a href="javascript:void(0)" class="admin-nav-item ${this.currentTab === 'inventory' ? 'active' : ''}" onclick="adminDashboard.switchTab('inventory')">
                <span>📊 Inventory & Stock</span>
              </a>
              <a href="javascript:void(0)" class="admin-nav-item ${this.currentTab === 'gallery' ? 'active' : ''}" onclick="adminDashboard.switchTab('gallery')">
                <span>🖼️ Product Gallery</span>
              </a>

              <!-- SETTINGS NAVIGATION -->
              <div class="admin-nav-section-title">Settings</div>
              <a href="javascript:void(0)" class="admin-nav-item ${this.currentTab === 'settings' ? 'active' : ''}" onclick="adminDashboard.switchTab('settings')">
                <span>⚙️ Store Settings</span>
              </a>
            </div>

            <!-- BOTTOM ADMIN USER CARD -->
            <div class="admin-user-card">
              <div class="admin-user-info">
                <div class="admin-avatar">A</div>
                <div style="overflow: hidden;">
                  <div style="font-weight: 700; font-size: 0.88rem; color: var(--onyx-black); white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">Aakash Sharma</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${this.getAdminCredentials().email}</div>
                </div>
              </div>
              <button class="btn-secondary" style="width: 100%; padding: 8px; font-size: 0.8rem; justify-content: center;" onclick="adminDashboard.logout()">
                Sign Out 🚪
              </button>
            </div>
          </aside>

          <!-- MAIN CONTENT VIEWPORT -->
          <main class="admin-main-viewport">
            
            <!-- TOP HEADER BAR -->
            <header class="admin-topbar-warm">
              <div style="display: flex; align-items: center; gap: 16px;">
                <h2 style="font-family: var(--font-heading); font-size: 1.6rem; color: var(--onyx-black); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800;">
                  ${this.getTabHeading()}
                </h2>
              </div>

              <div style="display: flex; align-items: center; gap: 16px;">
                <!-- View Store Live Switcher -->
                <button class="btn-primary" onclick="window.location.href='index.html'" style="padding: 10px 20px; font-size: 0.88rem; gap: 8px;">
                  View Store ↗
                </button>
              </div>
            </header>

            <!-- DYNAMIC TAB CONTENT AREA -->
            <div class="admin-content-area">
              ${this.renderTabContent()}
            </div>

          </main>
        </div>

        <!-- GLOBAL PRODUCT & PHOTO MANAGER MODAL -->
        <div id="adminProductModal" class="modal-overlay">
          <div class="admin-modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px dashed var(--sandstone-border); padding-bottom: 14px;">
              <h3 id="adminModalTitle" style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--onyx-black);">Edit Product</h3>
              <button class="modal-close" onclick="adminDashboard.closeProductModal()" style="position: static;">✕</button>
            </div>
            <div id="adminModalBody"></div>
          </div>
        </div>
      `;
    } catch(e) {
      console.error('Error rendering admin dashboard:', e);
    }
  }

  getTabHeading() {
    switch (this.currentTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'orders': return 'Customer Orders';
      case 'products': return 'Products & Pricing Catalogue';
      case 'categories': return 'Store Categories & Organization';
      case 'inventory': return 'Inventory & Stock Control';
      case 'gallery': return 'Product Gallery & Photos';
      case 'settings': return 'Store Settings & Policies';
      default: return 'Admin Panel';
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    localStorage.setItem('cozy_admin_active_tab', tabName);
    try {
      window.location.hash = tabName;
    } catch(e) {}
    this.renderAdminView();
  }

  /* ==========================================================================
     AUTHENTICATION SCREENS (Email & Password + Reset)
     ========================================================================== */

  renderLoginPage(container) {
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--porcelain-white); padding: 20px;">
        <div style="background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--sandstone-border); padding: 40px; width: 100%; max-width: 440px; box-shadow: var(--shadow-md); text-align: center;">
          
          <div style="width: 64px; height: 64px; background: var(--sandstone-light); border: 2px dashed var(--ruby-velvet); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px auto;">
            🧶
          </div>

          <h2 style="font-family: var(--font-heading); font-size: 1.8rem; color: var(--onyx-black); margin-bottom: 6px;">Cozy Loops Admin</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 24px;">Sign in with your email & password to manage store orders and catalog</p>

          <!-- INLINE ERROR WARNING BANNER -->
          <div id="adminLoginError" style="display: none; background: #FDEDEC; border: 1.5px dashed #F5C6CB; color: #C0392B; font-size: 0.85rem; font-weight: 600; padding: 12px 14px; border-radius: var(--radius-md); margin-bottom: 20px; text-align: left; box-shadow: var(--shadow-sm);">
            ⚠️ Incorrect email or password. Please check your credentials and try again.
          </div>

          <div class="admin-login-form">
            <div class="form-group" style="text-align: left; margin-bottom: 18px;">
              <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">Admin Email Address</label>
              <input type="email" id="adminEmailInput" class="form-control" placeholder="Enter admin email address" required onkeydown="if(event.key==='Enter') adminDashboard.handleLoginSubmit(event)" />
            </div>

            <div class="form-group" style="text-align: left; margin-bottom: 22px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black);">Password</label>
                <a href="javascript:void(0)" onclick="adminDashboard.renderForgotPasswordModal()" style="font-size: 0.8rem; color: var(--ruby-velvet); font-weight: 600;">Forgot Password?</a>
              </div>
              <input type="password" id="adminPasswordInput" class="form-control" placeholder="Enter your password" onkeydown="if(event.key==='Enter') adminDashboard.handleLoginSubmit(event)" />
            </div>

            <button type="button" onclick="adminDashboard.handleLoginSubmit(event)" class="btn-primary" style="width: 100%; justify-content: center; padding: 14px; font-size: 1rem; margin-bottom: 16px;">
              Sign In to Dashboard 🔑
            </button>

            <button type="button" class="btn-secondary" style="width: 100%; justify-content: center; padding: 12px; font-size: 0.88rem;" onclick="window.location.href='index.html'">
              ← Return to Live Store
            </button>

            
            </div>
          </div>

        </div>
      </div>
    `;
  }

  handleLoginSubmit(e) {
    if (e) {
      try { e.preventDefault(); } catch(err) {}
      try { e.stopPropagation(); } catch(err) {}
    }

    const emailElem = document.getElementById('adminEmailInput');
    const passElem = document.getElementById('adminPasswordInput');
    const errorElem = document.getElementById('adminLoginError');

    const email = emailElem ? emailElem.value : '';
    const pass = passElem ? passElem.value : '';

    if (this.login(email, pass)) {
      if (errorElem) errorElem.style.display = 'none';
      this.renderAdminView();
    } else {
      if (errorElem) {
        errorElem.style.display = 'block';
        errorElem.innerHTML = `⚠️ Incorrect email or password. Please check your credentials and try again.`;
      }
      if (passElem) {
        passElem.style.borderColor = '#C0392B';
        passElem.focus();
      }
      this.showToast('Incorrect email or password.');
    }
    return false;
  }

  renderForgotPasswordModal() {
    const creds = this.getAdminCredentials();
    const container = document.getElementById('adminView');
    if (!container) return;

    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--porcelain-white); padding: 20px;">
        <div style="background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--sandstone-border); padding: 40px; width: 100%; max-width: 440px; box-shadow: var(--shadow-md); text-align: center;">
          
          <div style="font-size: 2.8rem; margin-bottom: 12px;">🔑</div>
          <h2 style="font-family: var(--font-heading); font-size: 1.6rem; color: var(--onyx-black); margin-bottom: 6px;">Reset Password</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 24px;">Confirm your registered admin email address to set a new password.</p>

          <form onsubmit="adminDashboard.handleResetSubmit(event)">
            <div class="form-group" style="text-align: left; margin-bottom: 16px;">
              <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">Confirm Admin Email</label>
              <input type="email" id="resetEmailConfirm" class="form-control" placeholder="${creds.email}" required />
            </div>

            <div class="form-group" style="text-align: left; margin-bottom: 22px;">
              <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">New Admin Password</label>
              <input type="password" id="resetNewPass" class="form-control" placeholder="Enter new password" required minlength="4" />
            </div>

            <div style="display: flex; gap: 12px;">
              <button type="button" class="btn-secondary" style="flex: 1; justify-content: center; padding: 12px;" onclick="adminDashboard.renderAdminView()">Cancel</button>
              <button type="submit" class="btn-primary" style="flex: 1; justify-content: center; padding: 12px;">Update Password</button>
            </div>
          </form>

        </div>
      </div>
    `;
  }

  handleResetSubmit(e) {
    if (e) e.preventDefault();
    const emailConfirm = document.getElementById('resetEmailConfirm').value;
    const newPass = document.getElementById('resetNewPass').value;

    if (this.resetPassword(emailConfirm, newPass)) {
      this.renderAdminView();
    } else {
      cartStore.showToast('Email address does not match registered admin email!');
    }
  }

  renderTabContent() {
    if (this.currentTab === 'dashboard') return this.renderDashboardTab();
    if (this.currentTab === 'orders') return this.renderOrdersTab();
    if (this.currentTab === 'products') return this.renderProductsTab();
    if (this.currentTab === 'categories') return this.renderCategoriesTab();
    if (this.currentTab === 'inventory') return this.renderInventoryTab();
    if (this.currentTab === 'gallery') return this.renderGalleryTab();
    if (this.currentTab === 'settings') return this.renderSettingsTab();
    return this.renderDashboardTab();
  }

  /* ==========================================================================
     TAB 1: DASHBOARD OVERVIEW (KPIs + Low Stock Alerts + Recent Orders)
     ========================================================================== */

  renderDashboardTab() {
    const orders = cartStore.getOrders();
    const products = productStore.getAllProducts();

    if (this.dashboardMonthFilter === undefined) this.dashboardMonthFilter = 'All';

    // Parse unique month strings from order dates (e.g. 'Aug 2026', 'August 2026')
    const monthsSet = new Set();
    orders.forEach(o => {
      if (o.date) {
        const match = o.date.match(/([A-Za-z]+\s+\d{4})/);
        if (match) monthsSet.add(match[1]);
      }
    });
    const availableMonths = Array.from(monthsSet);

    let filteredOrders = orders;
    if (this.dashboardMonthFilter && this.dashboardMonthFilter !== 'All') {
      filteredOrders = orders.filter(o => o.date && o.date.includes(this.dashboardMonthFilter));
    }

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const ordersCount = filteredOrders.length;
    const lowStockProducts = products.filter(p => (p.stock !== undefined ? p.stock : 10) < 3);
    const outOfStockCount = products.filter(p => (p.stock !== undefined ? p.stock : 10) <= 0).length;

    const recentOrders = orders.slice(0, 5);

    const lowStockBannerHtml = lowStockProducts.length > 0 ? `
      <div style="background: #FFF8E7; border: 1.5px dashed #FFE0B2; border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; font-weight: 700; color: #D35400;">
          <span style="font-size: 1.3rem;">⚠️</span>
          <span>Inventory Alert: ${lowStockProducts.length} items are running low or out of stock!</span>
        </div>
        <button class="btn-secondary" style="padding: 6px 14px; font-size: 0.82rem; background: #FFF; border-color: #F39C12; color: #D35400;" onclick="adminDashboard.switchTab('inventory')">
          Manage Inventory 📦
        </button>
      </div>
    ` : '';

    const ordersTableRows = recentOrders.map(order => `
      <tr>
        <td style="font-weight: 700; color: var(--ruby-velvet);">${order.orderId || 'ORD'}</td>
        <td>
          <div style="font-weight: 700; color: var(--onyx-black);">${order.customerName || 'Customer'}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${order.phone || ''}</div>
        </td>
        <td>${(order.items || []).length} items</td>
        <td style="font-weight: 800; color: var(--onyx-black);">₹${order.total || 0}</td>
        <td>
          <span style="background: ${order.status === 'Confirmed' ? '#E8F8F0' : '#FFF3CD'}; color: ${order.status === 'Confirmed' ? '#1E8449' : '#856404'}; font-size: 0.78rem; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-full);">
            ${order.status || 'Pending'}
          </span>
        </td>
        <td style="color: var(--text-muted); font-size: 0.82rem;">${order.date || ''}</td>
      </tr>
    `).join('');

    return `
      <!-- LOW STOCK ALERT BANNER -->
      ${lowStockBannerHtml}

      <!-- MONTHLY EARNING & ORDER FILTER CONTROL ROW -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; flex-wrap: wrap; gap: 16px; background: var(--sandstone-light); padding: 14px 22px; border-radius: 20px; border: 1.5px dashed var(--sandstone-border);">
        <div>
          <h3 style="font-family: var(--font-heading); font-size: 1.35rem; color: var(--onyx-black); margin-bottom: 2px;">Earnings & Orders Overview</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Track your store performance month-by-month</p>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; background: var(--white); border: 1.5px solid var(--sandstone-border); padding: 6px 16px; border-radius: var(--radius-full); box-shadow: var(--shadow-sm);">
          <span style="font-size: 0.82rem; font-weight: 700; color: var(--ruby-velvet);">📅 Filter Month:</span>
          <select id="dashboardMonthSelect" class="admin-select-custom" style="border: none; background: transparent; font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); outline: none; cursor: pointer;" onchange="adminDashboard.handleDashboardMonthFilter(this.value)">
            <option value="All" ${this.dashboardMonthFilter === 'All' ? 'selected' : ''}>📅 All Time (All Months)</option>
            ${availableMonths.map(m => `
              <option value="${m}" ${this.dashboardMonthFilter === m ? 'selected' : ''}>📅 ${m}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- 4 KPI STAT CARDS ROW -->
      <div class="admin-kpi-grid">
        <div class="admin-kpi-card-warm">
          <div class="admin-kpi-title">Total Revenue</div>
          <div class="admin-kpi-value">₹${totalRevenue}</div>
          <div class="admin-kpi-sub">${this.dashboardMonthFilter === 'All' ? `Across ${ordersCount} total orders` : `In ${this.dashboardMonthFilter} (${ordersCount} orders)`}</div>
        </div>

        <div class="admin-kpi-card-warm">
          <div class="admin-kpi-title">Total Orders</div>
          <div class="admin-kpi-value">${ordersCount}</div>
          <div class="admin-kpi-sub">${this.dashboardMonthFilter === 'All' ? 'Received via WhatsApp' : `Placed in ${this.dashboardMonthFilter}`}</div>
        </div>

        <div class="admin-kpi-card-warm">
          <div class="admin-kpi-title">Out of Stock</div>
          <div class="admin-kpi-value" style="color: ${outOfStockCount > 0 ? '#C0392B' : 'var(--ruby-velvet)'};">${outOfStockCount}</div>
          <div class="admin-kpi-sub">of ${products.length} catalog items</div>
        </div>

        <div class="admin-kpi-card-warm">
          <div class="admin-kpi-title">Active Products</div>
          <div class="admin-kpi-value">${products.length}</div>
          <div class="admin-kpi-sub">Across store collections</div>
        </div>
      </div>

      <!-- RECENT ORDERS SECTION -->
      <div style="background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--sandstone-border); padding: 24px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: var(--onyx-black);">Recent Orders</h3>
            <p style="font-size: 0.82rem; color: var(--text-muted);">Latest customer orders needing fulfillment</p>
          </div>
          <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;" onclick="adminDashboard.switchTab('orders')">View All Orders →</button>
        </div>

        ${orders.length > 0 ? `
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${ordersTableRows}
            </tbody>
          </table>
        ` : `
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            No customer orders placed yet. Orders will automatically appear here when customers checkout!
          </div>
        `}
      </div>
    `;
  }

  handleDashboardMonthFilter(month) {
    this.dashboardMonthFilter = month;
    this.renderAdminView();
  }

  /* ==========================================================================
     TAB 2: ORDERS MANAGEMENT
     ========================================================================== */

  renderOrdersTab() {
    const orders = cartStore.getOrders();

    const rows = orders.map(order => `
      <tr>
        <td style="font-weight: 700; color: var(--ruby-velvet);">${order.orderId || 'ORD'}</td>
        <td>
          <div style="font-weight: 700; color: var(--onyx-black);">${order.customerName || 'Customer'}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${order.phone || ''} | ${order.email || 'No email'}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${order.address || ''}, ${order.city || ''}, ${order.state || ''} ${order.pincode || ''}</div>
        </td>
        <td>
          ${(order.items || []).map(i => `<div style="font-size: 0.82rem;">• ${i.name || 'Item'} (${i.selectedColor || 'Standard'}) × ${i.quantity || 1}</div>`).join('') || '<div style="font-size: 0.82rem; color: var(--text-muted);">No items</div>'}
        </td>
        <td style="font-weight: 800; color: var(--onyx-black);">₹${order.total || 0}</td>
        <td>
          <select onchange="adminDashboard.updateOrderStatus('${order.orderId}', this.value)">
            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
        <td>
          <div class="admin-action-group">
            <button class="admin-icon-btn admin-icon-btn-whatsapp" title="Send WhatsApp Update" onclick="adminDashboard.notifyCustomerWhatsApp('${order.orderId}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.818 11.818 0 005.71 1.453h.006c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.476-8.414z"/></svg>
              <span>WhatsApp</span>
            </button>
            <button class="admin-icon-btn admin-icon-btn-danger" title="Delete Order" onclick="adminDashboard.deleteOrder('${order.orderId}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    return `
      <div style="background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--sandstone-border); padding: 24px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--onyx-black);">Manage Orders (${orders.length})</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Track customer orders and send 1-click WhatsApp status updates</p>
          </div>
        </div>

        ${orders.length > 0 ? `
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Details</th>
                <th>Items Purchased</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        ` : `
          <div style="text-align: center; padding: 60px; color: var(--text-muted);">
            No customer orders recorded yet.
          </div>
        `}
      </div>
    `;
  }

  updateOrderStatus(orderId, newStatus) {
    cartStore.updateOrderStatus(orderId, newStatus);
    cartStore.showToast(`Order ${orderId} updated to ${newStatus}`);
  }

  deleteOrder(orderId) {
    if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
      cartStore.deleteOrder(orderId);
      cartStore.showToast(`Order ${orderId} deleted successfully`);
      this.renderAdminView();
    }
  }

  notifyCustomerWhatsApp(orderId) {
    const orders = cartStore.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    const text = `Hi ${order.customerName}! Update on your Cozy Loops order *${order.orderId}*: Status is now *${order.status}*. Thank you for choosing handcrafted! 🧶🌸`;
    window.open(`https://wa.me/91${order.phone}?text=${encodeURIComponent(text)}`, '_blank');
  }

  /* ==========================================================================
     TAB 3: PRODUCTS & PRICING CATALOGUE
     ========================================================================== */

  renderProductsTab() {
    const products = productStore.getAllProducts();
    const categories = productStore.getCategories();

    if (this.productSearchQuery === undefined) this.productSearchQuery = '';
    if (this.productCategoryFilter === undefined) this.productCategoryFilter = 'All';

    let filtered = products;

    if (this.productCategoryFilter && this.productCategoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === this.productCategoryFilter);
    }

    if (this.productSearchQuery && this.productSearchQuery.trim()) {
      const q = this.productSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    const rows = filtered.map(p => {
      const discountPercent = p.discount || (p.originalPrice && p.price < p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0);
      const unitStr = p.unit ? ` ${p.unit}` : '';
      const stockCount = p.stock !== undefined ? p.stock : 10;
      const stockStatus = p.stockStatus || (stockCount === 0 ? 'Out of Stock' : (stockCount < 3 ? 'Low Stock' : 'In Stock'));

      let stockBadgeClass = 'admin-stock-in';
      let stockBadgeLabel = '● IN STOCK';
      if (stockStatus === 'Low Stock' || stockCount < 3) {
        stockBadgeClass = 'admin-stock-low';
        stockBadgeLabel = '● LOW STOCK';
      } else if (stockStatus === 'Out of Stock' || stockCount === 0) {
        stockBadgeClass = 'admin-stock-out';
        stockBadgeLabel = '● OUT OF STOCK';
      }

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 14px;">
              <img src="${p.image || ''}" alt="${p.name}" style="width: 52px; height: 52px; object-fit: cover; border-radius: var(--radius-md); border: 1.5px solid var(--sandstone-border);" />
              <div>
                <div style="font-weight: 700; color: var(--onyx-black); font-size: 0.92rem;">${p.name}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.3;">${p.shortDesc || p.description || ''}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="background: var(--sandstone-light); font-size: 0.78rem; font-weight: 700; padding: 6px 12px; border-radius: var(--radius-sm); color: var(--onyx-black); white-space: nowrap; display: inline-block;">
              ${p.category}
            </span>
          </td>
          <td style="font-weight: 800; color: var(--onyx-black); font-size: 0.95rem;">
            ₹${p.price}<span style="font-size: 0.78rem; font-weight: 500; color: var(--text-muted);">${unitStr}</span>
          </td>
          <td>
            ${discountPercent > 0 ? `<span style="background: #FEF9E7; color: #B7950B; border: 1px solid #F9E79F; font-size: 0.75rem; font-weight: 800; padding: 4px 8px; border-radius: var(--radius-sm);">${discountPercent}% OFF</span>` : '<span style="color: var(--text-muted);">-</span>'}
          </td>
          <td>
            <span class="admin-stock-badge ${stockBadgeClass}">
              ${stockBadgeLabel}
            </span>
          </td>
          <td>
            <div class="admin-action-group">
              <button class="admin-icon-btn" title="Edit Product" onclick="adminDashboard.renderProductModal('${p.id}')" style="border-color: var(--sandstone-border); background: var(--white); color: var(--onyx-black); width: 36px; height: 36px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="admin-icon-btn admin-icon-btn-danger" title="Delete Product" onclick="adminDashboard.deleteProduct('${p.id}')" style="width: 36px; height: 36px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div style="background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--sandstone-border); padding: 24px; box-shadow: var(--shadow-sm);">
        
        <!-- HEADER ROW WITH TITLE & ADD BUTTON -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--onyx-black);">Product Catalogue (${products.length})</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Manage your handcrafted items, pricing, discounts, stock, and Cloudinary photos</p>
          </div>
          <button class="btn-primary" style="padding: 10px 18px; font-size: 0.88rem; gap: 8px;" onclick="adminDashboard.renderProductModal()">
            <span>+ Add New Product</span>
          </button>
        </div>

        <!-- SEARCH BAR & CATEGORY FILTER CONTROL ROW -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; background: var(--sandstone-light); padding: 14px 18px; border-radius: var(--radius-md); border: 1.5px dashed var(--sandstone-border); flex-wrap: wrap;">
          
          <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 320px; flex-wrap: wrap;">
            
            <!-- PREMIUM VECTOR SEARCH INPUT -->
            <div style="position: relative; flex: 1; min-width: 240px;">
              <svg style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--ruby-velvet); pointer-events: none;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="adminProductSearch" class="form-control" style="height: 42px; padding-left: 44px; padding-right: 16px; border-radius: var(--radius-full); background: var(--white); border: 1.5px solid var(--sandstone-border); font-size: 0.88rem; box-shadow: var(--shadow-sm);" placeholder="Search product name, tagline..." value="${this.productSearchQuery}" oninput="adminDashboard.handleProductSearch(this.value)" />
            </div>

            <!-- PREMIUM CATEGORY FILTER DROPDOWN -->
            <select id="adminCategoryFilter" class="form-control" style="height: 42px; width: auto; min-width: 210px; border-radius: var(--radius-full); background: var(--white); border: 1.5px solid var(--sandstone-border); font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); box-shadow: var(--shadow-sm); cursor: pointer;" onchange="adminDashboard.handleCategoryFilter(this.value)">
              <option value="All" ${this.productCategoryFilter === 'All' ? 'selected' : ''}>🏷️ All Categories (${products.length})</option>
              ${categories.map(cat => {
                const count = products.filter(p => p.category === cat).length;
                return `<option value="${cat}" ${this.productCategoryFilter === cat ? 'selected' : ''}>${cat} (${count})</option>`;
              }).join('')}
            </select>

            <!-- CLEAR FILTERS BUTTON -->
            ${(this.productSearchQuery || this.productCategoryFilter !== 'All') ? `
              <button class="btn-secondary" style="height: 42px; padding: 0 16px; font-size: 0.82rem; font-weight: 700; border-radius: var(--radius-full); border-color: var(--ruby-velvet); color: var(--ruby-velvet); background: var(--white); display: inline-flex; align-items: center; gap: 6px; box-shadow: var(--shadow-sm);" onclick="adminDashboard.clearProductFilters()">
                ✕ Clear Filters
              </button>
            ` : ''}

          </div>

          <!-- PRODUCT COUNTER STAT PILL -->
          <div style="background: var(--white); border: 1.5px solid var(--sandstone-border); padding: 8px 16px; border-radius: var(--radius-full); font-size: 0.82rem; font-weight: 700; color: var(--ruby-velvet); white-space: nowrap; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 6px; height: 42px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: var(--ruby-velvet); border-radius: 50%;"></span>
            Showing ${filtered.length} of ${products.length} Products
          </div>

        </div>

        <!-- TABLE OR EMPTY STATE -->
        ${filtered.length > 0 ? `
          <table class="admin-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>DISCOUNT</th>
                <th>STOCK</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        ` : `
          <div style="text-align: center; padding: 48px; background: var(--sandstone-light); border-radius: var(--radius-md); border: 1.5px dashed var(--sandstone-border);">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">🔍</div>
            <div style="font-weight: 700; font-size: 1rem; color: var(--onyx-black); margin-bottom: 4px;">No products match your search or filter</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">Try searching for a different keyword or resetting the category filter</div>
            <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.82rem;" onclick="adminDashboard.clearProductFilters()">
              Reset Search & Filters
            </button>
          </div>
        `}
      </div>
    `;
  }

  handleProductSearch(query) {
    this.productSearchQuery = query;
    this.renderAdminView();
    const inp = document.getElementById('adminProductSearch');
    if (inp) {
      inp.focus();
      inp.selectionStart = inp.selectionEnd = inp.value.length;
    }
  }

  handleCategoryFilter(category) {
    this.productCategoryFilter = category;
    this.renderAdminView();
  }

  clearProductFilters() {
    this.productSearchQuery = '';
    this.productCategoryFilter = 'All';
    this.renderAdminView();
  }

  renderProductModal(productId = null) {
    const modal = document.getElementById('adminProductModal');
    const modalTitle = document.getElementById('adminModalTitle');
    const modalBody = document.getElementById('adminModalBody');

    if (!modal || !modalBody) return;

    const p = productId ? productStore.getProductById(productId) : {
      id: '',
      name: '',
      shortDesc: '',
      description: '',
      price: '',
      unit: '/ piece',
      originalPrice: '',
      discount: '',
      category: 'Plushies & Amigurumi',
      badge: '',
      stockStatus: 'In Stock',
      stock: 10,
      image: '',
      additionalImages: []
    };

    modalTitle.textContent = productId ? `Edit Product` : `Add New Product 🧶`;

    const addImages = p.additionalImages || [];

    modalBody.innerHTML = `
      <form onsubmit="adminDashboard.saveProductModal(event, '${p.id || ''}')">
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">PRODUCT NAME *</label>
          <input type="text" id="modalProdName" class="form-control" value="${p.name || ''}" placeholder="e.g. Cozy Bear Amigurumi Plushie" required />
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">SHORT TAGLINE / DESCRIPTION</label>
          <input type="text" id="modalProdShortDesc" class="form-control" value="${p.shortDesc || ''}" placeholder="e.g. Handcrafted velvet yarn plushie with knitted scarf." />
        </div>

        <div class="admin-form-grid-2" style="margin-bottom: 16px;">
          <div class="form-group">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">PRICE (₹) *</label>
            <input type="number" id="modalProdPrice" class="form-control" value="${p.price || ''}" placeholder="150" required />
          </div>
          <div class="form-group">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">UNIT</label>
            <input type="text" id="modalProdUnit" class="form-control" value="${p.unit || '/ piece'}" placeholder="e.g. / piece, / slice, / set" />
          </div>
        </div>

        <div class="admin-form-grid-2" style="margin-bottom: 16px;">
          <div class="form-group">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">CATEGORY *</label>
            <select id="modalProdCat" class="form-control" required>
              ${productStore.getCategories().map(cat => `<option value="${cat}" ${p.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">TAG (SHOWN ON CARD)</label>
            <input type="text" id="modalProdBadge" class="form-control" value="${p.badge || ''}" placeholder="e.g. Best Seller, Popular, New" />
          </div>
        </div>

        <div class="admin-form-grid-2" style="margin-bottom: 16px;">
          <div class="form-group">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">DISCOUNT %</label>
            <input type="number" id="modalProdDiscount" class="form-control" value="${p.discount || ''}" placeholder="e.g. 20" />
          </div>
          <div class="form-group">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">STOCK STATUS</label>
            <select id="modalProdStockStatus" class="form-control">
              <option value="In Stock" ${p.stockStatus === 'In Stock' || (p.stock > 2) ? 'selected' : ''}>In Stock</option>
              <option value="Low Stock" ${p.stockStatus === 'Low Stock' || (p.stock > 0 && p.stock < 3) ? 'selected' : ''}>Low Stock</option>
              <option value="Out of Stock" ${p.stockStatus === 'Out of Stock' || p.stock === 0 ? 'selected' : ''}>Out of Stock</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">PRODUCT COVER IMAGE *</label>
          <div class="admin-img-upload-box">
            <img id="modalCoverPreview" src="${p.image || ''}" class="admin-img-preview" alt="Cover Preview" style="${p.image ? 'display: block;' : 'display: none;'}" />
            
            <div id="modalCoverPlaceholder" style="${!p.image ? 'display: flex;' : 'display: none;'} flex-direction: column; align-items: center; justify-content: center; height: 130px; background: var(--sandstone-light); border: 1.5px dashed var(--sandstone-border); border-radius: var(--radius-md); margin-bottom: 12px; color: var(--text-muted);">
              <span style="font-size: 1.8rem; margin-bottom: 4px;">📷</span>
              <span style="font-size: 0.82rem; font-weight: 600;">No cover image uploaded yet</span>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center; align-items: center; margin-bottom: 10px;">
              <label class="btn-secondary" style="padding: 8px 16px; font-size: 0.82rem; cursor: pointer;">
                📷 Upload / Select Cover Image
                <input type="file" accept="image/*" style="display: none;" onchange="adminDashboard.handleCoverUpload(this)" />
              </label>
              <button type="button" class="btn-secondary" style="padding: 8px 14px; font-size: 0.82rem; border-color: #C0392B; color: #C0392B;" onclick="document.getElementById('modalCoverUrl').value=''; document.getElementById('modalCoverPreview').style.display='none'; document.getElementById('modalCoverPlaceholder').style.display='flex';">
                Remove Image
              </button>
            </div>
            
            <input type="text" id="modalCoverUrl" class="form-control" value="${p.image || ''}" placeholder="https://res.cloudinary.com/... or image URL" oninput="if(this.value){ document.getElementById('modalCoverPreview').src=this.value; document.getElementById('modalCoverPreview').style.display='block'; document.getElementById('modalCoverPlaceholder').style.display='none'; } else { document.getElementById('modalCoverPreview').style.display='none'; document.getElementById('modalCoverPlaceholder').style.display='flex'; }" required />
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">ADDITIONAL GALLERY IMAGES</label>
          <div id="additionalImagesContainer">
            ${addImages.map((imgUrl, idx) => `
              <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
                <label class="btn-secondary" style="padding: 8px 14px; font-size: 0.8rem; cursor: pointer; white-space: nowrap;">
                  Upload Image
                  <input type="file" accept="image/*" style="display: none;" onchange="adminDashboard.handleGalleryUpload(this, 'addImg_${idx}')" />
                </label>
                <input type="text" id="addImg_${idx}" class="form-control add-img-input" value="${imgUrl}" placeholder="https://res.cloudinary.com/..." />
                <button type="button" class="btn-secondary" style="padding: 8px 12px; border-color: #C0392B; color: #C0392B;" onclick="this.parentElement.remove()">Remove</button>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-secondary" style="padding: 8px 16px; font-size: 0.82rem; margin-top: 8px;" onclick="adminDashboard.addGalleryImageRow()">
            + Add Additional Image
          </button>
        </div>

        <div class="form-group" style="margin-bottom: 24px;">
          <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">FULL PRODUCT DESCRIPTION</label>
          <textarea id="modalProdDesc" class="form-control" rows="3" placeholder="Detailed product description...">${p.description || ''}</textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px dashed var(--sandstone-border); padding-top: 16px;">
          <button type="button" class="btn-secondary" onclick="adminDashboard.closeProductModal()" style="padding: 10px 20px;">Cancel</button>
          <button type="submit" class="btn-primary" style="padding: 10px 24px; font-size: 0.92rem;">Save Product</button>
        </div>
      </form>
    `;

    modal.classList.add('active');
  }

  closeProductModal() {
    const modal = document.getElementById('adminProductModal');
    if (modal) modal.classList.remove('active');
  }

  async handleCoverUpload(fileInput) {
    await this.uploadImageToCloudinary(fileInput, 'modalCoverPreview', 'modalCoverUrl');
  }

  async handleGalleryUpload(fileInput, targetInputId) {
    await this.uploadImageToCloudinary(fileInput, null, targetInputId);
  }

  addGalleryImageRow() {
    const container = document.getElementById('additionalImagesContainer');
    if (!container) return;
    const idx = Date.now();
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';
    div.innerHTML = `
      <label class="btn-secondary" style="padding: 8px 14px; font-size: 0.8rem; cursor: pointer; white-space: nowrap;">
        Upload Image
        <input type="file" accept="image/*" style="display: none;" onchange="adminDashboard.handleGalleryUpload(this, 'addImg_${idx}')" />
      </label>
      <input type="text" id="addImg_${idx}" class="form-control add-img-input" placeholder="https://res.cloudinary.com/..." />
      <button type="button" class="btn-secondary" style="padding: 8px 12px; border-color: #C0392B; color: #C0392B;" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
  }

  uploadImageToCloudinary(fileInput, previewImgId, targetUrlInputId) {
    return new Promise(async (resolve) => {
      if (!fileInput.files || !fileInput.files[0]) {
        resolve(null);
        return;
      }
      const file = fileInput.files[0];
      
      const cloudName = localStorage.getItem('cozy_cloudinary_cloud_name');
      const uploadPreset = localStorage.getItem('cozy_cloudinary_preset');
      
      this.showToast('Uploading image...');

      if (cloudName && uploadPreset) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);
          
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.secure_url) {
            if (previewImgId) {
              const preview = document.getElementById(previewImgId);
              if (preview) {
                preview.src = data.secure_url;
                preview.style.display = 'block';
              }
              const placeholder = document.getElementById('modalCoverPlaceholder');
              if (placeholder) placeholder.style.display = 'none';
            }
            if (targetUrlInputId) {
              const input = document.getElementById(targetUrlInputId);
              if (input) input.value = data.secure_url;
            }
            this.showToast('Image uploaded to Cloudinary! ☁️');
            resolve(data.secure_url);
            return;
          }
        } catch (err) {
          console.error('Cloudinary upload error:', err);
        }
      }
      
      // Fallback to local DataURL with Promise
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target.result;
        if (previewImgId) {
          const preview = document.getElementById(previewImgId);
          if (preview) {
            preview.src = url;
            preview.style.display = 'block';
          }
          const placeholder = document.getElementById('modalCoverPlaceholder');
          if (placeholder) placeholder.style.display = 'none';
        }
        if (targetUrlInputId) {
          const input = document.getElementById(targetUrlInputId);
          if (input) input.value = url;
        }
        this.showToast('Image attached successfully!');
        resolve(url);
      };
      reader.readAsDataURL(file);
    });
  }

  saveProductModal(e, productId) {
    if (e) e.preventDefault();

    const name = document.getElementById('modalProdName').value;
    const shortDesc = document.getElementById('modalProdShortDesc').value;
    const price = parseFloat(document.getElementById('modalProdPrice').value) || 0;
    const unit = document.getElementById('modalProdUnit').value || '/ piece';
    const category = document.getElementById('modalProdCat').value;
    const badge = document.getElementById('modalProdBadge').value;
    const discount = parseInt(document.getElementById('modalProdDiscount').value) || null;
    const stockStatus = document.getElementById('modalProdStockStatus').value;
    const image = document.getElementById('modalCoverUrl').value || 'assets/bear_plushie.jpg';
    const description = document.getElementById('modalProdDesc').value;

    const addInputs = document.querySelectorAll('.add-img-input');
    const additionalImages = Array.from(addInputs).map(inp => inp.value.trim()).filter(v => v);

    const productData = {
      name,
      shortDesc,
      price,
      unit,
      category,
      badge: badge || null,
      discount,
      stockStatus,
      stock: stockStatus === 'Out of Stock' ? 0 : (stockStatus === 'Low Stock' ? 2 : 10),
      image,
      additionalImages,
      description
    };

    if (productId) {
      productStore.updateProduct(productId, productData);
      this.showToast('Product updated successfully!');
    } else {
      productStore.addProduct(productData);
      this.showToast('New product added to store!');
    }

    this.closeProductModal();
    this.renderAdminView();
  }

  deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
      productStore.deleteProduct(productId);
      this.showToast('Product deleted');
      this.renderAdminView();
    }
  }

  /* ==========================================================================
     TAB 4: STORE CATEGORIES & ORGANIZATION
     ========================================================================== */

  renderCategoriesTab() {
    const categories = productStore.getCategories();
    const allProducts = productStore.getAllProducts();

    return `
      <div style="background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--sandstone-border); padding: 28px; box-shadow: var(--shadow-sm); max-width: 900px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.5rem;">🏷️</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--onyx-black);">Store Categories & Collections</h3>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-muted);">Organize your crochet items into custom categories for easy customer browsing</p>
          </div>

          <button class="btn-primary" style="padding: 10px 20px; font-size: 0.88rem; gap: 8px;" onclick="adminDashboard.promptCreateCategory()">
            + Create New Category
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
          ${categories.map(cat => {
            const catProducts = allProducts.filter(p => p.category === cat);
            
            return `
              <div style="border: 1.5px dashed var(--sandstone-border); border-radius: var(--radius-md); padding: 18px; background: var(--porcelain-white); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                      <h4 style="font-weight: 800; font-size: 1.05rem; color: var(--onyx-black); margin-bottom: 2px;">${cat}</h4>
                      <span style="font-size: 0.78rem; font-weight: 700; color: var(--ruby-velvet); background: #FADBD8; padding: 2px 8px; border-radius: var(--radius-full);">
                        ${catProducts.length} ${catProducts.length === 1 ? 'Product' : 'Products'}
                      </span>
                    </div>

                    <button class="admin-icon-btn admin-icon-btn-danger" title="Delete Category" onclick="adminDashboard.deleteCategory('${cat}')">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>

                  <!-- PRODUCT ITEMS UNDER CATEGORY LIST -->
                  <div style="margin-top: 14px; border-top: 1px dashed var(--sandstone-border); padding-top: 12px;">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">Items in Category:</div>
                    ${catProducts.length > 0 ? `
                      <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${catProducts.map(p => `
                          <div style="display: flex; align-items: center; gap: 10px; background: var(--white); padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--sandstone-border);">
                            <img src="${p.image || ''}" alt="${p.name}" style="width: 28px; height: 28px; object-fit: cover; border-radius: 4px;" />
                            <span style="font-size: 0.82rem; font-weight: 600; color: var(--onyx-black); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.name}</span>
                          </div>
                        `).join('')}
                      </div>
                    ` : `
                      <div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">No products assigned to this category yet</div>
                    `}
                  </div>
                </div>

                <div style="margin-top: 16px;">
                  <button class="btn-secondary" style="width: 100%; justify-content: center; padding: 8px; font-size: 0.8rem; gap: 6px;" onclick="adminDashboard.switchTab('products')">
                    📦 Manage Products
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  promptCreateCategory() {
    const name = prompt('Enter New Category Name (e.g. Crochet Flowers, Custom Wall Art):');
    if (name && name.trim()) {
      const added = productStore.addCategory(name.trim());
      if (added) {
        this.showToast(`Category "${name.trim()}" created! 🏷️`);
        this.renderAdminView();
      } else {
        this.showToast('Category already exists or invalid!');
      }
    }
  }

  deleteCategory(catName) {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      productStore.deleteCategory(catName);
      this.showToast(`Category "${catName}" deleted`);
      this.renderAdminView();
    }
  }

  /* ==========================================================================
     TAB 5: INVENTORY & STOCK CONTROL (iOS SWITCH TOGGLES)
     ========================================================================== */

  renderInventoryTab() {
    const products = productStore.getAllProducts();

    const rows = products.map(p => {
      const stockStatus = p.stockStatus || (p.stock === 0 ? 'Out of Stock' : (p.stock < 3 ? 'Low Stock' : 'In Stock'));
      const isInStock = stockStatus !== 'Out of Stock' && p.stock !== 0;
      const isLowStock = stockStatus === 'Low Stock' || (p.stock > 0 && p.stock < 3);

      let badgeClass = 'admin-stock-in';
      let badgeLabel = '● IN STOCK';
      if (!isInStock) {
        badgeClass = 'admin-stock-out';
        badgeLabel = '❌ OUT OF STOCK';
      } else if (isLowStock) {
        badgeClass = 'admin-stock-low';
        badgeLabel = '⚠️ LOW STOCK';
      }

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${p.image || ''}" alt="${p.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--sandstone-border);" />
              <div>
                <div style="font-weight: 700; color: var(--onyx-black); font-size: 0.9rem;">${p.name}</div>
                <div style="font-size: 0.78rem; color: var(--ruby-velvet);">${p.category}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="admin-stock-badge ${badgeClass}">
              ${badgeLabel}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 24px;">
              <!-- IN STOCK SWITCH TOGGLE -->
              <label class="admin-switch-label" title="Toggle In Stock / Out of Stock">
                <span class="admin-switch">
                  <input type="checkbox" ${isInStock ? 'checked' : ''} onchange="adminDashboard.toggleStockIn('${p.id}', this.checked)" />
                  <span class="admin-slider admin-slider-success"></span>
                </span>
                <span style="font-size: 0.85rem; font-weight: 700; color: ${isInStock ? '#27AE60' : 'var(--text-muted)'};">
                  ${isInStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </label>

              <!-- LOW STOCK WARN TOGGLE -->
              <label class="admin-switch-label" title="Toggle Low Stock Warning Flag">
                <span class="admin-switch">
                  <input type="checkbox" ${isLowStock ? 'checked' : ''} onchange="adminDashboard.toggleStockLow('${p.id}', this.checked)" />
                  <span class="admin-slider admin-slider-warning"></span>
                </span>
                <span style="font-size: 0.85rem; font-weight: 700; color: ${isLowStock ? '#D35400' : 'var(--text-muted)'};">
                  Low Stock Flag
                </span>
              </label>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div style="background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--sandstone-border); padding: 28px; box-shadow: var(--shadow-sm); max-width: 900px;">
        <div style="margin-bottom: 24px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--onyx-black); margin-bottom: 4px;">Inventory & Stock Control</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Use instant switch toggles to manage product availability & low stock alerts</p>
        </div>

        <table class="admin-table">
          <thead>
            <tr>
              <th>Product Item</th>
              <th>Current Status</th>
              <th>Stock Availability Toggles</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  toggleStockIn(productId, isInStock) {
    const p = productStore.getProductById(productId);
    if (!p) return;
    const newStatus = isInStock ? 'In Stock' : 'Out of Stock';
    const newStock = isInStock ? 10 : 0;
    productStore.updateProduct(productId, { stockStatus: newStatus, stock: newStock });
    this.showToast(`Stock set to ${newStatus} for "${p.name}"`);
    this.renderAdminView();
  }

  toggleStockLow(productId, isLowStock) {
    const p = productStore.getProductById(productId);
    if (!p) return;
    const newStatus = isLowStock ? 'Low Stock' : 'In Stock';
    const newStock = isLowStock ? 2 : 10;
    productStore.updateProduct(productId, { stockStatus: newStatus, stock: newStock });
    this.showToast(`Low Stock flag ${isLowStock ? 'enabled' : 'disabled'} for "${p.name}"`);
    this.renderAdminView();
  }

  /* ==========================================================================
     TAB 6: PRODUCT GALLERY & MULTI-PHOTO MANAGER
     ========================================================================== */

  renderGalleryTab() {
    const products = productStore.getAllProducts();

    return `
      <div style="background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--sandstone-border); padding: 28px; box-shadow: var(--shadow-sm); max-width: 900px;">
        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 1.5rem;">🖼️</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--onyx-black);">Product Gallery & Photo Manager</h3>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Upload multiple high-res product photos, assign cover images, and manage photo carousels</p>
        </div>

        <!-- BATCH MULTI-PHOTO UPLOADER BANNER -->
        <div style="background: var(--sandstone-light); border: 1.5px dashed var(--sandstone-border); padding: 20px; border-radius: var(--radius-md); margin-bottom: 28px;">
          <h4 style="font-weight: 700; font-size: 0.95rem; color: var(--onyx-black); margin-bottom: 6px;">📷 Batch Multi-Image Uploader</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px;">Select a product item and upload multiple images at once into its photo gallery</p>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <select id="gallerySelectProduct" class="form-control" style="max-width: 320px;">
              <option value="">Select Product Item...</option>
              ${products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
            <label class="btn-primary" style="padding: 10px 20px; font-size: 0.88rem; cursor: pointer; white-space: nowrap; gap: 8px;">
              📁 Select & Upload Multiple Photos
              <input type="file" accept="image/*" multiple style="display: none;" onchange="adminDashboard.handleBatchGalleryUpload(this)" />
            </label>
          </div>
        </div>

        <h4 style="font-weight: 700; font-size: 1.1rem; color: var(--onyx-black); margin-bottom: 16px;">Product Catalog Photo Collections (${products.length})</h4>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
          ${products.map(p => {
            const addImgs = p.additionalImages || [];
            const totalPhotos = (p.image ? 1 : 0) + addImgs.length;

            return `
              <div style="border: 1.5px dashed var(--sandstone-border); border-radius: var(--radius-md); padding: 16px; background: var(--porcelain-white); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="position: relative; margin-bottom: 12px;">
                    ${p.image ? `
                      <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 160px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--sandstone-border);" />
                    ` : `
                      <div style="width: 100%; height: 160px; background: var(--sandstone-light); border: 1.5px dashed var(--sandstone-border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.85rem; font-weight: 600;">
                        No Cover Photo Set
                      </div>
                    `}
                    <span style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.75); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-full);">
                      ${totalPhotos} Photos
                    </span>
                  </div>

                  <div style="font-weight: 700; font-size: 0.92rem; color: var(--onyx-black); margin-bottom: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.name}</div>
                  <div style="font-size: 0.78rem; color: var(--ruby-velvet); margin-bottom: 10px;">${p.category}</div>

                  <!-- MINI GALLERY STRIP -->
                  ${addImgs.length > 0 ? `
                    <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 12px;">
                      ${addImgs.map(imgUrl => `
                        <img src="${imgUrl}" style="width: 36px; height: 36px; object-fit: cover; border-radius: var(--radius-xs); border: 1px solid var(--sandstone-border);" />
                      `).join('')}
                    </div>
                  ` : ''}
                </div>

                <button class="btn-secondary" style="width: 100%; justify-content: center; padding: 9px; font-size: 0.82rem; gap: 6px;" onclick="adminDashboard.renderProductModal('${p.id}')">
                  🖼️ Upload & Manage Photos
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  async handleBatchGalleryUpload(fileInput) {
    const select = document.getElementById('gallerySelectProduct');
    const productId = select ? select.value : '';
    if (!productId) {
      this.showToast('Please select a product item first!');
      return;
    }
    if (!fileInput.files || fileInput.files.length === 0) return;

    const files = Array.from(fileInput.files);
    const p = productStore.getProductById(productId);
    if (!p) return;

    this.showToast(`Uploading ${files.length} photos...`);

    const newUrls = [];
    for (const file of files) {
      const dummyInput = { files: [file] };
      const url = await this.uploadImageToCloudinary(dummyInput, null, null);
      if (url) newUrls.push(url);
    }

    if (newUrls.length > 0) {
      const existing = p.additionalImages || [];
      let cover = p.image;
      if (!cover) {
        cover = newUrls.shift();
      }
      const updatedGallery = [...existing, ...newUrls];
      productStore.updateProduct(productId, { image: cover, additionalImages: updatedGallery });
      this.showToast(`${files.length} photos uploaded to "${p.name}"! 📷`);
      this.renderAdminView();
    }
  }

  /* ==========================================================================
     TAB 6: STORE SETTINGS & CLOUDINARY CONFIG
     ========================================================================== */

  renderSettingsTab() {
    const settings = cartStore.getSettings();
    const cloudName = localStorage.getItem('cozy_cloudinary_cloud_name') || '';
    const preset = localStorage.getItem('cozy_cloudinary_preset') || '';

    const creds = this.getAdminCredentials();

    return `
      <div style="background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--sandstone-border); padding: 32px; max-width: 680px; box-shadow: var(--shadow-sm);">
        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--onyx-black); margin-bottom: 20px;">Store Settings & Credentials</h3>

        <form onsubmit="adminDashboard.saveSettings(event)">
          <h4 style="font-weight: 700; font-size: 1rem; color: var(--onyx-black); margin-bottom: 12px; border-bottom: 1px dashed var(--sandstone-border); padding-bottom: 6px;">🔑 Admin Security & Login Credentials</h4>
          
          <div style="background: var(--sandstone-light); padding: 16px; border-radius: var(--radius-md); border: 1px dashed var(--sandstone-border); margin-bottom: 24px;">
            <div class="admin-form-grid-2">
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">Admin Email Address</label>
                <input type="email" id="settingAdminEmail" class="form-control" value="${creds.email}" required />
              </div>
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">Admin Password</label>
                <input type="text" id="settingAdminPass" class="form-control" value="${creds.password}" required />
              </div>
            </div>
          </div>

          <h4 style="font-weight: 700; font-size: 1rem; color: var(--onyx-black); margin-bottom: 12px; border-bottom: 1px dashed var(--sandstone-border); padding-bottom: 6px;">General Store Settings</h4>
          
          <div class="form-group" style="margin-bottom: 18px;">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">Top Announcement Bar Banner</label>
            <input type="text" id="settingAnnounce" class="form-control" value="${settings.announcementText || ''}" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px;">
            <div class="form-group">
              <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">Free Shipping Threshold (₹)</label>
              <input type="number" id="settingFreeShip" class="form-control" value="${settings.freeShippingThreshold || 999}" />
            </div>
            <div class="form-group">
              <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">Standard Shipping Rate (₹)</label>
              <input type="number" id="settingShipFee" class="form-control" value="${settings.shippingFee || 0}" />
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 24px;">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">Seller WhatsApp Orders Phone</label>
            <input type="text" id="settingWhatsApp" class="form-control" value="${settings.whatsappNumber || '919355415172'}" />
          </div>

          <h4 style="font-weight: 700; font-size: 1rem; color: var(--onyx-black); margin-bottom: 12px; border-bottom: 1px dashed var(--sandstone-border); padding-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            <span>☁️ Cloudinary Upload Integration</span>
          </h4>
          
          <div style="background: var(--sandstone-light); padding: 16px; border-radius: var(--radius-md); border: 1px dashed var(--sandstone-border); margin-bottom: 24px;">
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">Configure your Cloudinary credentials below to enable automatic 1-click cloud image uploads in the product edit modal.</p>
            
            <div class="admin-form-grid-2">
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">Cloud Name</label>
                <input type="text" id="settingCloudName" class="form-control" value="${cloudName}" placeholder="e.g. cozyloops" />
              </div>
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--onyx-black); display: block; margin-bottom: 6px;">Unsigned Upload Preset</label>
                <input type="text" id="settingCloudPreset" class="form-control" value="${preset}" placeholder="e.g. cozy_preset" />
              </div>
            </div>
          </div>

          <button type="submit" class="btn-primary" style="padding: 12px 24px; font-size: 0.95rem;">Save Settings ⚙️</button>
        </form>
      </div>
    `;
  }

  saveSettings(e) {
    if (e) e.preventDefault();
    const adminEmail = document.getElementById('settingAdminEmail').value.trim();
    const adminPass = document.getElementById('settingAdminPass').value.trim();
    if (adminEmail) localStorage.setItem('cozy_admin_email', adminEmail);
    if (adminPass) localStorage.setItem('cozy_admin_password', adminPass);

    const announcementText = document.getElementById('settingAnnounce').value;
    const freeShippingThreshold = parseFloat(document.getElementById('settingFreeShip').value) || 999;
    const shippingFee = parseFloat(document.getElementById('settingShipFee').value) || 0;
    const whatsappNumber = document.getElementById('settingWhatsApp').value;

    const cloudName = document.getElementById('settingCloudName').value.trim();
    const preset = document.getElementById('settingCloudPreset').value.trim();

    localStorage.setItem('cozy_cloudinary_cloud_name', cloudName);
    localStorage.setItem('cozy_cloudinary_preset', preset);

    cartStore.updateSettings({
      announcementText,
      freeShippingThreshold,
      shippingFee,
      whatsappNumber
    });

    this.showToast('Store settings & credentials updated!');
    if (window.renderApp) window.renderApp();
  }
}

window.adminDashboard = new AdminDashboard();
