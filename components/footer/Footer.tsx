"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconShield, IconTruck, IconRefresh, IconUser, IconCheck } from "../ui/Icons";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const serviceBenefits = [
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

  return (
    <footer className="bg-[#591623] text-[#F2F2F0] border-t border-[#26231F]/30 selection:bg-[#8C072B] selection:text-[#F2F2F0]">
      {/* 5.2 Service Benefits Row */}
      <div className="border-b border-[#F2F2F0]/15">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {serviceBenefits.map((item, idx) => {
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
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* 5.1 Brand Statement */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5 sm:gap-3 group focus:outline-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo1_w.svg"
                alt="ORIIKO Emblem"
                className="h-8 sm:h-9 w-auto object-contain"
              />
              <span
                className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-[#F2F2F0] group-hover:text-[#F2F2F0]/80 transition-colors select-none leading-none pt-0.5"
                style={{
                  fontFamily: '"Futura", "Futura PT", "Century Gothic", "Trebuchet MS", sans-serif',
                }}
              >
                ORIIKO
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#F2F2F0]/80 leading-relaxed font-sans max-w-sm">
              An Indian contemporary streetwear label built on heavyweight combed cotton, crisp chain-stitch embroidery, and clean boxy silhouettes.
            </p>
            <div className="space-y-1 text-xs text-[#F2F2F0]/60">
              <p>Designed in India • Drop 01 Collection</p>
              <p>Pan-India Dispatch • UPI &amp; COD Available</p>
            </div>
            {/* Social links */}
            <div className="flex items-center gap-6 pt-2 text-xs uppercase tracking-widest text-[#F2F2F0]/70">
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

          {/* 5.3 Navigation Columns */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#F2F2F0]/60 font-semibold block">
              Shop
            </span>
            <ul className="space-y-2.5 text-xs text-[#F2F2F0]/80 font-sans">
              <li>
                <Link href="/shop" className="hover:text-[#F2F2F0] transition-colors">
                  All Drops
                </Link>
              </li>
              <li>
                <Link href="/shop?category=hoodies" className="hover:text-[#F2F2F0] transition-colors">
                  Heavyweight Hoodies
                </Link>
              </li>
              <li>
                <Link href="/shop?category=t-shirts" className="hover:text-[#F2F2F0] transition-colors">
                  Embroidered T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/shop?category=sweatshirts" className="hover:text-[#F2F2F0] transition-colors">
                  Sweatshirts &amp; Crewnecks
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bottoms" className="hover:text-[#F2F2F0] transition-colors">
                  Cargos &amp; Bottoms
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-[#F2F2F0] transition-colors">
                  Caps &amp; Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#F2F2F0]/60 font-semibold block">
              Policies &amp; Care
            </span>
            <ul className="space-y-2.5 text-xs text-[#F2F2F0]/80 font-sans">
              <li>
                <Link href="/shipping-policy" className="hover:text-[#F2F2F0] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds-and-cancellations" className="hover:text-[#F2F2F0] transition-colors">
                  Refunds &amp; Cancellations
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#F2F2F0] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-[#F2F2F0] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#F2F2F0] transition-colors">
                  Member Account
                </Link>
              </li>
            </ul>
          </div>

          {/* 5.4 Newsletter Subscription */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#F2F2F0]/60 font-semibold block">
              Drop Alerts
            </span>
            <h4 className="text-base font-serif text-[#F2F2F0]">
              Get Early Access to Limited Drops
            </h4>
            <p className="text-xs text-[#F2F2F0]/75 leading-relaxed font-sans">
              Sign up for restock notifications, limited embroidery releases, and exclusive India community codes.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-xl bg-[#8C072B] text-[#F2F2F0] text-xs flex items-center gap-3">
                <IconCheck size={16} />
                <span>You are on the ORIIKO Drop Alert list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex rounded-full border border-[#F2F2F0]/30 focus-within:border-[#F2F2F0] transition-colors overflow-hidden">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 bg-transparent px-5 py-3 text-xs text-[#F2F2F0] placeholder:text-[#F2F2F0]/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#8C072B] hover:bg-[#8C072B]/85 text-[#F2F2F0] text-xs uppercase tracking-widest font-medium transition-colors rounded-full m-0.5 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </div>
                <p className="text-[10px] text-[#F2F2F0]/50">
                  Only drop alerts and restock updates. Zero spam.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* 5.5 Bottom Legal & Copyright Bar */}
        <div className="mt-16 pt-8 border-t border-[#F2F2F0]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F2F2F0]/60 font-sans">
          <p>© 2026 ORIIKO INDIA. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/refunds-and-cancellations" className="hover:text-[#F2F2F0] transition-colors">
              Refunds &amp; Cancellations
            </Link>
            <Link href="/shipping-policy" className="hover:text-[#F2F2F0] transition-colors">
              Shipping Policy
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#F2F2F0] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-[#F2F2F0] transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
