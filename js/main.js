/* ===================================================
   BigProtein.Utility.Forum — Main JavaScript
   =================================================== */

// --- Products ---
const PRODUCTS = {
  main: {
    id: 'main-book',
    title: 'Big Protein, Small Bill',
    description: 'The 7-Week Supermarket Meal System — 156 pages of high-protein budget recipes.',
    price: 24.99,
    originalPrice: 29.99,
    image: 'images/cover.png',
    pdfUrl: 'ebook/Big Protein, Small Bill.pdf',
    pdfFileName: 'Big-Protein-Small-Bill.pdf',
    pageCount: '156 Pages'
  },
  bonus: {
    id: 'bonus-book',
    title: 'Sip Smart, Spend Less',
    description: 'Budget-friendly protein drinks & smoothies — 4 recipes under $4 total.',
    price: 8.00,
    originalPrice: 8.00,
    image: 'images/sip_page_1.png',
    pdfUrl: 'sip-smart-spend-less.pdf',
    pdfFileName: 'Sip-Smart-Spend-Less.pdf',
    pageCount: '8 Pages'
  }
};

// --- Cart State ---
const CartState = {
  items: [],
  listeners: [],

  addItem(product, isFreeBonus = false) {
    const existing = this.items.find(i => i.id === product.id);
    if (!existing) {
      const itemToAdd = { ...product };
      // If adding bonus and main book is present, or explicit free bonus claim
      if (itemToAdd.id === 'bonus-book') {
        if (this.hasItem('main-book') || isFreeBonus) {
          itemToAdd.price = 0;
        } else {
          itemToAdd.price = 8.00;
        }
      }
      this.items.push(itemToAdd);
    }

    // If main book was just added, make sure bonus is discounted to 0
    if (product.id === 'main-book') {
      const bonusItem = this.items.find(i => i.id === 'bonus-book');
      if (bonusItem) {
        bonusItem.price = 0;
      }
    }

    this.save();
    this.notify();
  },

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    // If main book removed, if bonus book was free, adjust it back or user choice
    if (id === 'main-book') {
      const bonusItem = this.items.find(i => i.id === 'bonus-book');
      if (bonusItem) {
        bonusItem.price = 8.00;
      }
    }
    this.save();
    this.notify();
  },

  hasItem(id) {
    return this.items.some(i => i.id === id);
  },

  getItem(id) {
    return this.items.find(i => i.id === id);
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  },

  getSavings() {
    return this.items.reduce((sum, item) => sum + (item.originalPrice - item.price), 0);
  },

  getCount() {
    return this.items.length;
  },

  clear() {
    this.items = [];
    this.save();
    this.notify();
  },

  save() {
    try {
      localStorage.setItem('bp_cart', JSON.stringify(this.items));
    } catch(e) {}
  },

  load() {
    try {
      const saved = localStorage.getItem('bp_cart');
      if (saved) {
        this.items = JSON.parse(saved);
        // Ensure price consistency on load
        if (this.hasItem('main-book')) {
          const bonusItem = this.items.find(i => i.id === 'bonus-book');
          if (bonusItem) bonusItem.price = 0;
        }
      }
    } catch(e) {}
    this.notify();
  },

  onChange(fn) {
    this.listeners.push(fn);
  },

  notify() {
    this.listeners.forEach(fn => fn(this));
  }
};

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  CartState.load();
  initHeader();
  initCarousel();
  initLightbox();
  initFAQ();
  initCart();
  initCheckout();
  initScrollReveal();
  initAddToCartButtons();
  updateCartUI();
});

// --- Header Scroll & Mobile Nav ---
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('open');
    });

    // Close when clicking a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        nav.classList.remove('open');
      });
    });
  }
}

// --- Book Preview Carousel ---
function initCarousel() {
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dotsContainer = document.querySelector('.carousel-dots');

  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const slideCount = slides.length;
  let currentSlide = 0;
  let slidesPerView = getSlidesPerView();

  function getSlidesPerView() {
    const trackWidth = track.parentElement.offsetWidth;
    const slideWidth = slides[0]?.offsetWidth || 280;
    const gap = 24;
    return Math.max(1, Math.floor(trackWidth / (slideWidth + gap)));
  }

  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const dotCount = Math.max(1, slideCount - slidesPerView + 1);
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goToSlide(index) {
    const maxIndex = Math.max(0, slideCount - slidesPerView);
    currentSlide = Math.max(0, Math.min(index, maxIndex));
    const target = slides[currentSlide];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = track.scrollLeft;
      const slideWidth = slides[0]?.offsetWidth || 280;
      const gap = 24;
      currentSlide = Math.round(scrollLeft / (slideWidth + gap));
      updateDots();
    }, 100);
  }, { passive: true });

  window.addEventListener('resize', () => {
    slidesPerView = getSlidesPerView();
    createDots();
  });

  createDots();
}

