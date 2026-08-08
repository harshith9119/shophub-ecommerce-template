import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Mail, TrendingUp, AlertTriangle } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import { getAllProducts, getAllOrders, getNewsletterSubscribers } from '../../lib/db';
import { formatPrice } from '../../lib/utils';

function DashboardContent() {
  const [stats, setStats] = useState({ products: 0, orders: 0, subscribers: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllProducts(), getAllOrders(), getNewsletterSubscribers()]).then(
      ([products, orders, subs]) => {
        const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
        const pending = orders.filter((o) => o.status === 'pending').length;
        setStats({ products: products.length, orders: orders.length, subscribers: subs.length, revenue, pending });
        setRecentOrders(orders.slice(0, 5));
        setLoading(false);
      }
    );
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'text-blue-400' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'text-green-400' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: TrendingUp, color: 'text-orange-400' },
    { label: 'Newsletter Subs', value: stats.subscribers, icon: Mail, color: 'text-purple-400' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {stats.pending > 0 && (
        <div className="admin-card flex items-center gap-3 mb-8 border-orange-800 bg-orange-900/20">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <span className="text-orange-300">{stats.pending} pending order(s) need attention.</span>
          <Link href="/admin/orders" className="ml-auto text-orange-400 hover:text-orange-300 text-sm font-bold">View Orders →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="admin-card">
            <div className="flex items-center justify-between mb-4">
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <p className="text-3xl font-extrabold text-white">{loading ? '...' : value}</p>
            <p className="text-gray-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-orange-400 text-sm hover:text-orange-300">View All</Link>
        </div>
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading...</p>
        ) : recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-800/50">
                    <td className="py-3">
                      <Link href={`/admin/orders/${o.id}`} className="text-orange-400 hover:underline">{o.orderNumber}</Link>
                    </td>
                    <td className="py-3 text-gray-300">{o.name}</td>
                    <td className="py-3 font-bold">{formatPrice(o.total)}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-gray-800">{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link href="/admin/products" className="admin-card hover:border-orange-600 transition group">
          <Package className="w-8 h-8 text-orange-400 mb-3" />
          <h3 className="font-bold group-hover:text-orange-400 transition">Manage Products</h3>
          <p className="text-gray-500 text-sm mt-1">Add, edit, or remove sarees</p>
        </Link>
        <Link href="/admin/design" className="admin-card hover:border-orange-600 transition group">
          <TrendingUp className="w-8 h-8 text-orange-400 mb-3" />
          <h3 className="font-bold group-hover:text-orange-400 transition">Design Website</h3>
          <p className="text-gray-500 text-sm mt-1">Customize colors, hero, branding</p>
        </Link>
        <Link href="/admin/seed" className="admin-card hover:border-orange-600 transition group">
          <AlertTriangle className="w-8 h-8 text-orange-400 mb-3" />
          <h3 className="font-bold group-hover:text-orange-400 transition">Seed Database</h3>
          <p className="text-gray-500 text-sm mt-1">Import 29 products from reference site</p>
        </Link>
      </div>
    </AdminLayout>
  );
}

function AdminDashboard() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}

AdminDashboard.displayName = 'AdminPage';
export default AdminDashboard;
