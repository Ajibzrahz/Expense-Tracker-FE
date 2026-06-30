export function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="eyebrow">{children}</span>; }
export function Loading({ label = "Loading…" }: { label?: string }) { return <div className="loading">{label}</div>; }
export function Empty({ msg }: { msg: string }) { return <div className="empty">{msg}</div>; }
export function ErrorNote({ msg }: { msg: string }) { return <div className="alert err">{msg}</div>; }
export function Ok({ msg }: { msg: string }) { return <div className="alert ok">{msg}</div>; }

export const money = (n: number | string) => {
  const v = Number(n) || 0;
  return (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
export const shortDate = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : "—");
