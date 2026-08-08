# ShopHub Template — Complete Setup Guide

This folder contains a **production-ready e-commerce platform** with all files included. Follow these steps to get your custom shopping store running.

## 📋 What's Inside

- ✅ **93 complete source files** (no missing pieces)
- ✅ **Database schema** (PostgreSQL via Supabase)
- ✅ **Admin dashboard** (full CMS for managing products, orders, settings)
- ✅ **Checkout flow** (COD + Razorpay)
- ✅ **Image management** (local + Supabase CDN)
- ✅ **Authentication** (customer login + admin auth)
- ✅ **Responsive design** (mobile, tablet, desktop)
- ✅ **Production config** (Next.js, TypeScript, Tailwind, SEO)

## 🚀 Quick Start (5 minutes)

### Step 1: Extract and Install

```bash
# Navigate to this folder and install dependencies
npm install
```

### Step 2: Setup Environment

Create `.env.local` in the project root (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your keys:

```ini
# Get these from Supabase dashboard (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5...

# Admin emails (comma-separated) — use your email here
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com

# Optional: For local testing without Supabase
NEXT_PUBLIC_DEV_ADMIN_BYPASS=true
```

### Step 3: Initialize Database

1. Go to your Supabase project dashboard
2. Open **SQL Editor**
3. Copy and run the contents of `supabase/schema.sql` — this creates all tables
4. Then run contents of `supabase/storage.sql` — this creates storage buckets

### Step 4: Start Development Server

```bash
npm run dev
```

Visit:
- **Storefront:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login
- **Debug:** http://localhost:3000/admin/debug (check Supabase status)

### Step 5: Seed Sample Products

1. Login to admin: http://localhost:3000/admin/login
2. Go to **Seed Database** → click "Seed Database Now"
3. This loads 29 sample products to test the site

**🎉 That's it! Your store is now running locally.**

---

## 📂 File Structure — Every Single File

```
shophub-ecommerce-template/
│
├── 📄 Core Config Files
│   ├── package.json              # Node dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── next.config.js            # Next.js config
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── postcss.config.js         # CSS processing
│   ├── .env.local.example        # Environment template
│   ├── .env.example              # Production env template
│   ├── .gitignore                # Git ignore rules
│   └── README.md                 # Standard readme
│
├── 📁 src/
│   ├── pages/                    # Next.js pages (each = a route)
│   │   ├── _app.js               # App wrapper, providers
│   │   ├── _document.js          # HTML document
│   │   ├── index.js              # Home page (/)
│   │   ├── login.js              # Customer login (/login)
│   │   ├── catalog.js            # Product listing (/catalog)
│   │   ├── cart.js               # Shopping cart (/cart)
│   │   ├── checkout.js           # Checkout page (/checkout)
│   │   ├── order-confirmation.js # Order success page
│   │   ├── contact.js            # Contact form (/contact)
│   │   ├── refund-policy.js      # Policy pages
│   │   ├── product/
│   │   │   └── [slug].js         # Dynamic product page (/product/:slug)
│   │   ├── profile/
│   │   │   └── index.js          # User profile (/profile)
│   │   ├── admin/                # Admin dashboard
│   │   │   ├── login.js          # Admin login (/admin/login)
│   │   │   ├── debug.js          # Debug status (/admin/debug)
│   │   │   ├── dashboard.js      # Main admin dashboard
│   │   │   ├── products/
│   │   │   │   ├── index.js      # Product list
│   │   │   │   └── [id].js       # Edit product
│   │   │   ├── orders/
│   │   │   │   ├── index.js      # Order list
│   │   │   │   └── [id].js       # Order details
│   │   │   ├── categories.js     # Manage categories
│   │   │   ├── coupons.js        # Manage coupons
│   │   │   ├── customers.js      # View customers
│   │   │   ├── newsletter.js     # Newsletter subscribers
│   │   │   ├── settings.js       # Site settings
│   │   │   ├── design.js         # Design/branding
│   │   │   ├── images.js         # Image management
│   │   │   ├── profile.js        # Admin profile
│   │   │   ├── homepage.js       # Homepage editor
│   │   │   ├── policies.js       # Policy editor
│   │   │   └── seed.js           # Seed database with samples
│   │   └── api/
│   │       ├── setup/
│   │       │   └── status.js     # Check Supabase/Razorpay status
│   │       └── payments/
│   │           └── razorpay/
│   │               ├── create-order.js
│   │               └── verify.js
│   │
│   ├── components/               # Reusable React components
│   │   ├── Navbar.js             # Top navigation
│   │   ├── Footer.js             # Footer
│   │   ├── ProductCard.js        # Product card in grid
│   │   ├── ProductPreviewModal.js# Product quick preview
│   │   ├── CartDrawer.js         # Slide-out cart panel
│   │   ├── HeroSection.js        # Large hero banner
│   │   ├── NewsletterSignup.js   # Newsletter form
│   │   ├── PageHead.js           # SEO meta tags
│   │   ├── SiteImage.js          # Optimized image component
│   │   ├── AdminGuard.js         # Auth wrapper for admin pages
│   │   ├── AdminLayout.js        # Admin page layout
│   │   ├── ErrorBoundary.js      # Error fallback
│   │   ├── TrustBadges.js        # Trust/verification badges
│   │   ├── MarqueeBar.js         # Scrolling announcement bar
│   │   ├── admin/
│   │   │   ├── ImageUploadField.js
│   │   │   └── ProductSelector.js
│   │   └── motion/
│   │       ├── Reveal.js         # Fade-in animations
│   │       └── ...
│   │
│   ├── context/                  # React Context for state management
│   │   ├── CartContext.js        # Shopping cart state (localStorage)
│   │   ├── AuthContext.js        # Admin auth state
│   │   ├── UserAuthContext.js    # Customer auth state
│   │   ├── SiteSettingsContext.js# Global site settings
│   │   └── NotificationContext.js# Toast notifications
│   │
│   ├── lib/                      # Utility functions & helpers
│   │   ├── supabase.js           # Supabase client init + config checks
│   │   ├── supabaseHelpers.js    # Auth helpers
│   │   ├── db.js                 # ALL database queries (150+ lines)
│   │   │   ├── getSiteSettings()
│   │   │   ├── getAllProducts()
│   │   │   ├── createOrder()
│   │   │   ├── updateOrder()
│   │   │   ├── getUserProfile()
│   │   │   └── seedDatabase()
│   │   ├── storage.js            # Image upload/migration to Supabase
│   │   ├── payments.js           # Razorpay integration
│   │   ├── optimizeImage.js      # Image CDN resizing
│   │   ├── utils.js              # Helpers (format price, calc discount, etc)
│   │   ├── setupStatus.js        # Check Supabase/Razorpay config
│   │   ├── seedProducts.js       # Sample product data (29 products)
│   │   └── defaultSettings.js    # Default site settings/policies
│   │
│   └── styles/
│       ├── globals.css           # Global styles
│       └── index.css
│
├── 📁 supabase/                  # Database schema & storage
│   ├── schema.sql                # Complete PostgreSQL schema
│   │   ├── CREATE TABLE products
│   │   ├── CREATE TABLE orders
│   │   ├── CREATE TABLE profiles
│   │   ├── CREATE TABLE categories
│   │   ├── CREATE TABLE site_settings
│   │   ├── CREATE TABLE newsletter
│   │   ├── CREATE TABLE coupons
│   │   └── RLS security policies
│   └── storage.sql               # Create storage buckets
│       ├── product-images bucket
│       └── site-assets bucket
│
├── 📁 public/                    # Static assets (public URL)
│   ├── favicon.ico               # Browser tab icon
│   ├── robots.txt                # SEO robots file
│   └── images/                   # Static images (placeholder)
│
├── 📁 scripts/
│   ├── upload_images_to_supabase.js  # Bulk image uploader
│   └── generateSeed.js               # Generate seed data
│
├── 📁 artifacts/                 # Utilities & templates
│   ├── generate_images_and_zip.ps1   # Download Unsplash images
│   ├── mapping_template.json         # Map products to images
│   ├── IMAGE_UPLOAD_INSTRUCTIONS.md  # Image upload guide
│   └── images/                       # Downloaded images go here
│
└── 📄 README.md                  # Main project README
```

**Total: 93 files across all directories, zero dependencies missing.**

---

## ⚙️ Environment Setup Explained

### `.env.local` (Development)

```ini
# REQUIRED: Supabase Project Keys
# Get from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# REQUIRED: Admin Email(s) who can access /admin
NEXT_PUBLIC_ADMIN_EMAILS=you@example.com,other-admin@example.com

# OPTIONAL: Dev Mode Bypass (local testing only!)
NEXT_PUBLIC_DEV_ADMIN_BYPASS=true       # Set to 'true' for local testing
                                        # Then use any email + password 'devadmin' to login

# OPTIONAL: Razorpay Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx_secret

# OPTIONAL: Analytics (Vercel)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxxxx
NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID=xxxxx
```

### Setup Supabase Keys

1. Go to https://supabase.com → Sign up (free)
2. Create a new project
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Troubleshooting Login Issues

If you can't login to /admin:

1. Check http://localhost:3000/admin/debug — it shows:
   - Is Supabase configured? ✅/❌
   - What admin emails are allowed?
   - Is Razorpay enabled?

2. **Solution 1:** Enable dev bypass
   ```ini
   NEXT_PUBLIC_DEV_ADMIN_BYPASS=true
   ```
   Then use **any email** + password `devadmin`

3. **Solution 2:** Ensure email is in `NEXT_PUBLIC_ADMIN_EMAILS`:
   ```ini
   NEXT_PUBLIC_ADMIN_EMAILS=your-actual-email@gmail.com
   ```

4. **Solution 3:** Verify Supabase keys are correct and project is active

---

## 🏗️ Customizing Your Store

### 1. Change Store Name

Replace **ShopHub** with your store name everywhere:

**Option A: Simple Find & Replace in Code Editor**
- In VS Code: `Ctrl+H` (or `Cmd+H` on Mac)
- Find: `ShopHub`
- Replace: `Your Store Name`
- Click "Replace All"

**Option B: PowerShell**
```powershell
$name = "Your Store Name"
Get-ChildItem -Path src -Recurse -Include *.js,*.jsx,*.ts,*.tsx | ForEach-Object {
  $text = Get-Content -Raw $_.FullName
  $text = $text -replace '(?i)shophub', $name
  Set-Content $_.FullName $text -Encoding utf8
}
```

### 2. Change Colors

Edit `tailwind.config.js`:

```javascript
// Change these color values
theme: {
  extend: {
    colors: {
      emerald: '#1f2937',   // Primary color (was green, change to any hex)
      gold: '#f59e0b',      // Accent color (was gold, change to any hex)
      charcoal: '#111827',  // Dark color
      ivory: '#f5f0e8',     // Light background
    },
  },
}
```

Then restart: `npm run dev`

### 3. Change Products & Categories

**Option A: Via Admin Dashboard**
1. Login to http://localhost:3000/admin/login
2. Go to **Products** → Add/Edit products
3. Go to **Categories** → Add/Edit categories

**Option B: Bulk Import**
1. Edit `src/lib/seedProducts.js` with your product data
2. Make sure each product has: `title`, `slug`, `description`, `salePrice`, `regularPrice`, `category`, `image`
3. Run Admin → Seed Database

### 4. Upload Your Logo

1. In admin dashboard, go to **Design**
2. Upload your logo under "Branding"
3. It updates the navbar and footer automatically

### 5. Customize Homepage

In admin dashboard → **Design** section:
- Upload hero image
- Change hero text
- Customize feature sections
- Update footer text

---

## 🚀 Deploying to Production

### Deploy to Vercel (Easiest)

```bash
npm install -g vercel
vercel login
vercel --prod
```

**In Vercel Dashboard:**
1. Go to **Settings** → **Environment Variables**
2. Add all your `.env.local` variables
3. Redeploy

### Deploy to Other Platforms

Works on any Node.js host. Example with GitHub + Any Hosting:

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/shophub-ecommerce.git
   git push -u origin main
   ```

2. Deploy using:
   - **Netlify:** Connect GitHub repo → auto-deploys on push
   - **AWS:** Elastic Beanstalk or Lightsail
   - **DigitalOcean:** App Platform
   - **Google Cloud:** Cloud Run
   - **Heroku:** Buildpacks (free tier ended, but still works)

---

## 🛒 Key Features Walkthrough

### Customer Storefront (/)

- Browse products by category
- Search and filter
- Add to cart
- Checkout (COD or Razorpay)
- Order confirmation email

### Admin Dashboard (/admin)

**Products:** Add, edit, delete products with images
**Orders:** View all orders, update status (pending → processing → shipped)
**Categories:** Manage product categories
**Coupons:** Create discount codes (% off, fixed ₹, free shipping)
**Settings:** Change shipping cost, enable/disable COD, customize policies
**Design:** Upload logo, hero images, customize homepage
**Newsletter:** View subscribers, send announcements
**Customers:** View customer profiles and purchase history
**Seed:** Load sample products for testing

### Checkout Flow

1. **Cart:** Add/remove items, quantity
2. **Checkout:** Enter shipping address
3. **Apply Coupon:** Optional discount code
4. **Payment:**
   - Cash on Delivery (COD) — order created, awaiting confirmation
   - Razorpay — redirects to payment gateway
5. **Confirmation:** Order number, email confirmation

---

## 🔧 Troubleshooting

### "Cannot find module 'next'"

```bash
npm install
npm run dev
```

### "Supabase not configured"

Seen at http://localhost:3000/admin/debug

**Fix:** Ensure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Restart: `npm run dev`

### "Products table not found"

**Fix:** Run `supabase/schema.sql` in your Supabase SQL Editor

### "Cannot checkout, database error"

1. Check `/admin/debug` — should show ✅ for Supabase
2. Run `supabase/schema.sql` to create `orders` table
3. Check Supabase → Settings → Authentication → Enable Email/Password auth

### "Images not showing"

1. Check Supabase Storage → Buckets
2. Should have `product-images` and `site-assets`
3. Run `supabase/storage.sql` to create them
4. Upload images via Admin → Images page

---

## 📞 Support Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Razorpay Docs:** https://razorpay.com/docs/

---

## ✅ Pre-Launch Checklist

Before going live:

- [ ] Replace ShopHub branding with your store name
- [ ] Set up Supabase project with all keys
- [ ] Run `supabase/schema.sql` and `supabase/storage.sql`
- [ ] Add admin email(s) to `NEXT_PUBLIC_ADMIN_EMAILS`
- [ ] Seed products (or add your own)
- [ ] Upload store logo and images
- [ ] Test checkout (COD flow)
- [ ] (Optional) Setup Razorpay for online payments
- [ ] Deploy to Vercel or hosting platform
- [ ] Test live checkout
- [ ] Setup email notifications (optional)
- [ ] Configure analytics (optional)

---

## 🎉 Ready to Launch!

You now have a **complete, production-ready e-commerce store**. Every file is included, nothing is missing. 

**Next steps:**
1. Edit `.env.local` with your Supabase keys
2. Run database setup (`schema.sql` + `storage.sql`)
3. Start dev server: `npm run dev`
4. Login to admin and seed sample products
5. Customize colors, logo, and store name
6. Deploy to Vercel or your hosting

**Happy selling! 🚀**
