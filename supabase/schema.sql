-- ShopHub — Run this in Supabase Dashboard â†’ SQL Editor
-- https://supabase.com/dashboard â†’ your project â†’ SQL Editor â†’ New query â†’ Run

-- â”€â”€â”€ Profiles (extends auth.users) â”€â”€â”€
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  address text,
  city text,
  state text,
  pincode text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup (pulls name/phone from auth metadata)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, phone, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    case when new.email = coalesce(current_setting('app.admin_email', true), 'abcdef@gmail.com')
      then 'admin' else 'customer' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- â”€â”€â”€ Products â”€â”€â”€
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  full_description text,
  sale_price numeric not null default 0,
  regular_price numeric,
  category text,
  status text default 'Available',
  image text,
  images jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  featured boolean default false,
  best_seller boolean default false,
  new_arrival boolean default false,
  rating numeric default 4,
  review_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- â”€â”€â”€ Categories â”€â”€â”€
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sort_order int default 0
);

-- â”€â”€â”€ Orders â”€â”€â”€
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  pincode text,
  notes text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric,
  shipping numeric,
  total numeric,
  status text default 'pending',
  payment_method text,
  payment_status text,
  razorpay_payment_id text,
  razorpay_order_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- â”€â”€â”€ Newsletter â”€â”€â”€
create table if not exists public.newsletter (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz default now()
);

-- â”€â”€â”€ Site settings (single JSON document) â”€â”€â”€
create table if not exists public.site_settings (
  id text primary key default 'site',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- â”€â”€â”€ Row Level Security â”€â”€â”€
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.newsletter enable row level security;
alter table public.site_settings enable row level security;

-- Helper: is admin
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles
create policy "Public profiles readable by owner and admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Products: public read, admin write
create policy "Products public read"
  on public.products for select using (true);

create policy "Products admin insert"
  on public.products for insert with check (public.is_admin());

create policy "Products admin update"
  on public.products for update using (public.is_admin());

create policy "Products admin delete"
  on public.products for delete using (public.is_admin());

-- Categories
create policy "Categories public read"
  on public.categories for select using (true);

create policy "Categories admin all"
  on public.categories for all using (public.is_admin());

-- Orders: anyone can create (guest checkout), users read own, admin all
create policy "Orders insert"
  on public.orders for insert with check (true);

create policy "Orders read own or admin"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Orders admin update"
  on public.orders for update using (public.is_admin());

-- Newsletter
create policy "Newsletter insert"
  on public.newsletter for insert with check (true);

create policy "Newsletter admin read"
  on public.newsletter for select using (public.is_admin());

-- Site settings
create policy "Settings public read"
  on public.site_settings for select using (true);

create policy "Settings admin write"
  on public.site_settings for all using (public.is_admin());

-- Images: stored in Supabase Storage (product-images, site-assets buckets).
-- Database columns hold CDN URLs only — run supabase/storage.sql to create buckets.
-- Legacy base64 or external URLs can be migrated from Admin â†’ Image Storage.

-- Make first admin manually after signup:
-- update public.profiles set role = 'admin' where email = 'abcdef@gmail.com';

