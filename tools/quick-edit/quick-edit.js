import { loadPage } from '../../scripts/scripts.js';

const importMap = {
  imports: {
    'da-lit': 'https://da.live/deps/lit/dist/index.js',
    'da-y-wrapper': 'https://da.live/deps/da-y-wrapper/dist/index.js',
  },
};

function addImportmap() {
  const importmapEl = document.createElement('script');
  importmapEl.type = 'importmap';
  importmapEl.textContent = JSON.stringify(importMap);
  document.head.appendChild(importmapEl);
}

function injectPublishButton() {
  const buttonsBar = document.querySelector('.quick-edit-buttons');
  if (!buttonsBar || buttonsBar.querySelector('.quick-edit-publish')) return;

  const style = document.createElement('style');
  style.textContent = `
    .quick-edit-publish {
      display: flex;
      background: #0078d4;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .quick-edit-publish:hover { background: #0067b8; }
    .quick-edit-publish:disabled { background: #999; cursor: not-allowed; }
    .quick-edit-buttons { display: flex !important; }
    .quick-edit-buttons .quick-edit-exit,
    .quick-edit-buttons .quick-edit-preview,
    .quick-edit-buttons .quick-edit-publish { display: flex !important; }
    .quick-edit-buttons .quick-edit-close { display: none !important; }
  `;
  document.head.appendChild(style);

  const publishBtn = document.createElement('button');
  publishBtn.className = 'quick-edit-publish';
  publishBtn.textContent = 'Publish';

  publishBtn.addEventListener('click', async () => {
    publishBtn.disabled = true;
    publishBtn.textContent = 'Publishing...';

    try {
      let { hostname } = window.location;
      if (hostname === 'localhost') {
        const meta = document.querySelector('meta[property="hlx:proxyUrl"]');
        if (meta) hostname = meta.content;
      }
      const parts = hostname.split('.')[0].split('--');
      const [, repo, owner] = parts;
      const pagePath = window.location.pathname === '/' ? '/index' : window.location.pathname;

      const resp = await fetch(`https://admin.hlx.page/live/${owner}/${repo}/main${pagePath}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (resp.ok) {
        publishBtn.textContent = 'Published!';
      } else {
        publishBtn.textContent = 'Failed';
      }
    } catch {
      publishBtn.textContent = 'Failed';
    }

    setTimeout(() => { publishBtn.textContent = 'Publish'; publishBtn.disabled = false; }, 2000);
  });

  const previewBtn = buttonsBar.querySelector('.quick-edit-preview');
  if (previewBtn) {
    previewBtn.after(publishBtn);
  } else {
    buttonsBar.appendChild(publishBtn);
  }
}

async function loadModule(origin, payload) {
  const { default: loadQuickEdit } = await import(`${origin}/nx/public/plugins/quick-edit/quick-edit.js`);

  // Watch for quick-edit buttons to appear and inject Publish
  const observer = new MutationObserver(injectPublishButton);
  observer.observe(document.body, { childList: true, subtree: true });

  loadQuickEdit(payload, loadPage);
}

// creates sidekick payload when loading QE from query param
function generateSidekickPayload() {
  let { hostname } = window.location;
  if (hostname === 'localhost') {
    hostname = document.querySelector('meta[property="hlx:proxyUrl"]').content;
  }
  const parts = hostname.split('.')[0].split('--');
  const [, repo, owner] = parts;

  return {
    detail: {
      config: { mountpoint: `https://content.da.live/${owner}/${repo}/` },
      location: { pathname: window.location.pathname },
    },
  };
}

export default function init(payload) {
  const { search } = window.location;
  const ref = new URLSearchParams(search).get('quick-edit');
  let origin;
  if (ref === 'on' || !ref) origin = 'https://da.live';
  if (ref === 'local') origin = 'http://localhost:6456';
  if (!origin) origin = `https://${ref}--da-nx--adobe.aem.live`;
  addImportmap();
  loadModule(origin, payload || generateSidekickPayload());
}
