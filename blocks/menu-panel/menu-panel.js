/**
 * Menu Panel block — blue overlay.
 *
 * Mobile: full-screen accordion (About, Future Showings, Contact Us)
 * Desktop: two-column layout (nav links + description) on right 65%
 *
 * Content rows from DA:
 *   Row 1: navigation links (About, Future Showings, Contact Us)
 *   Row 2: description text + Read more link
 *   Row 3: col 1 = experience info, col 2 = contact info
 * @param {Element} block
 */
export default function decorate(block) {
  const panel = document.createElement('div');
  panel.className = 'menu-panel-inner';

  const rows = [...block.children];

  // Gather nav items from row 1
  const linkEls = rows[0]?.querySelectorAll('a');
  const navItems = linkEls?.length
    ? [...linkEls]
    : [...(rows[0]?.querySelectorAll('li, p') || [])];

  // Gather description HTML from row 2
  let descHtml = '';
  if (rows[1]) {
    const wrapper = rows[1].querySelector('div') || rows[1];
    descHtml = wrapper.innerHTML;
  }

  // Gather row 3 columns content
  const row3Cols = rows[2] ? [...rows[2].children] : [];
  const futureShowingsHtml = row3Cols[0]?.innerHTML || '';
  const contactHtml = row3Cols[1]?.innerHTML || '';

  // Map accordion content by item title
  function getAccordionBody(title) {
    const t = title.toLowerCase();
    if (t.includes('about')) return descHtml;
    if (t.includes('future') || t.includes('showing')) {
      return futureShowingsHtml;
    }
    if (t.includes('contact')) return contactHtml;
    return '';
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
  navItems.forEach((item) => {
    const title = item.textContent.trim();
    const details = document.createElement('details');
    details.className = 'menu-panel-item';
    const summary = document.createElement('summary');
    summary.className = 'menu-panel-item-title';
    summary.textContent = title;
    const body = document.createElement('div');
    body.className = 'menu-panel-item-body';
    body.innerHTML = getAccordionBody(title);
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
  closeX.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24"
    fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor"
    stroke-width="2.5" stroke-linecap="round"/></svg>`;

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
