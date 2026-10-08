import { supabase } from "./supabase";

/**
 * Uploads a base64 string or File to Supabase Storage and returns the public URL.
 * @param path The path in storage (e.g., 'profiles/uid/avatar.jpg')
 * @param data The base64 string (with data:image/... prefix) or File object
 * @returns The download URL
 */
export async function uploadImage(path: string, data: string | File): Promise<string> {
  const bucket = "uploads"; // Default bucket name
  
  let fileBody: File | Buffer | Blob | ArrayBuffer | string = data;

  if (typeof data === 'string' && data.includes(',')) {
    // Convert base64 to Blob
    const parts = data.split(',');
    const byteString = atob(parts[1]);
    const mimeString = parts[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    fileBody = new Blob([ab], { type: mimeString });
  }

  let { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, fileBody, {
      upsert: true
    });

  if (uploadError) {
    if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("does not exist")) {
      console.warn("Bucket not found. Attempting to create...");
      await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      const retry = await supabase.storage
        .from(bucket)
        .upload(path, fileBody, {
          upsert: true
        });
      uploadError = retry.error;
      uploadData = retry.data;
    }

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      throw uploadError;
    }
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}

/**
 * Uploads a reseller image asset (avatar, logo, or banner) to Supabase Storage,
 * compressing it first if needed and returning a public CDN URL.
 * Falls back to optimized compressed base64 if storage is unavailable.
 */
export async function uploadResellerAsset(
  userId: string,
  assetType: "avatar" | "logo" | "banner",
  fileOrBase64: File | string,
  maxDim = 1200
): Promise<string> {
  // If already an HTTP/HTTPS URL, return as-is
  if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("http")) {
    return fileOrBase64;
  }

  try {
    let preparedData: string | File = fileOrBase64;
    if (fileOrBase64 instanceof File) {
      const compressed = await compressImageToBase64(fileOrBase64, maxDim);
      if (compressed) {
        preparedData = compressed;
      }
    }

    const cleanId = userId || "anonymous";
    const timestamp = Date.now();
    const filePath = `resellers/${cleanId}/${assetType}_${timestamp}.jpg`;

    const publicUrl = await uploadImage(filePath, preparedData);
    if (publicUrl && publicUrl.startsWith("http")) {
      return publicUrl;
    }
  } catch (err) {
    console.warn(`[STORAGE] Storage upload error for ${assetType}, using base64 fallback:`, err);
  }

  // Fallback to base64
  if (typeof fileOrBase64 === "string") return fileOrBase64;
  const fallback = await compressImageToBase64(fileOrBase64, Math.min(maxDim, 600));
  return fallback || "";
}

/**
 * Compresses an image file to a base64 string.
 * This is useful for storing images directly in Firestore to bypass Storage rules.
 * The image is resized to max 800x800 and compressed to JPEG with 0.6 quality.
 */
export async function compressImageToBase64(file: File, maxDim = 1000): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn("[IMAGE_COMPRESS] Image processing timed out, using raw reader result");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    }, 8000);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        clearTimeout(timeout);
        resolve(null);
        return;
      }

      // If already small SVG or GIF or under 300KB, return as-is
      if (file.type === "image/svg+xml" || file.type === "image/gif" || file.size < 300 * 1024) {
        clearTimeout(timeout);
        resolve(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;
          const MAX_WIDTH = maxDim;
          const MAX_HEIGHT = maxDim;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressed);
        } catch (err) {
          console.warn("[IMAGE_COMPRESS] Error during canvas processing, fallback to raw base64:", err);
          resolve(result);
        }
      };
      img.onerror = (err) => {
        clearTimeout(timeout);
        console.warn("[IMAGE_COMPRESS] Image load error, fallback to raw base64:", err);
        resolve(result);
      };
      img.src = result;
    };
    reader.onerror = (err) => {
      clearTimeout(timeout);
      console.error("[IMAGE_COMPRESS] FileReader error:", err);
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
}
