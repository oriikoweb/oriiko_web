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

export default function SignUpPage() {
  const { user, loading, signUp } = useAuth();
  const { triggerToast } = useStore();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!fullName.trim()) {
      setErrorMsg("Please provide your full name.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Passcode must be at least 6 characters in length.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passcodes do not match. Please verify your entry.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error);
    } else {
      triggerToast("Welcome to ORIIKO");
      router.push("/account");
    }
  };

  return (
    <AuthShell
      eyebrow="Member Registry"
      title="Create Account"
      subtitle="Join ORIIKO for faster checkout, order tracking, and early drop access across India."
      footer={
        <p className="text-xs text-[#26231F]/70 font-sans">
          Already registered?{" "}
          <Link
            href="/signin"
            className="font-semibold text-[#591623] hover:text-[#8C072B] underline underline-offset-4 transition-colors"
          >
            Sign in to your account
          </Link>
        </p>
      }
    >
      <AuthErrorBanner message={errorMsg} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="signup-name" className={AUTH_LABEL_CLASS}>
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Aarav Mehta"
            autoComplete="name"
            className={AUTH_INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="signup-email" className={AUTH_LABEL_CLASS}>
            Email Address
          </label>
          <input
            id="signup-email"
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
          id="signup-password"
          label="Passcode (Min. 6 characters)"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={6}
        />

        <AuthPasswordField
          id="signup-confirm"
          label="Confirm Passcode"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          minLength={6}
        />

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full py-3.5 mt-2 rounded-full bg-[#591623] hover:bg-[#8C072B] disabled:opacity-50 disabled:cursor-not-allowed text-[#F2F2F0] text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
        >
          {isSubmitting ? "Creating Profile..." : "Create Account"}
        </button>

        <p className="text-[10px] text-[#26231F]/50 text-center pt-1 font-sans leading-relaxed">
          By registering, you agree to ORIIKO&apos;s terms of service and client
          privacy notice.
        </p>
      </form>
    </AuthShell>
  );
}

