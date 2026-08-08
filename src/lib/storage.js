import { supabase } from './supabaseHelpers';

export const BUCKETS = {
  products: 'product-images',
  site: 'site-assets',
};

export function isStorageUrl(url) {
  return Boolean(url && typeof url === 'string' && url.includes('/storage/v1/object/public/'));
}

export function needsMigration(url) {
  return Boolean(url && !isStorageUrl(url));
}

export function getPublicUrl(bucket, path) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function sanitizeFolder(folder) {
  return (folder || 'misc')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'misc';
}

function uniquePath(folder, ext) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const safeFolder = sanitizeFolder(folder);
  return `${safeFolder}/${id}.${ext}`;
}

export async function uploadImageBlob(blob, contentType, { bucket, folder = 'misc' }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const path = uniquePath(folder, ext);

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    if (error.message?.includes('Bucket not found')) {
      throw new Error('Storage bucket not found. Run supabase/storage.sql in Supabase SQL Editor.');
    }
    if (error.message?.includes('row-level security') || error.message?.includes('Unauthorized')) {
      throw new Error('Upload denied. Make sure you are logged in as admin.');
    }
    throw error;
  }

  return getPublicUrl(bucket, path);
}

export async function uploadImageFile(file, { bucket, folder = 'misc' }) {
  const { compressImageFile } = await import('./imageUtils');
  const { blob, contentType } = await compressImageFile(file);
  return uploadImageBlob(blob, contentType, { bucket, folder });
}

export async function uploadImageFromUrl(url, { bucket, folder = 'misc' }, urlCache = new Map()) {
  if (!url) return url;
  if (isStorageUrl(url)) return url;
  if (urlCache.has(url)) return urlCache.get(url);

  let result;
  if (url.startsWith('data:')) {
    const { dataUrlToBlob } = await import('./imageUtils');
    const { blob, contentType } = dataUrlToBlob(url);
    result = await uploadImageBlob(blob, contentType, { bucket, folder });
  } else {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`Could not download image: ${url.slice(0, 60)}…`);
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) throw new Error('URL does not point to an image.');
    const file = new File([blob], 'image.jpg', { type: blob.type });
    result = await uploadImageFile(file, { bucket, folder });
  }

  urlCache.set(url, result);
  return result;
}

export async function uploadProductImageFile(file, productSlug) {
  return uploadImageFile(file, { bucket: BUCKETS.products, folder: productSlug || 'misc' });
}

export async function uploadSiteAssetFile(file, folder) {
  return uploadImageFile(file, { bucket: BUCKETS.site, folder: folder || 'general' });
}

export async function migrateUrlToStorage(url, bucket, folder, urlCache = new Map()) {
  if (!url || isStorageUrl(url)) return url;
  return uploadImageFromUrl(url, { bucket, folder }, urlCache);
}

/** Auto-upload product images to storage on save (skips URLs already on CDN). */
export async function ensureProductImagesStored(productData) {
  const folder = productData.slug || 'misc';
  const urlCache = new Map();

  let image = productData.image || '';
  if (needsMigration(image)) {
    image = await migrateUrlToStorage(image, BUCKETS.products, folder, urlCache);
  }

  const rawImages = productData.images?.length ? productData.images : image ? [image] : [];
  const images = [];
  const seen = new Set();

  for (const img of rawImages) {
    if (!img) continue;
    let url = img;
    if (needsMigration(url)) {
      url = await migrateUrlToStorage(url, BUCKETS.products, folder, urlCache);
    }
    if (!seen.has(url)) {
      seen.add(url);
      images.push(url);
    }
  }

  if (image && !seen.has(image)) {
    images.unshift(image);
  }

  return {
    ...productData,
    image: image || images[0] || '',
    images: images.length ? images : image ? [image] : [],
  };
}

function collectMigrationTasks(products, settings) {
  const tasks = [];
  const seen = new Set();

  const add = (task) => {
    const key = `${task.bucket}:${task.url}`;
    if (!needsMigration(task.url) || seen.has(key)) return;
    seen.add(key);
    tasks.push(task);
  };

  for (const p of products || []) {
    const folder = p.slug || p.id || 'misc';
    if (p.image) add({ kind: 'product-image', productId: p.id, url: p.image, bucket: BUCKETS.products, folder, label: p.title });
    for (const img of p.images || []) {
      if (img && img !== p.image) add({ kind: 'product-gallery', productId: p.id, url: img, bucket: BUCKETS.products, folder, label: p.title });
    }
  }

  if (settings?.general?.logoUrl) {
    add({ kind: 'site', field: 'logoUrl', url: settings.general.logoUrl, bucket: BUCKETS.site, folder: 'logo', label: 'Logo' });
  }
  if (settings?.hero?.image) {
    add({ kind: 'site', field: 'hero.image', url: settings.hero.image, bucket: BUCKETS.site, folder: 'hero', label: 'Hero' });
  }
  (settings?.homepage?.lookbookItems || []).forEach((item, i) => {
    if (item.image) {
      add({ kind: 'site', field: `lookbook.${i}`, url: item.image, bucket: BUCKETS.site, folder: `lookbook/${i + 1}`, label: `Lookbook ${i + 1}` });
    }
  });

  return tasks;
}

