import '../styles/globals.css';
import ErrorBoundary from '../components/ErrorBoundary';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { CartProvider } from '../context/CartContext';
import { AdminAuthProvider } from '../context/AuthContext';
import { UserAuthProvider } from '../context/UserAuthContext';
import { SiteSettingsProvider } from '../context/SiteSettingsContext';
import { ThemeProvider } from '../context/ThemeContext';
import { serif, sans } from '../lib/fonts';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function App({ Component, pageProps }) {
  const isAdmin = Component.displayName === 'AdminPage';

  return (
    <div className={`${serif.variable} ${sans.variable} font-sans`}>
      <ErrorBoundary>
        <AdminAuthProvider>
          <UserAuthProvider>
            <SiteSettingsProvider>
              <ThemeProvider>
              <CartProvider>
              <div className="flex flex-col min-h-screen">
                <div className="flex-grow">
                  <Component {...pageProps} />
                </div>
                {!isAdmin && (
                  <>
                    <Footer />
                    <WhatsAppButton />
                  </>
                )}
              </div>
              <Analytics />
              <SpeedInsights />
              </CartProvider>
              </ThemeProvider>
            </SiteSettingsProvider>
          </UserAuthProvider>
        </AdminAuthProvider>
      </ErrorBoundary>
    </div>
  );
}
