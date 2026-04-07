/**
 * Product List block — table view of products.
 * Each row: product number | description | creator
 * @param {Element} block
 */
export default function decorate(block) {
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

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    const listRow = document.createElement('div');
    listRow.className = 'product-list-row';
    listRow.setAttribute('tabindex', '0');
    listRow.setAttribute('role', 'button');

    // product number
    const num = document.createElement('span');
    num.className = 'product-list-col product-list-col-num';
    const numText = cols[0]?.textContent?.trim() || '';
    num.textContent = numText;
    listRow.append(num);

    // description
    const desc = document.createElement('span');
    desc.className = 'product-list-col product-list-col-desc';
    desc.textContent = cols[1]?.textContent?.trim() || '';
    listRow.append(desc);

    // creator
    const creator = document.createElement('span');
    creator.className = 'product-list-col product-list-col-creator';
    creator.textContent = cols[2]?.textContent?.trim() || '';
    listRow.append(creator);

    // click to open modal
    listRow.addEventListener('click', () => {
      // find matching image from the product-cards block
      let image;
      const cards = document.querySelectorAll('.product-card');
      cards.forEach((card) => {
        const cardNum = card.querySelector('.product-card-number');
        if (cardNum && cardNum.textContent.trim() === numText) {
          const pic = card.querySelector('.product-card-image picture, .product-card-image img');
          if (pic && !image) image = pic.cloneNode(true);
        }
      });

      // find full description from the matching card
      let fullDesc = cols[1]?.textContent?.trim();
      cards.forEach((card) => {
        const cardNum = card.querySelector('.product-card-number');
        if (cardNum && cardNum.textContent.trim() === numText && card.dataset.description) {
          fullDesc = card.dataset.description;
        }
      });

      const event = new CustomEvent('product-detail-open', {
        detail: {
          image,
          number: numText,
          description: fullDesc,
          creator: cols[2]?.textContent?.trim(),
        },
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    table.append(listRow);
  });

  block.replaceChildren(table);
}
