"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { LayoutDashboard, ArrowLeftRight, Tags, Target, Settings as Cog, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/settings", label: "Settings", icon: Cog },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await logout(); router.replace("/login"); };

  return (
    <aside className={`side ${open ? "open" : ""}`}>
      <div className="side-brandbar">
        <div className="brand"><span className="brand-mark">L</span><span>Ledger</span></div>
        <button className="side-toggle icon-btn" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav className="nav">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`side-item ${pathname === href ? "active" : ""}`} onClick={() => setOpen(false)}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="side-foot">
        <div className="side-user">
          <div className="nm">{user?.name || "Account"}</div>
          <div className="em">{user?.email}</div>
        </div>
        <button className="btn ghost sm" onClick={handleLogout}><LogOut size={16} /> Log out</button>
      </div>
    </aside>
  );
}
