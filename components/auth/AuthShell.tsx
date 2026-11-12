"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconEye, IconEyeOff, IconChevronLeft } from "../ui/Icons";

export const AUTH_LABEL_CLASS =
  "text-[11px] uppercase tracking-[0.16em] text-[#26231F]/70 block mb-1.5 font-medium font-sans";

export const AUTH_INPUT_CLASS =
  "w-full bg-[#FEFBF5] sm:bg-[#F2F2F0]/45 border border-[#26231F]/15 rounded-xl px-4 h-12 text-base sm:text-sm text-[#26231F] placeholder:text-[#26231F]/35 focus:bg-[#FEFBF5] focus:outline-none focus:border-[#591623] focus:ring-3 focus:ring-[#591623]/10 transition-all duration-150 font-sans";

export const AUTH_SUBMIT_BUTTON_CLASS =
  "w-full h-12 mt-2 rounded-full bg-[#591623] hover:bg-[#8C072B] active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-[#F2F2F0] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 shadow-sm";

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  activeTab?: "signin" | "signup";
  mode?: "standalone" | "storefront";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AUTH_TABS: Array<{ id: "signin" | "signup"; label: string; href: string }> = [
  { id: "signin", label: "Sign In", href: "/signin" },
  { id: "signup", label: "Create Account", href: "/signup" },
];

/**
 * Shared frame for ORIIKO authentication and account flows.
 * Uses a focused single-logo native layout on standalone auth routes and an
 * inline storefront card on `/account` so the ORIIKO mark is never repeated.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  activeTab,
  mode = "standalone",
  children,
  footer,
}: AuthShellProps) {
  if (mode === "storefront") {
    return (
      <main className="flex-1 bg-[#F2F2F0] text-[#26231F] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-16">
        <div className="w-full max-w-[440px]">
          <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
            {eyebrow && (
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#591623] font-semibold mb-2">
                {eyebrow}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#26231F] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[#26231F]/65 font-sans mt-2 leading-relaxed max-w-sm break-words">
                {subtitle}
              </p>
            )}
          </div>

          <div className="border border-[#26231F]/12 rounded-2xl sm:rounded-3xl bg-[#FEFBF5] p-5 sm:p-9 shadow-[0_20px_50px_-28px_rgba(38,35,31,0.14)]">
            {children}
          </div>

          {footer && <div className="mt-6 text-center space-y-3">{footer}</div>}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-[11px] uppercase tracking-[0.18em] text-[#26231F]/55 hover:text-[#591623] transition-colors font-sans"
            >
              &larr; Return to Store
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F0] text-[#26231F] flex flex-col">
      {/* Native Top Bar */}
      <header className="w-full max-w-[1120px] mx-auto px-4 sm:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] h-14 sm:h-16 flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1 -ml-2 px-3 py-2 min-h-[44px] rounded-full text-xs uppercase tracking-[0.16em] text-[#26231F]/70 hover:text-[#591623] hover:bg-[#26231F]/[0.04] active:scale-95 transition-all font-sans"
        >
          <IconChevronLeft size={16} />
          <span>Store</span>
        </Link>
      </header>

      {/* Main Centered Canvas */}
      <main className="flex-1 flex flex-col items-center justify-start sm:justify-center px-5 sm:px-6 pt-2 pb-4 sm:py-8">
        <div className="w-full max-w-[420px]">
          {/* Single Authoritative ORIIKO Brand Lockup */}
          <div className="flex flex-col items-center text-center mb-5 sm:mb-7">
            <Link
              href="/"
              className="inline-flex flex-col items-center gap-2 group focus:outline-none mb-4 sm:mb-5"
              aria-label="ORIIKO Home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo1_burgundy.svg"
                alt="ORIIKO Emblem"
                className="h-8 sm:h-9 w-auto object-contain select-none group-hover:opacity-80 transition-opacity duration-200"
              />
              <span
                className="text-lg sm:text-xl font-bold tracking-[0.26em] -mr-[0.26em] uppercase text-[#591623] group-hover:text-[#8C072B] transition-colors select-none leading-none"
                style={{
                  fontFamily:
                    '"Futura", "Futura PT", "Century Gothic", "Trebuchet MS", sans-serif',
                }}
              >
                ORIIKO
              </span>
            </Link>

            {eyebrow && (
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#591623]/80 font-semibold mb-1.5">
                {eyebrow}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#26231F] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[#26231F]/60 font-sans mt-1.5 leading-relaxed max-w-[320px]">
                {subtitle}
              </p>
            )}
          </div>

          {/* Native Segmented Mode Switcher */}
          {activeTab && (
            <nav
              aria-label="Authentication mode"
              className="grid grid-cols-2 p-1 rounded-full bg-[#26231F]/[0.06] border border-[#26231F]/8 mb-5 sm:mb-6"
            >
              {AUTH_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`h-10 rounded-full flex items-center justify-center text-[11px] sm:text-xs uppercase tracking-[0.16em] font-medium transition-all duration-200 active:scale-[0.98] ${
                      isActive
                        ? "bg-[#FEFBF5] text-[#591623] shadow-xs"
                        : "text-[#26231F]/55 hover:text-[#26231F]"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Edge-clean on mobile, luminous atelier surface on desktop */}
          <div className="sm:rounded-3xl sm:border sm:border-[#26231F]/10 sm:bg-[#FEFBF5] sm:p-8 sm:shadow-[0_24px_60px_-28px_rgba(38,35,31,0.16)]">
            {children}
          </div>

          {footer && <div className="mt-5 text-center space-y-2">{footer}</div>}
        </div>
      </main>

      {/* Quiet Safe-Area Legal Anchor */}
      <footer className="mt-auto pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] px-5 text-center space-y-1 shrink-0">
        <p className="text-[11px] text-[#26231F]/45 font-sans leading-relaxed">
          By continuing, you agree to ORIIKO&apos;s{" "}
          <Link
            href="/terms-and-conditions"
            className="underline underline-offset-2 hover:text-[#591623] transition-colors"
          >
            Terms
          </Link>{" "}
          &amp;{" "}
          <Link
            href="/privacy-policy"
            className="underline underline-offset-2 hover:text-[#591623] transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#26231F]/35 font-sans">
          © 2026 ORIIKO INDIA
        </p>
      </footer>
    </div>
  );
}

interface AuthErrorBannerProps {
  message: string | null;
}

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 p-3.5 rounded-xl border border-[#8C072B]/30 bg-[#8C072B]/8 text-[#8C072B] text-xs leading-relaxed font-sans"
    >
      <span className="font-semibold block mb-0.5">Authentication notice</span>
      {message}
    </div>
  );
}

interface AuthPasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  enterKeyHint?: React.InputHTMLAttributes<HTMLInputElement>["enterKeyHint"];
  minLength?: number;
  placeholder?: string;
}

export function AuthPasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  enterKeyHint,
  minLength,
  placeholder = "••••••••",
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={AUTH_LABEL_CLASS}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          enterKeyHint={enterKeyHint}
          className={`${AUTH_INPUT_CLASS} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-xl text-[#26231F]/45 hover:text-[#591623] active:scale-95 transition-all focus:outline-none cursor-pointer"
          aria-label={visible ? "Hide passcode" : "Show passcode"}
        >
          {visible ? <IconEyeOff size={17} /> : <IconEye size={17} />}
        </button>
      </div>
    </div>
  );
}
