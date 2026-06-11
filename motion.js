// Shared motion helpers — dependency-free, reduced-motion aware.
// Loaded first on every page so CSS can gate hidden states on `.js-reveal`.
//
// Reveal uses a scroll-position check (not IntersectionObserver) because some
// embedded/preview iframes never deliver IO callbacks, which would leave
// content stuck hidden. A rAF-throttled rect test works everywhere.
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Gate reveal base-states on a live JS document.
  document.documentElement.classList.add('js-reveal');

  const watched = new Set();
  let ticking = false;

  function reveal(el) {
    el.classList.add('is-in');
    watched.delete(el);
    // Safety net: force the final visible state on a wall clock, so content can
    // never stay stuck at a transition/animation start frame if the paint clock
    // is throttled (background/preview tabs). Generous so the longest staggered
    // entrance (the By Year chart) can fully play in a live tab first.
    setTimeout(() => el.classList.add('reveal-done'), 1600);
  }

  function check() {
    ticking = false;
    if (!watched.size) return;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const trigger = vh * 0.94;            // reveal a touch before fully in view
    for (const el of [...watched]) {
      const r = el.getBoundingClientRect();
      // visible (or above) the trigger line, and not entirely scrolled past
      if (r.top < trigger && r.bottom > -40) reveal(el);
    }
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    // rAF where available; setTimeout fallback because some preview iframes
    // throttle rAF when not actively painting.
    const raf = window.requestAnimationFrame || ((fn) => setTimeout(fn, 16));
    raf(check);
    setTimeout(() => { if (ticking) check(); }, 32);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  function add(el) {
    if (!el || el.classList.contains('is-in')) return;
    if (reduce) { el.classList.add('is-in'); return; }  // show immediately
    watched.add(el);
  }

  // Public: reveal a list/NodeList of elements as they scroll into view.
  window.revealOnScroll = function (els) {
    [...els].forEach(add);
    check();              // reveal anything already in view, synchronously
    schedule();
    setTimeout(check, 120); // settle late layout
  };

  // Public: reveal a single element once it enters the viewport.
  window.revealEl = function (el) { window.revealOnScroll([el]); };

  // Auto-wire static [data-reveal] elements, with a small document-order stagger.
  function wireStatic() {
    const statics = document.querySelectorAll('[data-reveal]');
    statics.forEach((el, i) => {
      if (el.style.transitionDelay === '') {
        el.style.transitionDelay = (Math.min(i, 8) * 55) + 'ms';
      }
    });
    if (statics.length) window.revealOnScroll(statics);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireStatic);
  } else {
    wireStatic();
  }
})();
