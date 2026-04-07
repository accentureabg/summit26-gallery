/**
 * Product API server — standalone HTTP endpoint.
 * Deploy as a serverless function (Vercel, AWS Lambda, Azure Functions)
 * or run standalone with `node server.js`.
 *
 * POST /api/product
 * Body (multipart/form-data):
 *   - number:      string  (e.g. '010')
 *   - name:        string  (e.g. 'Solar powered phone')
 *   - description: string  (full product description)
 *   - creator:     string  (creator name)
 *   - image:       file    (product image PNG/JPG)
 *
 * Authentication (pick one):
 *   Option A — Client credentials (recommended, auto-refreshes):
 *     DA_CLIENT_ID     - Adobe IMS OAuth client ID
 *     DA_CLIENT_SECRET - Adobe IMS OAuth client secret
 *   Option B — Direct token (expires, must be rotated manually):
 *     DA_TOKEN         - Adobe IMS access token
 *
 * Other environment variables:
 *   DA_ORG    - GitHub org (default: 'angelaccenture')
 *   DA_REPO   - Repository name (default: 'aem-boilerplate-demo')
 */

import http from 'node:http';
import DAClient from './da-client.js';
import { addProduct } from './product-service.js';

const PORT = process.env.PORT || 8787;
const ORG = process.env.DA_ORG || 'angelaccenture';
const REPO = process.env.DA_REPO || 'aem-boilerplate-demo';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/**
 * Parse multipart/form-data from the request body.
 * Lightweight parser — for production, use busboy or formidable.
 */
async function parseMultipart(req) {
  const contentType = req.headers['content-type'] || '';
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) throw new Error('Missing multipart boundary');

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const bodyStr = body.toString('latin1');

  const parts = bodyStr.split(`--${boundary}`).slice(1, -1);
  const fields = {};
  let imageBuffer = null;
  let imageName = null;

  for (const part of parts) {
    const [headerSection, ...valueParts] = part.split('\r\n\r\n');
    const value = valueParts.join('\r\n\r\n').replace(/\r\n$/, '');
    const nameMatch = headerSection.match(/name="([^"]+)"/);
    const filenameMatch = headerSection.match(/filename="([^"]+)"/);

    if (!nameMatch) continue;
    const name = nameMatch[1];

    if (filenameMatch) {
      // Binary file — re-extract from raw buffer
      const headerEnd = body.indexOf('\r\n\r\n', body.indexOf(`name="${name}"`));
      const partEnd = body.indexOf(Buffer.from(`\r\n--${boundary}`), headerEnd);
      imageBuffer = body.subarray(headerEnd + 4, partEnd);
      imageName = filenameMatch[1];
    } else {
      fields[name] = value;
    }
  }

  return { fields, imageBuffer, imageName };
}

async function handleRequest(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.method !== 'POST' || !req.url.startsWith('/api/product')) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...corsHeaders() });
    res.end(JSON.stringify({ error: 'Not found. POST /api/product' }));
    return;
  }

  try {
    const { fields, imageBuffer, imageName } = await parseMultipart(req);

    const required = ['number', 'name', 'description', 'creator'];
    const missing = required.filter((f) => !fields[f]);
    if (missing.length || !imageBuffer) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders() });
      res.end(JSON.stringify({
        error: `Missing fields: ${missing.join(', ')}${!imageBuffer ? ', image' : ''}`,
      }));
      return;
    }

    // Build DA client — prefers client credentials (auto-refresh),
    // falls back to direct token from env or Authorization header.
    const clientId = process.env.DA_CLIENT_ID;
    const clientSecret = process.env.DA_CLIENT_SECRET;
    const directToken = process.env.DA_TOKEN
      || req.headers.authorization?.replace('Bearer ', '');

    if (!clientId && !directToken) {
      res.writeHead(401, { 'Content-Type': 'application/json', ...corsHeaders() });
      res.end(JSON.stringify({
        error: 'Set DA_CLIENT_ID + DA_CLIENT_SECRET, or DA_TOKEN, or pass Authorization header',
      }));
      return;
    }

    const daClient = new DAClient({
      org: ORG,
      repo: REPO,
      ...(clientId ? { clientId, clientSecret } : { token: directToken }),
    });

    const result = await addProduct({
      number: fields.number,
      name: fields.name,
      description: fields.description,
      creator: fields.creator,
      image: imageBuffer,
      imageName: imageName || `product-${fields.number}.png`,
      daClient,
    });

    res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders() });
    res.end(JSON.stringify({
      success: true,
      imageUrl: result.imageUrl,
      previewUrl: result.previewUrl,
    }));
  } catch (err) {
    console.error('Product API error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders() });
    res.end(JSON.stringify({ error: err.message }));
  }
}

const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`Product API running on http://localhost:${PORT}/api/product`);
  console.log(`  ORG:  ${ORG}`);
  console.log(`  REPO: ${REPO}`);
});
