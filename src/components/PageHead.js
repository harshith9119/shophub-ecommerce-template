import Head from 'next/head';
import { optimizeImageUrl } from '../lib/optimizeImage';

export default function PageHead({ title, description, preloadImage }) {
  const fullTitle = title ? `${title} | ShopHub` : 'ShopHub â€” Exclusive Designer Sarees';
  const desc =
    description ||
    'Exclusive designer sarees for events, festivals & parties. Handpicked Kanjivaram, Organza, Chinon & Linen sarees with timeless elegance.';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#064e3b" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <link rel="icon" href="/favicon.ico" />

      {supabaseUrl && (
        <>
          <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={supabaseUrl} />
        </>
      )}
      <link rel="preconnect" href="https://source.unsplash.com/800x600/?fashion,clothing" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://source.unsplash.com/800x600/?fashion,clothing" />

      {preloadImage && (
        <link
          rel="preload"
          as="image"
          href={optimizeImageUrl(preloadImage, { width: 1280, quality: 80 })}
          fetchPriority="high"
        />
      )}
    </Head>
  );
}



