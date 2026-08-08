/** Build a smaller, faster-loading URL for product/hero images. */
export function optimizeImageUrl(src, { width = 800, quality = 78 } = {}) {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return src;

  try {
    // Supabase Storage — image transformation (CDN resize)
    if (src.includes('.supabase.co/storage/v1/object/public/')) {
      const renderUrl = src.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
      const sep = renderUrl.includes('?') ? '&' : '?';
      return `${renderUrl}${sep}width=${width}&quality=${quality}&resize=contain`;
    }

    // Shopify CDN — width param
    if (src.includes('cdn.shopify.com')) {
      const u = new URL(src);
      u.searchParams.set('width', String(width));
      return u.toString();
    }
  } catch {
    return src;
  }

  return src;
}

export function buildSrcSet(src, widths = [400, 640, 960, 1280]) {
  if (!src || src.startsWith('data:')) return undefined;
  return widths.map((w) => `${optimizeImageUrl(src, { width: w })} ${w}w`).join(', ');
}

export function sizesFor(context = 'card') {
  const map = {
    hero: '100vw',
    card: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
    gallery: '(max-width: 768px) 100vw, 50vw',
    thumb: '80px',
  };
  return map[context] || map.card;
}
