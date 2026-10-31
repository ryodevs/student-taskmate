/* config.js — inisialisasi Supabase global */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

let supabase = null;

export const initApp = async () => {
  if (window.__TASKMATE_INIT__) return;
  
  const url = 'https://YOUR-PROJECT.supabase.co'; // akan diganti oleh env di production
  const key = 'YOUR-PUBLIC-ANON-KEY';
  
  supabase = createClient(url, key);
  window.__TASKMATE_INIT__ = true;
  window.supabase = supabase;
};