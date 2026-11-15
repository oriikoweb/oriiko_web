"use client";

import React from "react";

const SOCIAL_ITEMS = [
  {
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    tag: "@ORIIKO.IN — DROP 01",
  },
  {
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    tag: "480 GSM BOXY HOODIE",
  },
  {
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    tag: "CHAIN-STITCH EMBROIDERY",
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    tag: "MUMBAI & BENGALURU FITS",
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    tag: "CORE FLEECE COLLECTION",
  },
];

export function SocialGallery() {
  return (
    <section className="bg-[#F2F2F0] dark:bg-[#26231F] py-12 sm:py-22 border-t border-[#26231F]/12 dark:border-[#F2F2F0]/12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-7 sm:mb-10 text-center space-y-2">
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#8C072B] dark:text-[#F2F2F0]/75 font-semibold block">
          Community Lookbook
        </span>
        <h2
          className="text-2xl sm:text-3xl font-serif font-normal text-[#26231F] dark:text-[#F2F2F0]"
          style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
        >
          Follow @ORIIKO.IN
        </h2>
        <p className="text-xs text-[#26231F]/60 dark:text-[#F2F2F0]/60 tracking-wider">
          Daily drop updates, streetwear fits, and embroidery close-ups across India.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        {SOCIAL_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className={`group relative rounded-2xl overflow-hidden bg-[#26231F] border border-[#26231F]/10 dark:border-[#F2F2F0]/15 cursor-pointer ${
              idx === 0
                ? "col-span-2 aspect-[16/10] sm:col-span-1 sm:aspect-[4/5]"
                : "aspect-[4/5]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.tag}
              className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-[#26231F]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#F2F2F0] px-3 py-1.5 rounded-full border border-[#F2F2F0]/35">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
