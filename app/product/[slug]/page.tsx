"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconStar,
  IconBag,
  IconCheck,
  IconTruck,
  IconRefresh,
  IconPlus,
  IconMinus,
  IconChevronDown,
} from "../../../components/ui/Icons";
import { ProductCard } from "../../../components/product/ProductCard";
import { useStore } from "../../../context/StoreContext";
import { PRODUCTS } from "../../../data/products";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { addToCart, formatPrice } = useStore();

  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("materials");

  if (!product) {
    notFound();
  }

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const toggleAccordion = (key: string) => {
    setActiveAccordion((prev) => (prev === key ? null : key));
  };

  return (
    <main className="flex-1 bg-[#F2F2F0] py-10 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumbs"
          className="text-[11px] tracking-widest uppercase text-[#26231F]/50 flex items-center gap-2 mb-8"
        >
          <Link href="/" className="hover:text-[#591623]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#591623]">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-[#591623]">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#26231F] truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* 7.1 Desktop 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: 7.2 Product Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails rail */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar">
              {product.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-18 h-24 md:w-22 md:h-28 flex-shrink-0 border rounded-lg overflow-hidden transition-all ${
                    activeImageIndex === idx
                      ? "border-[#591623] ring-1 ring-[#591623]"
                      : "border-[#26231F]/15 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View image angle ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>

            {/* Main Primary Zoomable Image Stage */}
            <div className="flex-1 aspect-[3/4] relative bg-[#26231F] border border-[#26231F]/15 rounded-2xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.galleryImages[activeImageIndex] || product.primaryImage}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out cursor-zoom-in"
              />

              {product.discountBadge && (
                <div className="absolute top-4 left-4">
                  <span className="bg-[#8C072B] text-[#F2F2F0] text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full">
                    {product.discountBadge}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 7.1 & 7.3 Product Information & Purchasing */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="space-y-2">
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#591623] font-semibold block">
                {product.collection}
              </span>
              <h1
                className="text-2xl sm:text-4xl font-serif text-[#26231F] leading-tight"
                style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
              >
                {product.name}
              </h1>

              {/* Reviews rating */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex text-[#8C072B]">
                  {[...Array(5)].map((_, i) => (
                    <IconStar
                      key={i}
                      size={13}
                      filled={i < Math.floor(product.rating)}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#26231F]/70 font-sans">
                  {product.rating} ({product.reviewCount} Verified Reviews)
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-2xl font-serif text-[#26231F] font-semibold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-[#26231F]/40 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#8C072B] bg-[#8C072B]/10 px-3 py-1 rounded-full ml-2">
                100% Heavyweight Combed Cotton
              </span>
            </div>

            {/* Editorial Overview */}
            <p className="text-xs sm:text-sm text-[#26231F]/75 leading-relaxed font-sans">
              {product.description}
            </p>

            {/* 7.3 Variant Selector */}
            <div className="space-y-3 pt-4 border-t border-[#26231F]/15">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] tracking-widest uppercase font-semibold text-[#26231F]">
                  Selected Option: <span className="text-[#591623]">{currentVariant.name}</span>
                </span>
                <span className="text-[11px] text-[#26231F]/60">
                  {currentVariant.inStock ? "Available for Dispatch" : "Sold Out"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantIndex(idx)}
                    disabled={!v.inStock}
                    className={`px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider border transition-all ${
                      selectedVariantIndex === idx
                        ? "border-[#591623] bg-[#591623] text-[#F2F2F0] font-medium"
                        : v.inStock
                        ? "border-[#26231F]/20 text-[#26231F] hover:border-[#591623]"
                        : "border-[#26231F]/10 text-[#26231F]/30 line-through cursor-not-allowed"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & 7.4 Add To Cart Action */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-[#26231F]/20 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-[#26231F] hover:bg-[#26231F]/5 transition-colors focus:outline-none"
                    aria-label="Decrease quantity"
                  >
                    <IconMinus size={14} />
                  </button>
                  <span className="px-4 text-xs font-semibold select-none min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-[#26231F] hover:bg-[#26231F]/5 transition-colors focus:outline-none"
                    aria-label="Increase quantity"
                  >
                    <IconPlus size={14} />
                  </button>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={() => addToCart(product, currentVariant, quantity)}
                  disabled={!currentVariant.inStock}
                  className="flex-1 py-4 rounded-full bg-[#591623] hover:bg-[#8C072B] disabled:bg-[#26231F]/20 text-[#F2F2F0] text-xs uppercase tracking-[0.22em] font-medium transition-colors flex items-center justify-center gap-3 shadow-md focus:outline-none"
                >
                  <IconBag size={16} />
                  <span>
                    {currentVariant.inStock
                      ? `Add to Bag (${formatPrice(product.price * quantity)})`
                      : "Size Currently Unavailable"}
                  </span>
                </button>
              </div>

              {/* Service Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-[#26231F]/70">
                <div className="flex items-center gap-2">
                  <IconTruck size={15} className="text-[#591623]" />
                  <span>Free Pan-India Shipping &gt; ₹2,999</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconRefresh size={15} className="text-[#591623]" />
                  <span>14-Day Easy Exchanges</span>
                </div>
              </div>
            </div>

            {/* Product Details Accordions */}
            <div className="pt-6 border-t border-[#26231F]/15 divide-y divide-[#26231F]/10">
              {/* Fabric & Embroidery Details */}
              <div>
                <button
                  onClick={() => toggleAccordion("materials")}
                  className="w-full py-4 flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-[#26231F] hover:text-[#591623] transition-colors"
                >
                  <span>Fabric &amp; Embroidery Details</span>
                  <IconChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeAccordion === "materials" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "materials" && (
                  <div className="pb-4 space-y-2 text-xs text-[#26231F]/70 leading-relaxed font-sans animate-in fade-in">
                    <p className="font-medium text-[#26231F]">{product.materials}</p>
                    <ul className="space-y-1.5 pt-1">
                      {product.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <IconCheck size={13} className="text-[#591623] flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Wash & Care Guide */}
              <div>
                <button
                  onClick={() => toggleAccordion("care")}
                  className="w-full py-4 flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-[#26231F] hover:text-[#591623] transition-colors"
                >
                  <span>Wash &amp; Care Guide</span>
                  <IconChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeAccordion === "care" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "care" && (
                  <div className="pb-4 text-xs text-[#26231F]/70 leading-relaxed font-sans animate-in fade-in">
                    <p>{product.care}</p>
                  </div>
                )}
              </div>

              {/* Shipping & Packaging */}
              <div>
                <button
                  onClick={() => toggleAccordion("delivery")}
                  className="w-full py-4 flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-[#26231F] hover:text-[#591623] transition-colors"
                >
                  <span>Shipping &amp; Packaging</span>
                  <IconChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeAccordion === "delivery" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "delivery" && (
                  <div className="pb-4 text-xs text-[#26231F]/70 leading-relaxed font-sans space-y-2 animate-in fade-in">
                    <p>
                      Every piece is quality-checked for GSM weight and embroidery finish before being packed in an ORIIKO matte frosted garment pouch.
                    </p>
                    <p>
                      Dispatched within 24 hours across India with live tracking. Prepaid orders over ₹2,999 ship free; Cash on Delivery is available on serviceable pin codes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Recommendation */}
        <div className="mt-28 pt-16 border-t border-[#26231F]/15">
          <div className="mb-10 text-center">
            <span className="text-[11px] tracking-[0.28em] uppercase text-[#591623] font-semibold block mb-1">
              More From Drop 01
            </span>
            <h2
              className="text-2xl sm:text-3xl font-serif text-[#26231F]"
              style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
            >
              Complete The Fit
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
