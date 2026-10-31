import { load, save, uid } from './storage';
import { StoredUser, User, Role } from '../types';

const USERS_KEY = 'taskmate:users';
const SESSION_KEY = 'taskmate:session';

function getUsers(): StoredUser[] {
  return load<StoredUser[]>(USERS_KEY, []);
}

function setUsers(users: StoredUser[]): void {
  save(USERS_KEY, users);
}

function setSession(userId: string): void {
  save(SESSION_KEY, { userId });
}

function strip(u: StoredUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    provider: u.provider,
    createdAt: u.createdAt,
  };
}

async function hash(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: Role
): Promise<User> {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    throw new Error('Email sudah terdaftar. Silakan masuk.');
  }
  const user: StoredUser = {
    id: uid(),
    name: name.trim(),
    email: normalized,
    role,
    provider: 'email',
    createdAt: Date.now(),
    passwordHash: await hash(password),
  };
  users.push(user);
  setUsers(users);
  setSession(user.id);
  return strip(user);
}

export async function loginEmail(email: string, password: string): Promise<User> {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  const found = users.find((u) => u.email === normalized);
  if (!found || !found.passwordHash) {
    throw new Error('Email atau password salah.');
  }
  const hashed = await hash(password);
  if (hashed !== found.passwordHash) {
    throw new Error('Email atau password salah.');
  }
  setSession(found.id);
  return strip(found);
}

// Simulasi Google OAuth untuk demo (client-side).
// PRODUKSI: ganti dengan Firebase Auth / Supabase Auth — lihat README.md.
export async function loginGoogle(
  name: string,
  email: string,
  role: Role = 'anggota'
): Promise<User> {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  let found = users.find((u) => u.email === normalized);
  if (!found) {
    found = {
      id: uid(),
      name: name.trim(),
      email: normalized,
      role,
      provider: 'google',
      createdAt: Date.now(),
    };
    users.push(found);
    setUsers(users);
  }
  setSession(found.id);
  return strip(found);
}

export function getCurrentUser(): User | null {
  const session = load<{ userId: string } | null>(SESSION_KEY, null);
  if (!session) return null;
  const found = getUsers().find((u) => u.id === session.userId);
  return found ? strip(found) : null;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
