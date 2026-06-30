import { api, tokenStore } from "./api";
import type { User } from "./types";

interface AuthResponse { success: boolean; data: { user: User; token: string } }

export async function login(email: string, password: string): Promise<User> {
  const json = await api<AuthResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false });
  if (!json?.data?.token) throw new Error("No token returned by server.");
  tokenStore.set(json.data.token);
  return json.data.user;
}
export async function signup(name: string, email: string, password: string): Promise<User> {
  const json = await api<AuthResponse>("/auth/signup", { method: "POST", body: { name, email, password }, auth: false });
  if (!json?.data?.token) throw new Error("No token returned by server.");
  tokenStore.set(json.data.token);
  return json.data.user;
}
export async function fetchProfile(): Promise<User> {
  const json = await api<{ success: boolean; data: { user: User } }>("/auth/profile");
  return json.data.user;
}
export async function logout(): Promise<void> {
  try { await api("/auth/logout", { method: "DELETE" }) } catch {}
  tokenStore.clear();
}
