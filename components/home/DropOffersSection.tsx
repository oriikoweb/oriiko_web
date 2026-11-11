"use client";

import React from "react";
import Link from "next/link";
import { IconArrowRight } from "../ui/Icons";

export function DropOffersSection() {
  return (
    <section
      aria-label="Drop 01 Offers and Early Access"
      className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Card — Offers & Value Breakdown */}
        <Link
          href="/shop"
          className="group relative grid grid-cols-1 sm:grid-cols-12 rounded-2xl overflow-hidden border border-[#26231F]/12 bg-[#F2F2F0] shadow-xs hover:border-[#591623]/35 transition-all"
        >
          <div className="sm:col-span-5 relative aspect-[16/10] sm:aspect-auto min-h-[220px] bg-[#26231F] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80"
              alt="ORIIKO Drop 01 Heavyweight Streetwear Stack"
              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
            />
          </div>

          <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#26231F]/55 font-semibold block">
                Drop 01 &middot; Value
              </span>
              <h2
                className="text-2xl sm:text-3xl font-serif font-normal text-[#26231F] leading-none"
                style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
              >
                Stack more, save cleanly.
              </h2>
            </div>

            <ul className="divide-y divide-[#26231F]/12 text-xs text-[#26231F]/70 space-y-2.5">
              <li className="pt-2.5 first:pt-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#26231F] text-sm">
                    10% Off Any Order
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#8C072B] text-[#F2F2F0] text-[9px] font-bold tracking-[0.14em] uppercase">
                    Code: ORIIKO10
                  </span>
                </div>
                <p>Apply at checkout on hoodies, embroidered tees, crewnecks &amp; cargos.</p>
              </li>

              <li className="pt-2.5 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#26231F] text-sm">
                    Free Pan-India Express Shipping
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#591623] text-[#F2F2F0] text-[9px] font-bold tracking-[0.14em] uppercase">
                    Above ₹2,999
                  </span>
                </div>
                <p>Zero shipping charges across 19,000+ Indian pin codes.</p>
              </li>

              <li className="pt-2.5 space-y-1">
                <span className="font-semibold text-[#26231F] text-sm block">
                  UPI, Cards &amp; COD Accepted
                </span>
                <p>Pay prepaid via UPI or choose Cash on Delivery at doorstep.</p>
              </li>
            </ul>

            <div className="pt-1">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#26231F] group-hover:bg-[#591623] text-[#F2F2F0] text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors">
                <span>Shop Essentials</span>
                <IconArrowRight size={13} />
              </span>
            </div>
          </div>
        </Link>

        {/* Right Card — Deep Burgundy Early Access (Hannovae Contrast Card) */}
        <Link
          href="/signup"
          className="group relative grid grid-cols-1 sm:grid-cols-12 rounded-2xl overflow-hidden bg-[#591623] text-[#F2F2F0] shadow-sm"
        >
          <div className="sm:col-span-5 relative aspect-[16/10] sm:aspect-auto min-h-[220px] bg-[#26231F] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80"
              alt="ORIIKO Embroidered Drop Preview"
              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
            />
          </div>

          <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#F2F2F0]/80 font-semibold block">
              Limited Release &middot; India
            </span>
            <h2
              className="text-2xl sm:text-3xl font-serif font-normal text-[#F2F2F0] leading-tight"
              style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
            >
              Be first when Drop 02 lands.
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-[#F2F2F0]/80">
              Our 480 GSM hoodies and small-batch chain-stitch colourways restock in tight runs. Create a member account for priority drop access across India.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F2F2F0] group-hover:bg-[#8C072B] text-[#26231F] group-hover:text-[#F2F2F0] text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors">
                <span>Join Early Access</span>
                <IconArrowRight size={13} />
              </span>
            </div>
            <p className="text-[11px] text-[#F2F2F0]/55">
              14-day easy size exchanges across India.
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}

