import type { Metadata } from "next";
import { fetchStoreBootstrap } from "@/lib/store/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await fetchStoreBootstrap();
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Product Details",
      description:
        "Browse ORIIKO heavyweight streetwear essentials across India.",
    };
  }

  const seoTitle = product.name.replace(/^ORIIKO\s+/i, "");

  return {
    title: seoTitle,
    description: `${product.name} (${product.collection}) — ${product.description}`,
    openGraph: {
      title: `${seoTitle} — ORIIKO`,
      description: product.description,
      images: product.primaryImage
        ? [
            {
              url: product.primaryImage,
              alt: product.name,
            },
          ]
        : [],
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