// --- Book Preview Lightbox & Four-Box Grid Viewer ---
const PREVIEW_PAGES = [
  { src: 'images/contents.png', title: 'Table of Contents', label: 'Contents' },
  { src: 'images/promises.png', title: 'Six Promises, Zero Tahini', label: 'Our Promises' },
  { src: 'images/system.png', title: 'One List, One Hour, 15-Minute Nights', label: 'The System' },
  { src: 'images/anatomy.png', title: 'Anatomy of a Recipe Page', label: 'Recipe Layout' },
  { src: 'images/leaderboard.png', title: 'Protein Per Dollar Leaderboard', label: 'Protein / Dollar' },
  { src: 'images/week01_opener.png', title: 'Week 01 — Comfort Food Week', label: 'Week 01 Opener' },
  { src: 'images/week01_plan.png', title: 'Week at a Glance — Game Plan', label: 'Weekly Game Plan' },
  { src: 'images/shop_list.png', title: 'Shop Once, Eat All Week', label: 'Grocery List' },
  { src: 'images/recipe_taquitos.png', title: 'Air-Fryer Chicken Taquitos', label: 'Recipe — Taquitos' },
  { src: 'images/recipe_mahi.png', title: 'Blackened Mahi Tacos (Upgrade)', label: 'Weekend Upgrade' },
  { src: 'images/closing.png', title: 'Closing Page & System Summary', label: 'Closing Page' }
];

let currentLightboxIndex = 0;
let isGridMode = false;
let isZoomed = false;

function initLightbox() {
  const lightbox = document.getElementById('preview-lightbox');
  if (!lightbox) return;

  const closeBtn = document.getElementById('lightbox-close');
  const gridToggleBtn = document.getElementById('lightbox-grid-toggle');
  const zoomToggleBtn = document.getElementById('lightbox-zoom-toggle');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const imgWrapper = document.getElementById('lightbox-image-wrapper');
  const openGridBtn = document.getElementById('btn-open-grid-preview');

  // Populate grid thumbnails
  const gridContainer = document.getElementById('grid-view-thumbnails');
  if (gridContainer) {
    let gridHtml = '';
    PREVIEW_PAGES.forEach((page, index) => {
      gridHtml += `
        <div class="grid-thumbnail-card" data-grid-index="${index}">
          <img src="${page.src}" alt="${page.title}" loading="lazy">
          <div class="grid-thumbnail-info">
            <span class="grid-thumbnail-title">${page.label}</span>
            <span class="grid-thumbnail-number">${index + 1}/11</span>
          </div>
        </div>
      `;
    });
    gridContainer.innerHTML = gridHtml;

    gridContainer.querySelectorAll('.grid-thumbnail-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.gridIndex, 10);
        showSinglePageView(idx);
      });
    });
  }

  // Open from carousel slide clicks
  document.querySelectorAll('.carousel-slide').forEach(slide => {
    slide.addEventListener('click', () => {
      const idx = parseInt(slide.dataset.slideIndex || '0', 10);
      openLightbox(idx, false);
    });
  });

  // Open from header Four-Box Grid button
  if (openGridBtn) {
    openGridBtn.addEventListener('click', () => {
      openLightbox(currentLightboxIndex, true);
    });
  }

  // Controls
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (gridToggleBtn) gridToggleBtn.addEventListener('click', toggleGridMode);
  if (zoomToggleBtn) zoomToggleBtn.addEventListener('click', toggleZoom);
  if (imgWrapper) imgWrapper.addEventListener('click', toggleZoom);
  if (prevBtn) prevBtn.addEventListener('click', prevLightboxPage);
  if (nextBtn) nextBtn.addEventListener('click', nextLightboxPage);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight' && !isGridMode) {
      nextLightboxPage();
    } else if (e.key === 'ArrowLeft' && !isGridMode) {
      prevLightboxPage();
    } else if (e.key === 'g' || e.key === 'G') {
      toggleGridMode();
    }
  });
}

