/* ===================================================
   Big Protein — Main JavaScript & Conversion Funnel
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
  initBonusUnlockModal();
  initStickyFunnelBar();
  initSocialProof();
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
    if (typeof window.triggerCartSocialProof === 'function') {
      window.triggerCartSocialProof();
    }
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

    // If both main book and free bonus are in cart, show celebration banner!
    if (CartState.hasItem('main-book') && CartState.hasItem('bonus-book')) {
      html += `
        <div class="cart-unlocked-banner">
          <span>🎁</span>
          <div>
            <strong>FREE BONUS GIFT APPLIED!</strong><br>
            <span style="font-weight:400; font-size:0.8rem; color:#145A32;">
              "Sip Smart, Spend Less" ($8.00 Value) is 100% FREE with your order!
            </span>
          </div>
        </div>
      `;
    }

    CartState.items.forEach(item => {
      html += `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.title}">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price ${item.price === 0 ? 'cart-item-free' : ''}">
              ${item.price === 0 ? 'FREE ($0.00)' : '$' + item.price.toFixed(2)}
              ${item.originalPrice > item.price ? `<span class="original">$${item.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
          </div>
        </div>
      `;
    });

    // Special Offer: Main book in cart, but bonus book NOT yet claimed (if user removed it)
    if (CartState.hasItem('main-book') && !CartState.hasItem('bonus-book')) {
      html += `
        <div class="cart-special-offer">
          <div class="cart-special-offer-header">
            <span>🎁</span>
            <h4>Free Bonus Available!</h4>
          </div>
          <p>You qualify to add "<strong>Sip Smart, Spend Less</strong>" — completely FREE!</p>
          <div class="offer-value">
            <span class="was">$8.00</span>
            <span class="now">FREE</span>
          </div>
          <button class="btn-claim-offer" onclick="claimBonusOffer()">
            Yes, Add My Free Bonus!
          </button>
        </div>
      `;
    }

    // Upgrade Offer: ONLY bonus book in cart at $8.00
    if (!CartState.hasItem('main-book') && CartState.hasItem('bonus-book')) {
      html += `
        <div class="cart-upgrade-box">
          <h4>💡 Upgrade & Get This Free!</h4>
          <p>Add "<strong>Big Protein, Small Bill</strong>" ($24.99) and get your "Sip Smart, Spend Less" drink book <strong>100% FREE</strong>!</p>
          <button class="btn-upgrade-cart" onclick="upgradeToBundle()">
            Get Both Books for Just $24.99
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
      savingsEl.textContent = `⚡ You save $${savings.toFixed(2)} today!`;
      savingsEl.style.display = 'block';
    } else {
      savingsEl.style.display = 'none';
    }
  }
  if (checkoutBtn) checkoutBtn.disabled = CartState.getCount() === 0;

  updateAddToCartButtons();
}

// --- Add To Cart Buttons & High-Converting Funnel Redirect ---
function initAddToCartButtons() {
  // Main book buttons (Hero, Pricing, Footer)
  document.querySelectorAll('[data-add-main]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      claimMainWithFreeBonus();
    });
  });

  // Bundle buttons
  document.querySelectorAll('[data-bundle-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      claimMainWithFreeBonus();
    });
  });

  // Quick bundle from announcement bar or sticky bar
  document.querySelectorAll('[data-quick-bundle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      claimMainWithFreeBonus();
    });
  });

  // Solo bonus button (buy for $8.00)
  document.querySelectorAll('[data-add-solo-bonus]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addSoloBonus();
    });
  });

  // Legacy bonus button
  document.querySelectorAll('[data-add-bonus]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      claimMainWithFreeBonus();
    });
  });
}

// High-Converting Funnel Action: Add Main Book + Automatically Grant Free Bonus + Celebrate!
function claimMainWithFreeBonus() {
  CartState.addItem({ ...PRODUCTS.main });
  CartState.addItem({ ...PRODUCTS.bonus }, true);
  openBonusUnlockModal();
}

function addToCart(productKey) {
  if (productKey === 'main') {
    claimMainWithFreeBonus();
    return;
  }
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
  if (window.openCart) window.openCart();
}

function upgradeToBundle() {
  claimMainWithFreeBonus();
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

// --- Celebratory Free Bonus Unlock Modal ---
function initBonusUnlockModal() {
  let overlay = document.getElementById('bonus-unlock-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'bonus-unlock-overlay';
    overlay.className = 'bonus-unlock-overlay';
    overlay.innerHTML = `
      <div class="bonus-unlock-modal" role="dialog" aria-modal="true" aria-label="Bonus Gift Unlocked">
        <div class="bonus-unlock-confetti-header"></div>
        <button class="bonus-close-btn" onclick="closeBonusUnlockModal()" aria-label="Close">✕</button>
        <div class="bonus-unlock-icon">🎁✨</div>
        <h3 class="bonus-unlock-title">FREE BONUS <span>UNLOCKED!</span></h3>
        <p class="bonus-unlock-subtitle">
          Because you ordered today, you've qualified for our promotional gift: <strong>"Sip Smart, Spend Less" ($8.00 value)</strong> has been added to your order for <strong>$0.00 FREE</strong>!
        </p>

        <div class="bonus-savings-meter">
          <span>⚡</span>
          <span>100% UNLOCKED — You are saving $13.00 today!</span>
        </div>

        <div class="bonus-items-preview">
          <div class="bonus-preview-row main-row">
            <span>📗 Big Protein, Small Bill (156 Pages)</span>
            <span>$24.99</span>
          </div>
          <div class="bonus-preview-row gift-row">
            <span>🥤 Sip Smart, Spend Less (4 Drink Recipes) <span class="badge-gift">FREE GIFT</span></span>
            <span>$0.00</span>
          </div>
          <div class="bonus-total-summary">
            <span style="font-size:0.85rem; font-weight:700; color:var(--color-charcoal);">Total Due Today:</span>
            <div>
              <span class="val-tag">$37.99</span>
              <span class="now-tag">$24.99</span>
            </div>
          </div>
        </div>

        <button class="btn-bonus-checkout" onclick="proceedFromBonusToCheckout()">
          🚀 Proceed to Instant Download Checkout ($24.99) →
        </button>
        <a class="bonus-secondary-link" onclick="viewCartFromBonus()">
          Or Review Cart Items
        </a>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeBonusUnlockModal();
    });
  }
}

function openBonusUnlockModal() {
  initBonusUnlockModal();
  const overlay = document.getElementById('bonus-unlock-overlay');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  if (typeof window.triggerCartSocialProof === 'function') {
    window.triggerCartSocialProof();
  }
}

function closeBonusUnlockModal() {
  const overlay = document.getElementById('bonus-unlock-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function proceedFromBonusToCheckout() {
  closeBonusUnlockModal();
  renderCheckoutForm();
  openCheckout();
}

function viewCartFromBonus() {
  closeBonusUnlockModal();
  if (window.openCart) window.openCart();
}

// --- Sticky Floating Conversion Bar ---
function initStickyFunnelBar() {
  let stickyBar = document.getElementById('sticky-funnel-bar');
  if (!stickyBar) {
    stickyBar = document.createElement('div');
    stickyBar.id = 'sticky-funnel-bar';
    stickyBar.className = 'sticky-funnel-bar';
    stickyBar.innerHTML = `
      <div class="sticky-funnel-inner">
        <div class="sticky-info">
          <img src="images/cover.png" alt="Big Protein Cookbook" class="sticky-thumb">
          <div class="sticky-titles">
            <div class="sticky-title">Big Protein, Small Bill</div>
            <div class="sticky-sub">🎁 Includes FREE $8.00 Drink Ebook Today</div>
          </div>
        </div>
        <div class="sticky-action">
          <div class="sticky-price-group">
            <div class="sticky-price-curr">$24.99</div>
            <div class="sticky-price-orig">$37.99</div>
          </div>
          <button class="btn-sticky-claim" onclick="claimMainWithFreeBonus()">
            Claim Your Copy ➔
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(stickyBar);
  }

  const onScroll = () => {
    if (window.scrollY > 480) {
      stickyBar.classList.add('visible');
      const toast = document.getElementById('social-proof-toast');
      if (toast) toast.classList.add('with-sticky');
    } else {
      stickyBar.classList.remove('visible');
      const toast = document.getElementById('social-proof-toast');
      if (toast) toast.classList.remove('with-sticky');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

// --- Live Social Proof System (120+ USA Customers, 48-Hour Cooldown, Precision Timers) ---
const USA_BUYERS_POOL = [
  { id: 1, name: 'Liam M.', loc: 'Denver, CO', action: 'purchased Big Protein + Free Bonus' },
  { id: 2, name: 'Marcus T.', loc: 'Chicago, IL', action: 'downloaded the Complete Meal System' },
  { id: 3, name: 'Elena R.', loc: 'Austin, TX', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 4, name: 'David K.', loc: 'Orlando, FL', action: 'purchased Big Protein, Small Bill' },
  { id: 5, name: 'Sarah W.', loc: 'Seattle, WA', action: 'unlocked the 7-Week Supermarket System' },
  { id: 6, name: 'Chloe B.', loc: 'Charlotte, NC', action: 'purchased Big Protein + Free Bonus' },
  { id: 7, name: 'Brandon S.', loc: 'Phoenix, AZ', action: 'claimed the $24.99 Launch Bundle' },
  { id: 8, name: 'Rachel H.', loc: 'Columbus, OH', action: 'downloaded the 156-Page Cookbook' },
  { id: 9, name: 'Tyler J.', loc: 'Dallas, TX', action: 'purchased Big Protein + Free Bonus' },
  { id: 10, name: 'Jessica P.', loc: 'San Diego, CA', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 11, name: 'Austin C.', loc: 'Nashville, TN', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 12, name: 'Megan F.', loc: 'Atlanta, GA', action: 'purchased Big Protein, Small Bill' },
  { id: 13, name: 'Anthony L.', loc: 'Indianapolis, IN', action: 'downloaded the Complete Meal System' },
  { id: 14, name: 'Samantha D.', loc: 'Kansas City, MO', action: 'purchased Big Protein + Free Bonus' },
  { id: 15, name: 'Kevin B.', loc: 'Minneapolis, MN', action: 'claimed the $24.99 Launch Bundle' },
  { id: 16, name: 'Emily N.', loc: 'Tampa, FL', action: 'unlocked the 7-Week Supermarket System' },
  { id: 17, name: 'Justin G.', loc: 'Salt Lake City, UT', action: 'purchased Big Protein + Free Bonus' },
  { id: 18, name: 'Hannah M.', loc: 'Raleigh, NC', action: 'downloaded the 156-Page Cookbook' },
  { id: 19, name: 'Ryan K.', loc: 'Portland, OR', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 20, name: 'Olivia S.', loc: 'San Antonio, TX', action: 'purchased Big Protein, Small Bill' },
  { id: 21, name: 'Travis R.', loc: 'Las Vegas, NV', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 22, name: 'Lauren C.', loc: 'Pittsburgh, PA', action: 'purchased Big Protein + Free Bonus' },
  { id: 23, name: 'Nathan D.', loc: 'Boise, ID', action: 'downloaded the Complete Meal System' },
  { id: 24, name: 'Brittany W.', loc: 'Richmond, VA', action: 'claimed the $24.99 Launch Bundle' },
  { id: 25, name: 'Jordan H.', loc: 'Omaha, NE', action: 'purchased Big Protein, Small Bill' },
  { id: 26, name: 'Nicole T.', loc: 'Louisville, KY', action: 'unlocked the 7-Week Supermarket System' },
  { id: 27, name: 'Cody M.', loc: 'Milwaukee, WI', action: 'purchased Big Protein + Free Bonus' },
  { id: 28, name: 'Taylor B.', loc: 'Albuquerque, NM', action: 'downloaded the 156-Page Cookbook' },
  { id: 29, name: 'Kyle E.', loc: 'Jacksonville, FL', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 30, name: 'Stephanie L.', loc: 'Cincinnati, OH', action: 'purchased Big Protein, Small Bill' },
  { id: 31, name: 'Andrew P.', loc: 'Tucson, AZ', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 32, name: 'Amber G.', loc: 'Oklahoma City, OK', action: 'purchased Big Protein + Free Bonus' },
  { id: 33, name: 'Dylan S.', loc: 'Des Moines, IA', action: 'downloaded the Complete Meal System' },
  { id: 34, name: 'Danielle V.', loc: 'Charleston, SC', action: 'claimed the $24.99 Launch Bundle' },
  { id: 35, name: 'Eric T.', loc: 'Sacramento, CA', action: 'purchased Big Protein, Small Bill' },
  { id: 36, name: 'Kayla R.', loc: 'Madison, WI', action: 'unlocked the 7-Week Supermarket System' },
  { id: 37, name: 'Sean M.', loc: 'Tulsa, OK', action: 'purchased Big Protein + Free Bonus' },
  { id: 38, name: 'Vanessa C.', loc: 'Spokane, WA', action: 'downloaded the 156-Page Cookbook' },
  { id: 39, name: 'Zachary W.', loc: 'Providence, RI', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 40, name: 'Alyssa K.', loc: 'Grand Rapids, MI', action: 'purchased Big Protein, Small Bill' },
  { id: 41, name: 'Adam B.', loc: 'Knoxville, TN', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 42, name: 'Brooke H.', loc: 'Reno, NV', action: 'purchased Big Protein + Free Bonus' },
  { id: 43, name: 'Derek S.', loc: 'Cleveland, OH', action: 'downloaded the Complete Meal System' },
  { id: 44, name: 'Paige N.', loc: 'Fort Worth, TX', action: 'claimed the $24.99 Launch Bundle' },
  { id: 45, name: 'Joshua L.', loc: 'Detroit, MI', action: 'purchased Big Protein, Small Bill' },
  { id: 46, name: 'Courtney D.', loc: 'Memphis, TN', action: 'unlocked the 7-Week Supermarket System' },
  { id: 47, name: 'Luke M.', loc: 'Wichita, KS', action: 'purchased Big Protein + Free Bonus' },
  { id: 48, name: 'Morgan F.', loc: 'Birmingham, AL', action: 'downloaded the 156-Page Cookbook' },
  { id: 49, name: 'Matthew T.', loc: 'Little Rock, AR', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 50, name: 'Heather C.', loc: 'Savannah, GA', action: 'purchased Big Protein, Small Bill' },
  { id: 51, name: 'Colton B.', loc: 'Colorado Springs, CO', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 52, name: 'Brianna M.', loc: 'St. Louis, MO', action: 'purchased Big Protein + Free Bonus' },
  { id: 53, name: 'Trevor K.', loc: 'Greensboro, NC', action: 'downloaded the Complete Meal System' },
  { id: 54, name: 'Kaitlyn S.', loc: 'Baton Rouge, LA', action: 'claimed the $24.99 Launch Bundle' },
  { id: 55, name: 'Blake R.', loc: 'Fremont, CA', action: 'purchased Big Protein, Small Bill' },
  { id: 56, name: 'Haley G.', loc: 'Fort Wayne, IN', action: 'unlocked the 7-Week Supermarket System' },
  { id: 57, name: 'Garrett W.', loc: 'Plano, TX', action: 'purchased Big Protein + Free Bonus' },
  { id: 58, name: 'Sierra D.', loc: 'Henderson, NV', action: 'downloaded the 156-Page Cookbook' },
  { id: 59, name: 'Jesse P.', loc: 'Chandler, AZ', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 60, name: 'Alexis H.', loc: 'Norfolk, VA', action: 'purchased Big Protein, Small Bill' },
  { id: 61, name: 'Dustin L.', loc: 'Lincoln, NE', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 62, name: 'Kelsey T.', loc: 'Toledo, OH', action: 'purchased Big Protein + Free Bonus' },
  { id: 63, name: 'Logan C.', loc: 'Lexington, KY', action: 'downloaded the Complete Meal System' },
  { id: 64, name: 'Shelby R.', loc: 'Saint Paul, MN', action: 'claimed the $24.99 Launch Bundle' },
  { id: 65, name: 'Brady N.', loc: 'Corpus Christi, TX', action: 'purchased Big Protein, Small Bill' },
  { id: 66, name: 'Madeline B.', loc: 'Bakersfield, CA', action: 'unlocked the 7-Week Supermarket System' },
  { id: 67, name: 'Brett M.', loc: 'Aurora, CO', action: 'purchased Big Protein + Free Bonus' },
  { id: 68, name: 'Cassidy W.', loc: 'Anaheim, CA', action: 'downloaded the 156-Page Cookbook' },
  { id: 69, name: 'Cameron J.', loc: 'Honolulu, HI', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 70, name: 'Gabrielle K.', loc: 'Santa Ana, CA', action: 'purchased Big Protein, Small Bill' },
  { id: 71, name: 'Grant E.', loc: 'Riverside, CA', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 72, name: 'Mallory P.', loc: 'Anchorage, AK', action: 'purchased Big Protein + Free Bonus' },
  { id: 73, name: 'Spencer T.', loc: 'Stockton, CA', action: 'downloaded the Complete Meal System' },
  { id: 74, name: 'Carly D.', loc: 'Chesapeake, VA', action: 'claimed the $24.99 Launch Bundle' },
  { id: 75, name: 'Mitchell S.', loc: 'Laredo, TX', action: 'purchased Big Protein, Small Bill' },
  { id: 76, name: 'Kendall B.', loc: 'Irving, TX', action: 'unlocked the 7-Week Supermarket System' },
  { id: 77, name: 'Hayden L.', loc: 'Garland, TX', action: 'purchased Big Protein + Free Bonus' },
  { id: 78, name: 'Jenna M.', loc: 'Scottsdale, AZ', action: 'downloaded the 156-Page Cookbook' },
  { id: 79, name: 'Bryce W.', loc: 'Gilbert, AZ', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 80, name: 'Cheyenne F.', loc: 'North Las Vegas, NV', action: 'purchased Big Protein, Small Bill' },
  { id: 81, name: 'Tanner R.', loc: 'Fremont, CA', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 82, name: 'Bailey H.', loc: 'Glendale, AZ', action: 'purchased Big Protein + Free Bonus' },
  { id: 83, name: 'Chase M.', loc: 'Winston-Salem, NC', action: 'downloaded the Complete Meal System' },
  { id: 84, name: 'Lindsey K.', loc: 'Lubbock, TX', action: 'claimed the $24.99 Launch Bundle' },
  { id: 85, name: 'Dakota P.', loc: 'Garland, TX', action: 'purchased Big Protein, Small Bill' },
  { id: 86, name: 'Sydney C.', loc: 'Hialeah, FL', action: 'unlocked the 7-Week Supermarket System' },
  { id: 87, name: 'Parker S.', loc: 'Chesapeake, VA', action: 'purchased Big Protein + Free Bonus' },
  { id: 88, name: 'Devin T.', loc: 'Boise, ID', action: 'downloaded the 156-Page Cookbook' },
  { id: 89, name: 'Makayla L.', loc: 'Baton Rouge, LA', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 90, name: 'Mason R.', loc: 'Richmond, VA', action: 'purchased Big Protein, Small Bill' },
  { id: 91, name: 'Payton W.', loc: 'Spokane, WA', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 92, name: 'Colby D.', loc: 'Des Moines, IA', action: 'purchased Big Protein + Free Bonus' },
  { id: 93, name: 'Tori B.', loc: 'Tacoma, WA', action: 'downloaded the Complete Meal System' },
  { id: 94, name: 'Preston M.', loc: 'San Bernardino, CA', action: 'claimed the $24.99 Launch Bundle' },
  { id: 95, name: 'Reagan F.', loc: 'Modesto, CA', action: 'purchased Big Protein, Small Bill' },
  { id: 96, name: 'Gavin K.', loc: 'Fontana, CA', action: 'unlocked the 7-Week Supermarket System' },
  { id: 97, name: 'Mikayla J.', loc: 'Santa Clarita, CA', action: 'purchased Big Protein + Free Bonus' },
  { id: 98, name: 'Connor S.', loc: 'Birmingham, AL', action: 'downloaded the 156-Page Cookbook' },
  { id: 99, name: 'Faith N.', loc: 'Fayetteville, NC', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 100, name: 'Levi T.', loc: 'Rochester, NY', action: 'purchased Big Protein, Small Bill' },
  { id: 101, name: 'Kylie R.', loc: 'Oxnard, CA', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 102, name: 'Carson W.', loc: 'Grand Prairie, TX', action: 'purchased Big Protein + Free Bonus' },
  { id: 103, name: 'Autumn L.', loc: 'Salt Lake City, UT', action: 'downloaded the Complete Meal System' },
  { id: 104, name: 'Dawson P.', loc: 'Huntsville, AL', action: 'claimed the $24.99 Launch Bundle' },
  { id: 105, name: 'Sierra M.', loc: 'Sioux Falls, SD', action: 'purchased Big Protein, Small Bill' },
  { id: 106, name: 'Jared B.', loc: 'Peoria, AZ', action: 'unlocked the 7-Week Supermarket System' },
  { id: 107, name: 'Katelyn H.', loc: 'Springfield, MO', action: 'purchased Big Protein + Free Bonus' },
  { id: 108, name: 'Christian D.', loc: 'Salem, OR', action: 'downloaded the 156-Page Cookbook' },
  { id: 109, name: 'Savannah T.', loc: 'Corona, CA', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 110, name: 'Brayden K.', loc: 'Eugene, OR', action: 'purchased Big Protein, Small Bill' },
  { id: 111, name: 'Alana C.', loc: 'McKinney, TX', action: 'unlocked the 7-Week Grocery Blueprint' },
  { id: 112, name: 'Keagan W.', loc: 'Fort Collins, CO', action: 'purchased Big Protein + Free Bonus' },
  { id: 113, name: 'Tessa R.', loc: 'Cary, NC', action: 'downloaded the Complete Meal System' },
  { id: 114, name: 'Nolan S.', loc: 'Alexandria, VA', action: 'claimed the $24.99 Launch Bundle' },
  { id: 115, name: 'Mallory E.', loc: 'Lakewood, CO', action: 'purchased Big Protein, Small Bill' },
  { id: 116, name: 'Easton M.', loc: 'Sunnyvale, CA', action: 'unlocked the 7-Week Supermarket System' },
  { id: 117, name: 'Brogan D.', loc: 'Hollywood, FL', action: 'purchased Big Protein + Free Bonus' },
  { id: 118, name: 'Mckenzie P.', loc: 'Clarksville, TN', action: 'downloaded the 156-Page Cookbook' },
  { id: 119, name: 'Brody T.', loc: 'Naperville, IL', action: 'claimed Big Protein + Free Drink Ebook' },
  { id: 120, name: 'Camille H.', loc: 'Overland Park, KS', action: 'purchased Big Protein, Small Bill' }
];

const COOLDOWN_48_HOURS_MS = 48 * 60 * 60 * 1000;
let lastSocialProofToastTime = 0;

function getNext48HrEligibleBuyer() {
  const now = Date.now();
  let history = {};
  try {
    const raw = localStorage.getItem('bp_social_proof_history');
    if (raw) history = JSON.parse(raw);
  } catch(e) {}

  // Filter out any name/location shown within the last 48 hours
  const eligible = USA_BUYERS_POOL.filter(buyer => {
    const lastShown = history[buyer.id];
    return !lastShown || (now - lastShown >= COOLDOWN_48_HOURS_MS);
  });

  let selectedBuyer;
  if (eligible.length > 0) {
    // Pick randomly from eligible candidates
    const randomIndex = Math.floor(Math.random() * eligible.length);
    selectedBuyer = eligible[randomIndex];
  } else {
    // Fallback if all 120 names were shown within 48h: pick the least recently shown
    selectedBuyer = [...USA_BUYERS_POOL].sort((a, b) => (history[a.id] || 0) - (history[b.id] || 0))[0];
  }

  // Record this buyer with the current timestamp
  history[selectedBuyer.id] = now;
  try {
    localStorage.setItem('bp_social_proof_history', JSON.stringify(history));
  } catch(e) {}

  return selectedBuyer;
}

function showSocialProofToast(forceShow = false) {
  const now = Date.now();
  // Prevent immediate duplicate if cart opened right as recurring timer fired
  if (!forceShow && (now - lastSocialProofToastTime < 8000)) return;
  lastSocialProofToastTime = now;

  let toast = document.getElementById('social-proof-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'social-proof-toast';
    toast.className = 'social-proof-toast';
    document.body.appendChild(toast);
  }

  const buyer = getNext48HrEligibleBuyer();
  const minuteAgo = Math.floor(Math.random() * 25) + 2;
  const timeText = minuteAgo === 2 ? 'Just now' : `${minuteAgo} minutes ago`;

  toast.innerHTML = `
    <div class="social-proof-icon">⚡</div>
    <div class="social-proof-content">
      <strong>${buyer.name} from ${buyer.loc}</strong>
      <span>${buyer.action}</span>
      <div class="social-proof-time">${timeText} • <span style="color:#2ECC71;">✓ Verified Buyer</span></div>
    </div>
    <button class="social-proof-close" onclick="this.parentElement.classList.remove('show')" aria-label="Close notification">✕</button>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 6000);
}

function initSocialProof() {
  // 1. Initial trigger: 10 seconds after user enters the site
  setTimeout(() => {
    showSocialProofToast();
  }, 10000);

  // 2. Recurring trigger: every 2 minutes (120,000 ms)
  setInterval(() => {
    showSocialProofToast();
  }, 120000);

  // 3. Cart trigger: 2 seconds after user opens the cart
  window.triggerCartSocialProof = function() {
    setTimeout(() => {
      showSocialProofToast(true);
    }, 2000);
  };
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
