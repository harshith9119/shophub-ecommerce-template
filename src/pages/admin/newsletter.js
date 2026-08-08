import React, { useState, useEffect } from 'react';
import { Mail, Download } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import { getNewsletterSubscribers } from '../../lib/db';

function NewsletterContent() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewsletterSubscribers().then((data) => { setSubscribers(data); setLoading(false); });
  }, []);

  const exportCsv = () => {
    const csv = 'Email,Subscribed At\n' + subscribers.map((s) => `${s.email},${s.subscribedAt}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
  };

  return (
    <AdminLayout title="Newsletter Subscribers">
      <div className="flex justify-between items-center mb-8">
        <p className="text-gray-400">{subscribers.length} subscriber(s)</p>
        {subscribers.length > 0 && (
          <button onClick={exportCsv} className="admin-btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      <div className="admin-card">
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading...</p>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No subscribers yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subscribers.map((s) => (
              <div key={s.id} className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                <span className="text-white">{s.email}</span>
                <span className="text-gray-500 text-sm">{new Date(s.subscribedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function AdminNewsletter() {
  return <AdminGuard><NewsletterContent /></AdminGuard>;
}
AdminNewsletter.displayName = 'AdminPage';
export default AdminNewsletter;
