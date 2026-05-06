/* ═══════════════════════════════════════════════════════
   SurpriseBox — script.js
   Features: smooth scroll nav, hamburger, FAQ accordion,
   gallery lightbox, testimonials slider, scroll reveal,
   form validation, navbar scroll effect
═══════════════════════════════════════════════════════ */

'use strict';

/* ── HELPERS ─────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ══════════════════════════════════════════════════════
   1. NAVBAR — scroll shadow + active highlight
══════════════════════════════════════════════════════ */
const navbar = $('#navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ══════════════════════════════════════════════════════
   2. HAMBURGER MENU
══════════════════════════════════════════════════════ */
const hamburger = $('#hamburger');
const navLinks  = $('#navLinks');

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close on link click
$$('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ══════════════════════════════════════════════════════
   3. SMOOTH SCROLL for anchor links
══════════════════════════════════════════════════════ */
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = $(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ══════════════════════════════════════════════════════
   4. SCROLL REVEAL — Intersection Observer
══════════════════════════════════════════════════════ */
// Add reveal class to sections and key elements
const revealTargets = $$([
  '#services .container > *:not(.services-grid)',
  '#how-it-works .container > *:not(.steps-grid)',
  '.step',
  '#testimonials .container > *:not(.testimonials-track)',
  '#pricing .container > *',
  '#about .container > *',
  '#location .container > *',
  '#faq .faq-item',
  '#contact .contact-left > *',
  '#final-cta .cta-content > *',
].join(','));

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
});

// Also reveal service cards
$$('.service-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('.reveal, .service-card').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════════════════════
   5. FAQ ACCORDION
══════════════════════════════════════════════════════ */
$$('.faq-item').forEach(item => {
  const btn = $('.faq-q', item);
  const ans = $('.faq-a', item);

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all others
    $$('.faq-item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        $('.faq-a', other).style.maxHeight = null;
      }
    });

    // Toggle current
    item.classList.toggle('open', !isOpen);
    ans.style.maxHeight = isOpen ? null : ans.scrollHeight + 'px';
  });
});

/* ══════════════════════════════════════════════════════
   6. GALLERY LIGHTBOX
══════════════════════════════════════════════════════ */
const lightbox      = $('#lightbox');
const lightboxClose = $('#lightboxClose');
const lightboxImg   = $('#lightboxImg');
const lightboxLabel = $('#lightboxLabel');

$$('.gallery-item').forEach(item => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `View ${item.dataset.label}`);

  const openLightbox = () => {
    // Clone the gradient background for lightbox
    lightboxImg.style.background = item.style.background;
    lightboxImg.textContent = '';
    const emoji = $('.gallery-icon', item);
    if (emoji) {
      const clone = document.createElement('span');
      clone.style.fontSize = '5rem';
      clone.textContent = emoji.textContent;
      lightboxImg.appendChild(clone);
    }
    lightboxLabel.textContent = item.dataset.label || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  };

  item.addEventListener('click', openLightbox);
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
  });
});

const closeLightbox = () => {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
};

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });

/* ══════════════════════════════════════════════════════
   7. TESTIMONIALS SLIDER
══════════════════════════════════════════════════════ */
const track  = $('#testimonialsTrack');
const tPrev  = $('#tPrev');
const tNext  = $('#tNext');
const tDots  = $('#tDots');
const cards  = $$('.tcard');
let   tIndex = 0;
let   tTimer;

// Build dots
cards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 't-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
  dot.addEventListener('click', () => goTo(i));
  tDots.appendChild(dot);
});

function goTo(idx) {
  tIndex = (idx + cards.length) % cards.length;
  track.scrollTo({ left: tIndex * track.offsetWidth, behavior: 'smooth' });
  $$('.t-dot', tDots).forEach((d, i) => d.classList.toggle('active', i === tIndex));
}

