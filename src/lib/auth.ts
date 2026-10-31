import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';

// Inisialisasi klien Supabase dari env yang sudah di-set di Vercel/.env.local
const supa = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// --- 1. register dengan email & password ---
export async function register(
  name: string,
  email: string,
  password: string,
  role: 'pengurus' | 'anggota'
): Promise<User> {
  const { data, error } = await supa.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    try {
      await supa.rpc('upsert_user_profile', {
        p_user_id: data.user.id,
        p_name: name,
        p_role: role,
      });
    } catch (_e) {
      // RPC opsional; registrasi tetap sukses
    }
  }
  return {
    id: data.user!.id,
    name: name.trim(),
    email: data.user!.email!.trim().toLowerCase(),
    role,
    provider: 'email' as const,
    createdAt: Date.now(),
  } as User;
}

// --- 2. login email ---
export async function loginEmail(email: string, password: string): Promise<User> {
  const { data, error } = await supa.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const user = data.user!;
  return {
    id: user.id,
    name: user.user_metadata?.full_name || user.email!.split('@')[0],
    email: user.email!,
    role: user.user_metadata?.role || 'anggota',
    provider: 'email' as const,
    createdAt: user.user_metadata?.createdAt ?? Date.now(),
  } as User;
}

// --- 3. login Google (OAuth) ---
export async function loginGoogle(
  _name: string,
  _email: string,
  _role: 'pengurus' | 'anggota' = 'anggota'
): Promise<User | null> {
  const { error } = await supa.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/auth/callback' },
  });
  if (error) throw error;
  return null;
}

// --- 4. getCurrentUser ---
export function getCurrentUser(): User | null {
  const session: any = supa.auth.getSession();
  if (!session?.data?.session) return null;
  const user: any = session.data.user;
  if (!user) return null;
  return {
    id: user.id,
    name: user.user_metadata?.full_name || user.email!.split('@')[0],
    email: user.email!,
    role: user.user_metadata?.role || 'anggota',
    provider: 'google' as const,
    createdAt: user.user_metadata?.createdAt ?? Date.now(),
  } as User;
}

// --- 5. logout ---
export function logout(): void {
  supa.auth.signOut();
}