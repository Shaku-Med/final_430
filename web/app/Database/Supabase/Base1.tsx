import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseKey: string = process.env.SUPABASE_SECRETE || '';

let db: SupabaseClient;

try {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials are missing. Some features may not work properly.');
  }
  db = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  // console.error('Failed to initialize Supabase client:', error);
  db = {
    from: () => ({
      select: () => Promise.reject(new Error('Supabase client not initialized')),
      insert: () => Promise.reject(new Error('Supabase client not initialized')),
      update: () => Promise.reject(new Error('Supabase client not initialized')),
      delete: () => Promise.reject(new Error('Supabase client not initialized')),
      order: () => ({
        limit: () => Promise.reject(new Error('Supabase client not initialized')),
      }),
    }),
    auth: {
      signIn: () => Promise.reject(new Error('Supabase client not initialized')),
      signOut: () => Promise.reject(new Error('Supabase client not initialized')),
    },
  } as unknown as SupabaseClient;
}

export default db;