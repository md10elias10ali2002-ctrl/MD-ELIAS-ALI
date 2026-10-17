/* ============================================================
   MD ELIAS ALI · DIGITAL MARKETER PORTFOLIO
   script.js — Interactivity, Animations & Form Logic
   ============================================================ */

'use strict';

/* ============================================================
   1. NAVBAR — SCROLL STATE & ACTIVE LINK HIGHLIGHT
   ============================================================ */
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

/**
 * Toggle the "scrolled" class on the navbar when the user
 * scrolls past 50px — this darkens the glass effect for
 * better readability over content.
 */
function handleNavbarScroll() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/**
 * Highlight the navigation link corresponding to the section
 * currently in view. Uses a simple offset calculation based on
 * each section's top position.
 */
function highlightActiveLink() {
  const scrollPosition = window.scrollY + 150; // offset for fixed navbar

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// Throttled scroll listener for performance
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      handleNavbarScroll();
      highlightActiveLink();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});

// Run once on page load
handleNavbarScroll();
highlightActiveLink();

/* ============================================================
   2. MOBILE HAMBURGER MENU
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

/**
 * Toggle the mobile menu open/closed and animate the hamburger
 * icon into an "X".
 */
function toggleMobileMenu() {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

hamburger.addEventListener('click', toggleMobileMenu);

/**
 * Close the mobile menu when any link inside it is clicked,
 * then allow the default smooth scroll to proceed.
 */
mobileLinks.forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  });
});

/**
 * Close the mobile menu if the user clicks outside of it.
 */
document.addEventListener('click', (e) => {
  if (
    mobileMenu.classList.contains('open') &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }
});

/**
 * Close mobile menu on window resize (e.g., rotating a device)
 * when the viewport becomes large enough for the desktop nav.
 */
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }
});

/* ============================================================
   3. SMOOTH SCROLL FOR ANCHOR LINKS (fallback + offset fix)
   ============================================================ */
/**
 * Native CSS `scroll-behavior: smooth` handles most cases, but
 * this JS fallback ensures a consistent offset for the fixed
 * navbar across all browsers.
 */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#' || targetId === '#home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      const navbarHeight = navbar.offsetHeight + 30;
      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.scrollY -
        navbarHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  });
});

/* ============================================================
   4. INTERSECTION OBSERVER — SCROLL REVEAL ANIMATIONS
   ============================================================ */
/**
 * Observe every element with the `.reveal` class and add the
 * `.visible` class when it enters the viewport. The CSS handles
 * the actual transition (opacity + translateY).
 *
 * `unobserve` is called after revealing so the animation only
 * plays once — better performance and a cleaner feel.
 */
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12, // trigger when 12% of element is visible
      rootMargin: '0px 0px -60px 0px', // slight offset for natural feel
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  // Fallback for very old browsers: show everything immediately
  revealElements.forEach((el) => el.classList.add('visible'));
}

/* ============================================================
   5. TESTIMONIALS SLIDER
   ============================================================ */
const testimonialTrack = document.getElementById('testimonialTrack');
const testimonialCards = document.querySelectorAll('.testimonial-card');
const sliderDotsContainer = document.getElementById('sliderDots');

let currentSlide = 0;
let sliderInterval = null;
const SLIDE_DURATION = 5000; // 5 seconds per slide

/**
 * Build the pagination dots dynamically based on the number of
 * testimonial cards. Each dot gets a click listener to jump to
 * its corresponding slide.
 */
function buildDots() {
  testimonialCards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
    if (index === 0) dot.classList.add('active');

    dot.addEventListener('click', () => {
      goToSlide(index);
      resetAutoSlide();
    });

    sliderDotsContainer.appendChild(dot);
  });
}

/**
 * Move the slider to a specific slide index, update the active
 * dot, and reset the auto-slide timer.
 */
function goToSlide(index) {
  currentSlide = index;
  testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

/**
 * Advance to the next slide, looping back to the first one.
 */
function nextSlide() {
  currentSlide = (currentSlide + 1) % testimonialCards.length;
  goToSlide(currentSlide);
}

/**
 * Start the auto-slide interval.
 */
function startAutoSlide() {
  sliderInterval = setInterval(nextSlide, SLIDE_DURATION);
}

/**
 * Stop and restart the auto-slide interval (used after manual
 * navigation so the timer doesn't feel out of sync).
 */
function resetAutoSlide() {
  clearInterval(sliderInterval);
  startAutoSlide();
}

// Pause auto-slide when hovering over the slider
const testimonialSlider = document.querySelector('.testimonial-slider');
if (testimonialSlider) {
  testimonialSlider.addEventListener('mouseenter', () => {
    clearInterval(sliderInterval);
  });
  testimonialSlider.addEventListener('mouseleave', () => {
    startAutoSlide();
  });
}

// Touch swipe support for mobile users
let touchStartX = 0;
let touchEndX = 0;

if (testimonialSlider) {
  testimonialSlider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  testimonialSlider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
}

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swiped left → next slide
      currentSlide = (currentSlide + 1) % testimonialCards.length;
    } else {
      // Swiped right → previous slide
      currentSlide =
        (currentSlide - 1 + testimonialCards.length) %
        testimonialCards.length;
    }
    goToSlide(currentSlide);
    resetAutoSlide();
  }
}

// Initialize the slider
if (testimonialTrack && testimonialCards.length > 0) {
  buildDots();
  startAutoSlide();
}

