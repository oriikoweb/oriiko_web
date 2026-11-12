"use client";

import React, { useState } from "react";
import { IconStar, IconChevronLeft, IconChevronRight, IconCheck } from "../ui/Icons";
import { REVIEWS } from "../../data/products";

export function ReviewCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);

  const prevReview = () => {
    setActiveIdx((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setActiveIdx((prev) => (prev === REVIEWS.length - 1 ? 0 : prev + 1));
  };

  const activeReview = REVIEWS[activeIdx] || REVIEWS[0];

  return (
    <section id="reviews" className="bg-[#F2F2F0] py-12 sm:py-24 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
      {/* Centered Header & Aggregate Rating */}
      <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-10 space-y-2.5 sm:space-y-3">
        <span className="text-[11px] tracking-[0.28em] uppercase text-[#8C072B] font-semibold block">
          Customer Reviews
        </span>
        <h2
          className="text-2xl sm:text-4xl font-serif font-normal text-[#26231F]"
          style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
        >
          Rated 4.9 / 5 Across India
        </h2>
        <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full border border-[#26231F]/15 bg-[#F2F2F0]">
          <div className="flex text-[#8C072B]">
            {[...Array(5)].map((_, i) => (
              <IconStar key={i} size={13} filled />
            ))}
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-[#26231F]/80">
            Based on 250+ Verified Indian Orders
          </span>
        </div>
      </div>

      {/* Centered Editorial Quote Card (Hannovae Testimonial Style) */}
      <div className="max-w-3xl mx-auto rounded-2xl border border-[#26231F]/12 bg-[#F2F2F0] p-6 sm:p-12 text-center space-y-5 sm:space-y-6 shadow-xs">
        <div className="flex items-center justify-center gap-1 text-[#8C072B]">
          {[...Array(activeReview.rating)].map((_, i) => (
            <IconStar key={i} size={15} filled />
          ))}
        </div>

        <blockquote
          className="text-xl sm:text-2xl lg:text-3xl font-serif font-normal text-[#26231F] leading-snug"
          style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
        >
          &ldquo;{activeReview.comment}&rdquo;
        </blockquote>

        <div className="space-y-1">
          <p className="text-xs font-medium text-[#26231F]/80 font-sans">
            {activeReview.title}
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] font-semibold text-[#591623]">
            <span>{activeReview.author}</span>
            {activeReview.verified && <IconCheck size={12} />}
          </div>
          <p className="text-[11px] text-[#26231F]/55 tracking-wide">
            {activeReview.location} &middot; {activeReview.productName}
          </p>
        </div>

        {/* Bottom Progress Bars & Arrows */}
        <div className="pt-4 flex items-center justify-between gap-4 border-t border-[#26231F]/10">
          <button
            onClick={prevReview}
            aria-label="Previous Review"
            className="w-9 h-9 rounded-full border border-[#26231F]/20 hover:border-[#591623] hover:text-[#591623] flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            {REVIEWS.map((rev, idx) => (
              <button
                key={rev.id}
                onClick={() => setActiveIdx(idx)}
                aria-label={`View review ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === activeIdx
                    ? "w-7 bg-[#591623]"
                    : "w-2.5 bg-[#26231F]/20 hover:bg-[#591623]/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextReview}
            aria-label="Next Review"
            className="w-9 h-9 rounded-full border border-[#26231F]/20 hover:border-[#591623] hover:text-[#591623] flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
