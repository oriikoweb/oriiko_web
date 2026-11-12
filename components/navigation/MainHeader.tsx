"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconMenu,
  IconSearch,
  IconBag,
  IconUser,
  IconGlobe,
  IconInstagram,
  IconMail,
  IconChevronDown,
  IconClose,
} from "../ui/Icons";
import { useStore } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";

const CURRENCIES = [
  { code: "INR", symbol: "₹", flag: "🇮🇳", label: "India (INR ₹)" },
];

const SHOP_CATEGORIES = [
  { label: "All Drops", href: "/shop", badge: "DROP 01" },
  { label: "Heavyweight Hoodies", href: "/shop?category=hoodies" },
  { label: "Embroidered T-Shirts", href: "/shop?category=t-shirts" },
  { label: "Sweatshirts", href: "/shop?category=sweatshirts" },
  { label: "Bottoms & Cargos", href: "/shop?category=bottoms" },
  { label: "Accessories", href: "/shop?category=accessories" },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "/#footer" },
  { label: "About us", href: "/#editorial" },
];

export function MainHeader() {
  const { cartCount, setIsCartOpen, setIsSearchOpen, setIsNavOpen } = useStore();
  const { user, profile } = useAuth();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isGlobeModalOpen, setIsGlobeModalOpen] = useState(false);

  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-30 w-full bg-[#F2F2F0] transition-shadow duration-300 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        {/* ── Top utility row ─────────────────────────────── */}
        <div className="hidden lg:flex items-center justify-end gap-5 px-8 xl:px-12 py-1.5 border-b border-[#26231F]/10">
          {/* Currency selector */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-[#26231F] hover:text-[#591623] transition-colors focus:outline-none cursor-pointer"
              aria-label="Select Currency"
            >
              <span className="text-sm leading-none">{selectedCurrency.flag}</span>
              <span>
                {selectedCurrency.code} {selectedCurrency.symbol}
              </span>
              <IconChevronDown
                size={10}
                className={`transition-transform duration-200 ${
                  isCurrencyOpen ? "rotate-180 text-[#591623]" : "text-[#26231F]/50"
                }`}
              />
            </button>

            {isCurrencyOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#F2F2F0] border border-[#26231F]/15 rounded-xl shadow-xl py-1.5 z-50 overflow-hidden">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => {
                      setSelectedCurrency(curr);
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[11px] flex items-center gap-2.5 hover:bg-[#591623]/8 hover:text-[#591623] transition-colors ${
                      selectedCurrency.code === curr.code
                        ? "font-semibold text-[#591623]"
                        : "text-[#26231F]"
                    }`}
                  >
                    <span>{curr.flag}</span>
                    <span>{curr.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3 pl-4 border-l border-[#26231F]/12">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#26231F] hover:text-[#591623] transition-colors"
              aria-label="ORIIKO on Instagram"
            >
              <IconInstagram size={15} />
            </a>
            <a
              href="mailto:concierge@oriiko.com"
              className="text-[#26231F] hover:text-[#591623] transition-colors"
              aria-label="Contact ORIIKO"
            >
              <IconMail size={15} />
            </a>
          </div>
        </div>

        {/* ── Main nav row ─────────────────────────────────── */}
        <div className="relative flex items-center justify-between px-3 sm:px-8 xl:px-12 border-b border-[#26231F]/12 h-[54px] sm:h-[58px]">

          {/* LEFT: Hamburger + desktop nav links */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <button
              onClick={() => setIsNavOpen(true)}
              className="flex items-center justify-center p-1.5 -ml-1.5 sm:p-1 sm:-ml-1 text-[#26231F] hover:text-[#591623] transition-colors focus:outline-none cursor-pointer"
              aria-label="Open Menu"
            >
              <IconMenu size={20} />
            </button>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
              {/* Home */}
              <Link
                href="/"
                className={`text-[13px] font-medium tracking-wide transition-colors ${
                  pathname === "/"
                    ? "text-[#591623]"
                    : "text-[#26231F] hover:text-[#591623]"
                }`}
              >
                Home
              </Link>

              {/* Shop with dropdown */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setIsShopHovered(true)}
                onMouseLeave={() => setIsShopHovered(false)}
              >
                <Link
                  href="/shop"
                  className={`inline-flex items-center gap-1 text-[13px] font-medium tracking-wide transition-colors ${
                    pathname.startsWith("/shop")
                      ? "text-[#591623]"
                      : "text-[#26231F] hover:text-[#591623]"
                  }`}
                >
                  Shop
                  <IconChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${
                      isShopHovered ? "rotate-180 text-[#591623]" : "text-[#26231F]/50"
                    }`}
                  />
                </Link>

                {isShopHovered && (
                  <div className="absolute left-0 top-full pt-1 w-60 z-50">
                    <div className="bg-[#F2F2F0] border border-[#26231F]/15 rounded-xl shadow-xl py-2 overflow-hidden">
                      <span className="text-[9px] uppercase tracking-widest text-[#26231F]/45 font-semibold px-4 block pb-1.5 pt-0.5">
                        Collections
                      </span>
                      {SHOP_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.label}
                          href={cat.href}
                          className="flex items-center justify-between px-4 py-1.5 text-[12px] text-[#26231F] hover:text-[#591623] hover:bg-[#591623]/5 transition-colors"
                        >
                          <span>{cat.label}</span>
                          {cat.badge && (
                            <span className="text-[8px] uppercase tracking-wider font-bold bg-[#8C072B] text-[#F2F2F0] px-2 py-0.5 rounded-full">
                              {cat.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                      <div className="mt-1.5 mx-4 pt-1.5 border-t border-[#26231F]/10">
                        <Link
                          href="/shop"
                          className="text-[10px] font-semibold uppercase tracking-wider text-[#591623] hover:text-[#8C072B] transition-colors"
                        >
                          View All →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Remaining links */}
              {NAV_LINKS.slice(1).map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] font-medium tracking-wide text-[#26231F] hover:text-[#591623] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CENTER: Logo — dead-centered horizontally and vertically across mobile & desktop */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 sm:gap-2.5 h-full px-1 group focus:outline-none pointer-events-auto"
              aria-label="ORIIKO Home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo1_burgundy.svg"
                alt=""
                aria-hidden="true"
                className="block h-[22px] sm:h-[26px] w-auto object-contain shrink-0 select-none group-hover:opacity-80 transition-opacity duration-200"
              />
              <span
                className="inline-flex items-center text-[1.08rem] sm:text-[1.32rem] font-bold tracking-[0.18em] sm:tracking-[0.22em] -mr-[0.18em] sm:-mr-[0.22em] uppercase text-[#591623] group-hover:text-[#8C072B] transition-colors select-none leading-[1] translate-y-[0.5px] sm:translate-y-[1px]"
                style={{ fontFamily: '"Futura", "Futura PT", "Century Gothic", "Trebuchet MS", sans-serif' }}
              >
                ORIIKO
              </span>
            </Link>
          </div>

          {/* RIGHT: Globe (desktop) · Bag · Account · Search */}
          <div className="ml-auto flex items-center gap-1 sm:gap-5 text-[#26231F] shrink-0 [&>*:first-child]:hidden sm:[&>*:first-child]:inline-flex [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:p-1.5 sm:[&>button]:p-1 [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>a]:p-1.5 sm:[&>a]:p-1">
            {/* Globe */}
            <button
              onClick={() => setIsGlobeModalOpen(true)}
              className="p-1 hover:text-[#591623] transition-colors focus:outline-none cursor-pointer"
              aria-label="Region & Currency"
            >
              <IconGlobe size={19} />
            </button>

            {/* Bag */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1 relative hover:text-[#591623] transition-colors focus:outline-none cursor-pointer"
              aria-label={`Shopping bag — ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
            >
              <IconBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#8C072B] text-[#F2F2F0] text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center leading-none shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account */}
            <Link
              href={user ? "/account" : "/signin"}
              className="p-1 relative hover:text-[#591623] transition-colors focus:outline-none"
              aria-label={user ? `Account: ${profile?.full_name || user.email}` : "Sign In"}
            >
              <IconUser size={19} />
              {user && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#591623] rounded-full ring-2 ring-[#F2F2F0]" />
              )}
            </Link>

            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1 hover:text-[#591623] transition-colors focus:outline-none cursor-pointer"
              aria-label="Search"
            >
              <IconSearch size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Region & Delivery Modal ───────────────────────── */}
      {isGlobeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsGlobeModalOpen(false)}
            className="fixed inset-0 bg-[#26231F]/50 backdrop-blur-xs"
          />
          <div className="relative bg-[#F2F2F0] border border-[#26231F]/15 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#26231F]/10">
              <div className="flex items-center gap-2.5">
                <IconGlobe size={18} className="text-[#591623]" />
                <h3 className="text-sm font-serif text-[#26231F] font-semibold tracking-wide">
                  Shipping Region &amp; Currency
                </h3>
              </div>
              <button
                onClick={() => setIsGlobeModalOpen(false)}
                className="p-1.5 rounded-full text-[#26231F] hover:text-[#591623] hover:bg-[#26231F]/5 transition-colors"
                aria-label="Close"
              >
                <IconClose size={18} />
              </button>
            </div>
            <p className="text-xs text-[#26231F]/65 leading-relaxed">
              ORIIKO currently ships exclusively across India in INR (₹) with UPI, Cards, Netbanking, and Cash on Delivery supported. Free express delivery on orders above ₹2,999.
            </p>
            <div className="space-y-2">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setSelectedCurrency(curr);
                    setIsGlobeModalOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                    selectedCurrency.code === curr.code
                      ? "border-[#591623] bg-[#591623] text-[#F2F2F0] font-medium"
                      : "border-[#26231F]/15 text-[#26231F] hover:border-[#591623]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">{curr.flag}</span>
                    <span>{curr.label}</span>
                  </span>
                  <span className="font-semibold">{curr.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
