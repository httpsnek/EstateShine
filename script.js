/**
 * Estate Shine Cleaning — script.js
 * Pure Vanilla JavaScript | No dependencies
 *
 * Modules:
 *  1. initStickyHeader()   — Backdrop-blur effect on scroll
 *  2. initMobileMenu()     — Slide-out navigation drawer
 *  3. initBlueprint()      — Interactive floor plan zones + tooltips
 *  4. initBeforeAfter()    — Drag-to-compare image slider
 *  5. initSmoothScroll()   — Smooth anchor scrolling + menu close
 *  6. initFooterYear()     — Auto-update copyright year
 */

'use strict';

function initStickyHeader() {
  // Header scrolls naturally with the page — no sticky behaviour.
}

/* ─────────────────────────────────────────────────────────────
   2. MOBILE / SLIDE-OUT MENU
   - Hamburger button opens the slide-out nav
   - Close button, overlay click, and Escape key close it
───────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const slideMenu  = document.getElementById('slide-menu');
  const overlay    = document.getElementById('menu-overlay');
  const closeBtn   = document.getElementById('menu-close');

  if (!hamburger || !slideMenu) return;

  // All focusable elements inside the slide menu (for focus trapping)
  const focusableSelectors = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';

  function openMenu() {
    slideMenu.classList.add('is-open');
    overlay.classList.add('is-active');
    slideMenu.setAttribute('aria-hidden', 'false');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation menu');
    document.body.classList.add('no-scroll');

    // Move focus to the close button inside the menu
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    slideMenu.classList.remove('is-open');
    overlay.classList.remove('is-active');
    slideMenu.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation menu');
    document.body.classList.remove('no-scroll');

    // Return focus to the hamburger button
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    if (slideMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && slideMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Close when a nav link inside the menu is clicked
  slideMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Basic focus trap: keep Tab/Shift+Tab inside the open menu
  slideMenu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...slideMenu.querySelectorAll(focusableSelectors)].filter(
      el => !el.disabled && getComputedStyle(el).display !== 'none'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   3. INTERACTIVE FLOOR PLAN / BLUEPRINT
   - Hover (desktop) and tap (mobile) highlight SVG zones
   - Tooltip fades in with mock cleaning checklist
───────────────────────────────────────────────────────────── */
function initBlueprint() {
  const floorPlan = document.getElementById('floor-plan');
  const tooltip   = document.getElementById('blueprint-tooltip');

  if (!floorPlan || !tooltip) return;

  // ── Mock cleaning checklist data (keyed by zone data-zone attribute) ──
  const zoneData = {
    kitchen: {
      label: 'Kitchen',
      items: [
        '[Countertops wiped & sanitized]',
        '[Sink scrubbed & polished]',
        '[Stovetop degreased]',
        '[Cabinet fronts spot-cleaned]',
      ],
    },
    bathroom: {
      label: 'Bathroom',
      items: [
        '[Toilet sanitized inside & out]',
        '[Shower & tub scrubbed]',
        '[Mirror polished streak-free]',
        '[Floor mopped & disinfected]',
      ],
    },
    bedroom: {
      label: 'Bedroom',
      items: [
        '[All surfaces dusted]',
        '[Carpets & rugs vacuumed]',
        '[Linens changed & made]',
        '[Closet fronts wiped]',
      ],
    },
    livingroom: {
      label: 'Living Room',
      items: [
        '[Sofa & cushions vacuumed]',
        '[TV stand & electronics dusted]',
        '[Windows & sills wiped]',
        '[Floors swept & mopped]',
      ],
    },
  };

  const tooltipRoom = tooltip.querySelector('.blueprint-tooltip__room');
  const tooltipList = tooltip.querySelector('.blueprint-tooltip__list');
  let activeZone    = null;
  let hideTimeout   = null;

  // ── Populate & show tooltip for a given zone key ──
  function showTooltip(zoneKey, targetEl) {
    clearTimeout(hideTimeout);
    const data = zoneData[zoneKey];
    if (!data) return;

    // Build checklist HTML
    tooltipRoom.textContent = data.label;
    tooltipList.innerHTML   = data.items
      .map(item => `<li>${item}</li>`)
      .join('');

    // On mobile: center the tooltip over the wrapper
    // On desktop: position near the hovered element
    const isMobile = window.innerWidth < 768;
    if (!isMobile && targetEl) {
      const wrapperRect = floorPlan.parentElement.getBoundingClientRect();
      const zoneRect    = targetEl.getBoundingClientRect();

      // Position tooltip to the right of zone, or left if near edge
      const leftPos = zoneRect.right - wrapperRect.left + 12;
      const topPos  = zoneRect.top  - wrapperRect.top;

      // Keep within wrapper bounds
      const tooltipWidth  = 220;
      const wrapperWidth  = wrapperRect.width;

      if (leftPos + tooltipWidth > wrapperWidth) {
        // Place to the left instead
        tooltip.style.left      = `${zoneRect.left - wrapperRect.left - tooltipWidth - 12}px`;
      } else {
        tooltip.style.left      = `${leftPos}px`;
      }
      tooltip.style.top       = `${Math.max(0, topPos)}px`;
      tooltip.style.transform = 'none';
    } else {
      // Mobile: centered (CSS handles transform)
      tooltip.style.left      = '50%';
      tooltip.style.top       = '50%';
      tooltip.style.transform = 'translate(-50%, -50%) scale(1)';
    }

    tooltip.classList.add('is-visible');
    tooltip.setAttribute('aria-hidden', 'false');
  }

  // ── Hide tooltip ──
  function hideTooltip() {
    hideTimeout = setTimeout(() => {
      tooltip.classList.remove('is-visible');
      tooltip.setAttribute('aria-hidden', 'true');
      activeZone = null;
    }, 120);
  }

  // ── Attach events to each floor zone group ──
  const zones = floorPlan.querySelectorAll('.floor-zone');

  zones.forEach(zone => {
    const key = zone.dataset.zone;

    // Desktop: mouseenter / mouseleave
    zone.addEventListener('mouseenter', () => {
      if (activeZone) activeZone.classList.remove('is-active');
      zone.classList.add('is-active');
      activeZone = zone;
      showTooltip(key, zone);
    });

    zone.addEventListener('mouseleave', () => {
      zone.classList.remove('is-active');
      hideTooltip();
    });

    // Click / tap — immediate toggle with mutual exclusion
    zone.addEventListener('click', (e) => {
      e.stopPropagation();
      if (zone.classList.contains('is-active')) {
        // Tap active zone → close
        zone.classList.remove('is-active');
        hideTooltip();
        activeZone = null;
      } else {
        // Tap a new zone → clear all, activate this one
        zones.forEach(z => z.classList.remove('is-active'));
        clearTimeout(hideTimeout);
        zone.classList.add('is-active');
        activeZone = zone;
        if (navigator.vibrate) navigator.vibrate(20);
        showTooltip(key, zone);
      }
    });

    // Keyboard: Enter / Space to activate
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (zone.classList.contains('is-active')) {
          zone.classList.remove('is-active');
          hideTooltip();
          activeZone = null;
        } else {
          if (activeZone) activeZone.classList.remove('is-active');
          zone.classList.add('is-active');
          activeZone = zone;
          showTooltip(key, zone);
        }
      }
    });

    // Blur → hide
    zone.addEventListener('blur', () => {
      zone.classList.remove('is-active');
      hideTooltip();
    });
  });

  // ── Close tooltip when tapping outside the blueprint ──
  document.addEventListener('click', (e) => {
    if (!floorPlan.contains(e.target) && !tooltip.contains(e.target)) {
      zones.forEach(z => z.classList.remove('is-active'));
      hideTooltip();
      activeZone = null;
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   4. BEFORE / AFTER IMAGE SLIDER
   - rAF-coalesced DOM writes for 60fps
   - clientX + getBoundingClientRect (viewport-relative, correct after scroll)
   - Non-passive touchmove on container to allow preventDefault
───────────────────────────────────────────────────────────── */
function initBeforeAfter() {
  const container = document.getElementById('before-after-slider');
  const handle    = document.getElementById('slider-handle');
  const beforeImg = container?.querySelector('.slider-img--before');

  if (!container || !handle || !beforeImg) return;

  let isDragging = false;
  let currentPct = 50;
  let rafId      = null;
  let pendingPct = null;

  // Commit a split — always called inside rAF
  function applySplit(pct) {
    pct = Math.max(2, Math.min(98, pct));
    currentPct = pct;
    beforeImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left        = `${pct}%`;
    handle.setAttribute('aria-valuenow', Math.round(pct));
  }

  // Schedule a split via rAF — coalesces multiple events per frame into one paint
  function scheduleSplit(pct) {
    pendingPct = pct;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (pendingPct !== null) { applySplit(pendingPct); pendingPct = null; }
    });
  }

  // Use clientX + getBoundingClientRect (both viewport-relative — correct after scroll)
  function getPercent(clientX) {
    const rect = container.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  // ── Mouse ──
  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
  });

  container.addEventListener('mousedown', (e) => {
    if (handle.contains(e.target)) return;
    scheduleSplit(getPercent(e.clientX));
    isDragging = true;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    scheduleSplit(getPercent(e.clientX));
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // ── Touch (touch-action: pan-y set in CSS — horizontal drag captured by JS) ──
  handle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDragging = true;
  }, { passive: false });

  container.addEventListener('touchstart', (e) => {
    if (handle.contains(e.target)) return;
    scheduleSplit(getPercent(e.touches[0].clientX));
    isDragging = true;
  }, { passive: true });

  // Non-passive so we can preventDefault — prevents vertical scroll while dragging
  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    scheduleSplit(getPercent(e.touches[0].clientX));
  }, { passive: false });

  window.addEventListener('touchend', () => { isDragging = false; });

  // ── Keyboard ──
  handle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  applySplit(currentPct - 5);
    if (e.key === 'ArrowRight') applySplit(currentPct + 5);
  });

  applySplit(50);
}

