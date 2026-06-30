import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";

export const metadata: Metadata = { title: "Ledger — Expense Tracker", description: "Track income, expenses, and budgets" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body><AuthProvider>{children}</AuthProvider></body></html>);
}
