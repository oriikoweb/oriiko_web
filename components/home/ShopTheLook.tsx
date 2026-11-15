"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconBag, IconPlus } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";

const HOTSPOT_POSITIONS = [
  { id: "spot-1", top: "30%", left: "52%" },
  { id: "spot-2", top: "65%", left: "60%" },
  { id: "spot-3", top: "75%", left: "45%" },
];

export function ShopTheLook() {
  const { products, addToCart, formatPrice } = useStore();
  const [activeSpotId, setActiveSpotId] = useState("spot-1");

  const hotspots = HOTSPOT_POSITIONS.slice(0, Math.max(0, products.length)).map(
    (pos, idx) => ({
      ...pos,
      product: products[idx],
    })
  );

  if (hotspots.length === 0) {
    return null;
  }

  const activeSpot = hotspots.find((s) => s.id === activeSpotId) || hotspots[0];
  const activeProduct = activeSpot.product;

  return (
    <section className="bg-[#F2F2F0] dark:bg-[#26231F] py-10 sm:py-22 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Centered Header (Hannovae Inspiration Block) */}
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-2">
        <span className="text-[11px] tracking-[0.28em] uppercase text-[#8C072B] dark:text-[#F2F2F0]/75 font-semibold block">
          Inspiration
        </span>
        <h2
          className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#26231F] dark:text-[#F2F2F0]"
          style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
        >
          Shop Looks
        </h2>
        <p className="text-xs sm:text-sm text-[#26231F]/65 dark:text-[#F2F2F0]/65 font-sans">
          Tap any marker on the lookbook to inspect sizing and add pieces directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-center">
        {/* Interactive Hotspot Look Image */}
        <div className="lg:col-span-8 relative aspect-[4/5] sm:aspect-[16/11] bg-[#26231F] overflow-hidden border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-2xl group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85"
            alt="ORIIKO India Streetwear Lookbook"
            className="w-full h-full object-cover object-center"
          />

          {/* Hotspot Pins */}
          {hotspots.map((spot) => {
            const isActive = spot.id === activeSpotId;
            return (
              <button
                key={spot.id}
                onClick={() => setActiveSpotId(spot.id)}
                className={`absolute w-10 h-10 sm:w-9 sm:h-9 rounded-full -ml-5 -mt-5 sm:-ml-4 sm:-mt-4 flex items-center justify-center transition-all cursor-pointer ${isActive
                  ? "bg-[#8C072B] text-[#F2F2F0] scale-115 shadow-lg ring-4 ring-[#8C072B]/35"
                  : "bg-[#F2F2F0] text-[#26231F] hover:scale-110 shadow-md hover:bg-[#591623] hover:text-[#F2F2F0]"
                  }`}
                style={{ top: spot.top, left: spot.left }}
                aria-label={`Inspect ${spot.product.name}`}
              >
                <IconPlus size={14} />
              </button>
            );
          })}
        </div>

        {/* Selected Product Card from Hotspot */}
        <div className="lg:col-span-4 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 shadow-xs">
          <div className="aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-xl bg-[#26231F] border border-[#26231F]/10 dark:border-[#F2F2F0]/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeProduct.id}
              src={activeProduct.primaryImage}
              alt={activeProduct.name}
              className="w-full h-full object-cover object-center animate-in fade-in duration-300"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] tracking-widest uppercase text-[#8C072B] dark:text-[#F2F2F0]/75 font-semibold block">
              Featured In Look
            </span>
            <h3 className="text-xl font-serif text-[#26231F] dark:text-[#F2F2F0]">
              {activeProduct.name}
            </h3>
            <span className="text-base font-semibold text-[#26231F] dark:text-[#F2F2F0] block">
              {formatPrice(activeProduct.price)}
            </span>
            <p className="text-xs text-[#26231F]/70 dark:text-[#F2F2F0]/70 leading-relaxed font-sans line-clamp-2">
              {activeProduct.description}
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <button
              onClick={() => addToCart(activeProduct, activeProduct.variants[0])}
              className="w-full py-3.5 rounded-full bg-[#591623] hover:bg-[#8C072B] text-[#F2F2F0] text-xs font-medium uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 shadow-sm focus:outline-none cursor-pointer"
            >
              <IconBag size={14} />
              <span>Add to Bag</span>
            </button>

            <Link
              href={`/product/${activeProduct.slug}`}
              className="block text-center text-xs tracking-wider uppercase text-[#26231F]/70 dark:text-[#F2F2F0]/70 hover:text-[#591623] dark:hover:text-[#F2F2F0] transition-colors underline underline-offset-4"
            >
              View Product Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
