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
      title="Join ORIIKO"
      subtitle="Faster checkout, order tracking, and early drop access."
      activeTab="signup"
    >
      <AuthErrorBanner message={errorMsg} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-name" className={AUTH_LABEL_CLASS}>
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            autoCapitalize="words"
            enterKeyHint="next"
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
          id="signup-password"
          label="Passcode (Min. 6 characters)"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          enterKeyHint="next"
          minLength={6}
        />

        <AuthPasswordField
          id="signup-confirm"
          label="Confirm Passcode"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          enterKeyHint="done"
          minLength={6}
        />

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className={AUTH_SUBMIT_BUTTON_CLASS}
        >
          {isSubmitting ? "Creating Profile..." : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
}

