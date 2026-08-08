import { supabase, getDb, isSupabaseConfigured } from './supabaseHelpers';
import { DEFAULT_SETTINGS } from './defaultSettings';
import { SEED_PRODUCTS } from './seedProducts';

export { isSupabaseConfigured };

const mergeSettings = (data) => ({
  ...DEFAULT_SETTINGS,
  ...data,
  general: { ...DEFAULT_SETTINGS.general, ...data?.general },
  hero: { ...DEFAULT_SETTINGS.hero, ...data?.hero },
  footer: { ...DEFAULT_SETTINGS.footer, ...data?.footer },
  policies: {
    refund: { ...DEFAULT_SETTINGS.policies.refund, ...data?.policies?.refund },
    shipping: { ...DEFAULT_SETTINGS.policies.shipping, ...data?.policies?.shipping },
    privacy: { ...DEFAULT_SETTINGS.policies.privacy, ...data?.policies?.privacy },
  },
  homepage: { ...DEFAULT_SETTINGS.homepage, ...data?.homepage },
  features: data?.features?.length ? data.features : DEFAULT_SETTINGS.features,
  coupons: data?.coupons ? data.coupons : DEFAULT_SETTINGS.coupons,
  contact: { ...DEFAULT_SETTINGS.contact, ...data?.contact },
});

const mapProduct = (row) =>
  row
    ? {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        fullDescription: row.full_description,
        salePrice: Number(row.sale_price),
        regularPrice: Number(row.regular_price || row.sale_price),
        category: row.category,
        status: row.status,
        image: row.image,
        images: row.images || [],
        tags: row.tags || [],
        featured: row.featured,
        bestSeller: row.best_seller,
        newArrival: row.new_arrival,
        rating: Number(row.rating),
        reviewCount: row.review_count,
        createdAt: row.created_at,
      }
    : null;

const mapProductToDb = (data) => ({
  title: data.title,
  slug: data.slug,
  description: data.description,
  full_description: data.fullDescription,
  sale_price: data.salePrice,
  regular_price: data.regularPrice,
  category: data.category,
  status: data.status,
  image: data.image,
  images: data.images || [],
  tags: data.tags || [],
  featured: !!data.featured,
  best_seller: !!data.bestSeller,
  new_arrival: !!data.newArrival,
  rating: data.rating ?? 4,
  review_count: data.reviewCount ?? 0,
  updated_at: new Date().toISOString(),
});

const mapOrder = (row) =>
  row
    ? {
        id: row.id,
        orderNumber: row.order_number,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        notes: row.notes,
        items: row.items,
        subtotal: Number(row.subtotal),
        shipping: Number(row.shipping),
        total: Number(row.total),
        status: row.status,
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        createdAt: row.created_at,
      }
    : null;

const mapProfile = (row) =>
  row
    ? {
        id: row.id,
        email: row.email,
        name: row.name,
        phone: row.phone,
        address: row.address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        role: row.role,
        avatarUrl: row.avatar_url,
        createdAt: row.created_at,
      }
    : null;

// ─── Settings ───
export const getSiteSettings = async () => {
  const db = getDb(false);
  if (!db) return DEFAULT_SETTINGS;
  const { data } = await db.from('site_settings').select('data').eq('id', 'site').maybeSingle();
  return data?.data ? mergeSettings(data.data) : DEFAULT_SETTINGS;
};

