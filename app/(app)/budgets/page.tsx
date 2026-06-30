"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Budget, Category } from "@/lib/types";
import { Eyebrow, Loading, Empty, ErrorNote, money } from "@/components/ui";
import { Trash2 } from "lucide-react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState<"monthly" | "weekly" | "daily">("monthly");

  const load = useCallback(async () => {
    try {
      const [b, cats] = await Promise.all([
        api<Budget[]>("/budgets"),
        api<{ count: number; categories: Category[] }>("/categories"),
      ]);
      setBudgets(Array.isArray(b) ? b : []);
      const ex = (cats.categories || []).filter((c) => c.type === "expense");
      setCategories(ex);
      setCategory((prev) => prev || ex[0]?._id || "");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!category) { setError("Create an expense category first."); return; }
    try { await api("/budgets", { method: "POST", body: { category, limit: Number(limit), period } }); setLimit(""); await load(); }
    catch (err: any) { setError(err.message); }
  };
  const remove = async (id: string) => {
    setError("");
    try { await api(`/budgets/${id}`, { method: "DELETE" }); await load(); }
    catch (err: any) { setError(err.message); }
  };
  const catLabel = (cat: string | Category) => (typeof cat === "object" ? cat?.name : "—");

  return (
    <div className="stack-lg">
      <div className="page-top"><div><Eyebrow>Limits</Eyebrow><h1>Budgets</h1><p>Set a ceiling per category and watch it fill.</p></div></div>

      <div className="panel">
        <form onSubmit={add} className="row">
          <div className="field" style={{ width: 180 }}><label>Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} required>{categories.length === 0 && <option value="">No expense categories</option>}{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
          <div className="field" style={{ width: 140 }}><label>Limit</label><input type="number" min="0" value={limit} onChange={(e) => setLimit(e.target.value)} required /></div>
          <div className="field" style={{ width: 150 }}><label>Period</label><select value={period} onChange={(e) => setPeriod(e.target.value as any)}><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="daily">Daily</option></select></div>
          <button className="btn primary">Add budget</button>
        </form>
      </div>

      {error && <ErrorNote msg={error} />}
      {loading ? <Loading label="Loading budgets…" /> : budgets.length === 0 ? (
        <Empty msg="No budgets yet. Create one to track spending against a limit." />
      ) : (
        <div className="stack">
          {budgets.map((b) => {
            const pct = Math.min(Number(b.percentage) || 0, 100);
            const over = (Number(b.percentage) || 0) > 100;
            return (
              <div key={b._id} className="bud">
                <div className="bud-top">
                  <span className="nm">{catLabel(b.category)}</span>
                  <button className="btn danger-ghost" onClick={() => remove(b._id)}><Trash2 size={16} /></button>
                </div>
                <div className="bud-bar"><div className={`bud-fill ${over ? "over" : ""}`} style={{ width: `${pct}%` }} /></div>
                <div className="bud-foot">
                  <span className="mono">{money(b.spent)} of {money(b.limit)} · {b.period}</span>
                  <span className="bud-pct" style={{ color: over ? "var(--coral)" : "var(--lime)" }}>{Math.round(Number(b.percentage)) || 0}%{over ? " over" : ""}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
