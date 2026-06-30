"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Budget, Category } from "@/lib/types";
import { Eyebrow, Loading, Empty, ErrorNote, money } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { Trash2, Pencil, Plus } from "lucide-react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState<"monthly" | "weekly" | "daily">(
    "monthly",
  );

  const [editing, setEditing] = useState<Budget | null>(null);
  const [eLimit, setELimit] = useState("");
  const [ePeriod, setEPeriod] = useState<"monthly" | "weekly" | "daily">(
    "monthly",
  );

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!category) {
      setError("Create an expense category first.");
      return;
    }
    try {
      await api("/budgets", {
        method: "POST",
        body: { category, limit: Number(limit), period },
      });
      setLimit("");
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };
  const remove = async (id: string) => {
    setError("");
    try {
      await api(`/budgets/${id}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };
  const openEdit = (b: Budget) => {
    setEditing(b);
    setELimit(String(b.limit));
    setEPeriod(b.period as any);
  };
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!editing) return;
    try {
      await api(`/budgets/${editing._id}`, {
        method: "PUT",
        body: { limit: Number(eLimit), period: ePeriod },
      });
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };
  const catLabel = (cat: string | Category) =>
    typeof cat === "object" ? cat?.name : "—";

  return (
    <div className="stack-lg">
      <div className="page-top">
        <div>
          <Eyebrow>Limits</Eyebrow>
          <h1>Budgets</h1>
          <p>Set a ceiling per category and watch it fill.</p>
        </div>
        <button className="btn primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={18} /> New budget
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <form onSubmit={add} className="form-grid">
            <div className="field">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.length === 0 && (
                  <option value="">No expense categories</option>
                )}
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Limit</label>
              <input
                type="number"
                min="0"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="form-submit">
              <button className="btn primary">Add</button>
            </div>
          </form>
        </div>
      )}

      {error && <ErrorNote msg={error} />}
      {loading ? (
        <Loading label="Loading budgets…" />
      ) : budgets.length === 0 ? (
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
                  <span className="row-actions">
                    <button
                      className="btn edit-ghost"
                      onClick={() => openEdit(b)}
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn danger-ghost"
                      onClick={() => remove(b._id)}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </span>
                </div>
                <div className="bud-bar">
                  <div
                    className={`bud-fill ${over ? "over" : ""}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="bud-foot">
                  <span className="mono">
                    {money(b.spent)} of {money(b.limit)} · {b.period}
                  </span>
                  <span
                    className="bud-pct"
                    style={{ color: over ? "var(--coral)" : "var(--lime)" }}
                  >
                    {Math.round(Number(b.percentage)) || 0}%
                    {over ? " over" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <Modal title="Edit budget" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit}>
            <div className="field">
              <label>Category</label>
              <input value={catLabel(editing.category)} disabled />
            </div>
            <div className="field">
              <label>Limit</label>
              <input
                type="number"
                min="0"
                value={eLimit}
                onChange={(e) => setELimit(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Period</label>
              <select
                value={ePeriod}
                onChange={(e) => setEPeriod(e.target.value as any)}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <button className="btn primary">Save changes</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
