import React, { useState, memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, calcDiscount } from '../lib/utils';
import SiteImage from './SiteImage';
import ProductPreviewModal from './ProductPreviewModal';

function ProductCard({ product, showRating = false, index = 0, compact = false }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const discount = calcDiscount(product.salePrice, product.regularPrice);
  const slug = product.slug || product.id;
  const secondaryImage = product.images?.[1] || product.image;
  const soldOut = product.status === 'Sold out';

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.75, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/product/${slug}`} className="block luxury-card overflow-hidden">
          <div className="product-image-wrap">
            <SiteImage
              src={hovered && secondaryImage !== product.image ? secondaryImage : product.image}
              alt={product.title}
              className={`${soldOut ? 'opacity-50 grayscale' : ''}`}
              width={640}
              context="card"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discount > 0 && !soldOut && (
                <span className="bg-gold/95 text-white text-[8px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1">
                  −{formatPrice(discount)}
                </span>
              )}
              {product.bestSeller && (
                <span className="bg-emerald/95 text-white text-[8px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1">
                  Best Seller
                </span>
              )}
            </div>

            {soldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/40 backdrop-blur-[1px]">
                <span className="border border-white/30 text-white px-5 py-2 text-[9px] font-sans font-semibold uppercase tracking-luxury">
                  Sold Out
                </span>
              </div>
            )}

            {/* Overlay actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewOpen(true); }} className="bg-white/95 dark:bg-charcoal/95 p-2 rounded-full shadow-sm hover:bg-gold">
                <Eye className="w-4 h-4 text-emerald" />
              </button>
            </div>

            {!soldOut && (
              <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 text-[9px] font-sans font-semibold uppercase tracking-wider transition-colors duration-300 ${
                    added ? 'bg-emerald text-white' : 'bg-white/95 dark:bg-charcoal/95 text-emerald dark:text-gold backdrop-blur-sm hover:bg-gold hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {added ? 'Added to Bag' : 'Quick Add'}
                </button>
              </div>
            )}
          </div>

          <div className={`${compact ? 'p-4' : 'p-4 md:p-5'} text-center border-t border-soft group-hover:border-gold/20 transition-colors duration-500`}>
            {showRating && product.rating && (
              <div className="flex items-center justify-center gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${i < Math.floor(product.rating) ? 'fill-gold text-gold' : 'text-cream dark:text-white/20'}`}
                    strokeWidth={0}
                  />
                ))}
              </div>
            )}
            <h3 className="font-serif text-sm md:text-base text-emerald dark:text-gold-light/90 font-medium mb-2 line-clamp-2 leading-snug group-hover:text-gold transition-colors duration-500">
              {product.title}
            </h3>
            <div className="flex justify-center items-baseline gap-2">
              <span className="font-sans text-base font-semibold text-body">{formatPrice(product.salePrice)}</span>
              {product.regularPrice > product.salePrice && (
                <span className="text-xs text-subtle line-through font-light">{formatPrice(product.regularPrice)}</span>
              )}
            </div>
          </div>

          {/* Gold accent line on hover */}
          <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-gold/0 via-gold to-gold/0 transition-all duration-700 mx-auto" />
        </Link>
      </motion.div>

      <ProductPreviewModal product={product} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </>
  );
}

export default memo(ProductCard);
