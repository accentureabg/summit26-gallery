/**
 * Product List block — table view of products.
 *
 * Data source: /products.json (spreadsheet in DA)
 * Expected columns: SessionID, Name, Long Description, Created By, Image URL
 *
 * Sheet-only: list is blank if no data in the sheet.
 * @param {Element} block
 */

function createRow(product) {
  const listRow = document.createElement('div');
  listRow.className = 'product-list-row';
  listRow.setAttribute('tabindex', '0');
  listRow.setAttribute('role', 'button');

  // product number
  const num = document.createElement('span');
  num.className = 'product-list-col product-list-col-num';
  num.textContent = product.SessionID || '';
  listRow.append(num);

  // name
  const desc = document.createElement('span');
  desc.className = 'product-list-col product-list-col-desc';
  desc.textContent = product.Name || '';
  listRow.append(desc);

  // creator
  const creator = document.createElement('span');
  creator.className = 'product-list-col product-list-col-creator';
  creator.textContent = product['Created By'] || '';
  listRow.append(creator);

  // click to open modal
  listRow.addEventListener('click', () => {
    const img = product['Image URL'] ? document.createElement('img') : null;
    if (img) {
      img.src = product['Image URL'];
      img.alt = product.Name || '';
    }

    const event = new CustomEvent('product-detail-open', {
      detail: {
        image: img,
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

  return listRow;
}

export default async function decorate(block) {
  block.textContent = '';

  try {
    const resp = await fetch('/products.json');
    if (!resp.ok) return;
    const json = await resp.json();
    const products = json.data || json;
    if (!products.length) return;

    const table = document.createElement('div');
    table.className = 'product-list-table';

    // header row
    const headerRow = document.createElement('div');
    headerRow.className = 'product-list-header';
    headerRow.innerHTML = `
      <span class="product-list-col product-list-col-num">Product #</span>
      <span class="product-list-col product-list-col-desc">Description</span>
      <span class="product-list-col product-list-col-creator">Creator</span>
    `;
    table.append(headerRow);

    products.forEach((product) => {
      table.append(createRow(product));
    });

    block.append(table);
  } catch {
    // no data — block stays blank
  }
}
