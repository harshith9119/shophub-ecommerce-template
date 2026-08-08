import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, isAdminEmail } from '../lib/supabase';
import { getUserProfile } from '../lib/db';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = async (uid) => {
    const data = await getUserProfile(uid);
    setProfile(data);
    return data;
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      if (u && !isAdminEmail(u.email)) {
        setUser(u);
        loadProfile(u.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      if (sessionUser && !isAdminEmail(sessionUser.email)) {
        setUser(sessionUser);
        await loadProfile(sessionUser.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getEmailRedirectTo = () =>
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

  const completeProfileFromMetadata = async (authUser) => {
    const meta = authUser.user_metadata || {};
    if (!meta.name && !meta.phone && !meta.address) return;
    const { saveUserProfile } = await import('../lib/db');
    await saveUserProfile(authUser.id, {
      email: authUser.email,
      name: meta.name,
      phone: meta.phone,
      address: meta.address,
      city: meta.city,
      state: meta.state,
      pincode: meta.pincode,
      role: 'customer',
    });
  };

  const signUp = async ({ email, password, name, phone, address, city, state, pincode }) => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError('Supabase is not connected. Add keys to .env.local.');
      return { success: false };
    }
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, address, city, state, pincode },
          emailRedirectTo: getEmailRedirectTo(),
        },
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Signup failed');

      // Profile save requires an active session (RLS). Metadata is saved in auth until email is confirmed.
      if (data.session) {
        const { saveUserProfile } = await import('../lib/db');
        await saveUserProfile(data.user.id, {
          email,
          name,
          phone,
          address,
          city,
          state,
          pincode,
          role: 'customer',
        });
        setUser(data.user);
        await loadProfile(data.user.id);
      }

      return { success: true, needsEmailConfirm: !data.session };
    } catch (err) {
      const msg =
        err.message?.includes('already registered')
          ? 'This email is already registered. Please sign in.'
          : err.message || 'Registration failed.';
      setError(msg);
      return { success: false };
    }
  };

  const signIn = async (email, password) => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError('Supabase is not connected.');
      return { success: false };
    }
    if (isAdminEmail(email)) {
      setError('Store owners should use the admin login at /admin/login');
      return { success: false };
    }
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      setUser(data.user);
      try {
        await completeProfileFromMetadata(data.user);
      } catch {
        // Non-fatal if profile already exists
      }
      await loadProfile(data.user.id);
      return { success: true };
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email first. Check your inbox (and spam folder), then sign in.');
        return { success: false, needsEmailConfirm: true };
      }
      setError(msg === 'Invalid login credentials' ? 'Invalid email or password.' : msg);
      return { success: false };
    }
  };

  const resendConfirmation = async (email) => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError('Supabase is not connected.');
      return { success: false };
    }
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: getEmailRedirectTo() },
      });
      if (resendError) throw resendError;
      return { success: true };
    } catch (err) {
      setError(err.message || 'Could not resend confirmation email.');
      return { success: false };
    }
  };

  const updateProfile = async (data) => {
    if (!user) return { success: false };
    const { saveUserProfile } = await import('../lib/db');
    const saved = await saveUserProfile(user.id, { ...data, email: data.email || user.email, role: 'customer' });
    setProfile(saved);
    return { success: true };
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        setError,
        signUp,
        signIn,
        resendConfirmation,
        updateProfile,
        logout,
        refreshProfile: () => user && loadProfile(user.id),
        isLoggedIn: !!user,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
};
