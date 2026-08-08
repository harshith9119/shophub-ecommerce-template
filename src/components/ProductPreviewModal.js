import React from 'react';
import SiteImage from './SiteImage';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductPreviewModal({ product, open, onClose }) {
  const { addToCart } = useCart();
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-charcoal max-w-3xl w-full rounded-lg overflow-hidden shadow-xl">
        <div className="flex justify-end p-3">
          <button onClick={onClose} className="p-2 text-muted hover:text-red-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <SiteImage src={product.image} alt={product.title} className="w-full h-96 object-cover rounded-md" priority />
          </div>
          <div className="space-y-4">
            <h2 className="font-serif text-2xl">{product.title}</h2>
            <p className="text-muted text-sm">{product.description}</p>
            <div className="flex items-center gap-4">
              <div className="text-xl font-semibold">₹{product.salePrice}</div>
              {product.regularPrice > product.salePrice && (
                <div className="text-sm text-muted line-through">₹{product.regularPrice}</div>
              )}
            </div>
            <div className="space-y-2">
              <button onClick={() => { addToCart(product); onClose(); }} className="luxury-btn flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Add to Bag
              </button>
            </div>
            <div className="text-xs text-muted">SKU: {product.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
