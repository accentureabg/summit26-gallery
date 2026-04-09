import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Assign nav classes: first = brand, last = tools, middle = sections
  const sections = [...nav.children];
  if (sections.length >= 1) sections[0].classList.add('nav-brand');
  if (sections.length >= 3) {
    sections[sections.length - 1].classList.add('nav-tools');
    sections.slice(1, -1).forEach((s) => s.classList.add('nav-sections'));
  } else if (sections.length === 2) {
    sections[1].classList.add('nav-tools');
  }

  // clean up brand link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
  }

  // wire up menu trigger — find Menu link in any nav section
  const menuLink = nav.querySelector('a[href="#"], a[href*="menu"]');
  if (menuLink) {
    menuLink.addEventListener('click', (e) => {
      e.preventDefault();
      const menuPanel = document.querySelector('.menu-panel');
      if (menuPanel) {
        menuPanel.classList.toggle('open');
        document.body.classList.toggle('menu-open');
      }
    });
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
