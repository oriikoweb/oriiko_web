"use client";

import React from "react";
import Link from "next/link";
import { IconArrowRight } from "../ui/Icons";
import { ProductCard } from "../product/ProductCard";
import { PRODUCTS } from "../../data/products";

export function BestsellingProducts() {
  const bestsellers = PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);

  return (
    <section className="py-16 sm:py-22 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
      {/* Centered Header (Hannovae Featured Collection Pattern) */}
      <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
        <span className="text-[11px] tracking-[0.28em] uppercase text-[#8C072B] font-semibold block">
          Products
        </span>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#26231F]"
          style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
        >
          Most Popular
        </h2>
        <div className="pt-1">
          <Link
            href="/shop?sort=bestselling"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#26231F]/20 hover:border-[#591623] hover:bg-[#591623] text-[#26231F] hover:text-[#F2F2F0] text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
          >
            <span>View All</span>
            <IconArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
        {bestsellers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
