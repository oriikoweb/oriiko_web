"use client";

import React from "react";

const PILLARS = [
  {
    index: "1 / 3",
    tag: "Silhouette",
    title: "Timeless Boxy Form",
    description:
      "Cut with dropped shoulders, structured hoods, and balanced torso proportions designed to outlast disposable seasonal trends.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
  },
  {
    index: "2 / 3",
    tag: "Weight",
    title: "480 GSM Combed Cotton",
    description:
      "Custom-knitted heavyweight Indian French terry and 280 GSM oversized single jersey that drape cleanly without feeling flimsy.",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80",
  },
  {
    index: "3 / 3",
    tag: "Finish",
    title: "High-Density Embroidery",
    description:
      "Multi-thread chain-stitch and satin crest embroidery tested against wash shrinkage, peeling, or fraying through heavy wear.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
];

export function ProductQualityShowcase() {
  return (
    <section
      id="quality"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
    >
      <div className="rounded-2xl bg-[#591623] text-[#F2F2F0] px-4 sm:px-10 lg:px-12 py-12 sm:py-22 space-y-8 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[10px] tracking-[0.28em] uppercase text-[#F2F2F0]/75 font-semibold block">
            ORIIKO Standard
          </span>
          <h2
            className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#F2F2F0]"
            style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
          >
            Three Pillars Behind Every Drop
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.index}
              className="group rounded-2xl bg-[#26231F]/35 border border-[#F2F2F0]/15 overflow-hidden flex flex-col justify-between hover:border-[#F2F2F0]/35 transition-all"
            >
              <div className="aspect-[16/11] w-full overflow-hidden bg-[#26231F]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700"
                />
              </div>

              <div className="p-6 sm:p-7 space-y-3">
                <div className="flex items-center justify-between text-[10px] tracking-[0.22em] uppercase text-[#F2F2F0]/65 font-semibold">
                  <span>{pillar.index}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#8C072B] text-[#F2F2F0]">
                    {pillar.tag}
                  </span>
                </div>
                <h3
                  className="text-2xl font-serif font-normal text-[#F2F2F0]"
                  style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
                >
                  {pillar.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#F2F2F0]/75 font-sans">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
