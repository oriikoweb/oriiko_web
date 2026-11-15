"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconClose, IconStar, IconBag } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, formatPrice } = useStore();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  if (!quickViewProduct) return null;

  const currentVariant = quickViewProduct.variants[selectedVariantIndex] || quickViewProduct.variants[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        onClick={() => setQuickViewProduct(null)}
        className="fixed inset-0 bg-[#26231F]/60 dark:bg-black/70 backdrop-blur-[3px] transition-opacity duration-300"
      />

      <div className="relative bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] w-full max-w-3xl max-h-[92svh] overflow-y-auto shadow-2xl border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-t-2xl sm:rounded-2xl transition-all duration-300 z-10">
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 p-2 text-[#26231F] dark:text-[#F2F2F0] hover:text-[#591623] dark:hover:text-[#F2F2F0]/75 transition-colors bg-[#F2F2F0]/90 dark:bg-[#26231F]/90 rounded-full shadow-xs cursor-pointer"
          aria-label="Close Preview"
        >
          <IconClose size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-[4/3] md:aspect-[3/4] max-h-[38svh] md:max-h-none bg-[#F2F2F0] dark:bg-[#F2F2F0]/5 overflow-hidden border-b md:border-b-0 md:border-r border-[#26231F]/10 dark:border-[#F2F2F0]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={quickViewProduct.primaryImage}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Product details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#26231F]/50 dark:text-[#F2F2F0]/55 font-semibold block mb-1">
                {quickViewProduct.collection}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif text-[#26231F] dark:text-[#F2F2F0]">
                {quickViewProduct.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-[#8C072B]">
                  {[...Array(5)].map((_, i) => (
                    <IconStar
                      key={i}
                      size={12}
                      filled={i < Math.floor(quickViewProduct.rating)}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                  {quickViewProduct.rating} ({quickViewProduct.reviewCount} Reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-lg font-medium text-[#26231F] dark:text-[#F2F2F0]">
                  {formatPrice(quickViewProduct.price)}
                </span>
                {quickViewProduct.originalPrice && (
                  <span className="text-sm text-[#26231F]/40 dark:text-[#F2F2F0]/40 line-through">
                    {formatPrice(quickViewProduct.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description summary */}
              <p className="text-xs leading-relaxed text-[#26231F]/70 dark:text-[#F2F2F0]/70 mt-4 line-clamp-3">
                {quickViewProduct.description}
              </p>

              {/* Variants */}
              <div className="mt-6 space-y-2">
                <span className="text-[10px] tracking-widest uppercase text-[#26231F]/70 dark:text-[#F2F2F0]/70 font-semibold block">
                  Select Size &amp; Colour
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.variants.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantIndex(idx)}
                      disabled={!v.inStock}
                      className={`px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider border transition-all ${selectedVariantIndex === idx
                        ? "border-[#591623] bg-[#591623] text-[#F2F2F0] font-medium"
                        : v.inStock
                          ? "border-[#26231F]/20 dark:border-[#F2F2F0]/20 text-[#26231F] dark:text-[#F2F2F0] hover:border-[#591623] dark:hover:border-[#8C072B]"
                          : "border-[#26231F]/10 dark:border-[#F2F2F0]/10 text-[#26231F]/30 dark:text-[#F2F2F0]/30 line-through cursor-not-allowed"
                        }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-[#26231F]/10 dark:border-[#F2F2F0]/10">
              <button
                onClick={() => {
                  addToCart(quickViewProduct, currentVariant);
                  setQuickViewProduct(null);
                }}
                disabled={!currentVariant.inStock}
                className="w-full py-3.5 rounded-full bg-[#591623] hover:bg-[#8C072B] disabled:bg-[#26231F]/20 dark:disabled:bg-[#F2F2F0]/15 text-[#F2F2F0] text-xs font-medium uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
              >
                <IconBag size={16} />
                <span>
                  {currentVariant.inStock ? "Add to Bag" : "Out of Stock"}
                </span>
              </button>

              <Link
                href={`/product/${quickViewProduct.slug}`}
                onClick={() => setQuickViewProduct(null)}
                className="block text-center text-xs tracking-wider uppercase text-[#26231F]/70 dark:text-[#F2F2F0]/70 hover:text-[#591623] dark:hover:text-[#F2F2F0] transition-colors underline underline-offset-4"
              >
                View Full Product Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

