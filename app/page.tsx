"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  useEffect(() => { if (!loading) router.replace(user ? "/dashboard" : "/login"); }, [user, loading, router]);
  return <div className="loading">Loading…</div>;
}