/* ─────────────────────────────────────────────────────────────
   5. SMOOTH SCROLL
   - All anchor links scroll smoothly to their targets
   - Offsets for the sticky header height
───────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  const headerHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '80'
  );

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return; // bare "#" — just top

      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   6. FOOTER YEAR — keeps copyright current automatically
───────────────────────────────────────────────────────────── */
function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────────────────────
   7. SCROLL REVEAL — fades elements up as they enter viewport
───────────────────────────────────────────────────────────── */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────────
   8. REVIEWS MODAL — 3D Curved Carousel
   - Cards pre-rendered; viewport scrolls natively (touch + arrows)
   - scroll event drives rotateY / scale / opacity per-card
   - Opens from drawer "Reviews" link (overlay stays active)
   - Close: X button, overlay click, or Escape key
───────────────────────────────────────────────────────────── */
function initReviewsModal() {
  const modal    = document.getElementById('reviews-modal');
  const closeBtn = document.getElementById('reviews-modal-close');
  const prevBtn  = document.getElementById('reviews-modal-prev');
  const nextBtn  = document.getElementById('reviews-modal-next');
  const viewport = document.getElementById('carousel-viewport');
  const track    = document.getElementById('carousel-track');
  const counter  = document.getElementById('reviews-modal-counter');
  const overlay  = document.getElementById('menu-overlay');
  const slideMenu = document.getElementById('slide-menu');
  const hamburger = document.getElementById('hamburger');

  if (!modal || !overlay || !slideMenu || !viewport || !track) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  const TOTAL = cards.length;
  const CARD_GAP = 16; // must match CSS gap on .carousel-track

  // ── Set track padding-inline so first/last cards can center ──
  function setTrackPadding() {
    const vpW    = viewport.clientWidth;
    const cardW  = cards[0].offsetWidth;
    const pad    = Math.max(0, (vpW - cardW) / 2);
    track.style.paddingInline = `${pad}px`;
  }

  // ── 3D curve: runs on every scroll tick ──
  function update3DEffect() {
    const vpRect    = viewport.getBoundingClientRect();
    const vpCenterX = vpRect.left + vpRect.width / 2;

    let closestIdx = 0;
    let minDist    = Infinity;

    cards.forEach((card, i) => {
      const rect       = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const distance   = cardCenterX - vpCenterX;
      const absDist    = Math.abs(distance);

      if (absDist < minDist) { minDist = absDist; closestIdx = i; }

      // Normalize distance against one card width, clamp to ±1.5
      const norm    = Math.max(-1.5, Math.min(1.5, distance / rect.width));
      const rotateY = norm * 38;                              // ±38 deg at edges
      const scale   = 1 - Math.abs(norm) * 0.14;             // 0.79 at max
      const opacity = Math.max(0.38, 1 - Math.abs(norm) * 0.44);

      card.style.transform = `perspective(1200px) rotateY(${rotateY}deg) scale(${scale})`;
      card.style.opacity   = opacity;
    });

    counter.textContent = `${closestIdx + 1} / ${TOTAL}`;
  }

  // ── Open ──
  function openModal() {
    overlay.classList.add('is-active');
    document.body.classList.add('no-scroll');
    modal.hidden = false;
    setTrackPadding();
    // Snap to card 1 instantly before fade-in
    viewport.scrollLeft = 0;
    requestAnimationFrame(() => {
      update3DEffect();
      modal.classList.add('is-open');
    });
    closeBtn?.focus();
  }

  // ── Close ──
  function closeModal() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
    modal.addEventListener('transitionend', () => { modal.hidden = true; }, { once: true });
    hamburger?.focus();
  }

  // ── Close drawer panel only (keep overlay + no-scroll) ──
  function closeDrawerOnly() {
    slideMenu.classList.remove('is-open');
    slideMenu.setAttribute('aria-hidden', 'true');
    if (hamburger) {
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation menu');
    }
  }

  // ── Reviews link in drawer (capture phase prevents auto-close) ──
  const reviewsLink = slideMenu.querySelector('a[href="#reviews"]');
  if (reviewsLink) {
    reviewsLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeDrawerOnly();
      openModal();
    }, { capture: true });
  }

  // ── Reviews links outside the drawer (e.g. footer) ──
  document.querySelectorAll('footer a[href="#reviews"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // ── Overlay click: close modal if open, else fall through ──
  overlay.addEventListener('click', (e) => {
    if (!modal.hidden) {
      closeModal();
      e.stopImmediatePropagation();
    }
  }, { capture: true });

  // ── Close button & Escape ──
  closeBtn?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // ── Arrow navigation: scroll by one card width + gap ──
  prevBtn?.addEventListener('click', () => {
    viewport.scrollBy({ left: -(cards[0].offsetWidth + CARD_GAP), behavior: 'smooth' });
  });
  nextBtn?.addEventListener('click', () => {
    viewport.scrollBy({ left: cards[0].offsetWidth + CARD_GAP, behavior: 'smooth' });
  });

  // ── Native scroll → 3D effect (rAF-throttled so DOM writes stay off the main thread) ──
  let isTicking = false;
  viewport.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        update3DEffect();
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });

  // ── Recalculate on resize ──
  window.addEventListener('resize', () => {
    setTrackPadding();
    update3DEffect();
  }, { passive: true });
}

