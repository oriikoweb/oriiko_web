"use client";

import React from "react";
import Link from "next/link";
import { IconArrowRight } from "../ui/Icons";
import { ProductCard } from "../product/ProductCard";
import { PRODUCTS } from "../../data/products";

export function NewArrivals() {
  const newArrivals = PRODUCTS.filter((p) => p.isNewArrival).slice(0, 4);

  return (
    <section className="py-10 sm:py-22 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
      {/* Centered Editorial Heading matching Hannovae rhythm */}
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-2.5 sm:space-y-3">
        <span className="text-[11px] tracking-[0.28em] uppercase text-[#8C072B] font-semibold block">
          Drop 01 &middot; Latest
        </span>
        <h2
          className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#26231F]"
          style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
        >
          New Pieces
        </h2>
        <div className="pt-1">
          <Link
            href="/shop?sort=newest"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full border border-[#26231F]/20 hover:border-[#591623] hover:bg-[#591623] text-[#26231F] hover:text-[#F2F2F0] text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
          >
            <span>Shop All New Arrivals</span>
            <IconArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-7">
        {newArrivals.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
