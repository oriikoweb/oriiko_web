"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconShield,
  IconTruck,
  IconRefresh,
  IconUser,
  IconCheck,
  IconChevronDown,
} from "../ui/Icons";

interface FooterLinkItem {
  label: string;
  href: string;
}

interface FooterColumnConfig {
  id: "shop" | "policies";
  title: string;
  links: FooterLinkItem[];
}

const SERVICE_BENEFITS = [
  {
    icon: IconTruck,
    title: "Free Pan-India Shipping",
    desc: "Express prepaid delivery across India on all orders above ₹2,999.",
  },
  {
    icon: IconRefresh,
    title: "14-Day Easy Exchanges",
    desc: "Hassle-free size exchanges and doorstep pickup across serviceable pin codes.",
  },
  {
    icon: IconShield,
    title: "UPI, Cards & COD Accepted",
    desc: "Encrypted checkout supporting UPI, Rupay, Visa, Mastercard, and Cash on Delivery.",
  },
  {
    icon: IconUser,
    title: "India Support Team",
    desc: "Fast sizing advice and order help directly from our India studio team.",
  },
];

const FOOTER_COLUMNS: FooterColumnConfig[] = [
  {
    id: "shop",
    title: "Shop",
    links: [
      { label: "All Drops", href: "/shop" },
      { label: "Heavyweight Hoodies", href: "/shop?category=hoodies" },
      { label: "Embroidered T-Shirts", href: "/shop?category=t-shirts" },
      { label: "Sweatshirts & Crewnecks", href: "/shop?category=sweatshirts" },
      { label: "Cargos & Bottoms", href: "/shop?category=bottoms" },
      { label: "Caps & Accessories", href: "/shop?category=accessories" },
    ],
  },
  {
    id: "policies",
    title: "Policies & Care",
    links: [
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Refunds & Cancellations", href: "/refunds-and-cancellations" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Member Account", href: "/account" },
    ],
  },
];

