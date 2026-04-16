/**
 * Menu Panel block — blue overlay.
 *
 * Mobile: full-screen accordion (About, Future Showings, Contact Us)
 * Desktop: two-column layout (nav links + description) on right 65%
 *
 * Content rows from DA:
 *   Row 1: navigation links
 *   Row 2: description text
 *   Row 3: company info + contact/social links
 * @param {Element} block
 */
export default function decorate(block) {
  const panel = document.createElement('div');
  panel.className = 'menu-panel-inner';

  const rows = [...block.children];

  // Gather nav items
  const linkEls = rows[0]?.querySelectorAll('a');
  const navItems = linkEls?.length
    ? [...linkEls]
    : [...(rows[0]?.querySelectorAll('li, p') || [])];

  // Gather description text
  let descHtml = '';
  if (rows[1]) {
    const paras = rows[1].querySelectorAll('p');
    paras.forEach((p) => {
      descHtml += `<p>${p.innerHTML}</p>`;
    });
    if (!paras.length) descHtml = `<p>${rows[1].textContent.trim()}</p>`;
  }

  // Gather contact content for accordion
  let contactHtml = '';
  if (rows[1]) contactHtml += rows[1].textContent.trim();
  if (rows[2]) {
    const paras = rows[2].querySelectorAll('p');
    paras.forEach((p) => {
      const link = p.querySelector('a');
      if (link) {
        contactHtml += `<br><br><a href="${link.href}">${link.textContent}</a>`;
      } else if (!p.querySelector('strong')) {
        contactHtml += `<br>${p.textContent.trim()}`;
      }
    });
  }

  // === MOBILE: Header + Accordion ===
  const mobileView = document.createElement('div');
  mobileView.className = 'menu-panel-mobile';

  const mobileHeader = document.createElement('div');
  mobileHeader.className = 'menu-panel-header';
  const brand = document.createElement('span');
  brand.className = 'menu-panel-brand';
  brand.textContent = 'Product Creation Lab';
  const closeText = document.createElement('button');
  closeText.className = 'menu-panel-close-text';
  closeText.textContent = 'Close';
  mobileHeader.append(brand, closeText);

  const accordion = document.createElement('div');
  accordion.className = 'menu-panel-accordion';
  navItems.forEach((item, i) => {
    const details = document.createElement('details');
    details.className = 'menu-panel-item';
    const summary = document.createElement('summary');
    summary.className = 'menu-panel-item-title';
    summary.textContent = item.textContent.trim();
    const body = document.createElement('div');
    body.className = 'menu-panel-item-body';
    if (i === navItems.length - 1 && contactHtml) {
      body.innerHTML = contactHtml;
    } else {
      body.textContent = 'Coming soon.';
    }
    details.append(summary, body);
    accordion.append(details);
  });

  mobileView.append(mobileHeader, accordion);

  // === DESKTOP: Two-column + X close ===
  const desktopView = document.createElement('div');
  desktopView.className = 'menu-panel-desktop';

  const closeX = document.createElement('button');
  closeX.className = 'menu-panel-close-x';
  closeX.setAttribute('aria-label', 'Close menu');
  closeX.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;

  const desktopGrid = document.createElement('div');
  desktopGrid.className = 'menu-panel-grid';

  // Left: nav links
  const navCol = document.createElement('div');
  navCol.className = 'menu-panel-nav';
  const menuLabel = document.createElement('span');
  menuLabel.className = 'menu-panel-label';
  menuLabel.textContent = 'Menu';
  navCol.append(menuLabel);
  navItems.forEach((item) => {
    const a = document.createElement('a');
    a.href = item.href || '#';
    a.className = 'menu-panel-link';
    a.textContent = item.textContent.trim();
    navCol.append(a);
  });

  // Right: description
  const descCol = document.createElement('div');
  descCol.className = 'menu-panel-desc';
  descCol.innerHTML = descHtml;

  desktopGrid.append(navCol, descCol);
  desktopView.append(closeX, desktopGrid);

  panel.append(mobileView, desktopView);
  block.replaceChildren(panel);

  // Close handlers
  function closeMenu() {
    block.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  closeText.addEventListener('click', closeMenu);
  closeX.addEventListener('click', closeMenu);
}
