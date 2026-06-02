// Lightweight auth helpers for Flask backend integration.
// Configure backend URL via VITE_API_URL (defaults to http://localhost:5000).

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:5000";

const TOKEN_KEY = "genescope.access_token";

export type LoginResponse = { access_token: string };

export async function login(email: string, password: string): Promise<LoginResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const msg =
      payload?.message ||
      payload?.error ||
      (res.status === 401
        ? "Invalid email or password."
        : res.status === 429
        ? "Too many attempts. Please wait a moment."
        : `Sign-in failed (${res.status}).`);
    throw new Error(msg);
  }

  if (!payload?.access_token) {
    throw new Error("Unexpected response from server.");
  }

  setToken(payload.access_token);
  return payload as LoginResponse;
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* noop */
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
