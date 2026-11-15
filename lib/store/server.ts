import { getDbClient } from "@/lib/auth/session";
import type {
  Product,
  ProductMediaItem,
  ProductVariant,
  StoreCollection,
  StoreSettings,
} from "@/types/ecommerce";

export interface StoreBootstrapPayload {
  settings: StoreSettings;
  collections: StoreCollection[];
  products: Product[];
  dbReady: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  deliveryCharge: 149,
  freeShippingThreshold: 2999,
  faviconUrl: null,
  heroVideoUrl: null,
};

function normalizeProductRow(raw: Record<string, unknown>): Product {
  const variantsRaw = Array.isArray(raw.variants)
    ? (raw.variants as ProductVariant[])
    : [];
  const mediaRaw = Array.isArray(raw.media)
    ? (raw.media as ProductMediaItem[])
    : [];
  const galleryFromMedia = mediaRaw
    .filter((m) => m.mediaType !== "video" && m.url)
    .map((m) => m.url);
  const galleryImages =
    Array.isArray(raw.galleryImages) && raw.galleryImages.length > 0
      ? (raw.galleryImages as string[]).filter(Boolean)
      : galleryFromMedia;

  const primaryImage =
    (typeof raw.primaryImage === "string" && raw.primaryImage) ||
    galleryImages[0] ||
    mediaRaw[0]?.url ||
    "";
  const secondaryImage =
    (typeof raw.secondaryImage === "string" && raw.secondaryImage) ||
    galleryImages[1] ||
    primaryImage;

  const sizesSet = new Set<string>();
  const colorsMap = new Map<string, string>();
  for (const v of variantsRaw) {
    if (v.size) sizesSet.add(v.size);
    if (v.color && !colorsMap.has(v.color)) {
      colorsMap.set(v.color, v.colorHex || "#26231F");
    }
  }

  return {
    id: String(raw.id || ""),
    slug: String(raw.slug || ""),
    name: String(raw.name || ""),
    collection: String(raw.collection || "DROP 01"),
    category: String(raw.category || "apparel"),
    collectionIds: Array.isArray(raw.collectionIds)
      ? (raw.collectionIds as string[])
      : [],
    collectionSlugs: Array.isArray(raw.collectionSlugs)
      ? (raw.collectionSlugs as string[])
      : [],
    collectionNames: Array.isArray(raw.collectionNames)
      ? (raw.collectionNames as string[])
      : [],
    price: Number(raw.price || 0),
    originalPrice:
      raw.originalPrice != null && Number(raw.originalPrice) > 0
        ? Number(raw.originalPrice)
        : undefined,
    discountBadge:
      typeof raw.discountBadge === "string" && raw.discountBadge
        ? raw.discountBadge
        : undefined,
    description: String(raw.description || ""),
    details: Array.isArray(raw.details) ? (raw.details as string[]) : [],
    materials: String(raw.materials || ""),
    care: String(raw.care || ""),
    primaryImage,
    secondaryImage,
    galleryImages,
    media: mediaRaw,
    variants: variantsRaw,
    rating: Number(raw.rating ?? 5),
    reviewCount: Number(raw.reviewCount ?? 0),
    isNewArrival: Boolean(raw.isNewArrival),
    isBestseller: Boolean(raw.isBestseller),
    isFeatured: Boolean(raw.isFeatured),
    availableSizes: Array.from(sizesSet),
    availableColors: Array.from(colorsMap.entries()).map(([name, hex]) => ({
      name,
      hex,
    })),
  };
}

export async function fetchStoreBootstrap(): Promise<StoreBootstrapPayload> {
  try {
    const supabase = getDbClient();
    const { data, error } = await supabase.rpc("get_store_bootstrap");

    if (error || !data || typeof data !== "object") {
      return {
        settings: DEFAULT_SETTINGS,
        collections: [],
        products: [],
        dbReady: false,
      };
    }

    const payload = data as {
      settings?: Partial<StoreSettings>;
      collections?: StoreCollection[];
      products?: Record<string, unknown>[];
    };

    const settings: StoreSettings = {
      deliveryCharge: Number(payload.settings?.deliveryCharge ?? 149),
      freeShippingThreshold: Number(
        payload.settings?.freeShippingThreshold ?? 2999
      ),
      faviconUrl: payload.settings?.faviconUrl || null,
      heroVideoUrl: payload.settings?.heroVideoUrl || null,
      updatedAt: payload.settings?.updatedAt,
    };

    const collections = Array.isArray(payload.collections)
      ? payload.collections
      : [];

    const products = Array.isArray(payload.products)
      ? payload.products.map(normalizeProductRow)
      : [];

    return {
      settings,
      collections,
      products,
      dbReady: true,
    };
  } catch {
    return {
      settings: DEFAULT_SETTINGS,
      collections: [],
      products: [],
      dbReady: false,
    };
  }
}

