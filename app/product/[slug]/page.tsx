"use client";

import React, { useState, use } from "react";
import Link from "next/link";
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const {
    products,
    catalogLoading,
    freeShippingThreshold,
    addToCart,
    formatPrice,
  } = useStore();

  const product = products.find((p) => p.slug === resolvedParams.slug);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    "materials"
  );

  if (catalogLoading) {
    return (
      <main className="flex-1 bg-[#F2F2F0] text-[#26231F] py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 aspect-[3/4] rounded-2xl bg-[#26231F]/8 animate-pulse" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-6 w-32 bg-[#26231F]/8 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-[#26231F]/8 rounded animate-pulse" />
              <div className="h-24 w-full bg-[#26231F]/8 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-1 bg-[#F2F2F0] text-[#26231F] py-24">
        <div className="max-w-lg mx-auto px-4 text-center space-y-4">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C072B] font-semibold">
            404 · Not Found
          </span>
          <h1 className="text-3xl font-serif">Piece Unavailable</h1>
          <p className="text-xs text-[#26231F]/70 leading-relaxed">
            This item is either archived or does not exist in our active
            collections.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 rounded-full bg-[#591623] text-[#F2F2F0] text-xs uppercase tracking-[0.2em]"
          >
            Browse Active Drops
          </Link>
        </div>
      </main>
    );
  }

  const mediaItems =
    product.media && product.media.length > 0
      ? product.media
      : product.galleryImages.map((url) => ({
          url,
          mediaType: "image" as const,
        }));

  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0];
  const currentVariant = product.variants[selectedVariantIndex] ||
    product.variants[0] || {
      id: `${product.id}-default`,
      name: "Default",
      inStock: true,
    };
  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const primaryCollectionName =
    product.collectionNames?.[0] || product.category;
  const primaryCollectionSlug =
    product.collectionSlugs?.[0] || product.category;

  const toggleAccordion = (key: string) => {
    setActiveAccordion((prev) => (prev === key ? null : key));
  };

  return (
    <main className="flex-1 bg-[#F2F2F0] text-[#26231F] py-6 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16">
        <nav
          aria-label="Breadcrumbs"
          className="text-[10px] sm:text-[11px] tracking-widest uppercase text-[#26231F]/50 flex flex-wrap items-center gap-1.5 sm:gap-2 mb-5 sm:mb-8"
        >
          <Link href="/" className="hover:text-[#591623]">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#591623]">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/shop?collection=${encodeURIComponent(primaryCollectionSlug)}`}
            className="hover:text-[#591623]"
          >
            {primaryCollectionName}
          </Link>
          <span>/</span>
          <span className="text-[#26231F] truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-3 sm:gap-4">
            <div className="flex md:flex-col gap-2.5 sm:gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar pb-1 md:pb-0">
              {mediaItems.map((item, idx) => (
                <button
                  key={`${item.url}-${idx}`}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`relative w-16 h-20 md:w-22 md:h-28 flex-shrink-0 border rounded-lg overflow-hidden transition-all cursor-pointer ${
                    activeMediaIndex === idx
                      ? "border-[#591623] ring-1 ring-[#591623]"
                      : "border-[#26231F]/15 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View media ${idx + 1}`}
                >
                  {item.mediaType === "video" ? (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  )}
                  {item.mediaType === "video" && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#26231F]/80 text-[#F2F2F0] text-[8px] font-bold uppercase tracking-wider">
                      Video
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 aspect-[4/5] sm:aspect-[3/4] relative bg-[#26231F] border border-[#26231F]/15 rounded-2xl overflow-hidden group">
              {currentMedia?.mediaType === "video" ? (
                <video
                  src={currentMedia.url}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
              ) : currentMedia?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentMedia.url}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#F2F2F0]/60">
                  No media provided
                </div>
              )}

              {product.discountBadge && (
                <div className="absolute top-4 left-4">
                  <span className="bg-[#8C072B] text-[#F2F2F0] text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full">
                    {product.discountBadge}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] tracking-[0.28em] uppercase text-[#591623] font-semibold">
                  {product.collection}
                </span>
                {(product.collectionNames ?? []).map((cname, idx) => (
                  <Link
                    key={`${cname}-${idx}`}
                    href={`/shop?collection=${encodeURIComponent(
                      product.collectionSlugs?.[idx] || ""
                    )}`}
                    className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#591623]/25 text-[#591623] hover:bg-[#591623] hover:text-[#F2F2F0] transition-colors"
                  >
                    {cname}
                  </Link>
                ))}
              </div>
              <h1
                className="text-2xl sm:text-4xl font-serif text-[#26231F] leading-tight"
                style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
              >
                {product.name}
              </h1>

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

            <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3 pt-2">
              <span className="text-2xl font-serif text-[#26231F] font-semibold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-[#26231F]/40 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#8C072B] bg-[#8C072B]/10 px-3 py-1 rounded-full sm:ml-1">
                100% Heavyweight Combed Cotton
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#26231F]/75 leading-relaxed font-sans">
              {product.description}
            </p>

            <div className="space-y-3 pt-4 border-t border-[#26231F]/15">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] tracking-widest uppercase font-semibold text-[#26231F]">
                  Selected Option:{" "}
                  <span className="text-[#591623] underline decoration-[#8C072B] underline-offset-4">
                    {currentVariant.name}
                  </span>
                </span>
                <span className="text-[11px] text-[#26231F]/60">
                  {currentVariant.inStock
                    ? "Available for Dispatch"
                    : "Sold Out"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantIndex(idx)}
                    disabled={!v.inStock}
                    className={`px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider border transition-all cursor-pointer ${
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

            <div className="pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-between sm:justify-start border border-[#26231F]/20 rounded-full overflow-hidden min-h-[46px]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 text-[#26231F] hover:bg-[#26231F]/5 transition-colors focus:outline-none"
                    aria-label="Decrease quantity"
                  >
                    <IconMinus size={14} />
                  </button>
                  <span className="px-4 text-xs font-semibold select-none min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-3 text-[#26231F] hover:bg-[#26231F]/5 transition-colors focus:outline-none"
                    aria-label="Increase quantity"
                  >
                    <IconPlus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, currentVariant, quantity)}
                  disabled={!currentVariant.inStock}
                  className="flex-1 py-4 px-5 min-h-[48px] rounded-full bg-[#591623] hover:bg-[#8C072B] disabled:bg-[#26231F]/20 text-[#F2F2F0] text-xs uppercase tracking-[0.2em] sm:tracking-[0.22em] font-medium transition-colors flex items-center justify-center gap-3 shadow-md focus:outline-none cursor-pointer"
                >
                  <IconBag size={16} />
                  <span>
                    {currentVariant.inStock
                      ? `Add to Bag (${formatPrice(product.price * quantity)})`
                      : "Size Currently Unavailable"}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 text-[11px] text-[#26231F]/70">
                <div className="flex items-center gap-2">
                  <IconTruck size={15} className="text-[#591623]" />
                  <span>
                    {freeShippingThreshold <= 0
                      ? "Free Pan-India Shipping"
                      : `Free Pan-India Shipping > ${formatPrice(freeShippingThreshold)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IconRefresh size={15} className="text-[#591623]" />
                  <span>14-Day Easy Exchanges</span>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="pt-6 border-t border-[#26231F]/15 divide-y divide-[#26231F]/10">
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
                  <div className="pb-4 space-y-2 text-xs text-[#26231F]/70 leading-relaxed font-sans">
                    <p className="font-medium text-[#26231F]">
                      {product.materials}
                    </p>
                    <ul className="space-y-1.5 pt-1">
                      {product.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <IconCheck
                            size={13}
                            className="text-[#591623] flex-shrink-0 mt-0.5"
                          />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

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
                  <div className="pb-4 text-xs text-[#26231F]/70 leading-relaxed font-sans">
                    <p>{product.care}</p>
                  </div>
                )}
              </div>

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
                  <div className="pb-4 text-xs text-[#26231F]/70 leading-relaxed font-sans space-y-2">
                    <p>
                      Every piece is quality-checked for GSM weight and
                      embroidery finish before being packed in an ORIIKO matte
                      frosted garment pouch.
                    </p>
                    <p>
                      Dispatched within 24 hours across India with live
                      tracking.{" "}
                      {freeShippingThreshold <= 0
                        ? "Prepaid orders ship free."
                        : `Prepaid orders over ${formatPrice(freeShippingThreshold)} ship free; Cash on Delivery is available on serviceable pin codes.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-28 pt-10 sm:pt-16 border-t border-[#26231F]/15">
            <div className="mb-7 sm:mb-10 text-center">
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
