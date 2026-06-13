/**
 * Reusable utility functions for the Padrinamiento application
 */

/**
 * Compresses a Base64 image data URL to a maximum dimension and JPEG quality
 * to ensure database writes do not exceed size quotas.
 */
export function compressImage(
  dataUrl: string,
  callback: (compressedDataUrl: string) => void,
  maxDimension: number = 500, // Avatars/photos can be even smaller, e.g. 500px is more than enough
  quality: number = 0.75
) {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    callback(dataUrl);
    return;
  }

  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      // Compress with JPEG quality
      const compressed = canvas.toDataURL('image/jpeg', quality);
      callback(compressed);
    } else {
      callback(dataUrl);
    }
  };
  img.onerror = () => {
    callback(dataUrl);
  };
}
