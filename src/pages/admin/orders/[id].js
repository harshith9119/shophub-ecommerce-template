import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminGuard from '../../../components/AdminGuard';
import AdminLayout from '../../../components/AdminLayout';
import { getOrderById, updateOrder } from '../../../lib/db';
import { formatPrice, ORDER_STATUS } from '../../../lib/utils';

function OrderDetailContent() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then((o) => { if (o) { setOrder(o); setStatus(o.status); } });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await updateOrder(id, { status });
    setOrder((prev) => ({ ...prev, status }));
    setSaving(false);
  };

  if (!order) return <AdminLayout title="Order"><p className="animate-pulse text-gray-500">Loading...</p></AdminLayout>;

  return (
    <AdminLayout title={`Order ${order.orderNumber}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card">
            <h2 className="font-bold mb-4">Order Items</h2>
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-4 py-4 border-b border-gray-800 last:border-0">
                <img src={item.image} alt="" className="w-16 h-20 object-cover rounded" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-gray-400 text-sm">Qty: {item.quantity} × {formatPrice(item.salePrice)}</p>
                </div>
                <p className="font-bold">{formatPrice(item.salePrice * item.quantity)}</p>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between text-xl font-bold text-white"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="font-bold mb-4">Shipping Address</h2>
            <p className="text-white font-semibold">{order.name}</p>
            <p className="text-gray-400">{order.address}</p>
            <p className="text-gray-400">{order.city}, {order.state} - {order.pincode}</p>
            <p className="text-gray-400 mt-2">{order.phone}</p>
            <p className="text-gray-400">{order.email}</p>
            {order.notes && <p className="text-gray-500 mt-4 text-sm">Notes: {order.notes}</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="admin-card">
            <h2 className="font-bold mb-4">Update Status</h2>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="admin-input mb-4">
              {Object.entries(ORDER_STATUS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <button onClick={handleSave} disabled={saving} className="admin-btn w-full">{saving ? 'Saving...' : 'Update Status'}</button>
          </div>
          <div className="admin-card text-sm space-y-2">
            <p><span className="text-gray-500">Payment:</span> <span className="uppercase font-bold">{order.paymentMethod}</span></p>
            <p><span className="text-gray-500">Placed:</span> {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminOrderDetail() {
  return <AdminGuard><OrderDetailContent /></AdminGuard>;
}
AdminOrderDetail.displayName = 'AdminPage';
export default AdminOrderDetail;