export const updateSiteSettings = async (updates) => {
  const db = getDb();
  const current = await getSiteSettings();
  const merged = { ...current, ...updates };
  const { error } = await db.from('site_settings').upsert({
    id: 'site',
    data: merged,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return { success: true };
};

// ─── Products ───
export const getAllProducts = async () => {
  const db = getDb(false);
  if (!db) return [];
  const { data, error } = await db.from('products').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapProduct);
};

export const getProductBySlug = async (slug) => {
  const db = getDb(false);
  if (!db) return null;
  const { data } = await db.from('products').select('*').eq('slug', slug).maybeSingle();
  return mapProduct(data);
};

export const getProductById = async (id) => {
  const db = getDb(false);
  if (!db) return null;
  const { data } = await db.from('products').select('*').eq('id', id).maybeSingle();
  return mapProduct(data);
};

export const addProduct = async (data) => {
  const db = getDb();
  const { ensureProductImagesStored } = await import('./storage');
  const prepared = await ensureProductImagesStored(data);
  const { data: row, error } = await db
    .from('products')
    .insert({ ...mapProductToDb(prepared), created_at: new Date().toISOString() })
    .select('id')
    .single();
  if (error) throw error;
  return { id: row.id };
};

export const updateProduct = async (id, data) => {
  const db = getDb();
  const { ensureProductImagesStored } = await import('./storage');
  const prepared = await ensureProductImagesStored(data);
  const { error } = await db.from('products').update(mapProductToDb(prepared)).eq('id', id);
  if (error) throw error;
};

export const deleteProduct = async (id) => {
  const db = getDb();
  const { error } = await db.from('products').delete().eq('id', id);
  if (error) throw error;
};

/** Upload a product image to Supabase Storage and return the public CDN URL. */
export const uploadProductImage = async (file, productSlug = 'misc') => {
  getDb();
  const { uploadProductImageFile } = await import('./storage');
  return uploadProductImageFile(file, productSlug);
};

/** Upload a site asset (logo, hero, lookbook) to Supabase Storage. */
export const uploadSiteImage = async (file, folder = 'general') => {
  getDb();
  const { uploadSiteAssetFile } = await import('./storage');
  return uploadSiteAssetFile(file, folder);
};

/** Migrate all product and site images to Supabase Storage. Skips images already on CDN. */
export const migrateAllImagesToStorage = async (onProgress) => {
  getDb();
  const { runImageMigration } = await import('./storage');
  const products = await getAllProducts();
  const settings = await getSiteSettings();

  return runImageMigration(
    products,
    settings,
    async (productId, data) => {
      const db = getDb();
      await db.from('products').update({
        image: data.image,
        images: data.images,
        updated_at: new Date().toISOString(),
      }).eq('id', productId);
    },
    async (newSettings) => {
      await updateSiteSettings({
        general: newSettings.general,
        hero: newSettings.hero,
        homepage: newSettings.homepage,
      });
    },
    onProgress
  );
};

// ─── Categories ───
export const getCategories = async () => {
  const db = getDb(false);
  if (!db) {
    return [
      { id: 'silk', name: 'Silk', slug: 'Silk', order: 1 },
      { id: 'organza', name: 'Organza', slug: 'Organza', order: 2 },
      { id: 'chinon', name: 'Chinon', slug: 'Chinon', order: 3 },
      { id: 'linen', name: 'Linen', slug: 'Linen', order: 4 },
      { id: 'designer', name: 'Designer', slug: 'Designer', order: 5 },
    ];
  }
  const { data } = await db.from('categories').select('*').order('sort_order');
  if (!data?.length) {
    return [
      { id: 'silk', name: 'Silk', slug: 'Silk', order: 1 },
      { id: 'organza', name: 'Organza', slug: 'Organza', order: 2 },
      { id: 'chinon', name: 'Chinon', slug: 'Chinon', order: 3 },
      { id: 'linen', name: 'Linen', slug: 'Linen', order: 4 },
      { id: 'designer', name: 'Designer', slug: 'Designer', order: 5 },
    ];
  }
  return data.map((c) => ({ id: c.id, name: c.name, slug: c.slug, order: c.sort_order }));
};

export const saveCategory = async (id, data) => {
  const db = getDb();
  if (id) {
    const { error } = await db.from('categories').update({ name: data.name, slug: data.slug, sort_order: data.order }).eq('id', id);
    if (error) throw error;
    return { id };
  }
  const { data: row, error } = await db.from('categories').insert({ name: data.name, slug: data.slug, sort_order: data.order }).select('id').single();
  if (error) throw error;
  return { id: row.id };
};

export const deleteCategory = async (id) => {
  const db = getDb();
  const { error } = await db.from('categories').delete().eq('id', id);
  if (error) throw error;
};

// ─── Orders ───
export const createOrder = async (orderData) => {
  const db = getDb();
  const orderNumber = orderData.orderNumber || `PS${Date.now().toString().slice(-8)}`;
  const { data, error } = await db
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: orderData.userId || null,
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      state: orderData.state,
      pincode: orderData.pincode,
      notes: orderData.notes,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      total: orderData.total,
      status: orderData.status || 'pending',
      payment_method: orderData.paymentMethod,
      payment_status: orderData.paymentStatus || (orderData.paymentMethod === 'razorpay' ? 'awaiting_payment' : 'cod'),
      created_at: new Date().toISOString(),
    })
    .select('id, order_number')
    .single();
  if (error) throw error;
  return { id: data.id, orderNumber: data.order_number };
};

