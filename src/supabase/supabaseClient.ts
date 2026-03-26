import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Use environment variables from expo config, or fallbacks for development if needed.
// Note: In production, these should ALWAYS come from process.env or Constants.expoConfig.extra
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing! Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
