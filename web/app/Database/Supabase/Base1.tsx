import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRETE || '';

let supabase;

try {
    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials are missing. Some features may not work properly.');
    }
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Create a mock client that will fail gracefully
    supabase = {
        from: () => ({
            select: () => Promise.reject(new Error('Supabase client not initialized')),
            insert: () => Promise.reject(new Error('Supabase client not initialized')),
            update: () => Promise.reject(new Error('Supabase client not initialized')),
            delete: () => Promise.reject(new Error('Supabase client not initialized')),
        }),
        auth: {
            signIn: () => Promise.reject(new Error('Supabase client not initialized')),
            signOut: () => Promise.reject(new Error('Supabase client not initialized')),
        },
    };
}

export default supabase;