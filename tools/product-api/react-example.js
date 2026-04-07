/**
 * Example: How to call the Product API from your React app.
 *
 * After the voice-driven AI workflow generates a product concept
 * (name, description, creator, image), call publishProduct() to
 * push it straight into the AEM gallery — no human in the loop.
 */

// ------------------------------------------------------------------
// Option A: Call the Product API endpoint (recommended for production)
// ------------------------------------------------------------------

const PRODUCT_API_URL = 'https://your-deployment.vercel.app/api/product';
// or if running locally: 'http://localhost:8787/api/product'

/**
 * Publish a product to the AEM gallery via the Product API.
 *
 * @param {object} product
 * @param {string} product.number      - e.g. '010'
 * @param {string} product.name        - e.g. 'Holographic sneakers'
 * @param {string} product.description - Full AI-generated description
 * @param {string} product.creator     - Visitor's name
 * @param {Blob|File} product.image    - AI-generated product image
 * @returns {Promise<{success: boolean, imageUrl: string, previewUrl: string}>}
 */
export async function publishProduct(product) {
  const formData = new FormData();
  formData.append('number', product.number);
  formData.append('name', product.name);
  formData.append('description', product.description);
  formData.append('creator', product.creator);
  formData.append('image', product.image, `product-${product.number}.png`);

  const resp = await fetch(PRODUCT_API_URL, {
    method: 'POST',
    body: formData,
    // If using Authorization header instead of server-side DA_TOKEN env:
    // headers: { Authorization: `Bearer ${daToken}` },
  });

  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || `API returned ${resp.status}`);
  }

  return resp.json();
}

// ------------------------------------------------------------------
// Option B: Call DA directly from the React app (simpler for demos)
// ------------------------------------------------------------------

import DAClient from './da-client.js';
import { addProduct } from './product-service.js';

/**
 * Publish directly to DA without a middleware API.
 * Only use this if the React app has access to the DA token.
 */
export async function publishProductDirect(product, daToken) {
  const daClient = new DAClient({
    org: 'angelaccenture',
    repo: 'aem-boilerplate-demo',
    token: daToken,
  });

  return addProduct({
    ...product,
    imageName: `product-${product.number}.png`,
    daClient,
  });
}

// ------------------------------------------------------------------
// Usage in your React component (after AI workflow completes)
// ------------------------------------------------------------------

/*
import { publishProduct } from './react-example';

// Inside your voice AI workflow completion handler:
async function onProductGenerated(aiResult) {
  // aiResult comes from your AI workflow with:
  //   { name, description, creatorName, generatedImageBlob }

  // Generate the next product number
  const nextNumber = String(latestProductNumber + 1).padStart(3, '0');

  try {
    const result = await publishProduct({
      number: nextNumber,
      name: aiResult.name,
      description: aiResult.description,
      creator: aiResult.creatorName,
      image: aiResult.generatedImageBlob,  // Blob from AI image generation
    });

    console.log('Product published!', result.previewUrl);
    // The product now appears on the AEM gallery page automatically.
  } catch (err) {
    console.error('Failed to publish product:', err);
  }
}
*/
