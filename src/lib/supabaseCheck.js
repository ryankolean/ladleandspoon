import { supabase } from './supabase';

export const checkSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }
  return supabase;
};
