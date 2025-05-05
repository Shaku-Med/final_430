import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not defined in environment variables');
}

if (!process.env.SUPABASE_SECRETE) {
    throw new Error('SUPABASE_SECRETE is not defined in environment variables');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRETE;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;