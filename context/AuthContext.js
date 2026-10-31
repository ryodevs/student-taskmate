/* context/AuthContext.js — pure vanilla JS, no React */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

const SUPABASE_URL = typeof window !== 'undefined' && window.SUPABASE_URL ? window.SUPABASE_URL : '';
const SUPABASE_ANON_KEY = typeof window !== 'undefined' && window.SUPABASE_ANON_KEY ? window.SUPABASE_ANON_KEY : '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const AuthStore = {
  user: null,
  role: 'guest',

  async init() {
    const { data: { session} } = await supabase.auth.getSession();
    this.user = session?.user || null;
    this.role = this.user?.email?.includes('pengurus') ? 'admin' : 'member';
    this.renderNav();
  },

  renderNav() {
    const nav = document.querySelector('nav') || document.createElement('nav');
    const isAdmin = this.role === 'admin';
    nav.innerHTML = `
      <a href="/">TaskMate</a>
      ${isAdmin ? `
        <a href="/dashboard">Dashboard</a>
        <a href="/classroom">Buat Kelas</a>
        <a href="/tools">Tools</a>
      ` : ''}
      <a href="#" onclick="Auth.signOut()">Logout</a>
    `;
    if (!document.querySelector('nav')) document.body.prepend(nav);
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else await this.init();
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else await this.init();
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' }
    });
    if (error) alert(error.message);
  },

  async signOut() {
    await supabase.auth.signOut();
    this.user = null;
    this.role = 'guest';
    this.renderNav();
    window.location.href = '/login';
  }
};