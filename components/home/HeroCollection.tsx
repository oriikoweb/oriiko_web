"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";

const HERO_SLIDES = [
  {
    eyebrow: "Drop 01 · Pan-India",
    title: "Built in Heavyweight.",
    subtitle: "480 GSM French Terry hoodies & dense embroidery stitched for Indian streets.",
    poster:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85",
    ctaLabel: "Shop the Drop",
    ctaHref: "/shop",
  },
  {
    eyebrow: "Signature Craft",
    title: "Tactile Crest Tees.",
    subtitle: "Relaxed drop-shoulder silhouettes cut from combed cotton jersey.",
    poster:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=85",
    ctaLabel: "Explore Tees",
    ctaHref: "/shop?category=t-shirts",
  },
  {
    eyebrow: "Core Silhouette",
    title: "Studio Layering.",
    subtitle: "Structured boxy outerwear & fleece sets tailored for daily movement.",
    poster:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85",
    ctaLabel: "View Fleece",
    ctaHref: "/shop?category=hoodies",
  },
];

// Env-var fallbacks (used when no DB video is configured)
const ENV_DESKTOP_VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "";
const ENV_MOBILE_VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO_MOBILE_URL || "";

export function HeroCollection() {
  const { heroVideoUrl } = useStore();
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Track reduced motion preference & viewport breakpoint for video source selection
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const updatePrefs = () => {
      setPrefersReducedMotion(motionQuery.matches);
      setIsMobileViewport(mobileQuery.matches);
    };

    updatePrefs();
    motionQuery.addEventListener("change", updatePrefs);
    mobileQuery.addEventListener("change", updatePrefs);

    return () => {
      motionQuery.removeEventListener("change", updatePrefs);
      mobileQuery.removeEventListener("change", updatePrefs);
    };
  }, []);

  // Auto-cycle fallback slides when background video is paused / unavailable
  useEffect(() => {
    if (videoReady && !videoError) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [videoReady, videoError]);

  // Pause hero video offscreen to preserve mobile battery & decode bandwidth
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || prefersReducedMotion || videoError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) return;
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Low-power mode / autoplay block gracefully leaves crisp poster image visible
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReducedMotion, videoError]);

  const activeSlide = HERO_SLIDES[currentSlide];

  // Priority: DB-stored URL → env var → no video (poster slideshow only)
  const desktopVideoSrc = heroVideoUrl || ENV_DESKTOP_VIDEO;
  const mobileVideoSrc = heroVideoUrl || ENV_MOBILE_VIDEO || desktopVideoSrc;
  const videoSrc = isMobileViewport ? mobileVideoSrc : desktopVideoSrc;
  const hasVideo = Boolean(videoSrc);

  return (
    <section
      ref={sectionRef}
      aria-label="ORIIKO Drop Hero"
      className="relative w-full min-h-[76svh] sm:min-h-[84vh] lg:min-h-[88vh] bg-[#26231F] overflow-hidden flex items-end sm:items-center justify-center"
    >
      {/* Layer 1: Always-mounted poster/slide imagery for zero-latency LCP & seamless fallback */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.eyebrow}
            src={slide.poster}
            alt={slide.title}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              idx === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Layer 2: Dedicated full-bleed edge-to-edge background video slot */}
      {!prefersReducedMotion && !videoError && hasVideo && (
        <video
          key={videoSrc}
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          poster={HERO_SLIDES[0].poster}
          aria-hidden="true"
          onCanPlay={() => setVideoReady(true)}
          onError={() => {
            setVideoError(true);
            setVideoReady(false);
          }}
          className={`absolute inset-0 z-[1] w-full h-full object-cover object-center pointer-events-none transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Layer 3: Multi-stop editorial contrast scrim */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] bg-gradient-to-t from-[#26231F]/88 via-[#26231F]/40 to-[#591623]/25 sm:bg-gradient-to-b sm:from-[#26231F]/35 sm:via-[#26231F]/40 sm:to-[#26231F]/80"
      />

      {/* Layer 4: Foreground Copy & Pill CTAs */}
      <div className="relative z-[3] w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-20 pb-12 sm:py-20 flex flex-col items-start sm:items-center text-left sm:text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#F2F2F0]/12 backdrop-blur-md px-3.5 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#F2F2F0] mb-4 sm:mb-5">
          {activeSlide.eyebrow}
        </span>

        <h1 className="text-[2.25rem] leading-[1.04] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-normal tracking-[-0.02em] text-[#F2F2F0] max-w-3xl mb-3 sm:mb-4">
          {activeSlide.title}
        </h1>

        <p className="text-[13px] sm:text-[15px] leading-relaxed text-[#F2F2F0]/85 max-w-md sm:max-w-lg mb-7 sm:mb-8">
          {activeSlide.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Link
            href={activeSlide.ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-[#F2F2F0] text-[#26231F] px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#591623] hover:text-[#F2F2F0] transition-colors min-h-[44px]"
          >
            {activeSlide.ctaLabel}
          </Link>
          <Link
            href="/shop?category=hoodies"
            className="inline-flex items-center justify-center rounded-full bg-[#26231F]/55 backdrop-blur-md text-[#F2F2F0] border border-[#F2F2F0]/25 px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#26231F]/80 transition-colors min-h-[44px]"
          >
            Heavyweight Hoodies
          </Link>
        </div>

        {/* Minimal dot selector for poster slides when static poster fallback is active */}
        {(!videoReady || videoError) && (
          <div className="flex items-center gap-2 mt-7 sm:mt-10">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.eyebrow}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`View slide ${idx + 1}: ${s.title}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? "w-7 bg-[#F2F2F0]"
                    : "w-2 bg-[#F2F2F0]/40 hover:bg-[#F2F2F0]/65"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
