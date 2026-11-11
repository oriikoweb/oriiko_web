"use client";

import React from "react";
import Link from "next/link";
import { IconArrowRight } from "../ui/Icons";

const EDITORIAL_CARDS = [
  {
    id: "card-hoodies",
    kicker: "SHOP",
    title: "Heavyweight Fleece & Hoodies",
    description:
      "480 GSM combed loopback French terry, clean zero-drawcord hoods, and boxy proportions built for everyday layering.",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80",
    link: "/shop?category=hoodies",
    cta: "View Collection",
  },
  {
    id: "card-tees",
    kicker: "EXPLORE",
    title: "Chain-Stitch Embroidered Tees",
    description:
      "Bio-washed 280 GSM oversized tees and crewnecks detailed with multi-thread chest embroidery.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    link: "/shop?category=t-shirts",
    cta: "View Collection",
  },
];

export function PromotionalCampaigns() {
  return (
    <section className="py-12 sm:py-16 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EDITORIAL_CARDS.map((card) => (
          <Link
            key={card.id}
            href={card.link}
            className="group rounded-2xl border border-[#26231F]/12 bg-[#F2F2F0] p-4 sm:p-6 flex flex-col justify-between gap-6 hover:border-[#591623]/40 transition-all shadow-xs"
          >
            {/* Padded Rounded Media */}
            <div className="aspect-[16/11] w-full rounded-xl overflow-hidden bg-[#26231F]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
              />
            </div>

            {/* Bottom Content Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1 pb-1">
              <div className="space-y-1.5 max-w-md">
                <span className="text-[10px] tracking-[0.26em] uppercase text-[#8C072B] font-bold block">
                  {card.kicker}
                </span>
                <h3
                  className="text-2xl sm:text-3xl font-serif font-normal text-[#26231F] group-hover:text-[#591623] transition-colors"
                  style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
                >
                  {card.title}
                </h3>
                <p className="text-xs text-[#26231F]/70 leading-relaxed font-sans">
                  {card.description}
                </p>
              </div>

              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#26231F]/20 group-hover:border-[#591623] group-hover:bg-[#591623] text-[#26231F] group-hover:text-[#F2F2F0] text-[11px] uppercase tracking-[0.18em] font-medium transition-colors flex-shrink-0 self-start sm:self-end">
                <span>{card.cta}</span>
                <IconArrowRight size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
