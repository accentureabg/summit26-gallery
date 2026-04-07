/**
 * Vercel serverless function — POST /api/product
 * Deploy this folder to Vercel and it auto-routes to /api/product.
 *
 * Environment variables (set in Vercel dashboard):
 *   DA_CLIENT_ID + DA_CLIENT_SECRET (recommended), or DA_TOKEN
 *   DA_ORG, DA_REPO
 */

import DAClient from '../da-client.js';
import { addProduct } from '../product-service.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Parse multipart with busboy (install: npm i busboy)
    const { default: Busboy } = await import('busboy');
    const fields = {};
    let imageBuffer = null;
    let imageName = null;

    await new Promise((resolve, reject) => {
      const bb = Busboy({ headers: req.headers });
      bb.on('field', (name, val) => { fields[name] = val; });
      bb.on('file', (name, stream, info) => {
        const chunks = [];
        imageName = info.filename;
        stream.on('data', (d) => chunks.push(d));
        stream.on('end', () => { imageBuffer = Buffer.concat(chunks); });
      });
      bb.on('finish', resolve);
      bb.on('error', reject);
      req.pipe(bb);
    });

    const missing = ['number', 'name', 'description', 'creator'].filter((f) => !fields[f]);
    if (missing.length || !imageBuffer) {
      return res.status(400).json({ error: `Missing: ${missing.join(', ')}${!imageBuffer ? ', image' : ''}` });
    }

    // Build DA client — prefers client credentials (auto-refresh)
    const clientId = process.env.DA_CLIENT_ID;
    const clientSecret = process.env.DA_CLIENT_SECRET;
    const directToken = process.env.DA_TOKEN
      || req.headers.authorization?.replace('Bearer ', '');

    if (!clientId && !directToken) {
      return res.status(401).json({
        error: 'Set DA_CLIENT_ID + DA_CLIENT_SECRET, or DA_TOKEN',
      });
    }

    const daClient = new DAClient({
      org: process.env.DA_ORG || 'angelaccenture',
      repo: process.env.DA_REPO || 'aem-boilerplate-demo',
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

    return res.status(200).json({
      success: true,
      imageUrl: result.imageUrl,
      previewUrl: result.previewUrl,
    });
  } catch (err) {
    console.error('Product API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
