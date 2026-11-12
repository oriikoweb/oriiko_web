"use client";

import React from "react";

const MARQUEE_ITEMS = [
  "Pan-India Express Shipping",
  "Free Delivery Above ₹2,999",
  "UPI, Cards & Cash On Delivery",
  "14-Day Easy Size Exchanges",
  "480 GSM Loopback French Terry",
  "High-Density Chain-Stitch Embroidery",
];

export function DeliveryMarquee() {
  const repeated = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section
      aria-label="Shipping and Quality Highlights"
      className="bg-[#8C072B] text-[#F2F2F0] py-3 sm:py-4 overflow-hidden my-4 sm:my-6 border-y border-[#591623]"
    >
      <div className="animate-ticker flex items-center gap-6 sm:gap-10 whitespace-nowrap">
        {repeated.map((text, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-6 sm:gap-10 text-[11px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.24em] font-medium"
          >
            <span>{text}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2F2F0]/60" />
          </span>
        ))}
      </div>
    </section>
  );
}