export const getAllOrders = async () => {
  const db = getDb(false);
  if (!db) return [];
  const { data } = await db.from('orders').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapOrder);
};

export const getOrderById = async (id) => {
  const db = getDb(false);
  if (!db) return null;
  const { data } = await db.from('orders').select('*').eq('id', id).maybeSingle();
  return mapOrder(data);
};

export const getOrdersByUser = async (userId, phone) => {
  const db = getDb(false);
  if (!db) return [];
  let query = db.from('orders').select('*').order('created_at', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  const { data } = await query;
  let orders = (data || []).map(mapOrder);
  if (phone && !userId) {
    const normalized = phone.replace(/\D/g, '').slice(-10);
    orders = orders.filter((o) => String(o.phone || '').replace(/\D/g, '').slice(-10) === normalized);
  }
  return orders;
};

export const updateOrder = async (id, data) => {
  const db = getDb();
  const payload = { updated_at: new Date().toISOString() };
  if (data.status) payload.status = data.status;
  if (data.paymentStatus) payload.payment_status = data.paymentStatus;
  if (data.razorpayPaymentId) payload.razorpay_payment_id = data.razorpayPaymentId;
  if (data.razorpayOrderId) payload.razorpay_order_id = data.razorpayOrderId;
  const { error } = await db.from('orders').update(payload).eq('id', id);
  if (error) throw error;
};

// ─── Profiles ───
export const getUserProfile = async (uid) => {
  const db = getDb(false);
  if (!db || !uid) return null;
  const { data } = await db.from('profiles').select('*').eq('id', uid).maybeSingle();
  return mapProfile(data);
};

export const saveUserProfile = async (uid, profileData) => {
  const db = getDb();
  const payload = {
    id: uid,
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phone,
    address: profileData.address,
    city: profileData.city,
    state: profileData.state,
    pincode: profileData.pincode,
    role: profileData.role || 'customer',
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await db.from('profiles').upsert(payload).select('*').single();
  if (error) throw error;
  return mapProfile(data);
};

export const getAllUsers = async () => {
  const db = getDb(false);
  if (!db) return [];
  const { data } = await db.from('profiles').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapProfile);
};

// ─── Newsletter ───
export const subscribeNewsletter = async (email) => {
  const db = getDb(false);
  if (!db) return { success: true, offline: true };
  const { error } = await db.from('newsletter').insert({ email: email.toLowerCase() });
  if (error?.code === '23505') return { success: true, duplicate: true };
  if (error) throw error;
  return { success: true };
};

export const getNewsletterSubscribers = async () => {
  const db = getDb(false);
  if (!db) return [];
  const { data } = await db.from('newsletter').select('*').order('subscribed_at', { ascending: false });
  return (data || []).map((r) => ({ id: r.id, email: r.email, subscribedAt: r.subscribed_at }));
};

// ─── Seed ───
export const seedDatabase = async () => {
  const db = getDb();

  const { data: existingSettings } = await db.from('site_settings').select('id').eq('id', 'site').maybeSingle();
  if (!existingSettings) {
    await db.from('site_settings').insert({ id: 'site', data: { ...DEFAULT_SETTINGS, seeded: true } });
  }

  const { count } = await db.from('products').select('*', { count: 'exact', head: true });
  if (!count) {
    const rows = SEED_PRODUCTS.map((p) => ({
      title: p.title,
      slug: p.slug,
      description: p.description,
      full_description: p.fullDescription,
      sale_price: p.salePrice,
      regular_price: p.regularPrice,
      category: p.category,
      status: p.status,
      image: p.image,
      images: p.images || [],
      tags: p.tags || [],
      featured: !!p.featured,
      best_seller: !!p.bestSeller,
      new_arrival: !!p.newArrival,
      rating: p.rating ?? 4,
      review_count: p.reviewCount ?? 0,
    }));
    const { error } = await db.from('products').insert(rows);
    if (error) throw error;
  }

  const { count: catCount } = await db.from('categories').select('*', { count: 'exact', head: true });
  if (!catCount) {
    await db.from('categories').insert([
      { name: 'Silk', slug: 'Silk', sort_order: 1 },
      { name: 'Organza', slug: 'Organza', sort_order: 2 },
      { name: 'Chinon', slug: 'Chinon', sort_order: 3 },
      { name: 'Linen', slug: 'Linen', sort_order: 4 },
      { name: 'Designer', slug: 'Designer', sort_order: 5 },
    ]);
  }

  return { success: true, products: SEED_PRODUCTS.length };
};
