// Lightweight auth helpers for Flask backend integration.
// Configure backend URL via VITE_API_URL (defaults to http://localhost:5000).

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:5000";

const TOKEN_KEY = "genescope.access_token";

export type LoginResponse = { access_token: string };
export type AuthUser = {
  id: string;
  email: string;
  role: "developer" | "client" | string;
  full_name?: string | null;
};

async function request<T>(
  path: string,
  init: RequestInit = {},
  { auth = false }: { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON */
  }

  if (!res.ok) {
    const fallback =
      res.status === 401
        ? "Invalid email or password."
        : res.status === 403
        ? "Your email domain is not authorized to access this system."
        : res.status === 404
        ? "Account not found."
        : res.status === 409
        ? "An account with that email already exists."
        : res.status === 429
        ? "Too many attempts. Please wait a moment."
        : `Request failed (${res.status}).`;
    throw new Error(payload?.message || payload?.error || fallback);
  }

  return payload as T;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!data?.access_token) throw new Error("Unexpected response from server.");
  setToken(data.access_token);
  return data;
}

export async function register(input: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (data?.access_token) setToken(data.access_token);
  return data;
}

export async function me(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me", { method: "GET" }, { auth: true });
}

export async function logout(): Promise<void> {
  try {
    await request<void>("/auth/logout", { method: "POST" }, { auth: true });
  } catch {
    /* ignore — we still clear token locally */
  } finally {
    clearToken();
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await request<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await request<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
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
