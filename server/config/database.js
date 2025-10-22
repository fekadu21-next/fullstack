import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function executeQuery(query, params = []) {
  try {
    const { data, error } = await supabase.rpc('execute_query', {
      query_text: query,
      params: params
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
