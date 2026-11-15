export interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  color?: string;
  colorHex?: string;
  inStock: boolean;
  stock?: number;
  sku?: string;
}

export interface ProductMediaItem {
  id?: string;
  url: string;
  mediaType: "image" | "video";
  altText?: string;
  isPrimary?: boolean;
}

export interface StoreCollection {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImage?: string | null;
  season?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface StoreSettings {
  deliveryCharge: number;
  freeShippingThreshold: number;
  faviconUrl: string | null;
  heroVideoUrl?: string | null;
  updatedAt?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  collection: string;
  category: string;
  collectionIds?: string[];
  collectionSlugs?: string[];
  collectionNames?: string[];
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
  media?: ProductMediaItem[];
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
