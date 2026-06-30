"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Transaction, Category } from "@/lib/types";
import {
  Eyebrow,
  Loading,
  Empty,
  ErrorNote,
  money,
  shortDate,
} from "@/components/ui";
import { Modal } from "@/components/Modal";
import { Trash2, Plus, Pencil } from "lucide-react";

export default function TransactionsPage() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // edit modal state (backend only allows amount + description)
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [eAmount, setEAmount] = useState("");
  const [eDesc, setEDesc] = useState("");

  const load = useCallback(async () => {
    try {
      const [tx, cats] = await Promise.all([
        api<{ success: boolean; data: Transaction[] }>("/transactions"),
        api<{ count: number; categories: Category[] }>("/categories"),
      ]);
      setItems(tx.data || []);
      setCategories(cats.categories || []);
      setCategory((prev) => prev || cats.categories?.[0]?._id || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  // category dropdown filtered by selected type
  const categoriesForType = categories.filter((c) => c.type === type);
  useEffect(() => {
    const match = categories.filter((c) => c.type === type);
    setCategory(match[0]?._id || "");
  }, [type, categories]);

  const catName = (cat: string | Category) => {
    const id = typeof cat === "object" ? cat?._id : cat;
    return (
      categories.find((c) => c._id === id)?.name ||
      (typeof cat === "object" ? cat?.name : "—")
    );
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!category) {
      setError("Create a category first (Categories page).");
      return;
    }
    try {
      await api("/transactions", {
        method: "POST",
        body: { amount: Number(amount), type, category, description, date },
      });
      setAmount("");
      setDescription("");
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };
  const remove = async (id: string) => {
    setError("");
    try {
      await api(`/transactions/${id}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };
  const openEdit = (t: Transaction) => {
    setEditing(t);
    setEAmount(String(t.amount));
    setEDesc(t.description || "");
  };
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!editing) return;
    try {
      await api(`/transactions/${editing._id}`, {
        method: "PUT",
        body: { amount: Number(eAmount), description: eDesc },
      });
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const shown =
    filter === "all" ? items : items.filter((t) => t.type === filter);

  return (
    <div className="stack-lg">
      <div className="page-top">
        <div>
          <Eyebrow>Ledger</Eyebrow>
          <h1>Transactions</h1>
          <p>Every income and expense, in order.</p>
        </div>
        <button className="btn primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={18} /> New transaction
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-h">
            <h3>Add transaction</h3>
          </div>
          <form onSubmit={add} className="form-grid">
            <div className="field">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
            <div className="field">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categoriesForType.length === 0 && (
                  <option value="">No {type} categories</option>
                )}
                {categoriesForType.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field wide">
              <label>Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
                maxLength={1000}
              />
            </div>
            <div className="field">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="form-submit">
              <button className="btn primary">Add</button>
            </div>
          </form>
        </div>
      )}

      <div className="row" style={{ alignItems: "center" }}>
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            className={`btn ${filter === f ? "primary" : "ghost"} sm`}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {error && <ErrorNote msg={error} />}
      {loading ? (
        <Loading label="Loading transactions…" />
      ) : shown.length === 0 ? (
        <Empty msg="No transactions to show. Add one with the button above." />
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th className="right">Amount</th>
                <th>Date</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((t) => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 500 }}>{t.description || "—"}</td>
                  <td className="muted">{catName(t.category)}</td>
                  <td>
                    <span className={`tag ${t.type}`}>{t.type}</span>
                  </td>
                  <td className={`amt ${t.type}`}>
                    {t.type === "income" ? "+" : "−"}
                    {money(t.amount)}
                  </td>
                  <td className="muted mono" style={{ fontSize: 13 }}>
                    {shortDate(t.date)}
                  </td>
                  <td className="right">
                    <span className="row-actions">
                      <button
                        className="btn edit-ghost"
                        onClick={() => openEdit(t)}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="btn danger-ghost"
                        onClick={() => remove(t._id)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title="Edit transaction" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit}>
            <div className="field">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={eAmount}
                onChange={(e) => setEAmount(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Description</label>
              <input
                value={eDesc}
                onChange={(e) => setEDesc(e.target.value)}
                placeholder="Optional"
                maxLength={1000}
              />
            </div>
            <p className="hint">
              Type, category, and date can&apos;t be changed after creation —
              delete and re-add to change those.
            </p>
            <button className="btn primary">Save changes</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
