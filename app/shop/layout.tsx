import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Streetwear Drops, Heavyweight Hoodies & Embroidered Tees",
  description:
    "Explore ORIIKO India's latest streetwear drops — heavyweight 480 GSM hoodies, chain-stitch embroidered oversized tees, French terry sweatshirts, and elevated essentials.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

