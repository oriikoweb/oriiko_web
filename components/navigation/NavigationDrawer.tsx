"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClose, IconArrowRight, IconUser } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";

export function NavigationDrawer() {
  const { isNavOpen, setIsNavOpen } = useStore();
  const { user, profile } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isNavOpen]);

  if (!isNavOpen) return null;

  const primaryLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop", hasChildren: true },
    { label: "Contact", href: "/#footer" },
    { label: "About us", href: "/#editorial" },
  ];

  const shopCategories = [
    { label: "All Drops", href: "/shop", badge: "DROP 01" },
    { label: "Heavyweight Hoodies", href: "/shop?category=hoodies" },
    { label: "Embroidered T-Shirts", href: "/shop?category=t-shirts" },
    { label: "Sweatshirts", href: "/shop?category=sweatshirts" },
    { label: "Bottoms & Cargos", href: "/shop?category=bottoms" },
    { label: "Accessories", href: "/shop?category=accessories" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background Backdrop Overlay */}
      <div
        onClick={() => setIsNavOpen(false)}
        className="absolute inset-0 bg-[#26231F]/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Sliding Sidebar */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <aside
          aria-label="ORIIKO Navigation Menu"
          className="w-screen max-w-md bg-[#F2F2F0] text-[#26231F] flex flex-col justify-between shadow-2xl border-r border-[#26231F]/15 rounded-r-2xl overflow-hidden animate-in slide-in-from-left duration-300"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#26231F]/10 flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setIsNavOpen(false)}
              className="inline-flex items-center gap-2.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo1_burgundy.svg"
                alt="ORIIKO Emblem"
                className="h-6 w-auto object-contain"
              />
              <span
                className="text-base font-bold tracking-[0.2em] uppercase text-[#591623]"
                style={{
                  fontFamily: '"Futura", "Futura PT", "Century Gothic", "Trebuchet MS", sans-serif',
                }}
              >
                ORIIKO
              </span>
            </Link>
            <button
              onClick={() => setIsNavOpen(false)}
              className="p-2 text-[#26231F] hover:text-[#591623] transition-colors -mr-2 focus:outline-none"
              aria-label="Close navigation"
            >
              <IconClose size={22} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-8 py-8 flex-1 overflow-y-auto no-scrollbar space-y-8">
            {/* Primary Nav Links */}
            <div className="space-y-4">
              <ul className="space-y-3">
                {primaryLinks.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setIsNavOpen(false)}
                        className={`group flex items-center justify-between text-xl font-sans font-medium tracking-normal transition-all ${
                          isActive
                            ? "text-[#591623] font-semibold"
                            : "text-[#26231F] hover:text-[#591623] hover:translate-x-1"
                        }`}
                      >
                        <span>{item.label}</span>
                        <IconArrowRight
                          size={15}
                          className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#591623]"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Shop Categories sub-list */}
            <div className="pt-6 border-t border-[#26231F]/10 space-y-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#26231F]/60 font-semibold block">
                Shop Categories
              </span>
              <ul className="space-y-2.5">
                {shopCategories.map((cat) => (
                  <li key={cat.label}>
                    <Link
                      href={cat.href}
                      onClick={() => setIsNavOpen(false)}
                      className="flex items-center justify-between text-sm font-sans tracking-wide text-[#26231F]/80 hover:text-[#591623] transition-colors py-0.5"
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
          <div className="p-8 border-t border-[#26231F]/10 bg-[#F2F2F0] space-y-4">
            <Link
              href={user ? "/account" : "/signin"}
              onClick={() => setIsNavOpen(false)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#26231F]/15 hover:border-[#591623] hover:bg-[#591623]/5 transition-all text-xs font-sans text-left"
            >
              <div className="flex items-center gap-2.5">
                <IconUser size={16} className="text-[#591623]" />
                <span className="font-medium text-[#26231F]">
                  {user
                    ? `Account: ${profile?.full_name || user.email?.split("@")[0]}`
                    : "Sign In / Create Account"}
                </span>
              </div>
              <span className="text-[10px] text-[#591623] font-semibold uppercase tracking-wider">
                {user ? "View" : "Open"} &rarr;
              </span>
            </Link>

            <div className="flex items-center justify-between text-[11px] tracking-wider uppercase text-[#26231F]/70">
              <span>India Storefront</span>
              <span className="font-semibold text-[#591623]">Pan-India Delivery</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#26231F]/60">
              Free express delivery across India on orders over ₹2,999.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