function openLightbox(index = 0, startInGridMode = false) {
  const lightbox = document.getElementById('preview-lightbox');
  if (!lightbox) return;

  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (startInGridMode) {
    showGridView();
  } else {
    showSinglePageView(index);
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('preview-lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  resetZoom();
}

function showSinglePageView(index) {
  currentLightboxIndex = Math.max(0, Math.min(index, PREVIEW_PAGES.length - 1));
  isGridMode = false;

  const mainView = document.getElementById('lightbox-main-view');
  const gridView = document.getElementById('lightbox-grid-view');
  const gridBtn = document.getElementById('lightbox-grid-toggle');
  const activeImg = document.getElementById('lightbox-active-img');
  const pageTitle = document.getElementById('lightbox-page-title');
  const pageCounter = document.getElementById('lightbox-page-counter');

  if (mainView) mainView.style.display = 'flex';
  if (gridView) gridView.style.display = 'none';
  if (gridBtn) gridBtn.classList.remove('active');

  const page = PREVIEW_PAGES[currentLightboxIndex];
  if (activeImg && page) {
    activeImg.src = page.src;
    activeImg.alt = page.title;
  }
  if (pageTitle && page) pageTitle.textContent = page.title;
  if (pageCounter) pageCounter.textContent = `Page ${currentLightboxIndex + 1} of ${PREVIEW_PAGES.length}`;

  resetZoom();
  updateGridHighlight();
}

function showGridView() {
  isGridMode = true;

  const mainView = document.getElementById('lightbox-main-view');
  const gridView = document.getElementById('lightbox-grid-view');
  const gridBtn = document.getElementById('lightbox-grid-toggle');
  const pageTitle = document.getElementById('lightbox-page-title');
  const pageCounter = document.getElementById('lightbox-page-counter');

  if (mainView) mainView.style.display = 'none';
  if (gridView) gridView.style.display = 'block';
  if (gridBtn) gridBtn.classList.add('active');

  if (pageTitle) pageTitle.textContent = 'Four-Boxes Grid Overview';
  if (pageCounter) pageCounter.textContent = '11 Pages Total';

  resetZoom();
  updateGridHighlight();
}

function toggleGridMode() {
  if (isGridMode) {
    showSinglePageView(currentLightboxIndex);
  } else {
    showGridView();
  }
}

function updateGridHighlight() {
  document.querySelectorAll('.grid-thumbnail-card').forEach((card, idx) => {
    card.classList.toggle('active', idx === currentLightboxIndex);
  });
}

function prevLightboxPage() {
  const newIndex = (currentLightboxIndex - 1 + PREVIEW_PAGES.length) % PREVIEW_PAGES.length;
  showSinglePageView(newIndex);
}

function nextLightboxPage() {
  const newIndex = (currentLightboxIndex + 1) % PREVIEW_PAGES.length;
  showSinglePageView(newIndex);
}

function toggleZoom() {
  const imgWrapper = document.getElementById('lightbox-image-wrapper');
  const zoomText = document.getElementById('lightbox-zoom-text');
  if (!imgWrapper) return;

  isZoomed = !isZoomed;
  imgWrapper.classList.toggle('zoomed', isZoomed);
  if (zoomText) zoomText.textContent = isZoomed ? 'Zoom Out' : 'Zoom In';
}

function resetZoom() {
  const imgWrapper = document.getElementById('lightbox-image-wrapper');
  const zoomText = document.getElementById('lightbox-zoom-text');
  isZoomed = false;
  if (imgWrapper) imgWrapper.classList.remove('zoomed');
  if (zoomText) zoomText.textContent = 'Zoom In';
}

// --- FAQ Accordion ---
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));

      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });
}

// --- Cart Sidebar ---
function initCart() {
  const overlay = document.querySelector('.cart-overlay');
  const sidebar = document.querySelector('.cart-sidebar');
  const closeBtn = document.querySelector('.cart-close');
  const cartTriggers = document.querySelectorAll('[data-open-cart]');

  if (!overlay || !sidebar) return;

  function openCart() {
    overlay.classList.add('open');
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    overlay.classList.remove('open');
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartTriggers.forEach(el => el.addEventListener('click', openCart));
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);

  window.openCart = openCart;
  window.closeCart = closeCart;

  CartState.onChange(() => updateCartUI());
}

