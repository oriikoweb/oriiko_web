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
    <main className="min-h-[100dvh] bg-[#F2F2F0] dark:bg-[#26231F] flex items-center justify-center px-4">
      <span className="text-[11px] uppercase tracking-[0.22em] text-[#26231F]/55 dark:text-[#F2F2F0]/60 font-sans">
        Redirecting...
      </span>
    </main>
  );
}

export default function AuthRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#F2F2F0] dark:bg-[#26231F]" />}>
      <AuthRedirectContent />
    </Suspense>
  );
}
