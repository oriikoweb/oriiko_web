"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/lib/admin/context";
import { IconAlertTriangle } from "./ui/AdminIcons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Authenticates administrators before rendering the control suite.
 * Only users whose Postgres `profiles.role` equals `'admin'` are granted entry.
 */
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { ready, authLoading, authState, signInAdmin, signOutAdmin } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!ready || authLoading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-7 h-7 border-2 border-[#591623] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-[#26231F]/70 dark:text-[#F2F2F0]/70">
            Verifying ORIIKO Admin Session
          </p>
        </div>
      </div>
    );
  }

  if (authState === "authenticated") {
    return <>{children}</>;
  }

  if (authState === "customer_denied") {
    return (
      <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#F2F2F0] dark:bg-[#26231F] border border-[#8C072B] rounded-[6px] p-7">
          <div className="w-11 h-11 rounded-[4px] bg-[#8C072B]/12 text-[#8C072B] flex items-center justify-center mb-4">
            <IconAlertTriangle className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold text-[#26231F] dark:text-[#F2F2F0]">
            Administrator Access Required
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[#26231F]/75 dark:text-[#F2F2F0]/75">
            Your signed-in account has the <strong className="font-semibold">customer</strong>{" "}
            role. Only accounts with the <strong className="font-semibold">admin</strong> role can
            access the ORIIKO Control Suite.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={signOutAdmin}
              className="px-4 py-2 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] transition-colors"
            >
              Sign Out &amp; Switch Account
            </button>
            <Link
              href="/account"
              className="px-4 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/5 dark:hover:bg-[#F2F2F0]/10 transition-colors"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    const { error } = await signInAdmin(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setErrorMessage(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-[4px] bg-[#591623] text-[#F2F2F0] font-semibold tracking-widest text-xs shrink-0">
            OR
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#591623] dark:text-[#F2F2F0]">
              ORIIKO
            </p>
            <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65 truncate">
              E-Commerce Operations &amp; Control Suite
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeToggle variant="admin" />
          <Link
            href="/"
            className="text-xs font-medium text-[#591623] dark:text-[#F2F2F0] hover:text-[#8C072B] dark:hover:text-[#F2F2F0]/75 transition-colors px-2 py-1"
          >
            Back to Storefront &rarr;
          </Link>
        </div>
      </header>

      {/* Centered Admin Sign-In Card */}
      <main className="max-w-md w-full mx-auto my-8">
        <div className="bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[6px] p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#591623] dark:text-[#F2F2F0]/80">
            Administrator Sign-In
          </p>
          <h1 className="mt-1.5 text-xl font-semibold text-[#26231F] dark:text-[#F2F2F0]">
            ORIIKO Control Suite
          </h1>
          <p className="mt-1.5 text-xs text-[#26231F]/70 dark:text-[#F2F2F0]/70 leading-relaxed">
            Sign in with your registered administrator credentials to manage products, collections,
            orders, customers, and storefront settings.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium text-[#26231F] dark:text-[#F2F2F0] mb-1.5"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oriiko.com"
                autoComplete="email"
                className="w-full px-3 py-2.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] text-[#26231F] dark:text-[#F2F2F0] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-[#26231F] dark:text-[#F2F2F0] mb-1.5"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full px-3 py-2.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] text-[#26231F] dark:text-[#F2F2F0] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-[4px] bg-[#8C072B]/10 border border-[#8C072B] text-xs text-[#8C072B]"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-[4px] bg-[#591623] text-[#F2F2F0] text-xs font-semibold tracking-wider uppercase hover:bg-[#8C072B] disabled:opacity-50 transition-colors"
            >
              {submitting ? "Authenticating..." : "Sign In to Admin Console"}
            </button>
          </form>

          <p className="mt-5 pt-4 border-t border-[#26231F]/10 dark:border-[#F2F2F0]/10 text-[11px] text-[#26231F]/60 dark:text-[#F2F2F0]/60 leading-relaxed">
            Access is restricted to accounts with the <span className="font-mono">admin</span>{" "}
            role in PostgreSQL.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#26231F]/55 dark:text-[#F2F2F0]/55">
        <span>ORIIKO E-Commerce Control Suite</span>
        <span>Designed &amp; Developed by BASKEY STUDIO</span>
      </footer>
    </div>
  );
}
