import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import PageHead from '../components/PageHead';
import SectionHeader from '../components/ui/SectionHeader';
import { FadeIn } from '../components/motion/Reveal';
import { getAllProducts, getCategories } from '../lib/db';
import { SEED_PRODUCTS } from '../lib/seedProducts';

export default function Catalog() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (router.query.category) setFilter(router.query.category);
    if (router.query.search) setSearch(router.query.search);
  }, [router.query]);

  useEffect(() => {
    Promise.all([getAllProducts(), getCategories()]).then(([prods, cats]) => {
      setProducts(prods.length ? prods : SEED_PRODUCTS);
      setCategories(['All', ...cats.map((c) => c.slug || c.name)]);
      setLoading(false);
    });
  }, []);

  let filtered = filter === 'All' ? products : products.filter((p) => p.category === filter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (sort === 'price-low') filtered = [...filtered].sort((a, b) => a.salePrice - b.salePrice);
  if (sort === 'price-high') filtered = [...filtered].sort((a, b) => b.salePrice - a.salePrice);
  if (sort === 'name') filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <PageHead title="Collection" description="Browse our complete collection of premium designer sarees." />
      <div className="bg-page min-h-screen transition-colors duration-500">
        <Navbar />

        {/* Catalog hero */}
        <div className="pt-32 pb-16 md:pt-40 md:pb-20 bg-emerald text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grain opacity-20" />
          <div className="luxury-container relative z-10">
            <FadeIn>
              <p className="luxury-subheading text-gold-light mb-4">Our Collection</p>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium">Complete Catalog</h1>
              <p className="text-white/60 font-light mt-4 max-w-lg">Handpicked sarees for every occasion — woven with elegance, chosen with care.</p>
            </FadeIn>
          </div>
        </div>

        <main className="luxury-container luxury-section">
          {/* Filters */}
          <FadeIn>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-14 pb-8 border-b border-soft">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-5 py-2.5 text-[10px] font-sans font-semibold uppercase tracking-wide transition-all duration-300 ${
                      filter === cat
                        ? 'bg-emerald dark:bg-gold text-white'
                        : 'bg-surface text-subtle border border-soft hover:border-gold hover:text-emerald dark:hover:text-gold-light'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-5 py-2.5 bg-surface border border-soft text-[11px] font-sans uppercase tracking-wide text-body focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="default">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </FadeIn>

          {search && (
            <p className="text-muted font-light text-center mb-10">
              Showing results for &ldquo;{search}&rdquo; — {filtered.length} piece{filtered.length !== 1 ? 's' : ''}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-cream mb-4" />
                  <div className="h-4 bg-cream w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-cream w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif text-2xl text-emerald mb-4">No pieces found</p>
              <button onClick={() => { setFilter('All'); setSearch(''); }} className="luxury-link">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((product, i) => (
                <ProductCard key={product.id || product.slug} product={product} showRating index={i % 8} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
