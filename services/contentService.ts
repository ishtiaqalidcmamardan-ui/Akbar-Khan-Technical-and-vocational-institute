
import { supabase, isSupabaseConfigured } from './supabase';

const CONTENT_KEY = 'ak_site_content_db';

export const contentService = {
  // Get all content overrides from local storage
  getAllLocal: (): Record<string, string> => {
    try {
      const saved = localStorage.getItem(CONTENT_KEY);
      return saved ? (JSON.parse(saved) as Record<string, string>) : {};
    } catch (e) {
      return {};
    }
  },

  // Initial fetch from Supabase to seed local cache for visitors
  syncFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase.from('site_settings').select('key, value');
      if (!error && data) {
        const cloudContent: Record<string, string> = {};
        data.forEach(item => { cloudContent[item.key] = item.value; });
        localStorage.setItem(CONTENT_KEY, JSON.stringify(cloudContent));
      }
    } catch (e) {
      console.error("Cloud sync failed", e);
    }
  },

  // Get specific text by key with a fallback
  getText: (key: string, fallback: string): string => {
    const all = contentService.getAllLocal();
    return all[key] || fallback;
  },

  // Save a single text update locally (Draft mode)
  saveUpdate: (key: string, value: string) => {
    const all = contentService.getAllLocal();
    all[key] = value;
    localStorage.setItem(CONTENT_KEY, JSON.stringify(all));
  },

  // PUSH all local edits to Supabase (Production Deployment)
  deployToCloud: async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured for global deployment.");
    }
    
    const allLocal = contentService.getAllLocal();
    const records = Object.entries(allLocal).map(([key, value]) => ({ key, value }));

    // Upsert logic: Update if key exists, otherwise insert
    const { error } = await supabase
      .from('site_settings')
      .upsert(records, { onConflict: 'key' });

    if (error) throw error;
    return true;
  },

  resetDefaults: () => {
    localStorage.removeItem(CONTENT_KEY);
    window.location.reload();
  }
};
