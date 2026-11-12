"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconClose, IconPlus, IconMinus, IconArrowRight, IconShield } from "../ui/Icons";
import { useStore } from "../../context/StoreContext";

const NATIVE_SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";

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
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const gestureAxisRef = useRef<"x" | "y" | null>(null);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsCartOpen(false);
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isCartOpen, setIsCartOpen]);

  const activeDragX = isCartOpen && isDragging ? dragOffsetX : 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
    gestureAxisRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }

    const dx = e.touches[0].clientX - touchStartXRef.current;
    const dy = e.touches[0].clientY - touchStartYRef.current;

    if (!gestureAxisRef.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        gestureAxisRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      } else {
        return;
      }
    }

    if (gestureAxisRef.current === "x") {
      setIsDragging(true);
      const clampedDx = dx > 0 ? dx : Math.max(-18, dx * 0.15);
      setDragOffsetX(clampedDx);
    }
  };

  const handleTouchEnd = () => {
    if (gestureAxisRef.current === "x") {
      const elapsed = Math.max(1, Date.now() - touchStartTimeRef.current);
      const velocity = dragOffsetX / elapsed;
      if (dragOffsetX > 72 || velocity > 0.45) {
        setIsCartOpen(false);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    gestureAxisRef.current = null;
    setIsDragging(false);
    setDragOffsetX(0);
  };

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

  const swipeFadeProgress =
    isCartOpen && isDragging && activeDragX > 0
      ? Math.max(0.25, 1 - activeDragX / 300)
      : 1;

  return (
    <div
      aria-hidden={!isCartOpen}
      className={`fixed inset-0 z-50 overflow-hidden ${
        isCartOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Background Overlay */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          opacity: isCartOpen ? swipeFadeProgress : 0,
          transition: isDragging
            ? "none"
            : `opacity 360ms ${NATIVE_SPRING}`,
        }}
        className="absolute inset-0 bg-[#26231F]/48 backdrop-blur-[3px] will-change-[opacity]"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <aside
          aria-label="Shopping Bag"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: isCartOpen
              ? `translate3d(${activeDragX}px, 0, 0)`
              : "translate3d(104%, 0, 0)",
            transition: isDragging
              ? "none"
              : `transform 400ms ${NATIVE_SPRING}`,
          }}
          className="w-[88vw] max-w-[390px] sm:max-w-md bg-[#F2F2F0] text-[#26231F] flex flex-col justify-between shadow-2xl border-l border-[#26231F]/15 rounded-l-2xl overflow-hidden will-change-transform touch-pan-y"
        >
          {/* Top Bar */}
          <div className="px-5 py-4 sm:p-7 border-b border-[#26231F]/10 flex items-center justify-between shrink-0">
            <div className="flex items-baseline gap-2.5">
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
              className="p-2.5 -mr-2 rounded-full text-[#26231F] hover:text-[#591623] hover:bg-[#26231F]/5 active:scale-95 transition-all focus:outline-none cursor-pointer"
              aria-label="Close Bag"
            >
              <IconClose size={20} />
            </button>
          </div>

          {/* Free Pan-India Shipping Progress Banner */}
          <div className="bg-[#591623]/5 px-5 sm:px-7 py-3 border-b border-[#26231F]/10 shrink-0">
            <div className="flex justify-between items-center gap-2 text-[11px] tracking-wider uppercase font-medium text-[#26231F]">
              <span className="truncate">
                {remainingForFreeShipping > 0
                  ? `Add ${formatPrice(remainingForFreeShipping)} for free pan-India shipping`
                  : "Free pan-India express shipping unlocked"}
              </span>
              <span className="font-semibold text-[#591623] shrink-0">
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
          <div className="flex-1 overflow-y-auto px-5 py-4 sm:p-7 no-scrollbar divide-y divide-[#26231F]/10">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 sm:py-16 space-y-4">
                <span className="font-serif text-3xl text-[#26231F]/40 italic">
                  Empty
                </span>
                <p className="text-xs sm:text-sm text-[#26231F]/70 max-w-xs font-sans">
                  Your shopping bag is currently empty. Explore our latest hoodies, embroidered tees, and sweatshirts.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-full bg-[#591623] text-[#F2F2F0] text-xs font-medium uppercase tracking-[0.2em] hover:bg-[#8C072B] active:scale-[0.98] transition-all"
                >
                  Shop Collection
                  <IconArrowRight size={14} />
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-5 first:pt-1 last:pb-1 flex gap-3.5 sm:gap-4">
                  <div className="w-18 h-24 sm:w-20 sm:h-28 bg-[#F2F2F0] border border-[#26231F]/10 rounded-xl flex-shrink-0 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.primaryImage}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
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
                          className="p-2 sm:p-1.5 text-[#26231F] hover:bg-[#26231F]/5 transition-colors focus:outline-none cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <IconMinus size={13} />
                        </button>
                        <span className="px-2.5 sm:px-3 text-xs font-medium select-none min-w-[26px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 sm:p-1.5 text-[#26231F] hover:bg-[#26231F]/5 transition-colors focus:outline-none cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <IconPlus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] tracking-wider uppercase text-[#26231F]/50 hover:text-[#8C072B] transition-colors underline underline-offset-4 py-1 cursor-pointer"
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
            <div className="p-5 sm:p-7 border-t border-[#26231F]/15 bg-[#F2F2F0] space-y-3.5 sm:space-y-4 shrink-0">
              <form onSubmit={handleApplyDiscount} className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Promo code (try: ORIIKO10)"
                  className="min-w-0 flex-1 bg-transparent border border-[#26231F]/20 rounded-lg px-3 py-2 text-base sm:text-xs uppercase tracking-wider placeholder:text-[#26231F]/40 focus:outline-none focus:border-[#591623]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 min-h-[40px] rounded-lg border border-[#591623] text-[#591623] text-xs uppercase tracking-wider font-medium hover:bg-[#591623] hover:text-[#F2F2F0] transition-colors shrink-0 cursor-pointer"
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
                className="w-full py-3.5 sm:py-4 min-h-[46px] rounded-full bg-[#591623] hover:bg-[#8C072B] active:scale-[0.985] text-[#F2F2F0] text-xs font-medium tracking-[0.2em] sm:tracking-[0.22em] uppercase transition-all flex items-center justify-center gap-3 shadow-md focus:outline-none cursor-pointer"
              >
                <IconShield size={16} />
                <span>Proceed to Checkout</span>
              </button>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center text-xs tracking-wider uppercase text-[#26231F]/70 hover:text-[#591623] transition-colors py-1 cursor-pointer"
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
