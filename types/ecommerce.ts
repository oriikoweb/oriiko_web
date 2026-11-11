export interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  color?: string;
  colorHex?: string;
  inStock: boolean;
  sku?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  collection: string;
  category: "hoodies" | "t-shirts" | "sweatshirts" | "bottoms" | "accessories";
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  description: string;
  details: string[];
  materials: string;
  care: string;
  primaryImage: string;
  secondaryImage: string;
  galleryImages: string[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  availableSizes: string[];
  availableColors: { name: string; hex: string }[];
}

export interface CartItem {
  id: string;
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  verified: boolean;
  productName: string;
  title: string;
  comment: string;
}

export interface StorySlide {
  id: number;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}
