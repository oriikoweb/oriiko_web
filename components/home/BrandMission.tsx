"use client";

import React from "react";
import Link from "next/link";
import { IconArrowRight } from "../ui/Icons";

export function BrandMission() {
  return (
    <section className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl bg-[#26231F] text-[#F2F2F0] py-20 sm:py-28 px-6 sm:px-12 text-center space-y-7">
        <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#8C072B]/25 border border-[#8C072B]/40 text-[10px] tracking-[0.28em] uppercase text-[#F2F2F0] font-semibold">
          Built For India
        </span>

        <h2
          className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal leading-[1.12] tracking-tight max-w-4xl mx-auto"
          style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
        >
          A testament of heavyweight cotton fleece, boxy silhouettes &amp; precision embroidery.
        </h2>

        <p className="text-xs sm:text-sm leading-relaxed text-[#F2F2F0]/75 font-sans max-w-xl mx-auto">
          Designed for India, ORIIKO builds small-batch hoodies, embroidered t-shirts, and sweatshirts engineered for weight, wash longevity, and clean everyday styling.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#F2F2F0] hover:bg-[#8C072B] text-[#26231F] hover:text-[#F2F2F0] text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
          >
            <span>Our Products</span>
            <IconArrowRight size={14} />
          </Link>
          <Link
            href="/#editorial"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-[#F2F2F0]/30 hover:border-[#F2F2F0] text-[#F2F2F0] text-xs uppercase tracking-[0.2em] font-medium transition-colors"
          >
            <span>About Us</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
