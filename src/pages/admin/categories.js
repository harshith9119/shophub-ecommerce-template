import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import { getCategories, saveCategory, deleteCategory } from '../../lib/db';

function CategoriesContent() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => getCategories().then((c) => { setCategories(c); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await saveCategory(null, { name: newName.trim(), slug: newName.trim(), order: categories.length + 1 });
    setNewName('');
    load();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    await deleteCategory(id);
    load();
  };

  return (
    <AdminLayout title="Categories">
      <form onSubmit={handleAdd} className="flex gap-4 mb-8">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category name..." className="admin-input flex-1" />
        <button type="submit" className="admin-btn flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
      </form>

      <div className="admin-card">
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading...</p>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-bold text-white">{cat.name}</p>
                  <p className="text-gray-500 text-sm">Slug: {cat.slug}</p>
                </div>
                <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-red-400 hover:bg-gray-800 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function AdminCategories() {
  return <AdminGuard><CategoriesContent /></AdminGuard>;
}
AdminCategories.displayName = 'AdminPage';
export default AdminCategories;
