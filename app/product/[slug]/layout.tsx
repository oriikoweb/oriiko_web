import type { Metadata } from "next";
import { PRODUCTS } from "../../../data/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description:
        "This ORIIKO piece could not be located. Browse our latest streetwear drops across India.",
    };
  }

  const seoTitle = product.name.replace(/^ORIIKO\s+/i, "");

  return {
    title: seoTitle,
    description: `${product.name} (${product.collection}) — ${product.description}`,
    openGraph: {
      title: `${seoTitle} — ORIIKO`,
      description: product.description,
      images: [
        {
          url: product.primaryImage,
          alt: product.name,
        },
      ],
    },
  };
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

