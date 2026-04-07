/**
 * Product Cards block — gallery grid of product items.
 * Each row: image | product number + description
 * Clicking a card opens the product-detail modal.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'product-card';

    const cols = [...row.children];
    const imageCol = cols[0];
    const bodyCol = cols[1];

    // image
    if (imageCol) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'product-card-image';
      const pic = imageCol.querySelector('picture') || imageCol.querySelector('img');
      if (pic) imageWrap.append(pic);
      li.append(imageWrap);
    }

    // body: product number + description
    if (bodyCol) {
      const bodyWrap = document.createElement('div');
      bodyWrap.className = 'product-card-body';

      const productNum = bodyCol.querySelector('h3, h4, strong');
      if (productNum) {
        const num = document.createElement('span');
        num.className = 'product-card-number';
        num.textContent = productNum.textContent;
        bodyWrap.append(num);
      }

      const desc = bodyCol.querySelector('p:not(:has(strong)):not(:has(a))');
      if (desc) {
        const descEl = document.createElement('span');
        descEl.className = 'product-card-desc';
        descEl.textContent = desc.textContent;
        bodyWrap.append(descEl);
      }

      // store full description + creator for the modal
      const creator = bodyCol.querySelector('em');
      if (creator) li.dataset.creator = creator.textContent;

      const fullDesc = bodyCol.querySelector('p:nth-of-type(2)');
      if (fullDesc) li.dataset.description = fullDesc.textContent;

      const link = bodyCol.querySelector('a');
      if (link) li.dataset.link = link.href;

      li.append(bodyWrap);
    }

    // click to open modal
    li.addEventListener('click', () => {
      const event = new CustomEvent('product-detail-open', {
        detail: {
          image: li.querySelector('.product-card-image picture, .product-card-image img')?.cloneNode(true),
          number: li.querySelector('.product-card-number')?.textContent,
          description: li.dataset.description || li.querySelector('.product-card-desc')?.textContent,
          creator: li.dataset.creator,
          link: li.dataset.link,
        },
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    li.setAttribute('tabindex', '0');
    li.setAttribute('role', 'button');

    ul.append(li);
  });

  block.replaceChildren(ul);
}
