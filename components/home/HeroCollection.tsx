"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IconArrowRight, IconChevronLeft, IconChevronRight } from "../ui/Icons";

const HERO_SLIDES = [
  {
    id: "slide-01",
    eyebrow: "Drop 01 • Signature Fleece",
    title: "Heavyweight Hoodies",
    subtitle:
      "480 GSM combed loopback French terry cut with dropped shoulders, double-lined hoods, and clean tonal embroidery built for India.",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "ORIIKO Heavyweight Hoodies Drop 01",
    primaryCta: { label: "Explore Hoodies", href: "/shop?category=hoodies" },
    secondaryCta: { label: "Shop All Drops", href: "/shop" },
  },
  {
    id: "slide-02",
    eyebrow: "Core Collection • Chain-Stitch",
    title: "Embroidered Tees & Crewnecks",
    subtitle:
      "280 GSM bio-washed oversized jersey and 420 GSM crewnecks finished with high-density multi-thread artwork.",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "ORIIKO Embroidered T-Shirts and Sweatshirts",
    primaryCta: { label: "Explore Tees", href: "/shop?category=t-shirts" },
    secondaryCta: { label: "Shop Sweatshirts", href: "/shop?category=sweatshirts" },
  },
];

export function HeroCollection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const current = HERO_SLIDES[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <section
      aria-label="Featured Drop Hero"
      className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5"
    >
      <div className="relative min-h-[72vh] sm:min-h-[82vh] w-full rounded-2xl overflow-hidden bg-[#26231F] border border-[#26231F]/15 flex items-center justify-center">
        {/* Background Slides */}
        {HERO_SLIDES.map((slide, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.imageAlt}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-out ${
              idx === activeIndex ? "opacity-75 scale-100" : "opacity-0 scale-105"
            }`}
          />
        ))}

        {/* Deep Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#26231F]/45 via-[#26231F]/45 to-[#26231F]/80" />

        {/* Centered Editorial Copy (Hannovae Slider Style) */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 sm:px-10 text-center text-[#F2F2F0] space-y-5 py-16">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#F2F2F0]/15 backdrop-blur-xs border border-[#F2F2F0]/20 text-[11px] font-medium tracking-[0.26em] uppercase text-[#F2F2F0]">
            {current.eyebrow}
          </span>

          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-serif font-normal leading-[1.06] tracking-tight"
            style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
          >
            {current.title}
          </h1>

          <p className="text-xs sm:text-sm font-sans leading-relaxed text-[#F2F2F0]/85 max-w-lg mx-auto">
            {current.subtitle}
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href={current.primaryCta.href}
              className="px-7 py-3.5 rounded-full bg-[#F2F2F0] hover:bg-[#8C072B] text-[#26231F] hover:text-[#F2F2F0] text-xs uppercase tracking-[0.2em] font-semibold transition-colors inline-flex items-center gap-2.5 shadow-lg"
            >
              <span>{current.primaryCta.label}</span>
              <IconArrowRight size={14} />
            </Link>
            <Link
              href={current.secondaryCta.href}
              className="px-7 py-3.5 rounded-full border border-[#F2F2F0]/45 hover:border-[#F2F2F0] bg-[#26231F]/35 backdrop-blur-xs text-[#F2F2F0] text-xs uppercase tracking-[0.2em] font-medium transition-colors"
            >
              {current.secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* Slide Controls */}
        <button
          onClick={handlePrev}
          aria-label="Previous Hero Slide"
          className="hidden sm:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#26231F]/45 hover:bg-[#591623] text-[#F2F2F0] border border-[#F2F2F0]/20 items-center justify-center transition-colors cursor-pointer"
        >
          <IconChevronLeft size={18} />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next Hero Slide"
          className="hidden sm:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#26231F]/45 hover:bg-[#591623] text-[#F2F2F0] border border-[#F2F2F0]/20 items-center justify-center transition-colors cursor-pointer"
        >
          <IconChevronRight size={18} />
        </button>

        {/* Bottom Indicator Pills */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View slide ${idx + 1}: ${slide.title}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeIndex
                  ? "w-8 bg-[#F2F2F0]"
                  : "w-3 bg-[#F2F2F0]/40 hover:bg-[#F2F2F0]/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
