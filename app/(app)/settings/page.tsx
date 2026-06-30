"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import { Eyebrow, ErrorNote, Ok } from "@/components/ui";
import type { User } from "@/lib/types";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [pMsg, setPMsg] = useState(""); const [pErr, setPErr] = useState("");

  const [oldPassword, setOld] = useState(""); const [newPassword, setNew] = useState("");
  const [cMsg, setCMsg] = useState(""); const [cErr, setCErr] = useState("");

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setPMsg(""); setPErr("");
    try {
      const json = await api<{ success: boolean; data: User }>("/users/profile", { method: "PUT", body: { name, email } });
      setPMsg("Profile updated."); if (json?.data) setUser(json.data);
    } catch (err: any) { setPErr(err.message); }
  };
  const changePw = async (e: React.FormEvent) => {
    e.preventDefault(); setCMsg(""); setCErr("");
    try { await api("/users/password", { method: "POST", body: { oldPassword, newPassword } }); setCMsg("Password changed."); setOld(""); setNew(""); }
    catch (err: any) { setCErr(err.message); }
  };

  return (
    <div className="stack-lg">
      <div className="page-top"><div><Eyebrow>Account</Eyebrow><h1>Settings</h1></div></div>
      <div className="settings-grid">
        <div className="panel">
          <div className="panel-h"><h3>Profile</h3></div>
          <form onSubmit={saveProfile}>
            <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            {pErr && <ErrorNote msg={pErr} />}{pMsg && <Ok msg={pMsg} />}
            <button className="btn primary">Save changes</button>
          </form>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Password</h3></div>
          <form onSubmit={changePw}>
            <div className="field"><label>Current password</label><input type="password" value={oldPassword} onChange={(e) => setOld(e.target.value)} required /></div>
            <div className="field"><label>New password</label><input type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} required /><span className="hint">8+ chars with upper, lower, number, special.</span></div>
            {cErr && <ErrorNote msg={cErr} />}{cMsg && <Ok msg={cMsg} />}
            <button className="btn primary">Change password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
