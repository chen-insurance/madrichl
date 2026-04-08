/**
 * Client-side image compression before upload.
 * Uses Canvas API to resize and convert to WebP.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const compressImage = (
  file: File,
  options: CompressOptions = {}
): Promise<File> => {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.8 } = options;

  // Skip non-image files or SVGs (can't compress)
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return Promise.resolve(file);
  }

  // Skip small files (< 100KB)
  if (file.size < 100 * 1024) {
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if exceeds max dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // fallback to original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Compressed is larger — keep original
            resolve(file);
            return;
          }

          const ext = "webp";
          const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
          resolve(new File([blob], name, { type: "image/webp" }));
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
};
