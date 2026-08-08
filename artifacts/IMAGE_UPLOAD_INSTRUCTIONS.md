Image bundle & upload instructions

Option A â€” quick (no keys): generate a ZIP of Unsplash images locally and import manually

1. Generate a bundle of Unsplash images:
   PowerShell:
     PowerShell -ExecutionPolicy Bypass -File artifacts\generate_images_and_zip.ps1 -count 30
   This creates artifacts/images/img_1.jpg .. img_30.jpg and artifacts/shophub-images.zip.

2. Use these images as needed (manual):
   - Upload them to your Supabase storage via the Supabase console (bucket: product-images or site-assets).
   - Update products in Supabase SQL Editor with UPDATE statements setting image URLs to the uploaded public URLs.

Option B â€” automated upload to Supabase (recommended if you have service role key)

Prereqs:
- Node 18+ installed
- In project root: npm i @supabase/supabase-js
- Env vars set when running: SUPABASE_URL (NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY, BUCKET_NAME (optional, default: product-images)

Steps:
1. Generate images locally (Option A step 1) or place your images into artifacts/images
2. Edit artifacts/mapping_template.json to map product slugs to filenames (slug must match products.slug in your DB)
3. Run:
   SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_service_key node scripts/upload_images_to_supabase.js ./artifacts/images ./artifacts/mapping_template.json

What the script does:
- Uploads each image to the specified Supabase bucket
- Retrieves a public URL for the image
- Updates the products table's image column where slug matches

Notes & safety:
- SUPABASE_SERVICE_ROLE_KEY is a server-only secret. Do not commit it.
- Verify backup of DB before bulk updates.

If you want, I can now:
- Generate the ZIP of 30 Unsplash images here in the repo artifacts (already possible) and commit it (note: binary bloat), OR
- Run the upload script for you if you provide SUPABASE_SERVICE_ROLE_KEY securely, OR
- Produce a single ZIP file for download with images + mapping.json ready for you to upload locally.

