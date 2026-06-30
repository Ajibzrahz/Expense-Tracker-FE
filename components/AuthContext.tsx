"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchProfile, logout as doLogout } from "@/lib/auth";
import { tokenStore } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState { user: User | null; loading: boolean; setUser: (u: User | null) => void; logout: () => Promise<void> }
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      if (!tokenStore.get()) { setLoading(false); return }
      try { setUser(await fetchProfile()) } catch { tokenStore.clear() } finally { setLoading(false) }
    })();
  }, []);
  const logout = async () => { await doLogout(); setUser(null) };
  return <AuthContext.Provider value={{ user, loading, setUser, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
