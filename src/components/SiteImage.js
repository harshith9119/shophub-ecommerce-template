import React, { useState, useMemo } from 'react';
import { optimizeImageUrl, buildSrcSet, sizesFor } from '../lib/optimizeImage';

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="533" viewBox="0 0 400 533"%3E%3Crect fill="%23f5f0e8" width="400" height="533"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23c5a059" font-family="serif" font-size="14"%3EImage%3C/text%3E%3C/svg%3E';

/**
 * Optimized image — responsive srcSet, lazy load, CDN resize, safe fallback.
 */
export default function SiteImage({
  src,
  alt,
  className,
  priority = false,
  width = 800,
  context = 'card',
  ...props
}) {
  const [failed, setFailed] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);

  const optimized = useMemo(() => {
    if (!src || failed) return PLACEHOLDER;
    if (useOriginal) return src;
    return optimizeImageUrl(src, { width: priority ? Math.max(width, 1280) : width });
  }, [src, failed, useOriginal, width, priority]);

  const srcSet = useMemo(() => {
    if (!src || failed || useOriginal) return undefined;
    return buildSrcSet(src);
  }, [src, failed, useOriginal]);

  const handleError = () => {
    if (!useOriginal && src && !src.startsWith('data:')) {
      setUseOriginal(true);
      return;
    }
    if (!failed) setFailed(true);
  };

  return (
    <img
      src={optimized}
      srcSet={srcSet}
      sizes={srcSet ? sizesFor(context) : undefined}
      alt={alt || ''}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchpriority={priority ? 'high' : 'auto'}
      width={context === 'thumb' ? 80 : undefined}
      height={context === 'thumb' ? 100 : undefined}
      onError={handleError}
      {...props}
    />
  );
}