const LEGAL_BAR_LINKS: FooterLinkItem[] = [
  { label: "Refunds & Cancellations", href: "/refunds-and-cancellations" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

/**
 * Renders a footer navigation column that behaves as a collapsible accordion
 * below the `md` breakpoint while staying permanently expanded on desktop.
 */
function FooterLinkColumn({
  column,
  isOpen,
  onToggle,
}: {
  column: FooterColumnConfig;
  isOpen: boolean;
  onToggle: (id: FooterColumnConfig["id"]) => void;
}) {
  return (
    <div className="lg:col-span-2 border-b border-[#F2F2F0]/15 md:border-b-0 md:space-y-4">
      <button
        type="button"
        onClick={() => onToggle(column.id)}
        aria-expanded={isOpen}
        aria-controls={`footer-section-${column.id}`}
        className="w-full flex items-center justify-between py-3.5 text-left md:hidden cursor-pointer focus:outline-none"
      >
        <span className="text-[11px] tracking-[0.22em] uppercase text-[#F2F2F0]/85 font-semibold">
          {column.title}
        </span>
        <IconChevronDown
          size={15}
          className={`text-[#F2F2F0]/65 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <span className="hidden md:block text-[10px] tracking-[0.25em] uppercase text-[#F2F2F0]/60 font-semibold">
        {column.title}
      </span>

      <div
        id={`footer-section-${column.id}`}
        className={`grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:grid-rows-[1fr] md:opacity-100 md:visible md:pb-0 ${
          isOpen
            ? "grid-rows-[1fr] opacity-100 visible pb-4"
            : "max-md:grid-rows-[0fr] max-md:opacity-0 max-md:invisible"
        }`}
      >
        <ul className="overflow-hidden space-y-2.5 text-xs text-[#F2F2F0]/80 font-sans">
          {column.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-[#F2F2F0] transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Global storefront footer with a minimal accordion-driven layout on mobile
 * and the full editorial showcase on tablet and desktop viewports.
 */
export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<FooterColumnConfig["id"] | null>(
    null
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const toggleMobileSection = (id: FooterColumnConfig["id"]) => {
    setOpenMobileSection((prev) => (prev === id ? null : id));
  };

  return (
    <footer
      id="footer"
      className="bg-[#591623] text-[#F2F2F0] border-t border-[#26231F]/30 selection:bg-[#8C072B] selection:text-[#F2F2F0]"
    >
      {/* Service Benefits Row (hidden on mobile to keep the mobile footer minimal) */}
      <div className="hidden md:block border-b border-[#F2F2F0]/15">
        <div className="max-w-[1440px] mx-auto px-10 lg:px-16 py-14 lg:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {SERVICE_BENEFITS.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-[#8C072B] text-[#F2F2F0] flex-shrink-0">
                    <IconComp size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#F2F2F0]">
                      {item.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-[#F2F2F0]/70 font-sans">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Navigation & Newsletter */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-16 pt-8 pb-7 md:py-16 lg:py-20">
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-12 lg:gap-16">
          {/* Brand Statement */}
          <div className="order-1 md:order-none lg:col-span-4 space-y-5">
            <div className="flex items-center justify-between gap-4 md:block">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo1_w.svg"
                  alt="ORIIKO Emblem"
                  className="block h-6 md:h-9 w-auto object-contain shrink-0"
                />
                <span
                  className="inline-flex items-center text-lg md:text-2xl font-bold tracking-[0.2em] -mr-[0.2em] uppercase text-[#F2F2F0] group-hover:text-[#F2F2F0]/80 transition-colors select-none leading-[1] translate-y-[1px]"
                  style={{
                    fontFamily:
                      '"Futura", "Futura PT", "Century Gothic", "Trebuchet MS", sans-serif',
                  }}
                >
                  ORIIKO
                </span>
              </Link>

              <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-[#F2F2F0]/75 md:hidden">
                <a href="#instagram" className="hover:text-[#F2F2F0] transition-colors">
                  Instagram
                </a>
                <Link href="/account" className="hover:text-[#F2F2F0] transition-colors">
                  Account
                </Link>
              </div>
            </div>

            <p className="hidden md:block text-sm text-[#F2F2F0]/80 leading-relaxed font-sans max-w-sm">
              An Indian contemporary streetwear label built on heavyweight combed cotton, crisp chain-stitch embroidery, and clean boxy silhouettes.
            </p>
            <div className="hidden md:block space-y-1 text-xs text-[#F2F2F0]/60">
              <p>Designed in India • Drop 01 Collection</p>
              <p>Pan-India Dispatch • UPI &amp; COD Available</p>
            </div>

            <div className="hidden md:flex items-center gap-6 pt-2 text-xs uppercase tracking-widest text-[#F2F2F0]/70">
              <a href="#instagram" className="hover:text-[#F2F2F0] transition-colors">
                Instagram
              </a>
              <Link href="/shop" className="hover:text-[#F2F2F0] transition-colors">
                Lookbook
              </Link>
              <Link href="/#quality" className="hover:text-[#F2F2F0] transition-colors">
                Fabric Specs
              </Link>
            </div>
          </div>

          {/* Navigation Columns (accordions on mobile, side-by-side columns on desktop) */}
          <div className="order-3 md:order-none flex flex-col border-t border-[#F2F2F0]/15 md:border-t-0 md:grid md:grid-cols-2 md:gap-8 lg:contents">
            {FOOTER_COLUMNS.map((column) => (
              <FooterLinkColumn
                key={column.id}
                column={column}
                isOpen={openMobileSection === column.id}
                onToggle={toggleMobileSection}
              />
            ))}
          </div>

          {/* Newsletter Subscription */}
          <div className="order-2 md:order-none lg:col-span-4 space-y-2.5 md:space-y-4">
            <span className="hidden md:block text-[10px] tracking-[0.25em] uppercase text-[#F2F2F0]/60 font-semibold">
              Drop Alerts
            </span>
            <h4 className="text-[11px] md:text-base uppercase md:normal-case tracking-[0.18em] md:tracking-normal font-sans md:font-serif font-medium md:font-normal text-[#F2F2F0]/75 md:text-[#F2F2F0]">
              <span className="md:hidden">Drop Alerts</span>
              <span className="hidden md:inline">Get Early Access to Limited Drops</span>
            </h4>
            <p className="hidden md:block text-xs text-[#F2F2F0]/75 leading-relaxed font-sans">
              Sign up for restock notifications, limited embroidery releases, and exclusive India community codes.
            </p>

            {subscribed ? (
              <div className="p-3.5 md:p-4 rounded-xl bg-[#8C072B] text-[#F2F2F0] text-xs flex items-center gap-3">
                <IconCheck size={16} />
                <span>You are on the ORIIKO Drop Alert list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex rounded-full border border-[#F2F2F0]/25 focus-within:border-[#F2F2F0] transition-colors overflow-hidden">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email for early drops..."
                    className="min-w-0 flex-1 bg-transparent px-4 sm:px-5 py-2.5 md:py-3 text-base md:text-xs text-[#F2F2F0] placeholder:text-[#F2F2F0]/45 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 sm:px-6 py-2.5 md:py-3 bg-[#8C072B] hover:bg-[#8C072B]/85 text-[#F2F2F0] text-[11px] sm:text-xs uppercase tracking-widest font-medium transition-colors rounded-full m-0.5 shrink-0 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </div>
                <p className="hidden md:block text-[10px] text-[#F2F2F0]/50">
                  Only drop alerts and restock updates. Zero spam.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal & Attribution Bar */}
        <div className="mt-6 md:mt-16 pt-2 md:pt-8 md:border-t md:border-[#F2F2F0]/15 flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-4 text-[11px] md:text-xs text-[#F2F2F0]/65 font-sans text-center">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3.5">
            <p>© 2026 ORIIKO INDIA. ALL RIGHTS RESERVED.</p>
            <span className="hidden sm:inline text-[#F2F2F0]/30">&bull;</span>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.15em] text-[#F2F2F0]/75">
              Designed &amp; Developed by{" "}
              <span className="font-semibold text-[#F2F2F0]">BASKEY STUDIO</span>
            </p>
          </div>
          <div className="hidden md:flex flex-wrap items-center justify-center gap-6">
            {LEGAL_BAR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#F2F2F0] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
