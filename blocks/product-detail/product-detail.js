/**
 * Product Detail modal block.
 * Listens for 'product-detail-open' events and displays a modal overlay
 * with the product image, number, description, creator, and link.
 * @param {Element} block
 */
export default function decorate(block) {
  // build modal structure
  const overlay = document.createElement('div');
  overlay.className = 'product-detail-overlay';

  const modal = document.createElement('div');
  modal.className = 'product-detail-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const closeBtn = document.createElement('button');
  closeBtn.className = 'product-detail-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  const imageWrap = document.createElement('div');
  imageWrap.className = 'product-detail-image';

  const content = document.createElement('div');
  content.className = 'product-detail-content';

  modal.append(closeBtn, imageWrap, content);
  overlay.append(modal);
  block.replaceChildren(overlay);

  function closeModal() {
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  // close on button click
  closeBtn.addEventListener('click', closeModal);

  // close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  // listen for product detail events
  document.addEventListener('product-detail-open', (e) => {
    const {
      image, number, description, creator, link,
    } = e.detail;

    // set image
    imageWrap.innerHTML = '';
    if (image) {
      imageWrap.append(image);
    }

    // set content
    let html = '<div class="product-detail-meta">';
    html += `<div class="product-detail-field"><span class="product-detail-label">Project</span><span class="product-detail-value">${number || ''}</span></div>`;
    html += `<div class="product-detail-field product-detail-field-desc"><span class="product-detail-label">Description</span><span class="product-detail-value">${description || ''}</span></div>`;
    html += '</div>';

    if (creator) {
      html += `<div class="product-detail-creator"><span class="product-detail-label">Created by</span><span class="product-detail-value product-detail-creator-name">${creator}</span></div>`;
    }

    if (link) {
      html += `<a href="${link}" class="product-detail-link" target="_blank" rel="noopener noreferrer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12"/><path d="M10 8l4 4-4 4" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
        Product Site
      </a>`;
    }

    content.innerHTML = html;

    overlay.classList.add('open');
    document.body.classList.add('modal-open');
    closeBtn.focus();
  });
}
