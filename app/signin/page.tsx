"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../context/StoreContext";
import {
  AuthShell,
  AuthErrorBanner,
  AuthPasswordField,
  AUTH_LABEL_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_SUBMIT_BUTTON_CLASS,
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
      title="Welcome back"
      subtitle="Access orders, saved details, and early drops."
      activeTab="signin"
    >
      <AuthErrorBanner message={errorMsg} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signin-email" className={AUTH_LABEL_CLASS}>
            Email Address
          </label>
          <input
            id="signin-email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
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
          enterKeyHint="go"
        />

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className={AUTH_SUBMIT_BUTTON_CLASS}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}

