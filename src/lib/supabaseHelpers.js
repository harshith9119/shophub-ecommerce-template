import { supabase as client, isSupabaseConfigured, createServiceClient } from './supabase';

export { client as supabase, isSupabaseConfigured, createServiceClient };

export function getDb(requireConnection = true) {
  if (!client) {
    if (requireConnection) {
      const err = new Error('Supabase is not configured. Add keys to .env.local — see comments in that file.');
      err.code = 'SUPABASE_NOT_CONFIGURED';
      throw err;
    }
    return null;
  }
  return client;
}
