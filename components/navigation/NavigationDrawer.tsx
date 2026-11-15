"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClose, IconArrowRight, IconUser } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";

const NATIVE_SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";

export function NavigationDrawer() {
  const { isNavOpen, setIsNavOpen, collections } = useStore();
  const { user, profile } = useAuth();
  const pathname = usePathname();

  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const gestureAxisRef = useRef<"x" | "y" | null>(null);

  // Body scroll lock & Escape key dismissal
  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = "hidden";
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsNavOpen(false);
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isNavOpen, setIsNavOpen]);

  const activeDragX = isNavOpen && isDragging ? dragOffsetX : 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
    gestureAxisRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }

    const dx = e.touches[0].clientX - touchStartXRef.current;
    const dy = e.touches[0].clientY - touchStartYRef.current;

    if (!gestureAxisRef.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        gestureAxisRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      } else {
        return;
      }
    }

    if (gestureAxisRef.current === "x") {
      setIsDragging(true);
      // Only allow leftward drag towards dismissal (with slight elastic resistance if pulled right)
      const clampedDx = dx < 0 ? dx : Math.min(18, dx * 0.15);
      setDragOffsetX(clampedDx);
    }
  };

  const handleTouchEnd = () => {
    if (gestureAxisRef.current === "x") {
      const elapsed = Math.max(1, Date.now() - touchStartTimeRef.current);
      const velocity = dragOffsetX / elapsed;
      if (dragOffsetX < -72 || velocity < -0.45) {
        setIsNavOpen(false);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    gestureAxisRef.current = null;
    setIsDragging(false);
    setDragOffsetX(0);
  };

  const primaryLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop", hasChildren: true },
    { label: "Contact", href: "/#footer" },
    { label: "About us", href: "/#editorial" },
  ];

  const collectionLinks = [
    { label: "All Drops", href: "/shop", badge: undefined as string | undefined },
    ...collections.map((col) => ({
      label: col.name,
      href: `/shop?collection=${encodeURIComponent(col.slug)}`,
      badge: col.season || undefined,
    })),
  ];

  // Interpolate backdrop opacity dynamically while swiping left
  const swipeFadeProgress =
    isNavOpen && isDragging && activeDragX < 0
      ? Math.max(0.25, 1 + activeDragX / 300)
      : 1;

  return (
    <div
      aria-hidden={!isNavOpen}
      className={`fixed inset-0 z-50 overflow-hidden ${
        isNavOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Smooth Dimmed & Blurred Backdrop */}
      <div
        onClick={() => setIsNavOpen(false)}
        style={{
          opacity: isNavOpen ? swipeFadeProgress : 0,
          transition: isDragging
            ? "none"
            : `opacity 360ms ${NATIVE_SPRING}`,
        }}
        className="absolute inset-0 bg-[#26231F]/48 backdrop-blur-[3px] will-change-[opacity]"
      />

      {/* Sliding Sidebar Sheet */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <aside
          aria-label="ORIIKO Navigation Menu"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: isNavOpen
              ? `translate3d(${activeDragX}px, 0, 0)`
              : "translate3d(-104%, 0, 0)",
            transition: isDragging
              ? "none"
              : `transform 400ms ${NATIVE_SPRING}`,
          }}
          className="w-[85vw] max-w-[360px] sm:max-w-md bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] flex flex-col justify-between shadow-2xl border-r border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-r-2xl overflow-hidden will-change-transform touch-pan-y"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 h-[56px] border-b border-[#26231F]/10 dark:border-[#F2F2F0]/10 flex items-center justify-between shrink-0">
            <Link
              href="/"
              onClick={() => setIsNavOpen(false)}
              className="inline-flex items-center gap-2 focus:outline-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo1_burgundy.svg"
                alt="ORIIKO Emblem"
                className="block dark:hidden h-6 w-auto object-contain shrink-0"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo1_w.svg"
                alt="ORIIKO Emblem"
                className="hidden dark:block h-6 w-auto object-contain shrink-0"
              />
              <span
                className="inline-flex items-center text-[1.05rem] font-bold tracking-[0.2em] -mr-[0.2em] uppercase text-[#591623] dark:text-[#F2F2F0] leading-[1] translate-y-[0.5px]"
                style={{
                  fontFamily:
                    '"Futura", "Futura PT", "Century Gothic", "Trebuchet MS", sans-serif',
                }}
              >
                ORIIKO
              </span>
            </Link>
            <button
              onClick={() => setIsNavOpen(false)}
              className="p-2.5 -mr-2 rounded-full text-[#26231F] dark:text-[#F2F2F0] hover:text-[#591623] dark:hover:text-[#F2F2F0]/75 hover:bg-[#26231F]/5 dark:hover:bg-[#F2F2F0]/10 active:scale-95 transition-all focus:outline-none cursor-pointer"
              aria-label="Close navigation"
            >
              <IconClose size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-5 sm:px-8 py-6 sm:py-8 flex-1 overflow-y-auto no-scrollbar space-y-6 sm:space-y-8">
            {/* Primary Nav Links with staggered native entrance */}
            <div className="space-y-2">
              <ul className="space-y-1.5 sm:space-y-2.5">
                {primaryLinks.map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <li
                      key={item.label}
                      style={{
                        opacity: isNavOpen ? 1 : 0,
                        transform: isNavOpen
                          ? "translate3d(0, 0, 0)"
                          : "translate3d(-12px, 0, 0)",
                        transition: `opacity 320ms ${NATIVE_SPRING}, transform 360ms ${NATIVE_SPRING}`,
                        transitionDelay: isNavOpen ? `${80 + idx * 40}ms` : "0ms",
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsNavOpen(false)}
                        className={`group flex items-center justify-between min-h-[44px] py-1.5 px-2 -mx-2 rounded-xl text-lg sm:text-xl font-sans font-medium tracking-normal active:scale-[0.98] active:bg-[#591623]/6 dark:active:bg-[#591623]/30 transition-all ${
                          isActive
                            ? "text-[#591623] dark:text-[#F2F2F0] font-semibold"
                            : "text-[#26231F] dark:text-[#F2F2F0]/85 hover:text-[#591623] dark:hover:text-[#F2F2F0] hover:translate-x-1"
                        }`}
                      >
                        <span>{item.label}</span>
                        <IconArrowRight
                          size={15}
                          className="opacity-45 sm:opacity-0 sm:-translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#591623] dark:text-[#F2F2F0]"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Shop Categories sub-list */}
            <div
              style={{
                opacity: isNavOpen ? 1 : 0,
                transform: isNavOpen
                  ? "translate3d(0, 0, 0)"
                  : "translate3d(-10px, 0, 0)",
                transition: `opacity 340ms ${NATIVE_SPRING}, transform 380ms ${NATIVE_SPRING}`,
                transitionDelay: isNavOpen ? "220ms" : "0ms",
              }}
              className="pt-5 sm:pt-6 border-t border-[#26231F]/10 dark:border-[#F2F2F0]/10 space-y-2.5 sm:space-y-3"
            >
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#26231F]/60 dark:text-[#F2F2F0]/60 font-semibold block">
                Collections
              </span>
              <ul className="space-y-1 sm:space-y-2">
                {collectionLinks.map((cat) => (
                  <li key={cat.label}>
                    <Link
                      href={cat.href}
                      onClick={() => setIsNavOpen(false)}
                      className="flex items-center justify-between min-h-[40px] py-1 px-2 -mx-2 rounded-lg text-sm font-sans tracking-wide text-[#26231F]/80 dark:text-[#F2F2F0]/80 hover:text-[#591623] dark:hover:text-[#F2F2F0] active:scale-[0.99] active:bg-[#591623]/6 dark:active:bg-[#591623]/30 transition-all"
                    >
                      <span>{cat.label}</span>
                      {cat.badge && (
                        <span className="text-[9px] uppercase tracking-widest font-sans px-2.5 py-0.5 bg-[#8C072B] text-[#F2F2F0] rounded-full font-bold">
                          {cat.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer of Drawer */}
          <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8 border-t border-[#26231F]/10 dark:border-[#F2F2F0]/10 bg-[#F2F2F0] dark:bg-[#26231F] space-y-3 sm:space-y-4 shrink-0">
            <Link
              href={user ? "/account" : "/signin"}
              onClick={() => setIsNavOpen(false)}
              className="w-full flex items-center justify-between p-3.5 min-h-[48px] rounded-xl border border-[#26231F]/15 dark:border-[#F2F2F0]/15 hover:border-[#591623] dark:hover:border-[#8C072B] hover:bg-[#591623]/5 dark:hover:bg-[#591623]/25 active:scale-[0.985] transition-all text-xs font-sans text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <IconUser size={16} className="text-[#591623] dark:text-[#F2F2F0] shrink-0" />
                <span className="font-medium text-[#26231F] dark:text-[#F2F2F0] truncate">
                  {user
                    ? `Account: ${profile?.full_name || user.email?.split("@")[0]}`
                    : "Sign In / Create Account"}
                </span>
              </div>
              <span className="text-[10px] text-[#591623] dark:text-[#F2F2F0] font-semibold uppercase tracking-wider shrink-0">
                {user ? "View" : "Open"} &rarr;
              </span>
            </Link>

            <div className="flex items-center justify-between text-[11px] tracking-wider uppercase text-[#26231F]/70 dark:text-[#F2F2F0]/70">
              <span>India Storefront</span>
              <span className="font-semibold text-[#591623] dark:text-[#F2F2F0]">Pan-India Delivery</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#26231F]/60 dark:text-[#F2F2F0]/60">
              Free express delivery across India on orders over ₹2,999.
            </p>
            <p className="pt-2.5 border-t border-[#26231F]/10 dark:border-[#F2F2F0]/10 text-[10px] uppercase tracking-[0.15em] text-[#26231F]/65 dark:text-[#F2F2F0]/65 font-sans text-center">
              Designed &amp; Developed by{" "}
              <span className="font-semibold text-[#591623] dark:text-[#F2F2F0]">BASKEY STUDIO</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
