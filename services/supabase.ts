
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// These are injected by your hosting provider or local environment
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Detect if we have a real connection
export const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

// Initialize client (or null if mock mode)
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Converts Base64 (from camera/file) to a Blob for Supabase Storage
 */
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
