/** Compress image to WebP/JPEG Blob for Supabase Storage upload. */
export function compressImageFile(file, maxWidth = 1200, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a JPG, PNG, or other image file.'));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error('Image must be under 8 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const tryWebP = file.type !== 'image/png';
        const mime = tryWebP ? 'image/webp' : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not compress image.'));
              return;
            }
            resolve({ blob, contentType: mime });
          },
          mime,
          quality
        );
      };
      img.onerror = () => reject(new Error('Could not read image file.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

export function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:([^;]+)/);
  const contentType = mimeMatch?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: contentType }), contentType };
}

/** Legacy — base64 data URL (avoid for new uploads). */
export function fileToDataUrl(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a JPG, PNG, or other image file.'));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error('Image must be under 8 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.onerror = () => reject(new Error('Could not read image file.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

export async function urlToDataUrl(url) {
  if (!url || url.startsWith('data:')) return url;
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('Could not download image. Re-upload the file from your computer instead.');
  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) throw new Error('URL does not point to an image.');
  const file = new File([blob], 'image.jpg', { type: blob.type });
  return fileToDataUrl(file);
}
