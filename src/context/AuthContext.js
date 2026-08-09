import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, isAdminEmail, DEV_ADMIN_BYPASS } from '../lib/supabase';
import { getUserProfile } from '../lib/db';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const checkAdmin = async (sessionUser) => {
      if (!sessionUser) {
        setUser(null);
        setProfile(null);
        return;
      }
      const prof = await getUserProfile(sessionUser.id);
      const isAdmin = prof?.role === 'admin' || isAdminEmail(sessionUser.email);
      if (isAdmin) {
        setUser(sessionUser);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdmin(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session?.user ?? null).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    // Development bypass: allow a local dev admin when NEXT_PUBLIC_DEV_ADMIN_BYPASS=true and password === 'devadmin'
    if (DEV_ADMIN_BYPASS && password === 'devadmin') {
      setUser({ id: 'dev', email });
      setProfile({ id: 'dev', email, name: 'Dev Admin', role: 'admin' });
      setLoading(false);
      return { success: true };
    }

    if (!isSupabaseConfigured()) {
      setError('Supabase is not connected. See .env.local setup steps.');
      return { success: false };
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const prof = await getUserProfile(data.user.id);
      const isAdmin = prof?.role === 'admin' || isAdminEmail(email);

      if (!isAdmin) {
        await supabase.auth.signOut();
        setError('Account is not an admin. Run: update profiles set role=\'admin\' where email=\'your@email.com\' in Supabase SQL.');
        return { success: false };
      }

      if (prof?.role !== 'admin') {
        const { saveUserProfile } = await import('../lib/db');
        await saveUserProfile(data.user.id, { ...prof, role: 'admin', email });
      }

      setUser(data.user);
      setProfile({ ...prof, role: 'admin' });
      return { success: true };
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Invalid email or password.' : err.message);
      return { success: false };
    }
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, profile, loading, error, login, logout, isAdmin: !!user }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

export const AuthProvider = AdminAuthProvider;
export const useAuth = useAdminAuth;
