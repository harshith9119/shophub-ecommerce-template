const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: node scripts/generateSeed.js <products.json path>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const mapCategory = (type, tags) => {
  const t = (type || '').toLowerCase();
  const tagStr = (tags || []).join(' ').toLowerCase();
  if (t.includes('silk') || tagStr.includes('silk') || tagStr.includes('kanjivaram')) return 'Silk';
  if (t.includes('organza') || tagStr.includes('organza')) return 'Organza';
  if (t.includes('chinon') || tagStr.includes('chinon')) return 'Chinon';
  if (t.includes('linen') || tagStr.includes('linen')) return 'Linen';
  if (t.includes('chiffon') || tagStr.includes('chiffon')) return 'Chiffon';
  return 'Designer';
};

const products = data.products.map((p, i) => {
  const v = p.variants[0];
  const price = parseFloat(v.price);
  const compare = v.compare_at_price ? parseFloat(v.compare_at_price) : null;
  return {
    title: p.title,
    slug: p.handle,
    description: (p.body_html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500),
    fullDescription: p.body_html || '',
    salePrice: price,
    regularPrice: compare || price,
    category: mapCategory(p.product_type, p.tags),
    status: v.available ? 'Available' : 'Sold out',
    image: p.images[0]?.src || '',
    images: p.images.map(img => img.src),
    tags: p.tags || [],
    featured: i < 8,
    bestSeller: i < 4,
    newArrival: i >= 4 && i < 12,
    rating: 4 + (i % 2),
    reviewCount: 3 + (i % 8),
    createdAt: new Date().toISOString(),
  };
});

const out = `// Auto-generated from shophub.com Shopify data\nexport const SEED_PRODUCTS = ${JSON.stringify(products, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '../src/lib/seedProducts.js'), out);
console.log(`Generated ${products.length} products`);


