import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { saveUserProfile } from '../../lib/db';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    const completeSignup = async (user) => {
      const meta = user.user_metadata || {};
      if (meta.name || meta.phone || meta.address) {
        try {
          await saveUserProfile(user.id, {
            email: user.email,
            name: meta.name,
            phone: meta.phone,
            address: meta.address,
            city: meta.city,
            state: meta.state,
            pincode: meta.pincode,
            role: 'customer',
          });
        } catch {
          // Profile trigger may have already created a row; non-fatal
        }
      }
      router.replace('/profile');
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        completeSignup(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        completeSignup(session.user);
      } else {
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s?.user) completeSignup(s.user);
            else {
              setError('Could not confirm email. Try signing in or request a new confirmation link.');
            }
          });
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory p-8">
      <div className="text-center max-w-md">
        {error ? (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <a href="/login" className="text-emerald underline">Go to Sign In</a>
          </>
        ) : (
          <p className="text-emerald animate-pulse">Confirming your email...</p>
        )}
      </div>
    </div>
  );
}
