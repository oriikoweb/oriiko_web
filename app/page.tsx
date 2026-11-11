import React from "react";
import { HeroCollection } from "../components/home/HeroCollection";
import { DropOffersSection } from "../components/home/DropOffersSection";
import { PromotionalCampaigns } from "../components/home/PromotionalCampaigns";
import { BestsellingProducts } from "../components/home/BestsellingProducts";
import { BrandMission } from "../components/home/BrandMission";
import { ProductQualityShowcase } from "../components/home/ProductQualityShowcase";
import { FeaturedProductPromotion } from "../components/home/FeaturedProductPromotion";
import { ShopTheLook } from "../components/home/ShopTheLook";
import { DeliveryMarquee } from "../components/home/DeliveryMarquee";
import { EditorialCollectionIntro } from "../components/home/EditorialCollectionIntro";
import { NewArrivals } from "../components/home/NewArrivals";
import { CompleteTheLook } from "../components/home/CompleteTheLook";
import { ReviewCarousel } from "../components/home/ReviewCarousel";
import { SocialGallery } from "../components/home/SocialGallery";

export default function HomePage() {
  return (
    <main className="flex-1 bg-[#F2F2F0]">
      {/* 01 — Full-Width Rounded Hero Slider */}
      <HeroCollection />

      {/* 02 — Twin Value Offers & Early Access Split Cards */}
      <DropOffersSection />

      {/* 03 — 2-Column Collection Editorial Grid */}
      <PromotionalCampaigns />

      {/* 04 — Most Popular Products */}
      <BestsellingProducts />

      {/* 05 — Dark Contrast Statement Band */}
      <BrandMission />

      {/* 06 — Three Numbered Brand Pillars */}
      <ProductQualityShowcase />

      {/* 07 — Spotlight Creation & Interactive Find My Size Helper */}
      <FeaturedProductPromotion />

      {/* 08 — Interactive Shop Looks */}
      <ShopTheLook />

      {/* 09 — Pan-India Value & Shipping Marquee */}
      <DeliveryMarquee />

      {/* 10 — 50/50 Fabric & Embroidery Split Card */}
      <EditorialCollectionIntro />

      {/* 11 — Drop 01 New Pieces */}
      <NewArrivals />

      {/* 12 — Complete 3-Piece Fit Bundle */}
      <CompleteTheLook />

      {/* 13 — Centered Verified Reviews Carousel */}
      <ReviewCarousel />

      {/* 14 — Community Lookbook Gallery */}
      <SocialGallery />
    </main>
  );
}
