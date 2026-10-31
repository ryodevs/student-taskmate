// Lapisan abstraksi storage — ganti implementasi ini dengan API backend
// (Supabase/Firestore/REST) jika ingin data tersinkron antar perangkat.
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
