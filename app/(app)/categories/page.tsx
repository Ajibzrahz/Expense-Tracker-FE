"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Eyebrow, Loading, Empty, ErrorNote } from "@/components/ui";
import { Plus, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const json = await api<{ count: number; categories: Category[] }>(
        "/categories",
      );
      setCategories(json.categories || []);
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
    try {
      await api("/categories", { method: "POST", body: { name, type } });
      setName("");
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };
  const remove = async (id: string) => {
    setError("");
    try {
      await api(`/categories/${id}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="stack-lg">
      <div className="page-top">
        <div>
          <Eyebrow>Organize</Eyebrow>
          <h1>Categories</h1>
          <p>Group income and spending into buckets.</p>
        </div>
        <button className="btn primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={18} /> New category
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <form onSubmit={add} className="row">
            <div className="field" style={{ flex: 1, minWidth: 180 }}>
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Groceries"
                maxLength={20}
                required
              />
            </div>
            <div className="field" style={{ width: 160 }}>
              <label>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <button className="btn primary">Add</button>
          </form>
        </div>
      )}

      {error && <ErrorNote msg={error} />}
      {loading ? (
        <Loading label="Loading categories…" />
      ) : categories.length === 0 ? (
        <Empty msg="No categories yet. Add one to get started." />
      ) : (
        <div className="cat-grid">
          {categories.map((c) => (
            <div key={c._id} className="cat-card">
              <div className="cat-card-top">
                <span className={`cat-dot ${c.type}`}>
                  {c.type === "income" ? (
                    <ArrowUpRight size={14} color="var(--lime)" />
                  ) : (
                    <ArrowDownRight size={14} color="var(--coral)" />
                  )}
                </span>
                <span className="nm">{c.name}</span>
              </div>
              <div className="cat-card-foot">
                <span className={`tag ${c.type}`}>{c.type}</span>
                <button
                  className="btn danger-ghost"
                  onClick={() => remove(c._id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