/* ─────────────────────────────────────────────────────────────
   INIT — run all modules when DOM is ready
───────────────────────────────────────────────────────────── */
function initFloatingBookBtn() {
  const btn = document.querySelector('.floating-book-btn');
  const bookingSection = document.querySelector('.booking-widget-wrapper');
  if (!btn || !bookingSection) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        btn.classList.add('hidden');
      } else {
        btn.classList.remove('hidden');
      }
    },
    { root: null, threshold: 0, rootMargin: '0px 0px -100px 0px' }
  );
  observer.observe(bookingSection);
}

/* ─────────────────────────────────────────────────────────────
   FAQ MODAL — Custom accordion (CSS Grid height trick)
   - Opens from drawer "FAQ" link (closes drawer, keeps overlay)
   - Exclusive accordion: only one item open at a time
   - Close: X button, overlay click, or Escape key
───────────────────────────────────────────────────────────── */
function initFaqModal() {
  const modal     = document.getElementById('faq-modal');
  const closeBtn  = document.getElementById('faq-modal-close');
  const faqLink   = document.getElementById('faq-link');
  const overlay   = document.getElementById('menu-overlay');
  const slideMenu = document.getElementById('slide-menu');
  const hamburger = document.getElementById('hamburger');

  if (!modal || !overlay || !slideMenu) return;

  function openModal() {
    overlay.classList.add('is-active');
    document.body.classList.add('no-scroll');
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    closeBtn?.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
    modal.addEventListener('transitionend', () => { modal.hidden = true; }, { once: true });
    hamburger?.focus();
  }

  function closeDrawerOnly() {
    slideMenu.classList.remove('is-open');
    slideMenu.setAttribute('aria-hidden', 'true');
    if (hamburger) {
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation menu');
    }
  }

  // ── Accordion: exclusive open/close ──
  const faqItems = Array.from(modal.querySelectorAll('.faq-item'));
  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isAlreadyOpen = item.classList.contains('is-open');
      // Close all items
      faqItems.forEach((i) => {
        i.classList.remove('is-open');
        i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });
      // Open clicked item only if it wasn't already open
      if (!isAlreadyOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── FAQ link in drawer ──
  if (faqLink) {
    faqLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeDrawerOnly();
      openModal();
    }, { capture: true });
  }

  // ── FAQ links outside the drawer (e.g. footer) ──
  document.querySelectorAll('footer a[href="#faq"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // ── Overlay click: close modal if open ──
  overlay.addEventListener('click', (e) => {
    if (!modal.hidden) {
      closeModal();
      e.stopImmediatePropagation();
    }
  }, { capture: true });

  // ── Close button & Escape ──
  closeBtn?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

/* ─────────────────────────────────────────────────────────────
   BOOKING FOCUS SCROLL
   - Saves scroll position when user engages the iframe
   - Scrolls page to top of booking container for clear view
   - Returns user to original position on click-outside
   - Safety timeout resets state after 60 s of inactivity
───────────────────────────────────────────────────────────── */
function initBookingFocusScroll() {
  const bookingSection = document.getElementById('booking');
  const widgetWrapper  = document.querySelector('.booking-widget-wrapper');
  if (!bookingSection || !widgetWrapper) return;

  let userOriginalY = 0;
  let safetyTimer   = null;

  function resetState() {
    userOriginalY = 0;
    clearTimeout(safetyTimer);
    safetyTimer = null;
  }

  function returnToOrigin() {
    if (userOriginalY === 0) return;
    window.scrollTo({ top: userOriginalY, behavior: 'smooth' });
    resetState();
  }

  // ── Engage: first click/touch on or around the iframe ──
  ['click', 'touchstart'].forEach(eventType => {
    bookingSection.addEventListener(eventType, () => {
      if (userOriginalY !== 0) return; // already engaged

      userOriginalY = window.scrollY;

      const wrapperTop = widgetWrapper.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top: wrapperTop, behavior: 'smooth' });

      // Safety: auto-reset after 60 s if user never clicks outside
      safetyTimer = setTimeout(resetState, 60000);
    }, { passive: true });
  });

  // ── Return: click anywhere outside the booking section ──
  document.addEventListener('click', (e) => {
    if (userOriginalY === 0) return;
    if (bookingSection.contains(e.target)) return;
    returnToOrigin();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initBlueprint();
  initBeforeAfter();
  initSmoothScroll();
  initFooterYear();
  initScrollReveal();
  initReviewsModal();
  initFloatingBookBtn();
  initFaqModal();
  initBookingFocusScroll();
});
