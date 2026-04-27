'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ── Footer year ──
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Scroll-reveal for lead paragraph and sections ──
  const revealEls = document.querySelectorAll('.legal-lead, .legal-section');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.07}s`;
      observer.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ── Scroll-reveal for about-us pillars (only present on about-us.html) ──
  const pillars = document.querySelectorAll('.about-pillar');
  if (pillars.length) {
    if ('IntersectionObserver' in window) {
      const pillarsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            pillarsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      pillars.forEach(p => pillarsObserver.observe(p));
    } else {
      pillars.forEach(p => p.classList.add('is-visible'));
    }
  }
});
