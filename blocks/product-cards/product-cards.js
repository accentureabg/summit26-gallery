/**
 * Product Cards block — gallery grid of product items.
 *
 * Data source: /form.json (spreadsheet in DA)
 * Expected columns: SessionID, Name, Long Description, Created By, Image URL
 * Optional columns: Brief Description, Site URL, Date Created
 *
 * Mobile: single card carousel with arrows and counter.
 * Tablet/Desktop: grid view.
 *
 * @param {Element} block
 */

function createCard(product) {
  const li = document.createElement('li');
  li.className = 'product-card';

  // image
  const imageWrap = document.createElement('div');
  imageWrap.className = 'product-card-image';
  if (product['Image URL']) {
    const img = document.createElement('img');
    img.src = product['Image URL'];
    img.alt = product.Name || '';
    img.loading = 'lazy';
    imageWrap.append(img);
  }
  li.append(imageWrap);

  // body: name + brief description
  const bodyWrap = document.createElement('div');
  bodyWrap.className = 'product-card-body';

  const nameEl = document.createElement('span');
  nameEl.className = 'product-card-number';
  nameEl.textContent = product.Name || '';
  bodyWrap.append(nameEl);

  const descEl = document.createElement('span');
  descEl.className = 'product-card-desc';
  descEl.textContent = product['Brief Description'] || '';
  bodyWrap.append(descEl);

  li.append(bodyWrap);

  // store data for modal
  if (product.Designer) li.dataset.creator = product.Designer;
  if (product['Long Description']) {
    li.dataset.description = product['Long Description'];
  }
  if (product['Site URL']) li.dataset.siteUrl = product['Site URL'];
  if (product['Date Created']) {
    li.dataset.dateCreated = product['Date Created'];
  }

  // click to open modal
  li.addEventListener('click', () => {
    const event = new CustomEvent('product-detail-open', {
      detail: {
        image: li.querySelector('.product-card-image img')
          ?.cloneNode(true),
        number: product['Session ID'] || product.SessionID,
        name: product.Name,
        description: product['Long Description'] || product.Name,
        creator: product.Designer,
        siteUrl: product['Site URL'],
        dateCreated: product['Date Created'],
      },
      bubbles: true,
    });
    document.dispatchEvent(event);
  });

  li.setAttribute('tabindex', '0');
  li.setAttribute('role', 'button');

  return li;
}

function addMobileNav(block, ul) {
  const cards = ul.querySelectorAll('.product-card');
  const total = cards.length;
  if (total === 0) return;

  // Counter
  const counter = document.createElement('div');
  counter.className = 'product-cards-counter';
  counter.textContent = `1/${total}`;

  // Nav arrows
  const nav = document.createElement('div');
  nav.className = 'product-cards-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'product-cards-prev';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '&#8249;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'product-cards-next';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '&#8250;';

  nav.append(prevBtn, nextBtn);

  // Update counter and info name on scroll
  function updateCounter() {
    const { scrollLeft } = ul;
    const cardWidth = cards[0].offsetWidth;
    const gap = parseInt(getComputedStyle(ul).gap, 10) || 0;
    const idx = Math.round(scrollLeft / (cardWidth + gap));
    const current = Math.min(Math.max(idx + 1, 1), total);
    counter.textContent = `${current}/${total}`;
    const card = cards[Math.min(idx, total - 1)];
    if (card && infoName) {
      infoName.textContent = card.querySelector(
        '.product-card-number',
      )?.textContent || '';
    }
  }

  function scrollToCard(direction) {
    const cardWidth = cards[0].offsetWidth;
    const gap = parseInt(getComputedStyle(ul).gap, 10) || 0;
    ul.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: 'smooth',
    });
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    scrollToCard(-1);
  });
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    scrollToCard(1);
  });
  ul.addEventListener('scroll', updateCounter);

  // Wrap card info + counter in a row below the carousel
  const infoRow = document.createElement('div');
  infoRow.className = 'product-cards-info';

  // Show first card's info initially
  const firstCard = cards[0];
  const infoName = document.createElement('span');
  infoName.className = 'product-cards-info-name';
  infoName.textContent = firstCard
    ?.querySelector('.product-card-number')?.textContent || '';

  infoRow.append(infoName, counter);
  block.append(nav, infoRow);
}

async function renderCardsFromSheet(block) {
  try {
    const resp = await fetch('/form.json');
    if (!resp.ok) return false;
    const json = await resp.json();
    const products = json.data || json;
    if (!products.length) return false;

    const ul = document.createElement('ul');
    products
      .filter((p) => p.Name && p.Name.trim())
      .reverse()
      .forEach((product) => {
        ul.append(createCard(product));
      });

    block.replaceChildren(ul);
    addMobileNav(block, ul);
    return true;
  } catch {
    return false;
  }
}

export default async function decorate(block) {
  block.textContent = '';
  await renderCardsFromSheet(block);
}
