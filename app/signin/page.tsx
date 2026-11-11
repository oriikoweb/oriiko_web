"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../context/StoreContext";
import {
  AuthShell,
  AuthErrorBanner,
  AuthPasswordField,
  AUTH_LABEL_CLASS,
  AUTH_INPUT_CLASS,
} from "../../components/auth/AuthShell";

export default function SignInPage() {
  const { user, loading, signIn } = useAuth();
  const { triggerToast } = useStore();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/account");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error);
    } else {
      triggerToast("Welcome back to ORIIKO");
      router.push("/account");
    }
  };

  return (
    <AuthShell
      eyebrow="Account Access"
      title="Sign In"
      subtitle="Enter your email and passcode to view orders, saved details, and drop updates."
      footer={
        <p className="text-xs text-[#26231F]/70 font-sans">
          New to ORIIKO?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#591623] hover:text-[#8C072B] underline underline-offset-4 transition-colors"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <AuthErrorBanner message={errorMsg} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="signin-email" className={AUTH_LABEL_CLASS}>
            Email Address
          </label>
          <input
            id="signin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={AUTH_INPUT_CLASS}
          />
        </div>

        <AuthPasswordField
          id="signin-password"
          label="Passcode"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full py-3.5 mt-2 rounded-full bg-[#591623] hover:bg-[#8C072B] disabled:opacity-50 disabled:cursor-not-allowed text-[#F2F2F0] text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
        >
          {isSubmitting ? "Authenticating..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}

