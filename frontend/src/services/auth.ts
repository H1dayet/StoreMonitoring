// Simple JWT auth helper for storing token

const KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(KEY, token);
  // Notify listeners (e.g., Root router) that auth state changed
  window.dispatchEvent(new Event('auth-changed'));
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('auth-changed'));
  } catch {}
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function authHeaders(init?: HeadersInit): HeadersInit {
  const token = getToken();
  return {
    ...(init || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type AuthUser = { id: string; username: string; role: 'admin' | 'user'; name: string; active: boolean } | null;
export function setAuthUser(user: NonNullable<AuthUser>) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
  window.dispatchEvent(new Event('auth-changed'));
}
export function getAuthUser(): AuthUser {
  try {
    const v = localStorage.getItem(USER_KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
