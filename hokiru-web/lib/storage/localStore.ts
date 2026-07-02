/**
 * Anonymous local-only persistence for the MVP (事前決定メモ: ログインはMVP初期では
 * 匿名ローカル保存を優先する). Swap for Supabase-backed reads/writes behind the
 * same key shape once anonymous auth lands — callers don't need to change.
 */
const PREFIX = "hokiru-web:";

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function clearAllLocal(): void {
  if (typeof window === "undefined") return;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => window.localStorage.removeItem(k));
}
