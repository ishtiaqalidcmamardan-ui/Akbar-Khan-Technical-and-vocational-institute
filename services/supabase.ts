
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * MANUAL CONFIGURATION (Last Resort)
 * If your hosting environment (Netlify/Vercel) fails to inject variables automatically,
 * you can paste your Supabase credentials directly here.
 */
const MANUAL_URL = ''; // e.g. 'https://tkjbktaawukvjcjxfmyl.supabase.co'
const MANUAL_KEY = ''; // e.g. 'sb_publishable_A8lgHgq-d6RBcIUbb4yY3g_54gnUk28'

/**
 * Diagnostic Helper: 
 * Resolves environment variables across different build tools and environments.
 * Prioritizes: Manual Constants -> process.env -> Vite meta.env -> Window Global -> Empty String
 */
const getEnv = (key: string): string => {
  try {
    // 1. Check Manual Overrides first
    if (key === 'SUPABASE_URL' && MANUAL_URL) return MANUAL_URL;
    if (key === 'SUPABASE_ANON_KEY' && MANUAL_KEY) return MANUAL_KEY;

    // 2. Check standard Node-style process.env (Injected during build)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] || '';
    }
    
    // 3. Check Vite-specific env (Injected during Vite build)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const viteKey = `VITE_${key}`;
      // @ts-ignore
      if (import.meta.env[viteKey]) return import.meta.env[viteKey];
      // @ts-ignore
      if (import.meta.env[key]) return import.meta.env[key];
    }

    // 4. Check Window object (Useful for direct script injection)
    // @ts-ignore
    if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
      // @ts-ignore
      return window.ENV[key];
    }
  } catch (e) {
    console.warn(`Environment resolution for ${key} failed. Falling back to empty string.`);
  }
  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

// Detailed logging for debugging in the browser console
if (typeof window !== 'undefined') {
  if (!isSupabaseConfigured) {
    console.group("AK Institute: Database Configuration Missing");
    console.error("The application could not find valid Supabase credentials.");
    console.info("Action Required: Set SUPABASE_URL and SUPABASE_ANON_KEY in your hosting dashboard.");
    console.info("Alternative: Edit 'services/supabase.ts' and paste them into MANUAL_URL and MANUAL_KEY.");
    console.groupEnd();
  } else {
    console.log("AK Institute DB Status: ✅ Node Connected");
  }
}

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

export const uploadImageToBucket = async (bucket: string, path: string, base64Data: string): Promise<string | null> => {
  if (!isSupabaseConfigured || !supabase) return null;

  const blob = base64ToBlob(base64Data);
  if (!blob) return null;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error(`Supabase Storage Error [${bucket}]:`, error);
    return null;
  }
};
