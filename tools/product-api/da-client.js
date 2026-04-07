/**
 * DA (Document Authoring) API client for AEM Edge Delivery Services.
 * Handles media uploads, page content updates, and preview triggers.
 *
 * Supports two auth modes:
 *   1. Direct token:       new DAClient({ token: 'IMS_TOKEN', ... })
 *   2. Client credentials: new DAClient({ clientId: '...', clientSecret: '...', ... })
 *      Token is auto-fetched and refreshed before expiry.
 *
 * Usage:
 *   const da = new DAClient({ org: 'myorg', repo: 'myrepo', clientId: '...', clientSecret: '...' });
 *   await da.uploadMedia(imageBuffer, 'product-001.png');
 *   await da.updatePage('/index', htmlContent);
 *   await da.triggerPreview('/index');
 */

const DA_ADMIN = 'https://admin.da.live';
const AEM_ADMIN = 'https://admin.hlx.page';
const IMS_TOKEN_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';
const IMS_SCOPE = 'aem.document_authoring';
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

export default class DAClient {
  /**
   * @param {object} opts
   * @param {string} opts.org    - GitHub org / DA org (e.g. 'angelaccenture')
   * @param {string} opts.repo   - Repository name (e.g. 'aem-boilerplate-demo')
   * @param {string} [opts.token]        - Direct Adobe IMS token (mode 1)
   * @param {string} [opts.clientId]     - OAuth client ID (mode 2)
   * @param {string} [opts.clientSecret] - OAuth client secret (mode 2)
   * @param {string} [opts.imsScope]     - IMS scope override
   * @param {string} [opts.branch='main'] - Git branch
   */
  constructor({
    org, repo, token, clientId, clientSecret, imsScope, branch = 'main',
  }) {
    this.org = org;
    this.repo = repo;
    this.branch = branch;

    // Auth mode
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.imsScope = imsScope || IMS_SCOPE;

    // Token state
    this._token = token || null;
    this._tokenExpiresAt = token ? Infinity : 0; // direct tokens don't auto-expire
  }

  /**
   * Get a valid access token, refreshing from IMS if needed.
   * @returns {Promise<string>}
   */
  async getToken() {
    // If using client credentials and token is expired or about to expire
    if (this.clientId && this.clientSecret) {
      const now = Date.now();
      if (!this._token || now >= this._tokenExpiresAt - TOKEN_REFRESH_BUFFER_MS) {
        await this._refreshToken();
      }
    }

    if (!this._token) {
      throw new Error(
        'No DA token available. Provide either a direct token or clientId + clientSecret.',
      );
    }

    return this._token;
  }

  /**
   * Exchange client credentials for an IMS access token.
   * @private
   */
  async _refreshToken() {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: this.imsScope,
    });

    const resp = await fetch(IMS_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`IMS token exchange failed (${resp.status}): ${text}`);
    }

    const result = await resp.json();
    this._token = result.access_token;
    // expires_in is seconds; convert to absolute ms timestamp
    this._tokenExpiresAt = Date.now() + (result.expires_in * 1000);
  }

  /**
   * Build auth headers with a valid token.
   * @returns {Promise<object>}
   */
  async getHeaders() {
    const token = await this.getToken();
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Upload a media file (image) to DA.
   * @param {Buffer|Blob|ArrayBuffer} data - Image binary data
   * @param {string} filename - e.g. 'product-001.png'
   * @param {string} [folder='/product-images'] - Target folder in DA
   * @returns {Promise<string>} The DA media URL for the uploaded image
   */
  async uploadMedia(data, filename, folder = '/product-images') {
    const path = `${folder}/${filename}`;
    const url = `${DA_ADMIN}/source/${this.org}/${this.repo}${path}`;
    const headers = await this.getHeaders();

    const body = data instanceof FormData ? data : (() => {
      const fd = new FormData();
      const blob = data instanceof Blob ? data : new Blob([data]);
      fd.append('data', blob, filename);
      return fd;
    })();

    const resp = await fetch(url, { method: 'PUT', headers, body });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`DA media upload failed (${resp.status}): ${text}`);
    }

    const result = await resp.json();
    return result?.url || `/${this.org}/${this.repo}${path}`;
  }

  /**
   * Get current page content from DA as HTML.
   * @param {string} pagePath - e.g. '/index'
   * @returns {Promise<string>} HTML content
   */
  async getPageContent(pagePath) {
    const url = `${DA_ADMIN}/source/${this.org}/${this.repo}${pagePath}.html`;
    const headers = await this.getHeaders();
    const resp = await fetch(url, { headers });
    if (!resp.ok) {
      throw new Error(`DA get page failed (${resp.status})`);
    }
    return resp.text();
  }

  /**
   * Update a page in DA with new HTML content.
   * @param {string} pagePath - e.g. '/index'
   * @param {string} html - Full page HTML content
   * @returns {Promise<void>}
   */
  async updatePage(pagePath, html) {
    const url = `${DA_ADMIN}/source/${this.org}/${this.repo}${pagePath}.html`;
    const headers = await this.getHeaders();

    const blob = new Blob([html], { type: 'text/html' });
    const fd = new FormData();
    fd.append('data', blob);

    const resp = await fetch(url, { method: 'PUT', headers, body: fd });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`DA page update failed (${resp.status}): ${text}`);
    }
  }

  /**
   * Trigger AEM preview for a page (makes it live on .page domain).
   * @param {string} pagePath - e.g. '/index'
   * @returns {Promise<object>} Preview response
   */
  async triggerPreview(pagePath) {
    const url = `${AEM_ADMIN}/preview/${this.org}/${this.repo}/${this.branch}${pagePath}`;
    const headers = await this.getHeaders();
    const resp = await fetch(url, { method: 'POST', headers });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`AEM preview trigger failed (${resp.status}): ${text}`);
    }

    return resp.json();
  }
}
