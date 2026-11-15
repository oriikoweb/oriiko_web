"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "../../context/StoreContext";

export function AnnouncementBar() {
  const { freeShippingThreshold, formatPrice } = useStore();

  const thresholdText =
    freeShippingThreshold <= 0
      ? "FREE PAN-INDIA SHIPPING ON ALL ORDERS"
      : `FREE PAN-INDIA SHIPPING ON ORDERS OVER ${formatPrice(freeShippingThreshold)}`;

  const announcements = [
    thresholdText,
    "DROP 01 LIVE: 480 GSM HOODIES & EMBROIDERED TEES",
    "USE CODE ORIIKO10 FOR 10% OFF YOUR FIRST ORDER",
    "14-DAY EASY EXCHANGE ACROSS INDIA",
    "UPI, CARDS & CASH ON DELIVERY AVAILABLE",
    "ENGINEERED IN HEAVYWEIGHT COMBED COTTON",
  ];

  return (
    <aside
      aria-label="Store Announcements"
      className="bg-[#591623] text-[#F2F2F0] py-2 sm:py-2.5 px-3 sm:px-4 overflow-hidden relative z-40 select-none border-b border-[#26231F]/15"
    >
      <div className="w-full overflow-hidden text-[10px] sm:text-[11px] font-medium tracking-[0.14em] sm:tracking-[0.18em] uppercase">
        <div className="animate-ticker flex whitespace-nowrap items-center">
          {announcements.concat(announcements).map((item, index) => (
            <Link
              key={index}
              href="/shop"
              className="inline-flex items-center hover:text-[#F2F2F0]/80 transition-opacity duration-200"
            >
              <span className="px-6">{item}</span>
              <span className="text-[#F2F2F0]/50 font-normal select-none">/</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
