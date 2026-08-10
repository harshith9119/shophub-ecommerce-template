import { createServiceClient } from '../../lib/supabase';

export default async function handler(req, res) {
  const svc = createServiceClient();
  if (!svc) return res.status(500).json({ error: 'Service role not configured' });

  if (req.method === 'POST') {
    const { email, makeAdmin } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const role = makeAdmin ? 'admin' : 'customer';
    const { error } = await svc.from('profiles').update({ role }).eq('email', email.toLowerCase());
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  res.setHeader('Allow', 'POST');
  res.status(405).end('Method Not Allowed');
}
