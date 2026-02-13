
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const base64ToBlob = (base64: string) => {
  if (!base64 || !base64.includes(',')) return null;
  try {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (e) {
    console.error("Base64 conversion failed", e);
    return null;
  }
};

/**
 * Uploads a base64 image to a specific Supabase bucket
 */
export const uploadImageToBucket = async (bucket: string, path: string, base64Data: string): Promise<string | null> => {
  if (!isSupabaseConfigured || !supabase) return null;

  const blob = base64ToBlob(base64Data);
  if (!blob) return null;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      contentType: blob.type,
      upsert: true
    });

  if (error) {
    console.error(`Upload error in bucket ${bucket}:`, error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
};