export async function countImagesNeedingMigration(products, settings) {
  return collectMigrationTasks(products, settings).length;
}

async function migrateUrlList(urls, bucket, folder, urlCache) {
  const result = [];
  const seen = new Set();
  for (const url of urls || []) {
    if (!url) continue;
    const migrated = await migrateUrlToStorage(url, bucket, folder, urlCache);
    if (!seen.has(migrated)) {
      seen.add(migrated);
      result.push(migrated);
    }
  }
  return result;
}

export async function migrateProductImages(product, urlCache) {
  const folder = product.slug || product.id || 'misc';

  if (!needsMigration(product.image) && (product.images || []).every((img) => !needsMigration(img))) {
    return null;
  }

  const image = await migrateUrlToStorage(product.image, BUCKETS.products, folder, urlCache);
  const images = await migrateUrlList(product.images, BUCKETS.products, folder, urlCache);

  return { image, images: images.length ? images : image ? [image] : [] };
}

export async function migrateSiteSettingsImages(settings, urlCache) {
  const next = { ...settings, general: { ...settings.general }, hero: { ...settings.hero }, homepage: { ...settings.homepage } };
  let changed = false;

  if (needsMigration(settings.general?.logoUrl)) {
    next.general.logoUrl = await migrateUrlToStorage(settings.general.logoUrl, BUCKETS.site, 'logo', urlCache);
    changed = true;
  }

  if (needsMigration(settings.hero?.image)) {
    next.hero.image = await migrateUrlToStorage(settings.hero.image, BUCKETS.site, 'hero', urlCache);
    changed = true;
  }

  if (settings.homepage?.lookbookItems?.length) {
    next.homepage.lookbookItems = [...settings.homepage.lookbookItems];
    for (let i = 0; i < settings.homepage.lookbookItems.length; i++) {
      const item = settings.homepage.lookbookItems[i];
      if (needsMigration(item.image)) {
        next.homepage.lookbookItems[i] = {
          ...item,
          image: await migrateUrlToStorage(item.image, BUCKETS.site, `lookbook/${i + 1}`, urlCache),
        };
        changed = true;
      }
    }
  }

  return changed ? next : null;
}

export function formatEta(seconds) {
  if (seconds == null || !Number.isFinite(seconds)) return '';
  if (seconds < 60) return `~${seconds}s left`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `~${m}m ${s}s left` : `~${m}m left`;
}

/** Run full migration with progress + ETA. Skips images already on storage. */
export async function runImageMigration(products, settings, updateProductFn, updateSettingsFn, onProgress) {
  const tasks = collectMigrationTasks(products, settings);
  const total = tasks.length;

  if (!total) {
    return { migrated: 0, skipped: 0, products: products.length, message: 'All images are already on Supabase Storage — nothing to migrate.' };
  }

  const urlCache = new Map();
  const startTime = Date.now();
  let done = 0;

  const report = (label) => {
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = done > 0 ? done / elapsed : 0;
    const remaining = total - done;
    const etaSeconds = rate > 0 ? Math.ceil(remaining / rate) : null;
    onProgress?.({
      done,
      total,
      percent: Math.round((done / total) * 100),
      label,
      etaSeconds,
      etaLabel: formatEta(etaSeconds),
    });
  };

  report('Starting…');

  for (const task of tasks) {
    await migrateUrlToStorage(task.url, task.bucket, task.folder, urlCache);
    done++;
    report(task.label || 'Migrating…');
  }

  const mapUrl = (url) => (url && urlCache.has(url) ? urlCache.get(url) : url);
  let migratedProducts = 0;

  for (const product of products) {
    const image = mapUrl(product.image);
    const images = [...new Set((product.images || []).map(mapUrl).filter(Boolean))];
    const finalImages = images.length ? images : image ? [image] : [];

    if (image !== product.image || JSON.stringify(finalImages) !== JSON.stringify(product.images || [])) {
      await updateProductFn(product.id, { ...product, image, images: finalImages });
      migratedProducts++;
    }
  }

  const newSettings = await migrateSiteSettingsImages(settings, urlCache);
  if (newSettings) {
    await updateSettingsFn(newSettings);
  }

  report('Complete');

  return {
    migrated: migratedProducts + (newSettings ? 1 : 0),
    skipped: 0,
    imagesProcessed: total,
    products: products.length,
    message: `Migrated ${total} image${total !== 1 ? 's' : ''} to Supabase Storage CDN.`,
  };
}
