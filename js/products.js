/* ==========================================================================
   Cozy Loops Crochet - Products & Inventory Engine
   ========================================================================== */

const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Cozy Bear Amigurumi Plushie',
    category: 'Plushies & Amigurumi',
    price: 599,
    originalPrice: 799,
    image: 'assets/bear_plushie.jpg',
    badge: 'Best Seller',
    colors: ['Oat Cream', 'Sandstone Beige', 'Pastel Pink', 'Ruby Red'],
    craftingDays: 'Ships in 2-3 Days',
    description: 'Handcrafted with 100% hypoallergenic soft velvet cotton yarn. Features a cozy knitted scarf, safety eyes, and plush stuffing.',
    isFeatured: true,
    inStock: true
  },
  {
    id: 'prod-002',
    name: 'Boho Daisy Flower Tote Bag',
    category: 'Bags & Totes',
    price: 899,
    originalPrice: 1199,
    image: 'assets/daisy_tote.jpg',
    badge: 'Popular',
    colors: ['Sandstone & Ruby', 'Sage Green & White', 'Vintage Mustard'],
    craftingDays: 'Ships in 3-5 Days',
    description: 'Spacious handmade crochet tote bag featuring vintage daisy granny square motifs. Sturdy handles and reinforced cotton inner lining.',
    isFeatured: true,
    inStock: true
  },
  {
    id: 'prod-003',
    name: 'Handmade Tulip Flower Bouquet',
    category: 'Home & Coasters',
    price: 499,
    originalPrice: 659,
    image: 'assets/tulip_bouquet.jpg',
    badge: 'Gift Choice',
    colors: ['Ruby & Pastel Pink', 'Soft Violet & White', 'Sunset Yellow'],
    craftingDays: 'Ships in 2-4 Days',
    description: 'Everlasting crochet tulip bouquet (Set of 6 stems) wrapped in rustic kraft paper. Never fades and stays beautiful forever!',
    isFeatured: true,
    inStock: true
  },
  {
    id: 'prod-004',
    name: 'Vintage Granny Square Bucket Hat',
    category: 'Wearables & Tops',
    price: 699,
    originalPrice: 899,
    image: 'assets/bucket_hat.jpg',
    badge: 'Trendy',
    colors: ['Sandstone & Ruby Velvet', 'Earth Tones', 'Pastel Blossom'],
    craftingDays: 'Ships in 3-4 Days',
    description: 'Chic 90s aesthetic crochet bucket hat made with premium cotton yarn. Soft, breathable, and perfectly fitted for everyday wear.',
    isFeatured: true,
    inStock: true
  },
  {
    id: 'prod-005',
    name: 'Boho Floral Coaster Set (4 Pcs)',
    category: 'Home & Coasters',
    price: 349,
    originalPrice: 499,
    image: 'assets/hero.jpg',
    badge: 'New',
    colors: ['Porcelain & Sandstone', 'Ruby Velvet Mix', 'Forest Sage'],
    craftingDays: 'Ships in 1-2 Days',
    description: 'Set of 4 absorbent handmade crochet coasters shaped like delicate flowers. Heat resistant and machine washable.',
    isFeatured: false,
    inStock: true
  },
  {
    id: 'prod-006',
    name: 'Cute Bunny Amigurumi Keychain',
    category: 'Accessories & Keychains',
    price: 199,
    originalPrice: 299,
    image: 'assets/bear_plushie.jpg',
    badge: 'Budget Pick',
    colors: ['Porcelain White', 'Sandstone Beige', 'Dusty Rose'],
    craftingDays: 'Ships in 1-2 Days',
    description: 'Adorable mini crochet bunny charm with golden keyring. Perfect for backpacks, car keys, or purses.',
    isFeatured: false,
    inStock: true
  }
];

class ProductStore {
  constructor() {
    this.productsKey = 'cozy_loops_products';
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.productsKey)) {
      localStorage.setItem(this.productsKey, JSON.stringify(INITIAL_PRODUCTS));
    }
  }

  getAllProducts() {
    try {
      return JSON.parse(localStorage.getItem(this.productsKey)) || INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  }

  getProductById(id) {
    const products = this.getAllProducts();
    return products.find(p => p.id === id);
  }

  saveProducts(products) {
    localStorage.setItem(this.productsKey, JSON.stringify(products));
  }

  addProduct(newProduct) {
    const products = this.getAllProducts();
    newProduct.id = 'prod-' + Date.now().toString().slice(-4);
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  updateProduct(id, updatedData) {
    const products = this.getAllProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedData };
      this.saveProducts(products);
      return true;
    }
    return false;
  }

  deleteProduct(id) {
    let products = this.getAllProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);
  }

  getCategories() {
    const defaultCategories = [
      'Plushies & Amigurumi',
      'Bags & Totes',
      'Home & Coasters',
      'Wearables & Tops',
      'Accessories & Keychains'
    ];
    try {
      const stored = JSON.parse(localStorage.getItem('cozy_store_categories'));
      return stored && Array.isArray(stored) && stored.length > 0 ? stored : defaultCategories;
    } catch (e) {
      return defaultCategories;
    }
  }

  addCategory(categoryName) {
    const categories = this.getCategories();
    const cleanName = categoryName.trim();
    if (cleanName && !categories.includes(cleanName)) {
      categories.push(cleanName);
      localStorage.setItem('cozy_store_categories', JSON.stringify(categories));
      return true;
    }
    return false;
  }

  deleteCategory(categoryName) {
    let categories = this.getCategories();
    categories = categories.filter(c => c !== categoryName);
    localStorage.setItem('cozy_store_categories', JSON.stringify(categories));
  }
}

window.productStore = new ProductStore();
