import React, { useState } from 'react';

export const ProductMultiSelect = ({ products, selectedIds, onChange, title, description, max = 0 }) => {
  const [search, setSearch] = useState('');
  
  const selectedProducts = (selectedIds || []).map(id => products.find(p => p.id === id)).filter(Boolean);
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) && 
    !(selectedIds || []).includes(p.id)
  );

  return (
    <div className="admin-card space-y-4">
      <h2 className="font-bold text-lg">{title}</h2>
      {description && <p className="text-sm text-gray-400 mb-2">{description}</p>}
      
      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium text-gray-300">
            Selected Products {max > 0 ? `(${selectedProducts.length}/${max})` : ''}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedProducts.map(p => (
              <div key={p.id} className="flex justify-between items-center p-2 bg-gray-800 rounded border border-emerald/30">
                <span className="truncate text-sm mr-2">{p.title}</span>
                <button 
                  onClick={() => onChange((selectedIds || []).filter(id => id !== p.id))}
                  className="text-red-400 hover:text-red-300 flex-shrink-0"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Add */}
      {(!max || (selectedIds || []).length < max) && (
        <div className="space-y-2">
          <input 
            type="text" 
            placeholder="Search products to add..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input"
          />
          <div className="max-h-48 overflow-y-auto border border-gray-700 rounded bg-gray-900/50">
            {filteredProducts.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">No products found.</div>
            ) : (
              filteredProducts.slice(0, 50).map(p => (
                <div key={p.id} className="flex justify-between items-center p-2 hover:bg-gray-800 border-b border-gray-800 last:border-0">
                  <span className="truncate text-sm mr-2">{p.title}</span>
                  <button 
                    onClick={() => onChange([...(selectedIds || []), p.id])}
                    className="text-emerald hover:text-emerald/80 text-xs uppercase tracking-wider font-semibold px-3 py-1 bg-emerald/10 rounded transition-colors"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
            {filteredProducts.length > 50 && (
              <div className="p-2 text-xs text-center text-gray-500 bg-gray-800/50">
                Showing top 50 results. Keep typing to search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ProductSingleSelect = ({ products, selectedId, onChange, title, description }) => {
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(!selectedId);
  
  const selectedProduct = products.find(p => p.id === selectedId);
  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-card space-y-4">
      <h2 className="font-bold text-lg">{title}</h2>
      {description && <p className="text-sm text-gray-400 mb-2">{description}</p>}
      
      {selectedProduct && !isEditing ? (
        <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-emerald/30">
          <span className="truncate text-sm font-medium mr-2">{selectedProduct.title}</span>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-blue-400 hover:text-blue-300 text-sm flex-shrink-0"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {selectedProduct && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Current: {selectedProduct.title}</span>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
          <input 
            type="text" 
            placeholder="Search for a product..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input"
          />
          <div className="max-h-48 overflow-y-auto border border-gray-700 rounded bg-gray-900/50">
            {/* Option to clear selection */}
            <div className="flex justify-between items-center p-2 hover:bg-gray-800 border-b border-gray-800">
              <span className="truncate text-sm italic text-gray-400">-- Auto-select / None --</span>
              <button 
                onClick={() => { onChange(''); setIsEditing(false); setSearch(''); }}
                className="text-gray-400 hover:text-gray-300 text-xs uppercase tracking-wider font-semibold px-3 py-1 bg-gray-800 rounded transition-colors"
              >
                Select
              </button>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">No products found.</div>
            ) : (
              filteredProducts.slice(0, 50).map(p => (
                <div key={p.id} className="flex justify-between items-center p-2 hover:bg-gray-800 border-b border-gray-800 last:border-0">
                  <span className="truncate text-sm mr-2">{p.title}</span>
                  <button 
                    onClick={() => { onChange(p.id); setIsEditing(false); setSearch(''); }}
                    className="text-emerald hover:text-emerald/80 text-xs uppercase tracking-wider font-semibold px-3 py-1 bg-emerald/10 rounded transition-colors"
                  >
                    Select
                  </button>
                </div>
              ))
            )}
            {filteredProducts.length > 50 && (
              <div className="p-2 text-xs text-center text-gray-500 bg-gray-800/50">
                Showing top 50 results. Keep typing to search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
