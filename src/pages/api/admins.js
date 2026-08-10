import { createServiceClient } from '../../lib/supabase';

export default async function handler(req, res) {
  const svc = createServiceClient();
  if (!svc) return res.status(500).json({ error: 'Service role not configured' });

  if (req.method === 'GET') {
    const { data, error } = await svc.from('profiles').select('email').eq('role', 'admin');
    if (error) return res.status(500).json({ error: error.message });
    const admins = (data || []).map((r) => r.email).filter(Boolean);
    return res.json({ admins });
  }

  res.setHeader('Allow', 'GET');
  res.status(405).end('Method Not Allowed');
}
