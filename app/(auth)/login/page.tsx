"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { useAuth } from "@/components/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const u = await login(email, password);
      setUser(u);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed."); setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <span className="eyebrow">Welcome back</span>
      <h2 style={{ marginTop: 10 }}>Sign in</h2>
      <p className="muted" style={{ marginTop: 0, marginBottom: 26, fontSize: 14 }}>Pick up where your ledger left off.</p>

      <form onSubmit={submit} className="stack">
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div className="field">
          <label>Password</label>
          <div className="pw-wrap">
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            <button type="button" className="linkbtn pw-toggle" onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
        </div>
        {error && <div className="alert err">{error}</div>}
        <button className="btn primary" disabled={loading} style={{ marginTop: 4 }}>{loading ? "Signing in…" : "Sign in"}</button>
      </form>

      <p className="muted" style={{ marginTop: 22, fontSize: 14 }}>
        New here? <Link href="/signup" className="linkbtn">Create an account</Link>
      </p>
    </div>
  );
}
