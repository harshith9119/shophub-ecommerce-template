-- ShopHub — Supabase Storage setup
-- Run in Supabase Dashboard â†’ SQL Editor (after schema.sql)

-- â”€â”€â”€ Buckets â”€â”€â”€
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('site-assets', 'site-assets', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- â”€â”€â”€ Public read (storefront) â”€â”€â”€
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Public read site assets" on storage.objects;
create policy "Public read site assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

-- â”€â”€â”€ Admin write (requires is_admin() from schema.sql) â”€â”€â”€
drop policy if exists "Admin insert product images" on storage.objects;
create policy "Admin insert product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admin insert site assets" on storage.objects;
create policy "Admin insert site assets"
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Admin update site assets" on storage.objects;
create policy "Admin update site assets"
  on storage.objects for update
  using (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Admin delete site assets" on storage.objects;
create policy "Admin delete site assets"
  on storage.objects for delete
  using (bucket_id = 'site-assets' and public.is_admin());

