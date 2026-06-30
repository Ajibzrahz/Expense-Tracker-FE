const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem("authToken")),
  set: (t: string) => localStorage.setItem("authToken", t),
  clear: () => localStorage.removeItem("authToken"),
};

interface ApiOptions { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown; auth?: boolean }

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status }
}

export async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) { const t = tokenStore.get(); if (t) headers.Authorization = `Bearer ${t}` }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, "Can't reach the server. It may be waking up — try again in a moment.");
  }

  let json: any = null;
  try { json = await res.json() } catch { json = null }

  if (!res.ok) {
    const msg = json?.message || json?.msg || json?.error || `Request failed (${res.status})`;
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(res.status, msg);
  }
  return json as T;
}
