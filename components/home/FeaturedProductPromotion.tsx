"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconBag, IconStar, IconCheck, IconPlus, IconMinus } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";
import { PRODUCTS } from "../../data/products";

const HEIGHT_OPTIONS = [
  { label: "Under 5'7\"", sizeIndex: 0 },
  { label: "5'7\" – 5'10\"", sizeIndex: 1 },
  { label: "5'11\" & Above", sizeIndex: 2 },
] as const;

export function FeaturedProductPromotion() {
  const { addToCart, formatPrice } = useStore();
  const product = PRODUCTS[0]; // Heavyweight Boxy Hoodie
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(1);
  const [isSizeHelperOpen, setIsSizeHelperOpen] = useState(false);
  const [heightIdx, setHeightIdx] = useState<number>(1);
  const [fitPref, setFitPref] = useState<"true" | "oversized">("true");

  const currentVariant =
    product.variants[selectedVariantIndex] || product.variants[0];

  const getRecommendedSizeLabel = () => {
    const base = HEIGHT_OPTIONS[heightIdx]?.sizeIndex ?? 1;
    const adjusted = fitPref === "oversized" ? Math.min(2, base + 1) : base;
    return ["S", "M", "L"][adjusted] || "L";
  };

  const applyRecommendedSize = () => {
    const rec = getRecommendedSizeLabel();
    const matchedIdx = product.variants.findIndex(
      (v) => v.size === rec && v.inStock
    );
    if (matchedIdx !== -1) {
      setSelectedVariantIndex(matchedIdx);
    }
  };

  return (
    <section className="bg-[#F2F2F0] py-10 sm:py-22">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-7 sm:mb-10 space-y-2">
          <span className="text-[10px] tracking-[0.26em] uppercase text-[#8C072B] font-bold block">
            Drop 01 Spotlight
          </span>
          <h2
            className="text-2xl sm:text-4xl font-serif font-normal text-[#26231F]"
            style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
          >
            {product.name}
          </h2>
        </div>

        <div className="rounded-2xl border border-[#26231F]/12 bg-[#F2F2F0] p-4 sm:p-8 lg:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
              {/* Thumbnails */}
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto no-scrollbar">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 border rounded-xl overflow-hidden transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#591623] ring-1 ring-[#591623]"
                        : "border-[#26231F]/15 opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image Frame */}
              <div className="flex-1 aspect-[4/5] sm:aspect-[3/4] relative bg-[#26231F] border border-[#26231F]/15 rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.galleryImages[activeImageIndex] || product.primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center animate-in fade-in duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#8C072B] text-[#F2F2F0] text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full">
                    Bestseller &middot; 480 GSM
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase Column */}
            <div className="lg:col-span-6 space-y-5 lg:pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-[#591623] font-semibold">
                    {product.collection}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-[#8C072B]">
                      {[...Array(5)].map((_, i) => (
                        <IconStar
                          key={i}
                          size={12}
                          filled={i < Math.floor(product.rating)}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#26231F]/65">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-3 pt-1 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-serif text-[#26231F] font-semibold">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-[#26231F]/40 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-[#8C072B] bg-[#8C072B]/10 px-3 py-1 rounded-full">
                    Free Pan-India Shipping
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#26231F]/75 leading-relaxed font-sans">
                {product.description}
              </p>

              {/* Material Highlights */}
              <ul className="space-y-2 py-3 border-y border-[#26231F]/10">
                {product.details.slice(0, 3).map((detail, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-[#26231F]/75"
                  >
                    <IconCheck
                      size={14}
                      className="text-[#591623] flex-shrink-0 mt-0.5"
                    />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              {/* Variant Pills */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[11px] tracking-widest uppercase text-[#26231F] font-semibold">
                    Select Size &amp; Shade
                  </span>
                  <span className="text-[11px] text-[#26231F]/60">
                    Model is 5&apos;11&quot; wearing Size L
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantIndex(idx)}
                      disabled={!variant.inStock}
                      className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                        selectedVariantIndex === idx
                          ? "border-[#591623] bg-[#591623] text-[#F2F2F0] font-medium"
                          : variant.inStock
                          ? "border-[#26231F]/20 text-[#26231F] hover:border-[#591623]"
                          : "border-[#26231F]/10 text-[#26231F]/30 line-through cursor-not-allowed"
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Find My Size Helper (Hannovae Style) */}
              <div className="rounded-xl border border-[#26231F]/15 overflow-hidden bg-[#F2F2F0]">
                <button
                  type="button"
                  onClick={() => setIsSizeHelperOpen(!isSizeHelperOpen)}
                  className="w-full px-4 py-3 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-semibold text-[#26231F] hover:text-[#591623] transition-colors cursor-pointer"
                >
                  <span>Find My Size</span>
                  {isSizeHelperOpen ? <IconMinus size={13} /> : <IconPlus size={13} />}
                </button>

                {isSizeHelperOpen && (
                  <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-[#26231F]/10">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#26231F]/55 block mb-2">
                        Your Height
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {HEIGHT_OPTIONS.map((opt, idx) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setHeightIdx(idx)}
                            className={`px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer ${
                              heightIdx === idx
                                ? "bg-[#26231F] text-[#F2F2F0] border-[#26231F]"
                                : "border-[#26231F]/20 text-[#26231F] hover:border-[#591623]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#26231F]/55 block mb-2">
                        Preferred Drape
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "true", label: "True Boxy Fit" },
                          { id: "oversized", label: "Extra Oversized" },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setFitPref(mode.id as "true" | "oversized")}
                            className={`px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer ${
                              fitPref === mode.id
                                ? "bg-[#26231F] text-[#F2F2F0] border-[#26231F]"
                                : "border-[#26231F]/20 text-[#26231F] hover:border-[#591623]"
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-lg bg-[#591623]/8 px-3.5 py-2.5">
                      <span className="text-xs text-[#26231F]">
                        Recommended:{" "}
                        <strong className="text-[#591623]">
                          Size {getRecommendedSizeLabel()}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={applyRecommendedSize}
                        className="text-[11px] uppercase tracking-wider font-semibold text-[#8C072B] hover:underline cursor-pointer"
                      >
                        Select Size {getRecommendedSizeLabel()}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase CTA */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={() => addToCart(product, currentVariant)}
                  disabled={!currentVariant.inStock}
                  className="w-full py-4 rounded-full bg-[#591623] hover:bg-[#8C072B] disabled:bg-[#26231F]/20 text-[#F2F2F0] text-xs font-medium uppercase tracking-[0.22em] transition-colors flex items-center justify-center gap-3 shadow-md focus:outline-none cursor-pointer"
                >
                  <IconBag size={16} />
                  <span>
                    {currentVariant.inStock
                      ? `Add ${currentVariant.name} to Bag`
                      : "Size Out of Stock"}
                  </span>
                </button>

                <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] text-[#26231F]/60 px-1">
                  <span>Dispatches within 24 hours across India</span>
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-[#591623] hover:underline font-medium"
                  >
                    Full Product Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
