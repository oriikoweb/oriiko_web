"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IconSearch, IconClose, IconArrowRight } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";
import { PRODUCTS } from "../../data/products";

const POPULAR_SEARCHES = [
  "Boxy Hoodie",
  "Embroidered Tee",
  "Crewneck Sweatshirt",
  "Cargo Trousers",
  "Half-Zip Fleece",
  "Twill Cap",
];

export function SearchDrawer() {
  const { isSearchOpen, setIsSearchOpen, formatPrice } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const handleClose = () => {
    setSearchTerm("");
    setIsSearchOpen(false);
  };

  const filteredProducts = searchTerm.trim()
    ? PRODUCTS.filter((p) => {
        const query = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.materials.toLowerCase().includes(query) ||
          p.collection.toLowerCase().includes(query)
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background Overlay */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-[#26231F]/50 backdrop-blur-xs transition-opacity"
      />

      {/* Search Container Slide-Down */}
      <div className="relative bg-[#F2F2F0] text-[#26231F] border-b border-[#26231F]/15 rounded-b-2xl shadow-2xl animate-in slide-in-from-top duration-300 max-h-[85vh] flex flex-col">
        <div className="max-w-[1440px] mx-auto w-full px-6 sm:px-10 lg:px-16 py-8">
          {/* Top Bar with Input & Close */}
          <div className="flex items-center justify-between pb-6 border-b border-[#26231F]/15 gap-4">
            <div className="flex items-center gap-4 flex-1">
              <IconSearch size={24} className="text-[#591623] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search collection, garment, or material..."
                className="w-full bg-transparent text-xl sm:text-2xl lg:text-3xl font-serif text-[#26231F] placeholder:text-[#26231F]/40 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-xs uppercase tracking-widest text-[#26231F]/60 hover:text-[#591623] transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-[#26231F] hover:text-[#591623] transition-colors -mr-2 focus:outline-none"
              aria-label="Close search"
            >
              <IconClose size={24} />
            </button>
          </div>

          {/* Results or Suggestions */}
          <div className="py-8 overflow-y-auto max-h-[55vh] no-scrollbar">
            {searchTerm.trim() === "" ? (
              <div className="space-y-6">
                <span className="text-[11px] tracking-[0.25em] uppercase text-[#26231F]/60 font-semibold block">
                  Suggested Searches
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {POPULAR_SEARCHES.map((query) => (
                    <button
                      key={query}
                      onClick={() => setSearchTerm(query)}
                      className="px-4 py-2 text-xs tracking-wider border border-[#26231F]/15 rounded-full hover:border-[#591623] hover:text-[#591623] transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-[#26231F]/60 font-semibold">
                    {filteredProducts.length} Product{filteredProducts.length > 1 ? "s" : ""} Found
                  </span>
                  <Link
                    href={`/shop?search=${encodeURIComponent(searchTerm)}`}
                    onClick={handleClose}
                    className="text-xs tracking-wider text-[#591623] hover:text-[#8C072B] font-medium flex items-center gap-1.5"
                  >
                    View All in Shop
                    <IconArrowRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                  {filteredProducts.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={handleClose}
                      className="group flex flex-col gap-3"
                    >
                      <div className="aspect-[3/4] bg-[#F2F2F0] overflow-hidden border border-[#26231F]/10 rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] tracking-[0.2em] uppercase text-[#26231F]/60 block mb-0.5">
                          {product.collection}
                        </span>
                        <h4 className="text-sm font-serif group-hover:text-[#591623] transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-[#26231F]">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] text-[#26231F]/40 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <p className="text-lg font-serif text-[#26231F]">
                  No pieces match &ldquo;{searchTerm}&rdquo;
                </p>
                <p className="text-xs tracking-wider text-[#26231F]/60">
                  Try searching for hoodies, embroidered tees, sweatshirts, or browse the full store.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[#591623] text-[#F2F2F0] text-xs uppercase tracking-widest hover:bg-[#8C072B] transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
