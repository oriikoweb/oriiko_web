"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight, IconArrowRight } from "../ui/Icons";
import { STORY_SLIDES } from "../../data/products";

export function BrandStoryCarousel() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? STORY_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev === STORY_SLIDES.length - 1 ? 0 : prev + 1));
  };

  const slide = STORY_SLIDES[currentSlideIndex];

  return (
    <section className="bg-[#F2F2F0] dark:bg-[#26231F] py-20 sm:py-28 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 overflow-hidden">
      {/* Header with Slide Counter and Nav Controls */}
      <div className="flex items-end justify-between mb-10 pb-6 border-b border-[#26231F]/15 dark:border-[#F2F2F0]/15">
        <div>
          <span className="text-[11px] tracking-[0.28em] uppercase text-[#591623] dark:text-[#F2F2F0]/75 font-semibold block mb-1">
            Storytelling & Manifesto
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#26231F] dark:text-[#F2F2F0]"
            style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
          >
            The Principles of ORIIKO
          </h2>
        </div>

        <div className="flex items-center gap-6">
          {/* Slide Indicator */}
          <div className="text-xs font-serif tracking-[0.2em] text-[#26231F] dark:text-[#F2F2F0]">
            <span className="font-semibold text-[#591623] dark:text-[#F2F2F0]">0{currentSlideIndex + 1}</span>
            <span className="text-[#26231F]/30 dark:text-[#F2F2F0]/35 mx-1">/</span>
            <span className="text-[#26231F]/50 dark:text-[#F2F2F0]/55">0{STORY_SLIDES.length}</span>
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevSlide}
              className="p-2.5 rounded-full border border-[#26231F]/20 dark:border-[#F2F2F0]/20 text-[#26231F] dark:text-[#F2F2F0] hover:border-[#591623] dark:hover:border-[#8C072B] hover:text-[#591623] dark:hover:text-[#F2F2F0] transition-colors focus:outline-none"
              aria-label="Previous Chapter"
            >
              <IconChevronLeft size={18} />
            </button>
            <button
              onClick={nextSlide}
              className="p-2.5 rounded-full border border-[#26231F]/20 dark:border-[#F2F2F0]/20 text-[#26231F] dark:text-[#F2F2F0] hover:border-[#591623] dark:hover:border-[#8C072B] hover:text-[#591623] dark:hover:text-[#F2F2F0] transition-colors focus:outline-none"
              aria-label="Next Chapter"
            >
              <IconChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Carousel Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Image with crossfade */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-2xl bg-[#26231F]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center animate-in fade-in duration-700"
            />
            <div className="absolute top-4 left-4 bg-[#F2F2F0]/90 dark:bg-[#26231F]/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#26231F]/15 dark:border-[#F2F2F0]/20 text-[10px] tracking-widest uppercase font-semibold text-[#591623] dark:text-[#F2F2F0]">
              {slide.label}
            </div>
          </div>
        </div>

        {/* Right Column: Narrative */}
        <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 key={slide.id}">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#8C072B] dark:text-[#F2F2F0]/75 font-semibold block">
              {slide.subtitle}
            </span>
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#26231F] dark:text-[#F2F2F0] leading-tight"
              style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
            >
              {slide.title}
            </h3>
          </div>

          <div className="w-10 h-[1.5px] bg-[#591623] dark:bg-[#8C072B]" />

          <p className="text-sm leading-relaxed text-[#26231F]/75 dark:text-[#F2F2F0]/75 font-sans">
            {slide.description}
          </p>

          <div className="pt-2">
            <Link
              href={slide.ctaLink}
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#591623] hover:bg-[#8C072B] text-[#F2F2F0] text-xs uppercase tracking-[0.22em] font-medium transition-colors shadow-md"
            >
              <span>{slide.ctaText}</span>
              <IconArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