/* ============================================================
   6. CONTACT FORM — VALIDATION + LOADING SPINNER
   ============================================================ */
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const spinner = document.getElementById('spinner');
const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
const formStatus = document.getElementById('formStatus');
const contactEndpoint = 'https://formsubmit.co/ajax/md10elias10ali2002@gmail.com';

/**
 * Basic email format validation using a regex pattern.
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show a subtle error state on an input by adding a red border
 * and then removing it after a short delay.
 */
function showInputError(input) {
  input.style.borderColor = '#f43f5e';
  input.style.boxShadow = '0 0 0 4px rgba(244, 63, 94, 0.15)';

  setTimeout(() => {
    input.style.borderColor = '';
    input.style.boxShadow = '';
  }, 2200);
}

/**
 * Validate and submit the form through FormSubmit's AJAX endpoint.
 */
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const messageValue = messageInput.value.trim();

    let hasError = false;

    // --- Name validation ---
    if (nameValue.length < 2) {
      showInputError(nameInput);
      hasError = true;
    }

    // --- Email validation ---
    if (!isValidEmail(emailValue)) {
      showInputError(emailInput);
      hasError = true;
    }

    // --- Message validation ---
    if (messageValue.length < 10) {
      showInputError(messageInput);
      hasError = true;
    }

    if (hasError) return;

    // --- Start loading state ---
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
      const formData = new FormData(contactForm);
      formData.set('_replyto', emailValue);
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error('The email service returned an invalid response. Please try again.');
      }

      if (!response.ok || (result.success !== 'true' && result.success !== true)) {
        throw new Error(result.message || 'The message could not be sent. Please try again.');
      }

      submitBtn.classList.remove('loading');
      btnText.textContent = 'Message Sent ✓';
      submitBtn.style.background =
        'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)';
      formStatus.textContent =
        'Your message was submitted. If this is the first submission, check your inbox for FormSubmit’s activation email.';
      formStatus.classList.add('form-status-success');
      contactForm.reset();

      setTimeout(() => {
        submitBtn.disabled = false;
        btnText.textContent = 'Send Message';
        submitBtn.style.background = '';
      }, 2500);

    } catch (error) {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
      formStatus.textContent =
        error instanceof Error
          ? error.message
          : 'The message could not be sent. Please try again.';
      formStatus.classList.add('form-status-error');
    }
  });
}

/* ============================================================
   7. BUTTON RIPPLE EFFECT (Micro-interaction)
   ============================================================ */
/**
 * Adds a subtle ripple effect to primary buttons on click,
 * enhancing the tactile feel of the UI. Purely decorative.
 */
document.querySelectorAll('.btn-primary, .btn-audit, .btn-submit').forEach((button) => {
  button.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');

    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.35);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleEffect 0.6s ease-out;
      pointer-events: none;
    `;

    // Ensure the button can contain the ripple
    if (getComputedStyle(this).position === 'static') {
      this.style.position = 'relative';
    }
    this.style.overflow = 'hidden';

    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 650);
  });
});

/**
 * Inject the ripple keyframes into the document head once.
 * Kept in JS so the effect is self-contained.
 */
(function injectRippleKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleEffect {
      to {
        transform: scale(2.5);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   8. SKILL CARD — POINTER-TRACKING GLOW (Desktop only)
   ============================================================ */
/**
 * On devices with a fine pointer (mouse), track the cursor
 * position over each skill card and set CSS custom properties
 * so a radial glow can follow the pointer. This is purely
 * progressive enhancement.
 */
if (window.matchMedia('(pointer: fine)').matches) {
  const skillCards = document.querySelectorAll('.skill-card');

  skillCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.background = `
        radial-gradient(
          300px circle at ${x}px ${y}px,
          rgba(124, 58, 237, 0.15),
          rgba(255, 255, 255, 0.045) 60%
        )
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

/* ============================================================
   9. WORK CARDS — PARALLAX BACKGROUND (Subtle)
   ============================================================ */
/**
 * Adds a very subtle parallax translation to the work card
 * background images as the user scrolls. Kept lightweight.
 */
const workCards = document.querySelectorAll('.work-card');

if (workCards.length > 0 && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(() => {
      workCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Only animate when the card is in the viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          const bg = card.querySelector('.work-bg');
          if (bg) {
            bg.style.transform = `scale(1.05) translateY(${(progress - 0.5) * 20}px)`;
          }
        }
      });
    });
  });
}

/* ============================================================
   10. YEAR AUTO-UPDATE IN FOOTER
   ============================================================ */
/**
 * Dynamically set the current year in the footer copyright
 * notice so it never goes stale.
 */
const footerYear = document.querySelector('.footer-col p');
if (footerYear && footerYear.textContent.includes('©')) {
  const currentYear = new Date().getFullYear();
  footerYear.textContent = `© ${currentYear} All rights reserved.`;
}

/* ============================================================
   11. PERFORMANCE — LOG A READY MESSAGE
   ============================================================ */
console.log(
  '%c MD ELIAS ALI · Portfolio ',
  'background: linear-gradient(135deg, #7c3aed, #06b6d4); color: #fff; font-weight: 700; padding: 6px 14px; border-radius: 6px; font-size: 13px;'
);
console.log(
  '%c Digital Marketing Portfolio — Loaded successfully ✓ ',
  'color: #10b981; font-weight: 600; font-size: 12px;'
);
