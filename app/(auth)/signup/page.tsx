"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/auth";
import { useAuth } from "@/components/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const u = await signup(name, email, password);
      setUser(u);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed."); setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <span className="eyebrow">Get started</span>
      <h2 style={{ marginTop: 10 }}>Create account</h2>
      <p className="muted" style={{ marginTop: 0, marginBottom: 26, fontSize: 14 }}>Start tracking in under a minute.</p>

      <form onSubmit={submit} className="stack">
        <div className="field">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required minLength={3} />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div className="field">
          <label>Password</label>
          <div className="pw-wrap">
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
            <button type="button" className="linkbtn pw-toggle" onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <span className="hint">8+ characters with uppercase, lowercase, a number, and a special character.</span>
        </div>
        {error && <div className="alert err">{error}</div>}
        <button className="btn primary" disabled={loading} style={{ marginTop: 4 }}>{loading ? "Creating…" : "Create account"}</button>
      </form>

      <p className="muted" style={{ marginTop: 22, fontSize: 14 }}>
        Already have an account? <Link href="/login" className="linkbtn">Sign in</Link>
      </p>
    </div>
  );
}
