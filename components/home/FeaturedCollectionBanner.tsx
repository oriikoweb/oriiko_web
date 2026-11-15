"use client";

import React from "react";
import Link from "next/link";
import { IconArrowRight } from "../ui/Icons";

export function FeaturedCollectionBanner() {
  return (
    <section className="relative w-full min-h-[500px] sm:min-h-[620px] flex items-center justify-center p-8 sm:p-16 border-y border-[#26231F]/15 overflow-hidden group">
      {/* Background cinematic photograph */}
      <div className="absolute inset-0 bg-[#26231F] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=85"
          alt="ORIIKO Drop 01 Heavyweight Streetwear Lookbook"
          className="w-full h-full object-cover object-center opacity-80 group-hover:scale-104 transition-transform duration-1000 ease-out"
        />
        {/* Strict brand dark wash */}
        <div className="absolute inset-0 bg-[#26231F]/50" />
      </div>

      {/* Center Content Box adhering to Off-White / Dark Charcoal surface */}
      <div className="relative z-10 max-w-2xl bg-[#F2F2F0] dark:bg-[#26231F] p-8 sm:p-12 lg:p-14 text-center border border-[#26231F]/15 dark:border-[#F2F2F0]/15 shadow-2xl space-y-4">
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#8C072B] dark:text-[#F2F2F0]/75 font-semibold block">
          Drop 01 Release
        </span>
        <h2
          className="text-2xl sm:text-4xl font-serif text-[#26231F] dark:text-[#F2F2F0] leading-tight"
          style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
        >
          Heavyweight Fleece & Embroidered Tees
        </h2>
        <div className="w-10 h-[1.5px] bg-[#591623] dark:bg-[#8C072B] mx-auto my-3" />
        <p className="text-xs sm:text-sm text-[#26231F]/75 dark:text-[#F2F2F0]/75 leading-relaxed font-sans max-w-lg mx-auto">
          Boxy proportions, dense combed cotton fleece, and intricate chain-stitch embroidery engineered for everyday wear across India.
        </p>
        <div className="pt-4 flex justify-center">
          <Link
            href="/shop"
            className="px-8 py-3.5 bg-[#591623] hover:bg-[#8C072B] text-[#F2F2F0] text-xs uppercase tracking-[0.22em] font-medium transition-colors inline-flex items-center gap-3 shadow-md"
          >
            <span>Explore Drop 01</span>
            <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

