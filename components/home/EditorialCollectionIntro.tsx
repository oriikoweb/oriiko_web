"use client";

import React from "react";
import Link from "next/link";
import { IconArrowRight } from "../ui/Icons";

export function EditorialCollectionIntro() {
  return (
    <section id="editorial" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="rounded-2xl overflow-hidden bg-[#26231F] text-[#F2F2F0] grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-sm">
        {/* Left Column — Narrative */}
        <div className="lg:col-span-6 p-6 sm:p-12 lg:p-16 flex flex-col justify-center space-y-5 sm:space-y-6">
          <span className="inline-flex items-center w-fit px-3 py-1 rounded-full bg-[#8C072B] text-[10px] tracking-[0.24em] uppercase text-[#F2F2F0] font-semibold">
            100% Combed Indian Cotton
          </span>

          <h2
            className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#F2F2F0] leading-[1.14] sm:leading-[1.12]"
            style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
          >
            Blending heavyweight structure with everyday comfort.
          </h2>

          <p className="text-xs sm:text-sm leading-relaxed text-[#F2F2F0]/80 font-sans max-w-lg">
            Crafted from custom-knitted 480 GSM loopback French terry and 280 GSM bio-washed single jersey. Pre-shrunk, enzyme-finished, and paired with clean chain-stitch embroidery made to last across Indian seasons.
          </p>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#F2F2F0] hover:bg-[#8C072B] text-[#26231F] hover:text-[#F2F2F0] text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
            >
              <span>Explore Drop 01</span>
              <IconArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Column — Full-Height Cropped Visual */}
        <div className="lg:col-span-6 relative min-h-[320px] sm:min-h-[420px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85"
            alt="ORIIKO Heavyweight Cotton Knitting and Embroidery Process"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute bottom-5 right-5 bg-[#F2F2F0]/92 backdrop-blur-xs px-4 py-2 rounded-full border border-[#26231F]/15 text-[10px] tracking-widest uppercase text-[#26231F] font-semibold">
            ORIIKO India &bull; Drop 01 Studio
          </div>
        </div>
      </div>
    </section>
  );
}
