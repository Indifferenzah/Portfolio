/**
 * portfolio.js — Portfolio page controller.
 * Handles: loading screen, navigation, scroll effects, animations.
 */

import { renderAll, observeReveal } from './renderer.js';
import { ParticleSystem } from './particles.js';
import { ANIMATION_CONFIG } from './config.js';
import { $, $$, debounce, throttle, addClass, removeClass, toggleClass } from './utils.js';

// ── Entry Point ───────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  renderAll();
  initNavigation();
  initScrollEffects();
  initRevealAnimations();
  initScrollIndicator();
  initParticles();
});

// ── Loading Screen ────────────────────────────────────────

function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  const hide = () => {
    addClass(screen, 'is-hidden');
    setTimeout(() => {
      screen.style.display = 'none';
    }, 600);
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, ANIMATION_CONFIG.loadingMinDuration);
  } else {
    window.addEventListener('load', () => {
      setTimeout(hide, ANIMATION_CONFIG.loadingMinDuration);
    });
  }
}

// ── Navigation ────────────────────────────────────────────

function initNavigation() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('nav-toggle');
  const menu    = document.getElementById('nav-menu');
  const links   = $$('.navbar__link');
  const sections = $$('section[id]');

  if (!navbar) return;

  // Hamburger toggle
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.contains('is-open');
      toggleClass(menu, 'is-open');
      toggleClass(toggle, 'is-open');
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        removeClass(menu, 'is-open');
        removeClass(toggle, 'is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        removeClass(menu, 'is-open');
        removeClass(toggle, 'is-open');
      }
    });
  }

  // Smooth scroll for nav links
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navHeight = navbar.offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  // Active section highlight (Intersection Observer)
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          toggleClass(link, 'is-active', isActive);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -60% 0px' });

  sections.forEach(s => navObserver.observe(s));
}

// ── Scroll Effects ────────────────────────────────────────

function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = throttle(() => {
    toggleClass(navbar, 'is-scrolled', window.scrollY > 60);
  }, 50);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run immediately
}

// ── Reveal Animations ─────────────────────────────────────

function initRevealAnimations() {
  // Observe all elements with .reveal class
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        addClass(entry.target, 'is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));

  // Re-run after dynamic content is rendered (give renderer time)
  setTimeout(() => {
    $$('.reveal:not(.is-visible)').forEach(el => observer.observe(el));
  }, 200);
}

// ── Scroll Indicator ──────────────────────────────────────

function initScrollIndicator() {
  const indicator = $('.scroll-indicator');
  if (!indicator) return;

  indicator.addEventListener('click', () => {
    const about = document.getElementById('about');
    if (about) about.scrollIntoView({ behavior: 'smooth' });
  });

  // Hide on scroll
  const onScroll = throttle(() => {
    toggleClass(indicator, 'is-hidden', window.scrollY > 100);
  }, 100);

  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Particles ─────────────────────────────────────────────

function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const system = new ParticleSystem(canvas);
  system.init();
}
