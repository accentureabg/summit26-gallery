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

  // Assign nav classes: first = brand, section with menu link = tools, rest = sections
  const navSections = [...nav.children];
  if (navSections.length >= 1) navSections[0].classList.add('nav-brand');
  const toolsSection = navSections.find((s, i) => i > 0 && s.querySelector('a'));
  if (toolsSection) {
    toolsSection.classList.add('nav-tools');
  }
  navSections.forEach((s, i) => {
    if (i > 0 && s !== toolsSection) s.classList.add('nav-sections');
  });

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
