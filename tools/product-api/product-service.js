/**
 * Product Service — high-level API for adding products to the gallery.
 * Handles image upload, page content mutation, and preview triggering.
 *
 * Called by the React voice-driven AI workflow after generating a product.
 */

import DAClient from './da-client.js';

const GALLERY_PAGE = '/index';

/**
 * Build a product card HTML snippet for insertion into the product-cards block.
 */
function buildCardHTML({ number, name, description, creator, imageUrl }) {
  return `    <div>
      <div><picture><img src="${imageUrl}" alt="${name}"></picture></div>
      <div><h3>${number}</h3><p>${name}</p><p>${description}</p><em>${creator}</em></div>
    </div>`;
}

/**
 * Build a product list row HTML snippet for insertion into the product-list block.
 */
function buildListRowHTML({ number, name, creator }) {
  return `    <div><div>${number}</div><div>${name}</div><div>${creator}</div></div>`;
}

/**
 * Insert a new product into the gallery page HTML.
 * Appends the product to both the product-cards and product-list blocks.
 *
 * @param {string} html - Current page HTML
 * @param {object} product - Product data with imageUrl already resolved
 * @returns {string} Updated page HTML
 */
export function addProductToPage(html, product) {
  // Insert into product-cards block (before the closing </div> of the block)
  const cardsEndTag = '</div>\n  </div>\n</div>\n<div>\n  <div class="product-list">';
  const cardHTML = buildCardHTML(product);
  const updatedCards = html.replace(
    cardsEndTag,
    `${cardHTML}\n  </div>\n</div>\n<div>\n  <div class="product-list">`,
  );

  // Insert into product-list block (before the closing </div> of the block)
  const listEndTag = '</div>\n</div>\n<div>\n  <div class="view-toggle">';
  const listRowHTML = buildListRowHTML(product);
  const updatedBoth = updatedCards.replace(
    listEndTag,
    `${listRowHTML}\n  </div>\n</div>\n<div>\n  <div class="view-toggle">`,
  );

  return updatedBoth;
}

/**
 * Add a product to the gallery — full pipeline.
 *
 * @param {object} opts
 * @param {string} opts.number      - Product number (e.g. '010')
 * @param {string} opts.name        - Product name
 * @param {string} opts.description - Full product description
 * @param {string} opts.creator     - Creator name
 * @param {Buffer|Blob|ArrayBuffer} opts.image - Image binary data
 * @param {string} opts.imageName   - Image filename (e.g. 'product-010.png')
 * @param {DAClient} opts.daClient  - Authenticated DA client instance
 * @returns {Promise<{imageUrl: string, previewUrl: string}>}
 */
export async function addProduct({
  number, name, description, creator, image, imageName, daClient,
}) {
  // 1. Upload image to DA media
  const imageUrl = await daClient.uploadMedia(image, imageName);

  // 2. Get current page content
  const currentHTML = await daClient.getPageContent(GALLERY_PAGE);

  // 3. Insert the new product
  const updatedHTML = addProductToPage(currentHTML, {
    number, name, description, creator, imageUrl,
  });

  // 4. Save updated page back to DA
  await daClient.updatePage(GALLERY_PAGE, updatedHTML);

  // 5. Trigger preview so the page is live
  const preview = await daClient.triggerPreview(GALLERY_PAGE);

  return {
    imageUrl,
    previewUrl: preview?.preview?.url || `https://main--${daClient.repo}--${daClient.org}.aem.page/`,
  };
}