tPrev.addEventListener('click', () => { clearInterval(tTimer); goTo(tIndex - 1); startTimer(); });
tNext.addEventListener('click', () => { clearInterval(tTimer); goTo(tIndex + 1); startTimer(); });

function startTimer() {
  tTimer = setInterval(() => goTo(tIndex + 1), 5000);
}
startTimer();

// Pause on hover
track.addEventListener('mouseenter', () => clearInterval(tTimer));
track.addEventListener('mouseleave', startTimer);

// Sync dot on native scroll
track.addEventListener('scroll', () => {
  const idx = Math.round(track.scrollLeft / track.offsetWidth);
  if (idx !== tIndex) {
    tIndex = idx;
    $$('.t-dot', tDots).forEach((d, i) => d.classList.toggle('active', i === tIndex));
  }
}, { passive: true });

/* ══════════════════════════════════════════════════════
   8. CONTACT FORM VALIDATION
══════════════════════════════════════════════════════ */
const form        = $('#contactForm');
const formSuccess = $('#formSuccess');

const rules = {
  fname:  { el: () => $('#fname'),  err: () => $('#nameError'),  check: v => v.trim().length >= 2,  msg: 'Please enter your full name.' },
  fphone: { el: () => $('#fphone'), err: () => $('#phoneError'), check: v => /^[\d\s\+\-]{8,15}$/.test(v.trim()), msg: 'Please enter a valid phone number.' },
  fmsg:   { el: () => $('#fmsg'),   err: () => $('#msgError'),   check: v => v.trim().length >= 20, msg: 'Please share a bit more detail (at least 20 characters).' },
};

function validateField(key) {
  const r   = rules[key];
  const el  = r.el();
  const err = r.err();
  const ok  = r.check(el.value);
  el.classList.toggle('error', !ok);
  err.textContent = ok ? '' : r.msg;
  return ok;
}

// Live validation on blur
Object.keys(rules).forEach(key => {
  rules[key].el().addEventListener('blur', () => validateField(key));
  rules[key].el().addEventListener('input', () => {
    if (rules[key].el().classList.contains('error')) validateField(key);
  });
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const allValid = Object.keys(rules).map(validateField).every(Boolean);
  if (!allValid) {
    // Scroll to first error
    const firstErr = form.querySelector('.error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Simulate submission (replace with real API / Formspree / etc.)
  const btn = form.querySelector('[type="submit"]');
  btn.textContent = 'Sending... 🎁';
  btn.disabled = true;

  setTimeout(() => {
    form.style.display = 'none';
    formSuccess.style.display = 'block';
  }, 1200);
});

/* ══════════════════════════════════════════════════════
   9. ACTIVE NAV LINK — highlight current section
══════════════════════════════════════════════════════ */
const sections = $$('section[id]');
const navAnchors = $$('.nav-links a[href^="#"]');

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.classList.toggle('active-link', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => activeObserver.observe(s));

/* ══════════════════════════════════════════════════════
   10. BACK TO TOP — hero logo click
══════════════════════════════════════════════════════ */
$('.logo').addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ══════════════════════════════════════════════════════
   11. RESIZE handler — reset testimonials layout
══════════════════════════════════════════════════════ */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    goTo(tIndex); // re-snap slider after resize
  }, 200);
}, { passive: true });

/* ══════════════════════════════════════════════════════
   12. MICRO ANIMATION — service card stagger on entry
══════════════════════════════════════════════════════ */
const serviceObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    $$('.service-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 100);
    });
    serviceObserver.disconnect();
  }
}, { threshold: 0.1 });

const servicesGrid = $('.services-grid');
if (servicesGrid) serviceObserver.observe(servicesGrid);

/* ══════════════════════════════════════════════════════
   DONE — SurpriseBox scripts loaded ✨
══════════════════════════════════════════════════════ */
console.log('%c🎁 SurpriseBox — scripts ready!', 'color:#e06c86;font-weight:bold;font-size:14px;');
