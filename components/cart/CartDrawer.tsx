"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IconClose, IconPlus, IconMinus, IconArrowRight, IconShield } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartCount,
    freeShippingThreshold,
    freeShippingProgress,
    formatPrice,
  } = useStore();

  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountCode.trim().toUpperCase() === "ORIIKO10") {
      setAppliedDiscount(0.1);
      setDiscountError(null);
    } else if (discountCode.trim()) {
      setDiscountError("Invalid promo code");
      setAppliedDiscount(null);
    }
  };

  const discountAmount = appliedDiscount ? cartSubtotal * appliedDiscount : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const shippingCost = remainingForFreeShipping === 0 ? 0 : 149;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background Overlay */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-[#26231F]/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <aside
          aria-label="Shopping Bag"
          className="w-screen max-w-md bg-[#F2F2F0] text-[#26231F] flex flex-col justify-between shadow-2xl border-l border-[#26231F]/15 rounded-l-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        >
          {/* Top Bar */}
          <div className="p-6 sm:p-7 border-b border-[#26231F]/10 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <h2
                className="text-xl sm:text-2xl font-serif tracking-wide text-[#26231F]"
                style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
              >
                Shopping Bag
              </h2>
              <span className="text-xs uppercase tracking-widest text-[#26231F]/60">
                ({cartCount})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#26231F] hover:text-[#591623] transition-colors -mr-2 focus:outline-none"
              aria-label="Close Bag"
            >
              <IconClose size={22} />
            </button>
          </div>

          {/* Free Pan-India Shipping Progress Banner */}
          <div className="bg-[#591623]/5 px-6 sm:px-7 py-3.5 border-b border-[#26231F]/10">
            <div className="flex justify-between items-center text-[11px] tracking-wider uppercase font-medium text-[#26231F]">
              <span>
                {remainingForFreeShipping > 0
                  ? `Add ${formatPrice(remainingForFreeShipping)} for free pan-India shipping`
                  : "Free pan-India express shipping unlocked"}
              </span>
              <span className="font-semibold text-[#591623]">
                {freeShippingProgress}%
              </span>
            </div>
            <div className="w-full bg-[#26231F]/10 h-1 mt-2 rounded-full overflow-hidden">
              <div
                className="bg-[#591623] h-full transition-all duration-500 ease-out"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-7 no-scrollbar divide-y divide-[#26231F]/10">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <span className="text-sm font-serif text-3xl text-[#26231F]/40 italic">
                  Empty
                </span>
                <p className="text-sm text-[#26231F]/70 max-w-xs font-sans">
                  Your shopping bag is currently empty. Explore our latest hoodies, embroidered tees, and sweatshirts.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#591623] text-[#F2F2F0] text-xs font-medium uppercase tracking-[0.2em] hover:bg-[#8C072B] transition-colors"
                >
                  Shop Collection
                  <IconArrowRight size={14} />
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex gap-4">
                  <div className="w-20 h-28 bg-[#F2F2F0] border border-[#26231F]/10 rounded-xl flex-shrink-0 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.primaryImage}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-serif hover:text-[#591623] transition-colors leading-snug line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <span className="text-xs font-semibold text-[#26231F] flex-shrink-0">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#26231F]/60 block mt-1 tracking-wide">
                        Option: {item.selectedVariant.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center border border-[#26231F]/20 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-[#26231F] hover:bg-[#26231F]/5 transition-colors focus:outline-none"
                          aria-label="Decrease quantity"
                        >
                          <IconMinus size={13} />
                        </button>
                        <span className="px-3 text-xs font-medium select-none min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-[#26231F] hover:bg-[#26231F]/5 transition-colors focus:outline-none"
                          aria-label="Increase quantity"
                        >
                          <IconPlus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] tracking-wider uppercase text-[#26231F]/50 hover:text-[#8C072B] transition-colors underline underline-offset-4"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Calculations and Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-6 sm:p-7 border-t border-[#26231F]/15 bg-[#F2F2F0] space-y-4">
              <form onSubmit={handleApplyDiscount} className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Promo code (try: ORIIKO10)"
                  className="flex-1 bg-transparent border border-[#26231F]/20 rounded-lg px-3 py-2 text-xs uppercase tracking-wider placeholder:text-[#26231F]/40 focus:outline-none focus:border-[#591623]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg border border-[#591623] text-[#591623] text-xs uppercase tracking-wider font-medium hover:bg-[#591623] hover:text-[#F2F2F0] transition-colors"
                >
                  Apply
                </button>
              </form>
              {discountError && (
                <p className="text-[11px] text-[#8C072B]">{discountError}</p>
              )}
              {appliedDiscount && (
                <p className="text-[11px] text-[#591623] font-medium">
                  10% ORIIKO Drop Discount Applied (-{formatPrice(discountAmount)})
                </p>
              )}

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#26231F]/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-[#8C072B]">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#26231F]/70">
                  <span>Pan-India Shipping</span>
                  <span>
                    {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif pt-2 border-t border-[#26231F]/10 text-[#26231F]">
                  <span>Total</span>
                  <span className="font-semibold text-[#591623]">
                    {formatPrice(finalTotal + shippingCost)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert("Proceeding to secure checkout...");
                }}
                className="w-full py-4 rounded-full bg-[#591623] hover:bg-[#8C072B] text-[#F2F2F0] text-xs font-medium tracking-[0.22em] uppercase transition-colors flex items-center justify-center gap-3 shadow-md focus:outline-none"
              >
                <IconShield size={16} />
                <span>Proceed to Checkout</span>
              </button>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center text-xs tracking-wider uppercase text-[#26231F]/70 hover:text-[#591623] transition-colors pt-1"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
