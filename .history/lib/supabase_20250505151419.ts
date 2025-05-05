import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qelivboxuxrxkenvfzox.supabase.co';// Substitua pelo URL do seu projeto
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbGl2Ym94dXhyeGtlbnZmem94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0Nzc5ODUsImV4cCI6MjA1ODA1Mzk4NX0.y27YWQshSDhUwg6bRHd5Z5a7lFh_9Os00fM7UiDXc7k'; // Substitua pela sua anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
