/**
 * Product Cards block — gallery grid of product items.
 *
 * Data source: /products.json (spreadsheet in DA)
 * Expected columns: number, name, description, creator, image
 *
 * Fallback: if the block has authored rows (image | text), uses those instead.
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
  if (product.image) {
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name || '';
    img.loading = 'lazy';
    imageWrap.append(img);
  }
  li.append(imageWrap);

  // body: product number + name
  const bodyWrap = document.createElement('div');
  bodyWrap.className = 'product-card-body';

  const num = document.createElement('span');
  num.className = 'product-card-number';
  num.textContent = product.number || '';
  bodyWrap.append(num);

  const descEl = document.createElement('span');
  descEl.className = 'product-card-desc';
  descEl.textContent = product.name || '';
  bodyWrap.append(descEl);

  li.append(bodyWrap);

  // store data for modal
  if (product.creator) li.dataset.creator = product.creator;
  if (product.description) li.dataset.description = product.description;

  // click to open modal
  li.addEventListener('click', () => {
    const event = new CustomEvent('product-detail-open', {
      detail: {
        image: li.querySelector('.product-card-image img')?.cloneNode(true),
        number: product.number,
        description: product.description || product.name,
        creator: product.creator,
      },
      bubbles: true,
    });
    document.dispatchEvent(event);
  });

  li.setAttribute('tabindex', '0');
  li.setAttribute('role', 'button');

  return li;
}

function renderCardsFromRows(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    const imageCol = cols[0];
    const bodyCol = cols[1];

    const product = {};

    // image
    const pic = imageCol?.querySelector('picture, img');
    if (pic) product.image = pic.querySelector('img')?.src || pic.src;

    // body
    if (bodyCol) {
      const productNum = bodyCol.querySelector('h3, h4, strong');
      if (productNum) product.number = productNum.textContent;

      const paragraphs = bodyCol.querySelectorAll('p');
      if (paragraphs[0]) product.name = paragraphs[0].textContent;
      if (paragraphs[1]) product.description = paragraphs[1].textContent;

      const creator = bodyCol.querySelector('em');
      if (creator) product.creator = creator.textContent;
    }

    ul.append(createCard(product));
  });

  block.replaceChildren(ul);
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
  // Try sheet first, fall back to authored content
  const loaded = await renderCardsFromSheet(block);
  if (!loaded) {
    renderCardsFromRows(block);
  }
}
