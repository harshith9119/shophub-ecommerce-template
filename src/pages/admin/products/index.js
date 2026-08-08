import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import AdminGuard from '../../../components/AdminGuard';
import AdminLayout from '../../../components/AdminLayout';
import { getAllProducts, deleteProduct } from '../../../lib/db';
import { formatPrice } from '../../../lib/utils';

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    getAllProducts().then((data) => { setProducts(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await deleteProduct(id);
    load();
  };

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Products">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input pl-10" />
        </div>
        <Link href="/admin/products/new" className="admin-btn flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add New Saree
        </Link>
      </div>

      <div className="admin-card overflow-hidden p-0">
        {loading ? (
          <p className="p-8 text-gray-500 animate-pulse">Loading products...</p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No products found.</p>
            <Link href="/admin/seed" className="text-orange-400 hover:underline">Seed database with reference products →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 bg-gray-950">
                  <th className="p-4">Image</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-4">
                      <img src={p.image} alt="" className="w-12 h-16 object-cover rounded" />
                    </td>
                    <td className="p-4 font-semibold text-white max-w-xs truncate">{p.title}</td>
                    <td className="p-4 text-gray-400">{p.category}</td>
                    <td className="p-4 font-bold">{formatPrice(p.salePrice)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.status === 'Available' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${p.id}`} className="p-2 text-blue-400 hover:bg-gray-800 rounded"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => handleDelete(p.id, p.title)} className="p-2 text-red-400 hover:bg-gray-800 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function AdminProducts() {
  return <AdminGuard><ProductsContent /></AdminGuard>;
}
AdminProducts.displayName = 'AdminPage';
export default AdminProducts;
