// Lightweight auth helpers for Flask backend integration.
// Configure backend URL via VITE_API_URL (defaults to http://localhost:5000).

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:5000";

const TOKEN_KEY = "genescope.access_token";
const SESSION_TOKEN_KEY = "genescope.session_token";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginResponse = { access_token: string };
export type AuthUser = {
  id: string | number;
  email: string;
  role: "pending" | "denied" | "viewer" | "client" | "developer" | string;
  full_name?: string | null;
  phone?: string | null;
  organization?: string | null;
  bio?: string | null;
  status?: string;
};

export function isPendingRole(role?: string | null): boolean {
  return role === "pending" || role === "denied" || !role;
}

export function roleAccessError(role?: string | null): string {
  return role === "denied"
    ? "Your access request was denied. Please contact an administrator."
    : "Your access request is still pending administrator approval.";
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim()) && email.trim().length <= 255;
}

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
        ? "Your account is not approved yet."
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

function unwrapUser(payload: any): AuthUser {
  const u = payload?.user ?? payload;
  return u as AuthUser;
}

export async function login(
  email: string,
  password: string,
  remember = false,
): Promise<LoginResponse> {
  if (!isValidEmail(email)) throw new Error("Please enter a valid email address.");
  const data = await request<LoginResponse & { user?: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, remember }),
  });
  const role = data?.user?.role;
  if (isPendingRole(role)) {
    clearToken();
    throw new Error(roleAccessError(role));
  }
  if (!data?.access_token) throw new Error("Unexpected response from server.");
  setToken(data.access_token, remember);
  return data;
}

export async function register(input: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<{ pending: true; message: string }> {
  clearToken();
  if (!isValidEmail(input.email)) throw new Error("Please enter a valid email address.");
  const data = await request<Partial<LoginResponse> & { pending?: boolean; message?: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  clearToken();
  return {
    pending: true,
    message: data?.message || "Your access request has been submitted for review.",
  };
}

export async function me(): Promise<AuthUser> {
  const raw = await request<any>("/auth/me", { method: "GET" }, { auth: true });
  return unwrapUser(raw);
}

export type ProfileUpdate = {
  full_name?: string | null;
  phone?: string | null;
  organization?: string | null;
  bio?: string | null;
};

export async function updateMe(input: ProfileUpdate): Promise<AuthUser> {
  const raw = await request<any>(
    "/auth/me",
    { method: "PUT", body: JSON.stringify(input) },
    { auth: true },
  );
  return unwrapUser(raw);
}

export async function changePassword(current_password: string, new_password: string): Promise<void> {
  await request<void>(
    "/auth/change-password",
    { method: "POST", body: JSON.stringify({ current_password, new_password }) },
    { auth: true },
  );
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

export function setToken(token: string, remember = false) {
  if (typeof window === "undefined") return;
  try {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    } else {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* storage unavailable */
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    /* noop */
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
