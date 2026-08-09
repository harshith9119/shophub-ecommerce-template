import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import { ADMIN_EMAILS } from '../../lib/supabase';
import { getSetupStatus } from '../../lib/setupStatus';

function StatusRow({ label, ok, detail }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
      {ok ? (
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-gray-400 text-sm mt-1">{detail}</p>
      </div>
      <span className={`ml-auto text-xs font-bold uppercase px-2 py-1 rounded ${ok ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
        {ok ? 'Connected' : 'Not Set Up'}
      </span>
    </div>
  );
}

function AdminEmailsManager() {
  const [list, setList] = useState([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch('/api/admins');
      const data = await res.json();
      setList(data.admins || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (emailToChange, makeAdmin) => {
    setBusy(true);
    await fetch('/api/set-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailToChange, makeAdmin }),
    });
    await load();
    setBusy(false);
  };

  const add = () => {
    if (email) changeRole(email, true).then(() => setEmail(''));
  };

  return (
    <div>
      <div className="mb-3">
        <input className="bg-gray-800 text-white px-3 py-2 rounded w-full" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email to grant admin" />
        <div className="mt-2 flex gap-2">
          <button onClick={add} className="bg-gold text-black px-3 py-1 rounded" disabled={busy}>Grant Admin</button>
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-2">Current admins:</p>
        <ul className="space-y-1">
          {list.map((a) => (
            <li key={a} className="flex items-center justify-between bg-gray-800 p-2 rounded">
              <span>{a}</span>
              <div className="flex gap-2">
                <button onClick={() => changeRole(a, false)} className="text-red-400" disabled={busy}>Revoke</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SettingsContent() {
  const [status, setStatus] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      try {
        const res = await fetch('/api/setup/status');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setStatus(data);
          return;
        }
      } catch {
        // API unavailable (static export / Firebase hosting) — fall back to client check
      }

      try {
        const data = await getSetupStatus();
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) {
          setLoadError('Could not check connection status.');
          setStatus({ supabase: false, supabaseLive: false, razorpay: false });
        }
      }
    };

    loadStatus();
    return () => { cancelled = true; };
  }, []);

  const supabaseOk = status?.supabase && status?.supabaseLive;

  return (
    <AdminLayout title="Setup & Settings">
      <div className="max-w-3xl space-y-8">
        <div className="admin-card space-y-4">
          <h2 className="font-bold text-lg text-white">Connection Status</h2>
          {status ? (
            <div className="space-y-3">
              {loadError && <p className="text-amber-400 text-sm">{loadError}</p>}
              <StatusRow
                label="Supabase Database"
                ok={supabaseOk}
                detail={
                  supabaseOk
                    ? 'Supabase is connected. Orders, products & login work.'
                    : status.supabase
                      ? 'Keys are set but database is not reachable. Run supabase/schema.sql in Supabase SQL Editor.'
                      : 'Add Supabase keys to .env.local — see steps below.'
                }
              />
              <StatusRow
                label="Razorpay Payments"
                ok={status.razorpay}
                detail={status.razorpay ? 'Online UPI/Card/Netbanking payments are enabled.' : 'Add Razorpay keys to .env.local for online payments. COD still works once Supabase is set up.'}
              />
            </div>
          ) : (
            <p className="text-gray-500 animate-pulse">Checking...</p>
          )}
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            Step 1 — Supabase Database & Auth
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light">
              <ExternalLink className="w-4 h-4" />
            </a>
          </h2>
          <ol className="text-gray-400 text-sm space-y-3 list-decimal pl-5 leading-relaxed">
            <li>Go to <strong className="text-white">supabase.com</strong> → New project → name it <code className="text-gold">shophub-ecommerce</code></li>
            <li><strong className="text-white">SQL Editor</strong> → paste and run <code className="text-gold">supabase/schema.sql</code> from this project</li>
            <li><strong className="text-white">Project Settings → API</strong> → copy Project URL and anon/public key</li>
            <li>Add to <code className="text-gold">.env.local</code>:
              <pre className="mt-2 bg-gray-950 p-3 rounded text-xs text-green-400 overflow-x-auto">{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...`}</pre>
            </li>
            <li><strong className="text-white">Authentication → URL Configuration</strong> → set Site URL to your domain and add <code className="text-gold">/auth/callback</code> to Redirect URLs</li>
            <li><strong className="text-white">Authentication → Providers</strong> → enable Email. For testing you can disable &quot;Confirm email&quot;; for production keep it on.</li>
            <li>Create admin user: sign up at <code className="text-gold">/admin/login</code> with email <code className="text-gold">{status?.adminEmail || 'abcdef@gmail.com'}</code> and password <code className="text-gold">12345678</code></li>
            <li>Or run in SQL Editor: <code className="text-gold">update profiles set role=&apos;admin&apos; where email=&apos;abcdef@gmail.com&apos;;</code></li>
            <li>Run <code className="text-gold">supabase/storage.sql</code> in SQL Editor to create image storage buckets</li>
            <li>Restart dev server: <code className="text-gold">npm run dev</code></li>
            <li>Go to <strong className="text-white">Seed Database</strong> in admin sidebar to import all 29 products</li>
            <li>Go to <strong className="text-white">Image Storage</strong> → <strong className="text-white">Migrate All Images</strong> to move photos to Supabase CDN (much faster loading)</li>
          </ol>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            Step 2 — Deploy on Vercel
            <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light">
              <ExternalLink className="w-4 h-4" />
            </a>
          </h2>
          <ol className="text-gray-400 text-sm space-y-3 list-decimal pl-5 leading-relaxed">
            <li>Push this project to GitHub</li>
            <li>Import repo at <strong className="text-white">vercel.com/new</strong></li>
            <li>Add the same env vars from <code className="text-gold">.env.local</code> in Vercel → Settings → Environment Variables</li>
            <li>In Supabase → Authentication → URL Configuration → add your Vercel domain and <code className="text-gold">https://yourdomain.com/auth/callback</code> to Redirect URLs</li>
            <li>Deploy — your store goes live automatically on every push</li>
          </ol>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            Step 3 — Razorpay Payments
            <a href="https://dashboard.razorpay.com/signup" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light">
              <ExternalLink className="w-4 h-4" />
            </a>
          </h2>
          <ol className="text-gray-400 text-sm space-y-3 list-decimal pl-5 leading-relaxed">
            <li>Sign up at <strong className="text-white">dashboard.razorpay.com</strong> (use TEST mode while developing)</li>
            <li>Go to <strong className="text-white">Settings → API Keys</strong> → Generate Test Keys</li>
            <li>Add to <code className="text-gold">.env.local</code> and Vercel env vars:
              <pre className="mt-2 bg-gray-950 p-3 rounded text-xs text-green-400 overflow-x-auto">{`NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key`}</pre>
            </li>
            <li>Restart server — checkout will show <strong className="text-white">Pay Online</strong> option</li>
          </ol>
        </div>

        <div className="admin-card">
          <h2 className="font-bold text-lg mb-2 text-white">Admin Emails</h2>
          <p className="text-gray-400 text-sm mb-3">Manage admin users (grant or revoke admin role).</p>
          <AdminEmailsManager />
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminSettings() {
  return <AdminGuard><SettingsContent /></AdminGuard>;
}

AdminSettings.displayName = 'AdminPage';
export default AdminSettings;
