/* ===================================================
   Big Protein — Main JavaScript & Direct Checkout
   Payment Link: https://superprofile.bio/vp/big-protein-small-bill
   =================================================== */

// --- Direct Checkout Link & VIP Coupon Code ---
const CHECKOUT_URL = 'https://superprofile.bio/vp/big-protein-small-bill';
const VIP_COUPON_CODE = 'FREEDRINK';

function redirectToCheckout() {
  autoCopyCoupon();
  window.open(CHECKOUT_URL, '_blank') || (window.location.href = CHECKOUT_URL);
}

function autoCopyCoupon() {
  copyCouponCode(VIP_COUPON_CODE, null);
}

function copyCouponCode(code = VIP_COUPON_CODE, triggerBtn = null) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showCopyFeedback(code, triggerBtn);
    }).catch(() => {
      fallbackCopy(code, triggerBtn);
    });
  } else {
    fallbackCopy(code, triggerBtn);
  }
}

function fallbackCopy(code, triggerBtn) {
  const textArea = document.createElement('textarea');
  textArea.value = code;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showCopyFeedback(code, triggerBtn);
  } catch (err) {}
  document.body.removeChild(textArea);
}

function showCopyFeedback(code, triggerBtn) {
  if (triggerBtn) {
    const originalText = triggerBtn.innerHTML;
    triggerBtn.classList.add('copied');
    triggerBtn.innerHTML = '✓ Copied!';
    setTimeout(() => {
      triggerBtn.classList.remove('copied');
      triggerBtn.innerHTML = originalText;
    }, 2500);
  }

  let toast = document.getElementById('copy-floating-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copy-floating-toast';
    toast.className = 'copy-floating-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <span class="toast-icon">✓</span>
    <span>Code <strong>${code}</strong> copied! Paste at checkout for $1.00 OFF (Drink Book FREE)</span>
  `;
  toast.classList.add('show');
  clearTimeout(window._copyToastTimer);
  window._copyToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

window.copyCouponCode = copyCouponCode;
window.handleCheckoutClick = function(e, el) {
  autoCopyCoupon();
};

// Global safety stubs for backward compatibility
window.openCart = redirectToCheckout;
window.closeCart = () => {};
window.claimMainWithFreeBonus = redirectToCheckout;
window.addToCart = redirectToCheckout;
window.addSoloBonus = redirectToCheckout;
window.claimBonusOffer = redirectToCheckout;
window.upgradeToBundle = redirectToCheckout;

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initCarousel();
  initLightbox();
  initFAQ();
  initStickyFunnelBar();
  initSocialProof();
  initScrollReveal();
  initCheckoutRedirects();
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

  // Mobile menu & backdrop overlay
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);
    }

    const setMenuOpen = (isOpen) => {
      toggle.classList.toggle('active', isOpen);
      nav.classList.toggle('open', isOpen);
      backdrop.classList.toggle('active', isOpen);
      document.body.classList.toggle('nav-menu-open', isOpen);
    };

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenuOpen(!nav.classList.contains('open'));
    });

    backdrop.addEventListener('click', () => {
      setMenuOpen(false);
    });

    // Close when clicking any menu link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMenuOpen(false);
      }
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

// --- Sticky Floating Conversion Bar ---
function initStickyFunnelBar() {
  // Do not show on how-to-order guide page or informational pages
  if (window.location.href.includes('how-to-order') ||
      document.body.classList.contains('no-sticky-bar') ||
      document.querySelector('.guide-page-hero') ||
      window.location.pathname.includes('privacy') ||
      window.location.pathname.includes('terms') ||
      window.location.pathname.includes('refund') ||
      window.location.pathname.includes('contact')) {
    return;
  }

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
            <div class="sticky-title">Big Protein + Drink Ebook</div>
            <div class="sticky-sub">
              <span>🎟️ Code: <strong>FREEDRINK</strong> ($1 OFF)</span>
              <button class="sticky-copy-chip" onclick="copyCouponCode('FREEDRINK', this)">📋 Copy</button>
            </div>
          </div>
        </div>
        <div class="sticky-action">
          <div class="sticky-price-group">
            <div class="sticky-price-curr">$24.99</div>
            <div class="sticky-price-orig">$45.99 Val</div>
          </div>
          <a href="${CHECKOUT_URL}" target="_blank" rel="noopener noreferrer" class="btn-sticky-claim" onclick="handleCheckoutClick(event, this)">
            Claim With Code ➔
          </a>
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

// --- Live Social Proof System (120+ USA Customers, 48-Hour Cooldown) ---
const USA_BUYERS_POOL = [
  { id: 1, name: 'Liam M.', loc: 'Denver, CO', action: 'applied code FREEDRINK & unlocked Big Protein bundle' },
  { id: 2, name: 'Marcus T.', loc: 'Chicago, IL', action: 'downloaded the Complete Meal System' },
  { id: 3, name: 'Elena R.', loc: 'Austin, TX', action: 'used code FREEDRINK for $1.00 OFF drink book' },
  { id: 4, name: 'David K.', loc: 'Orlando, FL', action: 'purchased Big Protein, Small Bill' },
  { id: 5, name: 'Sarah W.', loc: 'Seattle, WA', action: 'unlocked the 7-Week Supermarket System' },
  { id: 6, name: 'Chloe B.', loc: 'Charlotte, NC', action: 'applied code FREEDRINK at checkout' },
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
  { id: 50, name: 'Heather C.', loc: 'Savannah, GA', action: 'purchased Big Protein, Small Bill' }
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

  const eligible = USA_BUYERS_POOL.filter(buyer => {
    const lastShown = history[buyer.id];
    return !lastShown || (now - lastShown >= COOLDOWN_48_HOURS_MS);
  });

  let selectedBuyer;
  if (eligible.length > 0) {
    const randomIndex = Math.floor(Math.random() * eligible.length);
    selectedBuyer = eligible[randomIndex];
  } else {
    selectedBuyer = [...USA_BUYERS_POOL].sort((a, b) => (history[a.id] || 0) - (history[b.id] || 0))[0];
  }

  history[selectedBuyer.id] = now;
  try {
    localStorage.setItem('bp_social_proof_history', JSON.stringify(history));
  } catch(e) {}

  return selectedBuyer;
}

function showSocialProofToast(forceShow = false) {
  const now = Date.now();
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
    <button class="social-proof-close" onclick="event.stopPropagation(); this.parentElement.classList.remove('show')" aria-label="Close notification">✕</button>
  `;

  toast.style.cursor = 'pointer';
  toast.onclick = (e) => {
    if (e.target.classList.contains('social-proof-close')) return;
    redirectToCheckout();
  };

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 6000);
}

function initSocialProof() {
  setTimeout(() => {
    showSocialProofToast();
  }, 10000);

  setInterval(() => {
    showSocialProofToast();
  }, 120000);
}

// --- Wire Up Direct Checkout Triggers ---
function initCheckoutRedirects() {
  const triggers = document.querySelectorAll(
    '[data-add-main], [data-bundle-action], [data-quick-bundle], [data-add-solo-bonus], [data-add-bonus], [data-open-cart]'
  );

  triggers.forEach(el => {
    el.addEventListener('click', (e) => {
      autoCopyCoupon();
      if (el.tagName !== 'A' || !el.getAttribute('href') || el.getAttribute('href') === '#' || el.getAttribute('href') === '') {
        e.preventDefault();
        redirectToCheckout();
      }
    });
  });
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
