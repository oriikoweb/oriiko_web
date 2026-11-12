"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "../../types/ecommerce";
import { IconStar, IconBag } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";

interface ProductCardProps {
  product: Product;
  showBadge?: boolean;
}

export function ProductCard({ product, showBadge = true }: ProductCardProps) {
  const { addToCart, formatPrice, setQuickViewProduct } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.availableColors[0]?.name);

  return (
    <article
      className="group relative flex flex-col bg-[#F2F2F0] transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] w-full bg-[#F2F2F0] overflow-hidden border border-[#26231F]/10 rounded-xl">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          {/* Primary Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.primaryImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered && product.secondaryImage
                ? "opacity-0 scale-104"
                : "opacity-100 scale-100"
            }`}
          />

          {/* Secondary Alternate Image on Hover */}
          {product.secondaryImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.secondaryImage}
              alt={`${product.name} alternate silhouette view`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                isHovered ? "opacity-100 scale-104" : "opacity-0 scale-100"
              }`}
            />
          )}
        </Link>

        {/* Promotional / Status Badge */}
        {showBadge && product.discountBadge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-[#8C072B] text-[#F2F2F0] text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full">
              {product.discountBadge}
            </span>
          </div>
        )}

        {/* Quick Action Overlay (Always visible on mobile/tablet touch, hover reveal on lg+) */}
        <div
          className={`absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 z-10 transition-all duration-300 ${
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-3 lg:pointer-events-none"
          }`}
        >
          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, product.variants[0]);
              }}
              className="flex-1 py-2 sm:py-3 px-2 sm:px-3 rounded-lg bg-[#591623] hover:bg-[#8C072B] active:scale-[0.98] text-[#F2F2F0] text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm whitespace-nowrap cursor-pointer"
              aria-label={`Quick add ${product.name} to bag`}
            >
              <IconBag size={13} />
              <span>Quick Add</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="py-2 sm:py-3 px-2.5 sm:px-3.5 rounded-lg bg-[#F2F2F0] hover:bg-[#26231F] active:scale-[0.98] text-[#26231F] hover:text-[#F2F2F0] border border-[#26231F]/20 text-[9px] sm:text-[10px] uppercase tracking-wider font-medium transition-all shrink-0 cursor-pointer"
              aria-label={`Quick view ${product.name}`}
            >
              <span className="sm:hidden">View</span>
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-3 sm:pt-4 pb-1 sm:pb-2 flex flex-col flex-1 justify-between">
        <div className="space-y-1">
          {/* Collection tag */}
          <span className="text-[9px] sm:text-[10px] tracking-[0.16em] sm:tracking-[0.22em] uppercase text-[#26231F]/50 font-medium block truncate">
            {product.collection}
          </span>

          {/* Title */}
          <h3 className="text-[13px] sm:text-base font-serif font-normal text-[#26231F] group-hover:text-[#591623] transition-colors line-clamp-1">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Reviews Rating */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex text-[#8C072B]">
              {[...Array(5)].map((_, i) => (
                <IconStar
                  key={i}
                  size={11}
                  filled={i < Math.floor(product.rating)}
                />
              ))}
            </div>
            <span className="text-[10px] text-[#26231F]/50 font-sans">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Pricing and Color Swatches */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-medium text-[#26231F]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] sm:text-xs text-[#26231F]/40 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Subtle Color Swatches */}
          {product.availableColors && product.availableColors.length > 1 && (
            <div className="flex items-center gap-1.5">
              {product.availableColors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-2.5 h-2.5 rounded-full transition-transform ${
                    selectedColor === c.name
                      ? "ring-1 ring-offset-1 ring-[#591623] scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={`Select ${c.name}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

