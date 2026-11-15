"use client";

import React from "react";
import Link from "next/link";
import { IconArrowRight } from "../ui/Icons";
import { ProductCard } from "../product/ProductCard";
import { useStore } from "../../context/StoreContext";

export function BestsellingProducts() {
  const { products, catalogLoading } = useStore();
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);
  const items = bestsellers.length > 0 ? bestsellers : products.slice(0, 4);

  if (!catalogLoading && items.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-22 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-2.5 sm:space-y-3">
        <span className="text-[11px] tracking-[0.28em] uppercase text-[#8C072B] font-semibold block">
          Products
        </span>
        <h2
          className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#26231F]"
          style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
        >
          Most Popular
        </h2>
        <div className="pt-1">
          <Link
            href="/shop?sort=bestselling"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full border border-[#26231F]/20 hover:border-[#591623] hover:bg-[#591623] text-[#26231F] hover:text-[#F2F2F0] text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
          >
            <span>View All</span>
            <IconArrowRight size={13} />
          </Link>
        </div>
      </div>

      {catalogLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-7">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-[#26231F]/8 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-7">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
