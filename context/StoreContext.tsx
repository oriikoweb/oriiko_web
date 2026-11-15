"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  CartItem,
  Product,
  ProductVariant,
  StoreCollection,
} from "../types/ecommerce";

interface StoreContextType {
  products: Product[];
  collections: StoreCollection[];
  catalogLoading: boolean;
  dbReady: boolean;
  deliveryCharge: number;
  freeShippingThreshold: number;
  faviconUrl: string | null;
  heroVideoUrl: string | null;
  refreshStorefront: () => Promise<void>;
  cart: CartItem[];
  addToCart: (
    product: Product,
    variant?: ProductVariant,
    quantity?: number
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  freeShippingProgress: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  currency: string;
  formatPrice: (amount: number) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toastMessage: string | null;
  triggerToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function getInitialCart(): CartItem[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("oriiko_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
  }
  return [];
}

function getVisitorSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = window.localStorage.getItem("oriiko_visitor_sid");
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      window.localStorage.setItem("oriiko_visitor_sid", sid);
    }
    return sid;
  } catch {
    return "";
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<StoreCollection[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [dbReady, setDbReady] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState(149);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2999);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(getInitialCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [currency] = useState("INR");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const lastTrackedPathRef = useRef<string | null>(null);

  const refreshStorefront = useCallback(async () => {
    try {
      const res = await fetch("/api/store/bootstrap", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
      setCollections(Array.isArray(data.collections) ? data.collections : []);
      setDbReady(Boolean(data.dbReady));
      if (data.settings) {
        setDeliveryCharge(Number(data.settings.deliveryCharge ?? 149));
        setFreeShippingThreshold(
          Number(data.settings.freeShippingThreshold ?? 2999)
        );
        setFaviconUrl(data.settings.faviconUrl || null);
        setHeroVideoUrl(data.settings.heroVideoUrl || null);
      }
    } catch {
      // Leave current state intact on transient network failure
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return refreshStorefront();
    });
    return () => {
      active = false;
    };
  }, [refreshStorefront]);

  // Live-update favicon link tags when settings change
  useEffect(() => {
    if (typeof document === "undefined") return;
    const href = faviconUrl || "/api/favicon";
    const links = document.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"]'
    );
    links.forEach((link) => {
      if (link.getAttribute("href") !== href) {
        link.setAttribute("href", href);
      }
    });
  }, [faviconUrl]);

  // Track real page views on storefront routes
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastTrackedPathRef.current === pathname) return;
    lastTrackedPathRef.current = pathname;

    const sessionId = getVisitorSessionId();
    if (!sessionId) return;

    const width = typeof window !== "undefined" ? window.innerWidth : 1280;
    const device =
      width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";

    fetch("/api/store/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        sessionId,
        device,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      }),
    }).catch(() => {
      // Ignore analytics failures
    });
  }, [pathname]);

  // Sync cart to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem("oriiko_cart", JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const addToCart = (
    product: Product,
    variant?: ProductVariant,
    quantity = 1
  ) => {
    const selectedVariant = variant ||
      product.variants[0] || {
        id: `${product.id}-default`,
        name: "Default",
        inStock: true,
      };
    const itemId = `${product.id}-${selectedVariant.id}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedVariant,
          quantity,
        },
      ];
    });

    triggerToast(`Added ${product.name} (${selectedVariant.name}) to Bag`);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const freeShippingProgress =
    freeShippingThreshold <= 0
      ? 100
      : Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        collections,
        catalogLoading,
        dbReady,
        deliveryCharge,
        freeShippingThreshold,
        faviconUrl,
        heroVideoUrl,
        refreshStorefront,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        freeShippingProgress,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isNavOpen,
        setIsNavOpen,
        quickViewProduct,
        setQuickViewProduct,
        currency,
        formatPrice,
        searchQuery,
        setSearchQuery,
        toastMessage,
        triggerToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
