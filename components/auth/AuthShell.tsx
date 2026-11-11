"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconEye, IconEyeOff } from "../ui/Icons";

export const AUTH_LABEL_CLASS =
  "text-[10px] uppercase tracking-[0.2em] text-[#26231F]/65 block mb-2 font-medium font-sans";

export const AUTH_INPUT_CLASS =
  "w-full bg-transparent border border-[#26231F]/20 rounded-lg px-4 py-3 text-xs text-[#26231F] placeholder:text-[#26231F]/35 focus:outline-none focus:border-[#591623] transition-colors font-sans";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Shared editorial frame for ORIIKO authentication and account pages.
 * Keeps typography, logo lockup, and 4-colour palette consistent without imagery.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="flex-1 bg-[#F2F2F0] text-[#26231F] flex flex-col items-center justify-center px-4 sm:px-6 py-14 sm:py-20">
      <div className="w-full max-w-[440px]">
        {/* Brand Emblem + Wordmark Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link
            href="/"
            className="inline-flex flex-col items-center gap-3 group focus:outline-none mb-6"
            aria-label="ORIIKO Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo1_burgundy.svg"
              alt="ORIIKO Emblem"
              className="h-10 w-auto object-contain select-none group-hover:opacity-80 transition-opacity duration-200"
            />
            <span
              className="text-xl font-bold tracking-[0.26em] uppercase text-[#591623] group-hover:text-[#8C072B] transition-colors select-none leading-none"
              style={{
                fontFamily:
                  '"Futura", "Futura PT", "Century Gothic", "Trebuchet MS", sans-serif',
              }}
            >
              ORIIKO
            </span>
          </Link>

          <span className="text-[10px] uppercase tracking-[0.26em] text-[#591623] font-semibold mb-2">
            {eyebrow}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#26231F] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#26231F]/65 font-sans mt-2 leading-relaxed max-w-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content Surface */}
        <div className="border border-[#26231F]/15 rounded-2xl bg-[#F2F2F0] p-7 sm:p-10 shadow-xs">
          {children}
        </div>

        {/* Footer Links */}
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

interface AuthErrorBannerProps {
  message: string | null;
}

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-5 p-3.5 rounded-xl border border-[#8C072B]/35 bg-[#8C072B]/8 text-[#8C072B] text-xs leading-relaxed font-sans"
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
  minLength?: number;
  placeholder?: string;
}

export function AuthPasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
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
          className={`${AUTH_INPUT_CLASS} pr-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#26231F]/45 hover:text-[#591623] transition-colors focus:outline-none cursor-pointer"
          aria-label={visible ? "Hide passcode" : "Show passcode"}
        >
          {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
        </button>
      </div>
    </div>
  );
}

