"use client";

import React, { useState } from "react";
import { IconCheck, IconBag } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";
import { PRODUCTS } from "../../data/products";

export function CompleteTheLook() {
  const { addToCart, formatPrice } = useStore();
  const ensembleItems = [PRODUCTS[0], PRODUCTS[1], PRODUCTS[5]]; // Hoodie, Embroidered Tee, Cargos
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(
    ensembleItems.map((p) => p.id)
  );

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) =>
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
    <section className="bg-[#F2F2F0] py-16 sm:py-22 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#26231F]/12 pb-6 gap-4">
        <div>
          <span className="text-[11px] tracking-[0.25em] uppercase text-[#8C072B] font-semibold block mb-1">
            Full Fit Direction
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-[#26231F]"
            style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
          >
            Complete The Fit
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#26231F]/70 max-w-md font-sans">
          Select individual pieces or add the balanced 3-piece Drop 01 streetwear outfit in one tap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Coordinated Ensemble Products */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {ensembleItems.map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`cursor-pointer p-3 rounded-2xl border transition-all relative bg-[#F2F2F0] ${
                  isSelected
                    ? "border-[#591623] shadow-sm"
                    : "border-[#26231F]/15 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Selection indicator checkbox */}
                <div className="absolute top-5 right-5 z-10 w-5 h-5 rounded-full border border-[#26231F]/20 flex items-center justify-center bg-[#F2F2F0]">
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
                  <span className="text-[9px] uppercase tracking-widest text-[#26231F]/60 block">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-serif font-medium text-[#26231F] line-clamp-1">
                    {item.name}
                  </h4>
                  <span className="text-xs font-semibold text-[#26231F] block">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bundle Summary & CTA Box */}
        <div className="lg:col-span-4 bg-[#F2F2F0] border border-[#26231F]/15 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#8C072B] font-semibold block">
            3-Piece Streetwear Fit
          </span>
          <h3 className="text-xl font-serif text-[#26231F]">
            The Drop 01 Signature Fit
          </h3>

          <div className="space-y-2 py-3 border-y border-[#26231F]/10 text-xs">
            {ensembleItems.map((item) => (
              <div
                key={item.id}
                className={`flex justify-between ${
                  selectedItemIds.includes(item.id)
                    ? "text-[#26231F]"
                    : "text-[#26231F]/40 line-through"
                }`}
              >
                <span className="line-clamp-1 flex-1 pr-2">{item.name}</span>
                <span className="font-medium">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs tracking-wider uppercase text-[#26231F]/70">
              Selected ({selectedProducts.length} Items)
            </span>
            <span className="text-xl font-serif font-semibold text-[#591623]">
              {formatPrice(totalBundlePrice)}
            </span>
          </div>

          <button
            onClick={handleAddEnsemble}
            disabled={selectedProducts.length === 0}
            className="w-full py-4 rounded-full bg-[#591623] hover:bg-[#8C072B] disabled:bg-[#26231F]/20 text-[#F2F2F0] text-xs font-medium uppercase tracking-[0.22em] transition-colors flex items-center justify-center gap-3 shadow-md focus:outline-none cursor-pointer"
          >
            <IconBag size={16} />
            <span>Add Selected Fit to Bag</span>
          </button>

          <p className="text-[10px] text-center text-[#26231F]/60">
            Free pan-India express delivery on all orders above ₹2,999.
          </p>
        </div>
      </div>
    </section>
  );
}
