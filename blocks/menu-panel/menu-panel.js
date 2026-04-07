/**
 * Menu Panel block — blue slide-out panel.
 * Content rows:
 *   Row 1: navigation links (About, Contact Us, Legal)
 *   Row 2: description text
 *   Row 3: company info + contact/social links
 * @param {Element} block
 */
export default function decorate(block) {
  const panel = document.createElement('div');
  panel.className = 'menu-panel-inner';

  // close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'menu-panel-close';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
  panel.append(closeBtn);

  // content area — two column layout
  const contentGrid = document.createElement('div');
  contentGrid.className = 'menu-panel-grid';

  const rows = [...block.children];

  // left column: nav links
  const leftCol = document.createElement('div');
  leftCol.className = 'menu-panel-nav';

  if (rows[0]) {
    const label = document.createElement('span');
    label.className = 'menu-panel-label';
    label.textContent = 'Project';
    leftCol.append(label);

    const links = rows[0].querySelectorAll('a');
    if (links.length) {
      links.forEach((a) => {
        const navLink = document.createElement('a');
        navLink.href = a.href;
        navLink.className = 'menu-panel-link';
        navLink.textContent = a.textContent;
        leftCol.append(navLink);
      });
    } else {
      // plain text list items
      const items = rows[0].querySelectorAll('li, p');
      items.forEach((item) => {
        const navLink = document.createElement('span');
        navLink.className = 'menu-panel-link';
        navLink.textContent = item.textContent;
        leftCol.append(navLink);
      });
    }
  }

  // right column: description
  const rightCol = document.createElement('div');
  rightCol.className = 'menu-panel-desc';

  if (rows[1]) {
    const label = document.createElement('span');
    label.className = 'menu-panel-label';
    label.textContent = 'Description';
    rightCol.append(label);

    const descText = document.createElement('p');
    descText.className = 'menu-panel-desc-text';
    descText.textContent = rows[1].textContent.trim();
    rightCol.append(descText);
  }

  contentGrid.append(leftCol, rightCol);

  // footer area: company info + contact links
  const footer = document.createElement('div');
  footer.className = 'menu-panel-footer';

  if (rows[2]) {
    const cols = [...rows[2].children];
    cols.forEach((col) => {
      const section = document.createElement('div');
      section.className = 'menu-panel-footer-col';

      const heading = col.querySelector('h3, h4, strong');
      if (heading) {
        const label = document.createElement('span');
        label.className = 'menu-panel-label';
        label.textContent = heading.textContent;
        section.append(label);
      }

      const paras = col.querySelectorAll('p');
      paras.forEach((p) => {
        if (p.querySelector('strong') || p.querySelector('h3') || p.querySelector('h4')) return;
        const text = document.createElement('p');
        text.className = 'menu-panel-footer-text';
        // check for links
        const link = p.querySelector('a');
        if (link) {
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.textContent;
          text.append(a);
        } else {
          text.textContent = p.textContent;
        }
        section.append(text);
      });

      footer.append(section);
    });
  }

  panel.append(contentGrid, footer);
  block.replaceChildren(panel);

  // close handler
  closeBtn.addEventListener('click', () => {
    block.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
}
