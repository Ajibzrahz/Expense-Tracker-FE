export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="brand"><span className="brand-mark">L</span><span>Ledger</span></div>
        <div>
          <span className="eyebrow">Personal finance</span>
          <h1 className="auth-hero">Every naira, <em>accounted</em> for.</h1>
        </div>
        <div className="auth-ledger">
          <div className="auth-ledger-row"><span>Income</span><span className="mono" style={{color:'var(--lime)'}}>+ tracked</span></div>
          <div className="auth-ledger-row"><span>Expenses</span><span className="mono" style={{color:'var(--coral)'}}>− watched</span></div>
          <div className="auth-ledger-row" style={{borderBottom:'none'}}><span>Budgets</span><span className="mono">on target</span></div>
        </div>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  );
}
