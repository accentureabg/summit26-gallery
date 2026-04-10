/**
 * Product Cards block — gallery grid of product items.
 *
 * Data source: /products.json (spreadsheet in DA)
 * Expected columns: SessionID, Name, Long Description, Created By, Image URL
 * Optional columns: Brief Description, Site URL, Date Created
 *
 * Sheet-only: page is blank if no data in the sheet.
 *
 * Clicking a card opens the product-detail modal.
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

  // body: session ID + name
  const bodyWrap = document.createElement('div');
  bodyWrap.className = 'product-card-body';

  const num = document.createElement('span');
  num.className = 'product-card-number';
  num.textContent = product.SessionID || '';
  bodyWrap.append(num);

  const descEl = document.createElement('span');
  descEl.className = 'product-card-desc';
  descEl.textContent = product.Name || '';
  bodyWrap.append(descEl);

  li.append(bodyWrap);

  // store data for modal
  if (product['Created By']) li.dataset.creator = product['Created By'];
  if (product['Long Description']) li.dataset.description = product['Long Description'];
  if (product['Site URL']) li.dataset.siteUrl = product['Site URL'];
  if (product['Date Created']) li.dataset.dateCreated = product['Date Created'];

  // click to open modal
  li.addEventListener('click', () => {
    const event = new CustomEvent('product-detail-open', {
      detail: {
        image: li.querySelector('.product-card-image img')?.cloneNode(true),
        number: product.SessionID,
        name: product.Name,
        description: product['Long Description'] || product.Name,
        creator: product['Created By'],
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

async function renderCardsFromSheet(block) {
  try {
    const resp = await fetch('/products.json');
    if (!resp.ok) return false;
    const json = await resp.json();
    const products = json.data || json;
    if (!products.length) return false;

    const ul = document.createElement('ul');
    products.forEach((product) => {
      ul.append(createCard(product));
    });

    block.replaceChildren(ul);
    return true;
  } catch {
    return false;
  }
}

export default async function decorate(block) {
  // Clear authored content — sheet is the only data source
  block.textContent = '';

  await renderCardsFromSheet(block);
}
