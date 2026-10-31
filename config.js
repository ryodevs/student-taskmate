/* config.js — inisialisasi Supabase global membaca dari env */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

let supabase = null;

export const initApp = async () => {
  if (window.__TASKMATE_INIT__) return;
  
  // Baca dari import.meta.env (Vercel/Vite) atau window.__SUPABASE_*
  const url = import.meta.env.VITE_SUPABASE_URL || 
              (typeof window !== 'undefined' && window.__SUPABASE_URL__) || 
              'https://YOUR-PROJECT.supabase.co';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 
              (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) || 
              'YOUR-PUBLIC-ANON-KEY';
  
  supabase = createClient(url, key);
  window.__TASKMATE_INIT__ = true;
  window.supabase = supabase;
  
  // Cek koneksi dasar
  try {
    const { data, error } = await supabase.from('_health').select('count').limit(1);
    if (error) console.warn('Supabase connection warning:', error.message);
  } catch (e) {
    console.warn('Supabase init warning:', e.message);
  }
};