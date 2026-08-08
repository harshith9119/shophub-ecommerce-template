import React, { useState, useEffect, useMemo } from 'react';
import { Phone, Search } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import { getAllUsers } from '../../lib/db';

function CustomersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getAllUsers().then((data) => { setUsers(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.phone, u.city, u.state, u.pincode]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [users, query]);

  return (
    <AdminLayout title="Customers">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone, city…"
            className="admin-input pl-11"
          />
        </div>
        {query && (
          <p className="text-gray-400 text-sm">
            {filtered.length} of {users.length} customer{users.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="admin-card overflow-hidden p-0">
        {loading ? (
          <p className="p-8 text-gray-500 animate-pulse">Loading customers...</p>
        ) : users.length === 0 ? (
          <p className="p-8 text-gray-500">No registered customers yet.</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-gray-500">No customers match &ldquo;{query}&rdquo;</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 bg-gray-950">
                  <th className="p-4">Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-4 font-semibold text-white">{u.name || '—'}</td>
                    <td className="p-4 text-gray-300"><span className="inline-flex items-center gap-2"><Phone className="w-3 h-3" /> {u.phone || '—'}</span></td>
                    <td className="p-4 text-gray-400">{u.email || '—'}</td>
                    <td className="p-4 text-gray-400">{u.city ? `${u.city}, ${u.state || ''}` : '—'}</td>
                    <td className="p-4 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
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

function AdminCustomers() {
  return <AdminGuard><CustomersContent /></AdminGuard>;
}
AdminCustomers.displayName = 'AdminPage';
export default AdminCustomers;
