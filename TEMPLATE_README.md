# ShopHub E-Commerce Template

A complete, production-ready e-commerce platform built with **Next.js 14**, **React 18**, **Tailwind CSS**, **TypeScript**, **Supabase**, and **Razorpay**.

Perfect for launching custom shopping stores for any business category — fashion, electronics, home goods, food, and more.

## Features

✨ **Complete Out-of-the-Box**
- Multi-product catalog with search, filtering, and categories
- Shopping cart with persistent storage
- Checkout flow (Cash on Delivery + Razorpay)
- Order management and customer tracking
- Admin dashboard (products, orders, settings, coupons, newsletter)

🎨 **Modern Design**
- Luxury e-commerce aesthetic (customizable colors/fonts)
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Smooth animations (Framer Motion)
- SEO-optimized

🔒 **Security & Performance**
- Secure admin authentication (Supabase Auth)
- Server-side data protection (Supabase RLS)
- Image optimization and CDN
- Analytics & speed insights (Vercel)
- TypeScript for type safety

📱 **User Features**
- Browse products by category
- Add to cart, manage quantities
- Checkout with address fields
- Order confirmation & status tracking
- Newsletter signup
- Contact form
- Customer support pages

⚙️ **Admin Features**
- Seed database with sample products
- Manage products, categories, and inventory
- View and manage orders
- Create coupons and discount codes
- Customize homepage, hero sections, policies
- Newsletter subscriber management
- Website settings (logo, colors, contact info)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, Supabase |
| **Database** | PostgreSQL (via Supabase) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage (CDN images) |
| **Payments** | Razorpay (optional, COD works without it) |
| **Hosting** | Vercel (recommended) |

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (free at https://supabase.com)
- (Optional) Razorpay account for online payments

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd shophub-ecommerce
npm install
```

### 2. Set Up Environment

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

**Required Keys:**
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from same location
- `SUPABASE_SERVICE_ROLE_KEY` — (for server-only operations; keep secret)
- `NEXT_PUBLIC_ADMIN_EMAILS` — comma-separated admin email addresses

**Optional:**
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — for online payments (test or live)
- `RAZORPAY_KEY_SECRET` — Razorpay secret (server-only)

### 3. Initialize Database

In your Supabase SQL Editor, run the schema files in this order:

1. `supabase/schema.sql` — creates tables (products, orders, profiles, etc.)
2. `supabase/storage.sql` — creates storage buckets for images

### 4. Run Locally

```bash
npm run dev
```

Visit **http://localhost:3000** for the storefront.

### 5. Access Admin Dashboard

1. Go to **http://localhost:3000/admin/login**
2. Use any email from `NEXT_PUBLIC_ADMIN_EMAILS`
3. (If using dev bypass) Set `NEXT_PUBLIC_DEV_ADMIN_BYPASS=true` in .env.local and use password `devadmin`

### 6. Seed Sample Data

In the admin dashboard, go to **Seed Database** and click "Seed Database Now" to load 29 sample products.

## Project Structure

```
shophub-ecommerce/
├── src/
│   ├── pages/              # Next.js pages (routing)
│   │   ├── admin/          # Admin dashboard
│   │   ├── product/        # Product detail pages
│   │   ├── checkout.js     # Checkout page
│   │   ├── cart.js         # Shopping cart
│   │   ├── catalog.js      # Product listing
│   │   ├── login.js        # Customer login
│   │   └── index.js        # Home page
│   ├── components/         # Reusable React components
│   │   ├── ProductCard.js
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   └── ...
│   ├── context/            # State management (React Context)
│   │   ├── CartContext.js
│   │   ├── AuthContext.js  # Admin auth
│   │   ├── UserAuthContext.js
│   │   └── SiteSettingsContext.js
│   ├── lib/                # Utilities & helpers
│   │   ├── db.js           # Database queries
│   │   ├── supabase.js     # Supabase client
│   │   ├── storage.js      # Image upload/storage
│   │   ├── payments.js     # Razorpay integration
│   │   ├── seedProducts.js # Sample product data
│   │   ├── defaultSettings.js # Default site settings
│   │   └── ...
│   └── styles/             # Global CSS
├── supabase/
│   ├── schema.sql          # Database schema
│   └── storage.sql         # Storage buckets
├── public/                 # Static assets (images, fonts, favicon)
├── scripts/
│   └── upload_images_to_supabase.js  # Bulk image uploader
├── artifacts/              # Utilities for image generation
│   ├── generate_images_and_zip.ps1
│   ├── mapping_template.json
│   └── IMAGE_UPLOAD_INSTRUCTIONS.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md               # This file
```

## Customization Guide

### Change Store Name

Replace all instances of **"ShopHub"** with your store name:

```bash
# Using PowerShell
(Get-ChildItem -Path src -Recurse -Include *.js,*.jsx,*.ts,*.tsx) | ForEach-Object {
  $text = Get-Content -Raw $_.FullName
  $text = $text -replace '(?i)shophub', 'YourStoreName'
  Set-Content $_.FullName $text -Encoding utf8
}
```

### Customize Colors & Fonts

Edit `tailwind.config.js` to change:
- Primary colors (emerald, gold)
- Font families (serif, sans)
- Spacing, borders, shadows

### Update Categories

In `src/lib/db.js`, function `getCategories()`, update the hardcoded default categories. Or manage them via the admin dashboard after seeding.

### Add Products

**Option 1 (Admin Dashboard):**
- Go to Admin → Products → Add Product
- Upload images, set price, category, description

**Option 2 (Bulk Import):**
- Edit `src/lib/seedProducts.js` with your product data
- Run `/admin/seed` to import

### Customize Homepage

In the Admin Dashboard → Design section:
- Change hero section image and text
- Customize homepage sections
- Update footer text and policies

### Setup Razorpay (Optional)

1. Create a Razorpay account at https://razorpay.com
2. Get your **Key ID** (public) and **Key Secret** (private)
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   ```
4. Razorpay will be enabled at checkout

## Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel
```

During setup:
1. Connect your GitHub repo
2. Add environment variables in Vercel dashboard (Settings → Environment Variables)
3. Deploy!

### Deploy to Other Platforms

Works on any Node.js hosting (Netlify, AWS, Google Cloud, DigitalOcean, Heroku, etc.).

See `next.config.js` for build configuration.

## Troubleshooting

### Admin Login Not Working

Check `/admin/debug` page:
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify your email is in `NEXT_PUBLIC_ADMIN_EMAILS`
- Or set `NEXT_PUBLIC_DEV_ADMIN_BYPASS=true` for local testing (password: `devadmin`)

### Images Not Loading

- Check Supabase Storage → Buckets (should have `product-images` and `site-assets`)
- Run `supabase/storage.sql` in Supabase SQL Editor to create buckets
- Use Admin → Images page to migrate images to Supabase

### Checkout Failing

- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase SQL: ensure `orders` table exists (run `supabase/schema.sql`)
- For Razorpay errors, check `/admin/debug` to confirm Razorpay keys are set

### Database Errors

- Run `supabase/schema.sql` in Supabase SQL Editor
- Check RLS policies are enabled for all tables
- Verify user role is set to `admin` for admin features

## Image Management

### Replace Product Images

**Option 1: Admin Dashboard**
- Go to Admin → Images → Upload Images
- Drag and drop or select files to replace product images

**Option 2: Bulk Upload Script**

```bash
# Download Unsplash images as placeholders
PowerShell -ExecutionPolicy Bypass -File artifacts\generate_images_and_zip.ps1 -count 30

# Upload to Supabase and update products
npm i @supabase/supabase-js
SUPABASE_URL=<your-url> SUPABASE_SERVICE_ROLE_KEY=<your-key> node scripts/upload_images_to_supabase.js ./artifacts/images ./artifacts/mapping_template.json
```

See `artifacts/IMAGE_UPLOAD_INSTRUCTIONS.md` for detailed steps.

## API Routes

The backend exposes these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/setup/status` | GET | Check setup status (Supabase, Razorpay) |
| `/api/payments/razorpay/create-order` | POST | Create Razorpay payment order |
| `/api/payments/razorpay/verify` | POST | Verify Razorpay payment |

## Environment Variables Reference

```ini
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,owner@example.com
NEXT_PUBLIC_DEV_ADMIN_BYPASS=false  # Set to true for local dev testing

# Razorpay (optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx
NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID=xxx
```

## Common Customizations

### Change Primary Color from Green to Blue

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      emerald: '#0891b2',  // Change to cyan/blue
      // ... other colors
    },
  },
}
```

### Add New Product Category

1. In `src/lib/db.js`, add to default categories
2. In Admin Dashboard → Categories, add the new category
3. Use it when creating products

### Remove Razorpay (Keep COD Only)

In `src/pages/checkout.js`, remove the Razorpay payment method option.

### Add Email Notifications

Use a service like SendGrid, Mailgun, or AWS SES. Add API route `/api/emails/order-confirmation` and call from checkout.

## Security Best Practices

✅ **Configured:**
- Supabase RLS (Row-Level Security) protects data
- Admin credentials checked on every admin page
- Service role key kept server-only

⚠️ **To-Do:**
- Add rate limiting to API routes
- Enable CORS restrictions
- Use HTTPS only (Vercel does this by default)
- Rotate Razorpay keys regularly
- Monitor Supabase logs for suspicious activity

## Support & Contributing

For issues, feature requests, or customizations:
1. Check existing documentation above
2. Review code comments in `src/lib/db.js` and `src/pages/checkout.js`
3. Refer to [Next.js Docs](https://nextjs.org/docs) and [Supabase Docs](https://supabase.com/docs)

## License

MIT — Use this freely for personal and commercial projects!

---

**Ready to launch your store?** Start with the Quick Start section above, and customize from there. Happy selling! 🚀
