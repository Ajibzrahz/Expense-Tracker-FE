"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Eyebrow, Loading, Empty, ErrorNote } from "@/components/ui";
import { Modal } from "@/components/Modal";
import {
  Plus,
  Trash2,
  Pencil,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Category | null>(null);
  const [eName, setEName] = useState("");

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
  const openEdit = (c: Category) => {
    setEditing(c);
    setEName(c.name);
  };
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!editing) return;
    try {
      await api(`/categories/${editing._id}`, {
        method: "PATCH",
        body: { name: eName },
      });
      setEditing(null);
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
          <form onSubmit={add} className="form-grid">
            <div className="field wide">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Groceries"
                maxLength={20}
                required
              />
            </div>
            <div className="field">
              <label>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
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
                <span className="row-actions">
                  <button
                    className="btn edit-ghost"
                    onClick={() => openEdit(c)}
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn danger-ghost"
                    onClick={() => remove(c._id)}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title="Edit category" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit}>
            <div className="field">
              <label>Name</label>
              <input
                value={eName}
                onChange={(e) => setEName(e.target.value)}
                maxLength={20}
                required
              />
            </div>
            <p className="hint">Type can&apos;t be changed after creation.</p>
            <button className="btn primary">Save changes</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
