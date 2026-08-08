/* Upload local images to Supabase storage and update product records.

Usage:
  1. npm install @supabase/supabase-js node-fetch form-data
  2. Set env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BUCKET_NAME (optional, default 'product-images')
  3. Create a mapping JSON file: mapping.json with [{ "slug": "product-slug", "filename": "img_1.jpg" }, ...]
  4. Run: node scripts/upload_images_to_supabase.js ./artifacts/images ./mapping.json

Notes:
 - This script requires the SUPABASE_SERVICE_ROLE_KEY (server-only secret). Run locally or on a trusted server.
 - The script uploads to storage path 'product-images/<filename>' and calls products table to update image column by slug.
*/

import fs from 'fs';
import path from 'path';
import process from 'process';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/upload_images_to_supabase.js <images_folder> <mapping.json>');
    process.exit(1);
  }

  const imagesFolder = args[0];
  const mappingFile = args[1];

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const BUCKET = process.env.BUCKET_NAME || 'product-images';

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Set SUPABASE_URL (NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in env.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  let mapping;
  try {
    mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
  } catch (err) {
    console.error('Failed to read mapping file:', err.message);
    process.exit(1);
  }

  for (const entry of mapping) {
    const { slug, filename } = entry;
    const filePath = path.join(imagesFolder, filename);
    if (!fs.existsSync(filePath)) {
      console.warn('File not found, skipping:', filePath);
      continue;
    }

    const destPath = filename; // store at root of bucket with same filename
    try {
      const file = fs.readFileSync(filePath);
      const upload = await supabase.storage.from(BUCKET).upload(destPath, file, { upsert: true });
      if (upload.error) {
        console.error('Upload error for', filename, upload.error.message);
        continue;
      }
      // Get public URL
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(destPath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        console.warn('Could not get public URL for', destPath);
        continue;
      }

      // Update product record by slug
      const { error: updateError } = await supabase.from('products').update({ image: publicUrl }).eq('slug', slug);
      if (updateError) {
        console.error('Failed to update product', slug, updateError.message);
      } else {
        console.log(`Uploaded ${filename} and updated product ${slug}`);
      }
    } catch (err) {
      console.error('Error processing', filename, err.message);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
