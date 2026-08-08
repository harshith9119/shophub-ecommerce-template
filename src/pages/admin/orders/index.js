import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard';
import AdminLayout from '../../../components/AdminLayout';
import { getAllOrders } from '../../../lib/db';
import { formatPrice, ORDER_STATUS } from '../../../lib/utils';

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders().then((data) => { setOrders(data); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <AdminLayout title="Orders">
      <div className="flex gap-3 mb-8 flex-wrap">
        {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${filter === s ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="admin-card overflow-hidden p-0">
        {loading ? (
          <p className="p-8 text-gray-500 animate-pulse">Loading orders...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-gray-500">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 bg-gray-950">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const statusInfo = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
                  return (
                    <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-4">
                        <Link href={`/admin/orders/${o.id}`} className="text-orange-400 hover:underline font-bold">{o.orderNumber}</Link>
                      </td>
                      <td className="p-4 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <p className="text-white">{o.name}</p>
                        <p className="text-gray-500 text-xs">{o.email}</p>
                      </td>
                      <td className="p-4 text-gray-400">{o.items?.length || 0}</td>
                      <td className="p-4 font-bold">{formatPrice(o.total)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusInfo.color}`}>{statusInfo.label}</span>
                      </td>
                      <td className="p-4 text-gray-400 uppercase text-xs">{o.paymentMethod}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function AdminOrders() {
  return <AdminGuard><OrdersContent /></AdminGuard>;
}
AdminOrders.displayName = 'AdminPage';
export default AdminOrders;
