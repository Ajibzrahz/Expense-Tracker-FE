"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Summary, Transaction, Category } from "@/lib/types";
import { Eyebrow, Loading, ErrorNote, Empty, money, shortDate } from "@/components/ui";

interface OverviewRow { month: string; income: number; expense: number }
interface TrendRow { date: string; total: number }

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [overview, setOverview] = useState<OverviewRow[]>([]);
  const [trend, setTrend] = useState<TrendRow[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sum, ov, tr, tx, cats] = await Promise.all([
          api<{ success: boolean; summary: Summary }>("/analytics/summary"),
          api<{ success: boolean; data: OverviewRow[] }>("/analytics/overview").catch(() => ({ data: [] })),
          api<{ success: boolean; data: TrendRow[] }>("/analytics/trends").catch(() => ({ data: [] })),
          api<{ success: boolean; data: Transaction[] }>("/transactions"),
          api<{ count: number; categories: Category[] }>("/categories"),
        ]);
        setSummary(sum.summary);
        setOverview((ov as any).data || []);
        setTrend((tr as any).data || []);
        setRecent((tx.data || []).slice(0, 6));
        setCategories(cats.categories || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loading label="Loading dashboard…" />;
  if (error) return <ErrorNote msg={error} />;

  const s = summary || { totalIncome: 0, totalExpense: 0, balance: 0, savingsRate: 0 };
  const catName = (cat: string | Category) => {
    const id = typeof cat === "object" ? cat?._id : cat;
    return categories.find((c) => c._id === id)?.name || (typeof cat === "object" ? cat?.name : "—");
  };
  const activeOverview = overview.filter((r) => r.income > 0 || r.expense > 0);

  return (
    <div className="stack-lg">
      <div className="page-top">
        <div><Eyebrow>Overview</Eyebrow><h1>Dashboard</h1></div>
        <Link href="/transactions" className="btn primary">+ New transaction</Link>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="lbl">Income</div><div className="val income">{money(s.totalIncome)}</div></div>
        <div className="kpi"><div className="lbl">Expenses</div><div className="val expense">{money(s.totalExpense)}</div></div>
        <div className="kpi"><div className="lbl">Balance</div><div className="val">{money(s.balance)}</div></div>
        <div className="kpi"><div className="lbl">Savings rate</div><div className="val">{s.savingsRate}%</div></div>
      </div>

      <div className="charts">
        <div className="panel">
          <div className="panel-h"><h3>Income vs Expenses</h3><span className="muted" style={{ fontSize: 12 }}>This year</span></div>
          {activeOverview.length === 0 ? <Empty msg="No activity yet this year." /> : <OverviewChart rows={activeOverview} />}
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Spending</h3><span className="muted" style={{ fontSize: 12 }}>Last 7 days</span></div>
          {trend.every((t) => t.total === 0) ? <Empty msg="No expenses this week." /> : <TrendChart rows={trend} />}
        </div>
      </div>

      <div className="panel">
        <div className="panel-h"><h3>Recent activity</h3><Link href="/transactions" className="linkbtn" style={{ fontSize: 13 }}>View all →</Link></div>
        {recent.length === 0 ? (
          <Empty msg="No transactions yet. Add your first from the Transactions page." />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Description</th><th>Category</th><th>Type</th><th className="right">Amount</th><th>Date</th></tr></thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t._id}>
                    <td>{t.description || "—"}</td>
                    <td className="muted">{catName(t.category)}</td>
                    <td><span className={`tag ${t.type}`}>{t.type}</span></td>
                    <td className={`amt ${t.type}`}>{t.type === "income" ? "+" : "−"}{money(t.amount)}</td>
                    <td className="muted mono" style={{ fontSize: 13 }}>{shortDate(t.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewChart({ rows }: { rows: OverviewRow[] }) {
  const W = 560, H = 220, pad = { t: 14, r: 12, b: 28, l: 46 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const max = Math.max(1, ...rows.flatMap((r) => [r.income, r.expense]));
  const gw = iw / rows.length, bw = Math.min(20, gw / 3);
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart">
        {[0, 0.5, 1].map((f) => {
          const gy = pad.t + ih - f * ih;
          return (<g key={f}><line x1={pad.l} y1={gy} x2={W - pad.r} y2={gy} className="grid" /><text x={pad.l - 8} y={gy + 4} className="axis" textAnchor="end">{Math.round(max * f)}</text></g>);
        })}
        {rows.map((r, i) => {
          const cx = pad.l + i * gw + gw / 2;
          return (<g key={r.month}>
            <rect x={cx - bw - 2} y={y(r.income)} width={bw} height={pad.t + ih - y(r.income)} className="b-income" rx={3} />
            <rect x={cx + 2} y={y(r.expense)} width={bw} height={pad.t + ih - y(r.expense)} className="b-expense" rx={3} />
            <text x={cx} y={H - 9} className="axis" textAnchor="middle">{r.month}</text>
          </g>);
        })}
      </svg>
      <div className="chart-legend"><span><i style={{ background: "var(--lime)" }} />Income</span><span><i style={{ background: "var(--coral)" }} />Expense</span></div>
    </>
  );
}

function TrendChart({ rows }: { rows: TrendRow[] }) {
  const W = 420, H = 220, pad = { t: 14, r: 12, b: 28, l: 40 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const max = Math.max(1, ...rows.map((r) => r.total));
  const sx = rows.length > 1 ? iw / (rows.length - 1) : 0;
  const x = (i: number) => pad.l + i * sx;
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const pts = rows.map((r, i) => `${x(i)},${y(r.total)}`).join(" ");
  const dl = (d: string) => new Date(d).toLocaleDateString(undefined, { weekday: "short" });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      {[0, 0.5, 1].map((f) => { const gy = pad.t + ih - f * ih; return <line key={f} x1={pad.l} y1={gy} x2={W - pad.r} y2={gy} className="grid" />; })}
      <polyline points={pts} className="tline" fill="none" />
      {rows.map((r, i) => (<g key={r.date}><circle cx={x(i)} cy={y(r.total)} r={3.5} className="tdot" /><text x={x(i)} y={H - 9} className="axis" textAnchor="middle">{dl(r.date)}</text></g>))}
    </svg>
  );
}