// --- Update Cart UI ---
function updateCartUI() {
  // Update cart count badges
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = CartState.getCount();
    el.style.display = CartState.getCount() > 0 ? 'inline-flex' : 'none';
  });

  // Update cart body
  const cartBody = document.querySelector('.cart-body');
  if (!cartBody) return;

  if (CartState.getCount() === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
      </div>
    `;
  } else {
    let html = '';
    CartState.items.forEach(item => {
      html += `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.title}">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price ${item.price === 0 ? 'cart-item-free' : ''}">
              ${item.price === 0 ? 'FREE' : '$' + item.price.toFixed(2)}
              ${item.originalPrice > item.price ? `<span class="original">$${item.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
          </div>
        </div>
      `;
    });

    // Special Offer: Main book in cart, but bonus book NOT yet claimed
    if (CartState.hasItem('main-book') && !CartState.hasItem('bonus-book')) {
      html += `
        <div class="cart-special-offer">
          <div class="cart-special-offer-header">
            <span>🎁</span>
            <h4>Special Offer!</h4>
          </div>
          <p>Add "<strong>Sip Smart, Spend Less</strong>" to your order — completely FREE!</p>
          <div class="offer-value">
            <span class="was">$8.00</span>
            <span class="now">FREE</span>
          </div>
          <button class="btn-claim-offer" onclick="claimBonusOffer()">
            Yes, Add It Free!
          </button>
        </div>
      `;
    }

    // Upgrade Offer: ONLY bonus book in cart at $8.00
    if (!CartState.hasItem('main-book') && CartState.hasItem('bonus-book')) {
      html += `
        <div class="cart-upgrade-box">
          <h4>💡 Upgrade & Save $8.00!</h4>
          <p>Add "<strong>Big Protein, Small Bill</strong>" ($24.99) and get your "Sip Smart, Spend Less" book <strong>100% FREE</strong>!</p>
          <button class="btn-upgrade-cart" onclick="upgradeToBundle()">
            Add Main Book & Get Bonus FREE
          </button>
        </div>
      `;
    }

    cartBody.innerHTML = html;
  }

  // Update totals
  const totalEl = document.querySelector('.cart-total-value');
  const savingsEl = document.querySelector('.cart-total-savings');
  const checkoutBtn = document.querySelector('.btn-checkout');

  if (totalEl) totalEl.textContent = '$' + CartState.getTotal().toFixed(2);
  if (savingsEl) {
    const savings = CartState.getSavings();
    if (savings > 0) {
      savingsEl.textContent = `You save $${savings.toFixed(2)}`;
      savingsEl.style.display = 'block';
    } else {
      savingsEl.style.display = 'none';
    }
  }
  if (checkoutBtn) checkoutBtn.disabled = CartState.getCount() === 0;

  updateAddToCartButtons();
}

// --- Add To Cart Buttons ---
function initAddToCartButtons() {
  // Main book buttons
  document.querySelectorAll('[data-add-main]').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart('main');
    });
  });

  // Bundle button (add main book + claim bonus free)
  document.querySelectorAll('[data-bundle-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      upgradeToBundle();
    });
  });

  // Solo bonus button (buy for $8.00)
  document.querySelectorAll('[data-add-solo-bonus]').forEach(btn => {
    btn.addEventListener('click', () => {
      addSoloBonus();
    });
  });

  // Legacy bonus button
  document.querySelectorAll('[data-add-bonus]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (CartState.hasItem('main-book')) {
        claimBonusOffer();
      } else {
        upgradeToBundle();
      }
    });
  });
}

function addToCart(productKey) {
  const product = PRODUCTS[productKey];
  if (!product) return;
  CartState.addItem({ ...product });
  if (window.openCart) window.openCart();
}

function addSoloBonus() {
  CartState.addItem({ ...PRODUCTS.bonus }, false);
  if (window.openCart) window.openCart();
}

function claimBonusOffer() {
  CartState.addItem({ ...PRODUCTS.bonus }, true);
}

function upgradeToBundle() {
  CartState.addItem({ ...PRODUCTS.main });
  CartState.addItem({ ...PRODUCTS.bonus }, true);
  if (window.openCart) window.openCart();
}

function removeFromCart(id) {
  CartState.removeItem(id);
}

function updateAddToCartButtons() {
  // Main book buttons
  document.querySelectorAll('[data-add-main]').forEach(btn => {
    if (CartState.hasItem('main-book')) {
      btn.textContent = '✓ Added to Cart';
      btn.classList.add('added');
    } else {
      btn.textContent = btn.dataset.originalText || 'Add to Cart — $24.99';
      btn.classList.remove('added');
    }
  });

  // Bundle buttons
  document.querySelectorAll('[data-bundle-action]').forEach(btn => {
    if (CartState.hasItem('main-book') && CartState.hasItem('bonus-book')) {
      btn.textContent = '✓ Bundle in Cart';
      btn.classList.add('added');
    } else {
      btn.textContent = 'Get FREE with Main Book — $24.99';
      btn.classList.remove('added');
    }
  });

  // Solo bonus buttons
  document.querySelectorAll('[data-add-solo-bonus]').forEach(btn => {
    if (CartState.hasItem('bonus-book')) {
      btn.textContent = '✓ Ebook in Cart';
    } else {
      btn.textContent = 'Buy This Ebook Solo — $8.00';
    }
  });
}

