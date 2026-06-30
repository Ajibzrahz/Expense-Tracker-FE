"use client";

import Link from "next/link";
import { Bell, User as UserIcon } from "lucide-react";
import { useAuth } from "./AuthContext";

export function Topbar() {
  const { user } = useAuth();
  const initial = (user?.name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-actions">
        <button
          className="icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
        </button>
        <Link
          href="/settings"
          className="avatar"
          title={user?.name || user?.email || "Account"}
        >
          {initial || <UserIcon size={16} />}
        </Link>
      </div>
    </header>
  );
}
