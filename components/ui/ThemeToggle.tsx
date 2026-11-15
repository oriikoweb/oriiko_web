"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { IconMoon, IconSun } from "./Icons";

interface ThemeToggleProps {
  variant?: "storefront" | "admin";
  className?: string;
}

/**
 * Accessible Dark/Light theme switch using strictly the ORIIKO 4-color palette.
 */
export function ThemeToggle({
  variant = "storefront",
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const isRoundedFull = variant === "storefront";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-between w-11 h-6 sm:w-12 sm:h-[26px] p-0.5 border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#591623] cursor-pointer shrink-0 ${
        isRoundedFull ? "rounded-full" : "rounded-[4px]"
      } bg-[#26231F]/[0.07] border-[#26231F]/18 text-[#26231F] hover:border-[#591623] dark:bg-[#F2F2F0]/10 dark:border-[#F2F2F0]/22 dark:text-[#F2F2F0] dark:hover:border-[#8C072B] ${className}`}
    >
      {/* Sun slot */}
      <span
        aria-hidden="true"
        className="relative z-10 w-[18px] sm:w-[20px] h-full flex items-center justify-center transition-colors duration-200 text-[#F2F2F0] dark:text-[#F2F2F0]/55"
      >
        <IconSun size={11} />
      </span>

      {/* Moon slot */}
      <span
        aria-hidden="true"
        className="relative z-10 w-[18px] sm:w-[20px] h-full flex items-center justify-center transition-colors duration-200 text-[#26231F]/55 dark:text-[#F2F2F0]"
      >
        <IconMoon size={11} />
      </span>

      {/* Animated active thumb */}
      <span
        aria-hidden="true"
        className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] sm:w-5 sm:h-5 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] translate-x-0 dark:translate-x-5 sm:dark:translate-x-[22px] bg-[#591623] dark:bg-[#8C072B] shadow-xs ${
          isRoundedFull ? "rounded-full" : "rounded-[3px]"
        }`}
      />
    </button>
  );
}