// --- Checkout Modal & Instant Download System ---
function initCheckout() {
  const checkoutBtn = document.querySelector('.btn-checkout');
  if (!checkoutBtn) return;

  // Create checkout modal if not present
  let modalOverlay = document.getElementById('checkout-overlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'checkout-overlay';
    modalOverlay.className = 'checkout-overlay';
    modalOverlay.innerHTML = `
      <div class="checkout-modal" id="checkout-modal">
        <div class="checkout-header">
          <h3 id="checkout-modal-title">Secure Checkout</h3>
          <button class="checkout-close" id="checkout-close-btn" aria-label="Close checkout">✕</button>
        </div>
        <div class="checkout-body" id="checkout-body">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Close checkout handlers
    const closeBtn = modalOverlay.querySelector('#checkout-close-btn');
    closeBtn.addEventListener('click', closeCheckout);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeCheckout();
    });
  }

  checkoutBtn.addEventListener('click', () => {
    if (window.closeCart) window.closeCart();
    renderCheckoutForm();
    openCheckout();
  });
}

function openCheckout() {
  const overlay = document.getElementById('checkout-overlay');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckout() {
  const overlay = document.getElementById('checkout-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderCheckoutForm() {
  const body = document.getElementById('checkout-body');
  const title = document.getElementById('checkout-modal-title');
  if (!body) return;

  if (title) title.textContent = 'Secure Checkout';

  const items = CartState.items;
  const total = CartState.getTotal();
  const savings = CartState.getSavings();

  let itemsHtml = '';
  items.forEach(item => {
    itemsHtml += `
      <div class="checkout-item-row">
        <span class="checkout-item-name">${item.title}</span>
        <span class="checkout-item-cost ${item.price === 0 ? 'free' : ''}">
          ${item.price === 0 ? 'FREE' : '$' + item.price.toFixed(2)}
        </span>
      </div>
    `;
  });

  body.innerHTML = `
    <div class="checkout-summary-box">
      <div class="checkout-items-list">
        ${itemsHtml}
      </div>
      <div class="checkout-divider"></div>
      <div class="checkout-total-row">
        <span>Total Due</span>
        <span>$${total.toFixed(2)}</span>
      </div>
      ${savings > 0 ? `<div class="checkout-savings-row">You save $${savings.toFixed(2)} today</div>` : ''}
    </div>

    <form id="checkout-form" onsubmit="handleCheckoutSubmit(event)">
      <div class="form-group" style="margin-bottom: var(--space-md);">
        <label style="display:block; font-weight:700; font-size:0.85rem; margin-bottom:6px; color:var(--color-charcoal);">
          Delivery Email Address <span style="color:var(--color-primary);">*</span>
        </label>
        <input type="email" id="checkout-email" required placeholder="you@example.com"
          style="width:100%; padding:0.75rem 1rem; border:1px solid var(--color-cream-darker); border-radius:var(--radius-md); font-family:var(--font-body); font-size:0.95rem;">
        <span style="font-size:0.75rem; color:var(--color-text-muted); display:block; margin-top:4px;">
          Your PDF download link and receipt will be sent here immediately.
        </span>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-md);">
        <label style="display:block; font-weight:700; font-size:0.85rem; margin-bottom:6px; color:var(--color-charcoal);">
          Full Name
        </label>
        <input type="text" id="checkout-name" placeholder="Alex Morgan"
          style="width:100%; padding:0.75rem 1rem; border:1px solid var(--color-cream-darker); border-radius:var(--radius-md); font-family:var(--font-body); font-size:0.95rem;">
      </div>

      <div style="margin-bottom: var(--space-md);">
        <label style="display:block; font-weight:700; font-size:0.85rem; margin-bottom:8px; color:var(--color-charcoal);">
          Payment Method
        </label>
        <div class="checkout-payment-methods">
          <button type="button" class="payment-method-btn active" onclick="selectPaymentTab(this, 'card')">
            💳 Card
          </button>
          <button type="button" class="payment-method-btn" onclick="selectPaymentTab(this, 'paypal')">
            🅿️ PayPal
          </button>
          <button type="button" class="payment-method-btn" onclick="selectPaymentTab(this, 'apple')">
             Pay
          </button>
        </div>
      </div>

      <div id="card-fields" class="payment-card-fields">
        <div class="full-width">
          <input type="text" placeholder="Card number (e.g. 4242 •••• •••• 4242)" value="4242 •••• •••• 4242"
            style="width:100%; padding:0.75rem 1rem; border:1px solid var(--color-cream-darker); border-radius:var(--radius-md); font-family:var(--font-body); font-size:0.95rem;">
        </div>
        <div>
          <input type="text" placeholder="MM / YY" value="12/28"
            style="width:100%; padding:0.75rem 1rem; border:1px solid var(--color-cream-darker); border-radius:var(--radius-md); font-family:var(--font-body); font-size:0.95rem;">
        </div>
        <div>
          <input type="text" placeholder="CVC" value="888"
            style="width:100%; padding:0.75rem 1rem; border:1px solid var(--color-cream-darker); border-radius:var(--radius-md); font-family:var(--font-body); font-size:0.95rem;">
        </div>
      </div>

      <button type="submit" class="btn-complete-order" id="btn-complete-order">
        🔒 Pay $${total.toFixed(2)} & Download Immediately
      </button>

      <div class="checkout-trust-badge">
        <span>🛡️ 256-Bit SSL Encrypted</span>
        <span>•</span>
        <span>⚡ Instant PDF Delivery</span>
        <span>•</span>
        <span>All Sales Final</span>
      </div>
    </form>
  `;
}

function selectPaymentTab(btn, method) {
  document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cardFields = document.getElementById('card-fields');
  if (cardFields) {
    if (method === 'card') {
      cardFields.style.display = 'grid';
    } else {
      cardFields.style.display = 'none';
    }
  }
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-complete-order');
  const emailInput = document.getElementById('checkout-email');
  const email = emailInput ? emailInput.value : 'customer@example.com';

  const purchasedItems = [...CartState.items];
  const orderNum = 'BP-' + Math.floor(10000 + Math.random() * 90000);

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Securing Order & Preparing Download...';
    btn.style.opacity = '0.8';
  }

  setTimeout(() => {
    renderSuccessScreen(purchasedItems, orderNum, email);
    CartState.clear();
  }, 1200);
}

function renderSuccessScreen(purchasedItems, orderNum, email) {
  const body = document.getElementById('checkout-body');
  const title = document.getElementById('checkout-modal-title');
  if (!body) return;

  if (title) title.textContent = 'Order Confirmed!';

  let downloadCardsHtml = '';
  purchasedItems.forEach(item => {
    downloadCardsHtml += `
      <div class="download-item-card">
        <div class="download-item-info">
          <div class="download-item-icon">📖</div>
          <div>
            <div class="download-item-title">${item.title}</div>
            <div class="download-item-sub">Digital Edition (${item.pageCount || 'PDF'})</div>
          </div>
        </div>
        <a href="${item.pdfUrl}" download="${item.pdfFileName}" class="btn-download-pdf">
          ⬇ Download PDF
        </a>
      </div>
    `;
  });

  body.innerHTML = `
    <div class="order-success-card">
      <div class="order-success-icon">✓</div>
      <h3>You're All Set!</h3>
      <p style="margin-bottom: var(--space-xs); font-weight: 700; color: var(--color-charcoal);">
        Order #${orderNum}
      </p>
      <p>
        Your digital cookbooks are ready! Click below to download immediately. We've also sent your download link and receipt to <strong>${email}</strong>.
      </p>

      <div class="download-boxes">
        ${downloadCardsHtml}
      </div>

      <div style="background: var(--color-cream); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-xl); font-size: 0.85rem; color: var(--color-text-secondary); text-align: left;">
        <p style="margin: 0;"><strong>💡 Tip:</strong> Save the PDF to your phone, tablet, or laptop. You have lifetime access to these files with no expiry or subscriptions.</p>
      </div>

      <button class="btn-upgrade-cart" style="background: var(--color-charcoal);" onclick="closeCheckout()">
        Done & Return to Site
      </button>
    </div>
  `;
}

// --- Scroll Reveal ---
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// --- Smooth Scroll for Anchor Links ---
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (anchor) {
    const href = anchor.getAttribute('href');
    if (href === '#' || href === '') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
});
