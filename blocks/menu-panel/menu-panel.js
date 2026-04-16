/**
 * Menu Panel block — full-screen blue overlay with accordion nav.
 *
 * Mobile: accordion items (About, Future Showings, Contact Us)
 * Desktop: two-column layout (nav links + description)
 *
 * Content rows from DA:
 *   Row 1: navigation links (About, Future Showings, Contact Us)
 *   Row 2: description text
 *   Row 3: company info + contact/social links
 * @param {Element} block
 */
export default function decorate(block) {
  const panel = document.createElement('div');
  panel.className = 'menu-panel-inner';

  // Header: brand + close
  const header = document.createElement('div');
  header.className = 'menu-panel-header';

  const brand = document.createElement('span');
  brand.className = 'menu-panel-brand';
  brand.textContent = 'Product Creation Lab';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'menu-panel-close';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.textContent = 'Close';

  header.append(brand, closeBtn);
  panel.append(header);

  const rows = [...block.children];

  // Build accordion from nav links (row 0) and content (rows 1-2)
  const accordion = document.createElement('div');
  accordion.className = 'menu-panel-accordion';

  if (rows[0]) {
    const links = rows[0].querySelectorAll('a');
    const items = links.length
      ? [...links]
      : [...rows[0].querySelectorAll('li, p')];

    // Get content for the last item (Contact Us) from rows 1-2
    let contactContent = '';
    if (rows[1]) {
      contactContent += rows[1].textContent.trim();
    }
    if (rows[2]) {
      const paras = rows[2].querySelectorAll('p');
      paras.forEach((p) => {
        const link = p.querySelector('a');
        if (link) {
          contactContent += `<br><br>${p.textContent.trim()}`;
          contactContent += `<br><a href="${link.href}">${link.textContent}</a>`;
        } else if (!p.querySelector('strong')) {
          contactContent += `<br>${p.textContent.trim()}`;
        }
      });
    }

    items.forEach((item, i) => {
      const details = document.createElement('details');
      details.className = 'menu-panel-item';

      const summary = document.createElement('summary');
      summary.className = 'menu-panel-item-title';
      summary.textContent = item.textContent.trim();

      const body = document.createElement('div');
      body.className = 'menu-panel-item-body';

      // Last item gets the contact content
      if (i === items.length - 1 && contactContent) {
        body.innerHTML = contactContent;
      } else {
        body.textContent = 'Coming soon.';
      }

      details.append(summary, body);
      accordion.append(details);
    });
  }

  panel.append(accordion);
  block.replaceChildren(panel);

  // close handler
  closeBtn.addEventListener('click', () => {
    block.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
}
