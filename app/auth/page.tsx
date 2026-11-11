"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

function AuthRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace("/account");
      return;
    }

    const mode = searchParams.get("mode");
    router.replace(mode === "signup" ? "/signup" : "/signin");
  }, [loading, user, searchParams, router]);

  return (
    <main className="flex-1 bg-[#F2F2F0] flex items-center justify-center py-24">
      <span className="text-[11px] uppercase tracking-[0.22em] text-[#26231F]/55 font-sans">
        Redirecting...
      </span>
    </main>
  );
}

export default function AuthRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F2F2F0]" />}>
      <AuthRedirectContent />
    </Suspense>
  );
}
