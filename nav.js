// Mobile hamburger navigation. Collapses the header's page links behind a ☰ that
// opens a right slide-in drawer; desktop is untouched (links stay inline, the ☰
// and drawer are hidden by CSS above 760px). Loaded on every page. The
// Recap/Detailed view toggle deliberately stays in the header, not the drawer.
(function () {
  const actions = document.querySelector('.header-actions');
  if (!actions) return;
  const links = [...actions.querySelectorAll('.nav-link')];
  if (!links.length) return;

  const burger = document.createElement('button');
  burger.type = 'button';
  burger.className = 'nav-burger';
  burger.setAttribute('aria-label', 'Open navigation menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-controls', 'nav-drawer');
  burger.innerHTML = '<span></span><span></span><span></span>';
  // Anchor to the header (not the actions row) so CSS can pin it to the corner.
  (actions.closest('.site-header') || actions).appendChild(burger);

  const scrim = document.createElement('div');
  scrim.className = 'nav-scrim';

  const drawer = document.createElement('nav');
  drawer.className = 'nav-drawer';
  drawer.id = 'nav-drawer';
  drawer.setAttribute('aria-label', 'Pages');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-drawer-close';
  close.setAttribute('aria-label', 'Close navigation menu');
  close.innerHTML = '×';
  drawer.appendChild(close);

  // Clone the links so the desktop originals stay in place.
  links.forEach(l => {
    const a = l.cloneNode(true);
    a.classList.add('nav-drawer-link');
    drawer.appendChild(a);
  });

  document.body.append(scrim, drawer);

  function open() {
    document.body.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
    drawer.querySelector('.nav-drawer-link')?.focus();
  }
  function closeDrawer(refocus) {
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
    if (refocus) burger.focus();
  }

  burger.addEventListener('click', open);
  close.addEventListener('click', () => closeDrawer(true));
  scrim.addEventListener('click', () => closeDrawer(true));
  // Tapping a link navigates away; close first so a same-page link still resets.
  drawer.addEventListener('click', (e) => { if (e.target.closest('.nav-drawer-link')) closeDrawer(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(true); });
})();
