/**
 * View Toggle block — pill-style List/Grid switcher.
 * Toggles visibility of product-cards (grid) and product-list (list) blocks.
 * @param {Element} block
 */
export default function decorate(block) {
  const toggle = document.createElement('div');
  toggle.className = 'view-toggle-pill';

  const listBtn = document.createElement('button');
  listBtn.className = 'view-toggle-btn';
  listBtn.setAttribute('data-view', 'list');
  listBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="0" y="1" width="16" height="2" rx="1"/>
    <rect x="0" y="7" width="16" height="2" rx="1"/>
    <rect x="0" y="13" width="16" height="2" rx="1"/>
  </svg>List`;

  const gridBtn = document.createElement('button');
  gridBtn.className = 'view-toggle-btn active';
  gridBtn.setAttribute('data-view', 'grid');
  gridBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="0" y="0" width="7" height="7" rx="1"/>
    <rect x="9" y="0" width="7" height="7" rx="1"/>
    <rect x="0" y="9" width="7" height="7" rx="1"/>
    <rect x="9" y="9" width="7" height="7" rx="1"/>
  </svg>Grid`;

  toggle.append(listBtn, gridBtn);
  block.replaceChildren(toggle);

  function setView(view) {
    const cards = document.querySelector('.product-cards');
    const list = document.querySelector('.product-list');

    if (view === 'grid') {
      if (cards) cards.closest('.section').style.display = '';
      if (list) list.closest('.section').style.display = 'none';
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    } else {
      if (cards) cards.closest('.section').style.display = 'none';
      if (list) list.closest('.section').style.display = '';
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    }
  }

  listBtn.addEventListener('click', () => setView('list'));
  gridBtn.addEventListener('click', () => setView('grid'));

  // default: show grid, hide list
  // defer to allow other blocks to load
  requestAnimationFrame(() => setView('grid'));
}
