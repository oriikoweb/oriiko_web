"use client";

import React, { useState } from "react";
import { IconCheck, IconBag } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";

export function CompleteTheLook() {
  const { products, freeShippingThreshold, addToCart, formatPrice } =
    useStore();
  const ensembleItems = products.slice(0, 3);
  const [deselectedIds, setDeselectedIds] = useState<string[]>([]);

  if (ensembleItems.length === 0) {
    return null;
  }

  const selectedItemIds = ensembleItems
    .map((p) => p.id)
    .filter((id) => !deselectedIds.includes(id));

  const toggleItem = (id: string) => {
    setDeselectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedProducts = ensembleItems.filter((p) =>
    selectedItemIds.includes(p.id)
  );
  const totalBundlePrice = selectedProducts.reduce(
    (acc, item) => acc + item.price,
    0
  );

  const handleAddEnsemble = () => {
    selectedProducts.forEach((p) => {
      addToCart(p, p.variants[0]);
    });
  };

  return (
    <section className="bg-[#F2F2F0] dark:bg-[#26231F] py-10 sm:py-22 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-7 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 pb-5 sm:pb-6 gap-3 sm:gap-4">
        <div>
          <span className="text-[11px] tracking-[0.25em] uppercase text-[#8C072B] dark:text-[#F2F2F0]/75 font-semibold block mb-1">
            Full Fit Direction
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-[#26231F] dark:text-[#F2F2F0]"
            style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
          >
            Complete The Fit
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#26231F]/70 dark:text-[#F2F2F0]/70 max-w-md font-sans">
          Select individual pieces or add the balanced 3-piece Drop 01 streetwear outfit in one tap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
        {/* Coordinated Ensemble Products (Horizontal swipe cards on mobile, 3-col on sm+) */}
        <div className="lg:col-span-8 flex sm:grid sm:grid-cols-3 gap-3.5 sm:gap-5 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory no-scrollbar">
          {ensembleItems.map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`min-w-[68%] min-[420px]:min-w-[54%] sm:min-w-0 snap-start cursor-pointer p-3 rounded-2xl border transition-all relative bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] ${
                  isSelected
                    ? "border-[#591623] dark:border-[#8C072B] shadow-sm"
                    : "border-[#26231F]/15 dark:border-[#F2F2F0]/15 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Selection indicator checkbox */}
                <div className="absolute top-5 right-5 z-10 w-5 h-5 rounded-full border border-[#26231F]/20 dark:border-[#F2F2F0]/25 flex items-center justify-center bg-[#F2F2F0] dark:bg-[#26231F]">
                  {isSelected && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#591623] flex items-center justify-center text-[#F2F2F0]">
                      <IconCheck size={10} />
                    </div>
                  )}
                </div>

                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#26231F]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.primaryImage}
                    alt={item.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="pt-3 px-1 space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#26231F]/60 dark:text-[#F2F2F0]/60 block">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-serif font-medium text-[#26231F] dark:text-[#F2F2F0] line-clamp-1">
                    {item.name}
                  </h4>
                  <span className="text-xs font-semibold text-[#26231F] dark:text-[#F2F2F0] block">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bundle Summary & CTA Box */}
        <div className="lg:col-span-4 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-2xl p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-xs">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#8C072B] dark:text-[#F2F2F0]/75 font-semibold block">
            3-Piece Streetwear Fit
          </span>
          <h3 className="text-xl font-serif text-[#26231F] dark:text-[#F2F2F0]">
            The Drop 01 Signature Fit
          </h3>

          <div className="space-y-2 py-3 border-y border-[#26231F]/10 dark:border-[#F2F2F0]/10 text-xs">
            {ensembleItems.map((item) => (
              <div
                key={item.id}
                className={`flex justify-between ${
                  selectedItemIds.includes(item.id)
                    ? "text-[#26231F] dark:text-[#F2F2F0]"
                    : "text-[#26231F]/40 dark:text-[#F2F2F0]/40 line-through"
                }`}
              >
                <span className="line-clamp-1 flex-1 pr-2">{item.name}</span>
                <span className="font-medium">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs tracking-wider uppercase text-[#26231F]/70 dark:text-[#F2F2F0]/70">
              Selected ({selectedProducts.length} Items)
            </span>
            <span className="text-xl font-serif font-semibold text-[#591623] dark:text-[#F2F2F0]">
              {formatPrice(totalBundlePrice)}
            </span>
          </div>

          <button
            onClick={handleAddEnsemble}
            disabled={selectedProducts.length === 0}
            className="w-full py-4 rounded-full bg-[#591623] hover:bg-[#8C072B] disabled:bg-[#26231F]/20 dark:disabled:bg-[#F2F2F0]/15 text-[#F2F2F0] text-xs font-medium uppercase tracking-[0.22em] transition-colors flex items-center justify-center gap-3 shadow-md focus:outline-none cursor-pointer"
          >
            <IconBag size={16} />
            <span>Add Selected Fit to Bag</span>
          </button>

          <p className="text-[10px] text-center text-[#26231F]/60 dark:text-[#F2F2F0]/60">
            {freeShippingThreshold <= 0
              ? "Free pan-India express delivery on all orders."
              : `Free pan-India express delivery on all orders above ${formatPrice(freeShippingThreshold)}.`}
          </p>
        </div>
      </div>
    </section>
  );
}
