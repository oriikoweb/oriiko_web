"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import {
  buildAdminNotifications,
  EMPTY_WORKSPACE,
} from "./repository";
import type {
  AdminAccount,
  AdminCustomer,
  AdminNotification,
  AdminOrder,
  AdminProduct,
  AdminStoreSettings,
  AdminWorkspaceState,
  CustomerSegment,
  CustomerStatus,
  OrderStatus,
  PaymentStatus,
} from "./types";

export interface AdminToast {
  id: string;
  title: string;
  description?: string;
  tone: "success" | "info" | "error";
}

export interface ProductSaveInput {
  id?: string;
  name: string;
  slug: string;
  subtitle?: string;
  collection: string;
  category: string;
  collectionIds: string[];
  subcategory: string;
  status: AdminProduct["status"];
  price: number;
  compareAtPrice?: number;
  costPrice: number;
  sku: string;
  lowStockThreshold: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  promoLabel?: string;
  description: string;
  details: string[];
  materials: string;
  care: string;
  media: AdminProduct["media"];
  variants: AdminProduct["variants"];
  seoTitle: string;
  seoDescription: string;
}

export interface CollectionSaveInput {
  id?: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  season: string;
  isActive: boolean;
  sortOrder: number;
}

interface AdminContextValue {
  ready: boolean;
  authLoading: boolean;
  workspaceLoading: boolean;
  workspaceError: string | null;
  authState: "unauthenticated" | "customer_denied" | "authenticated";
  currentAdmin: AdminAccount | null;
  workspace: AdminWorkspaceState;
  notifications: AdminNotification[];
  unreadCount: number;
  toasts: AdminToast[];
  notify: (
    title: string,
    description?: string,
    tone?: AdminToast["tone"]
  ) => void;
  dismissToast: (id: string) => void;
  refreshWorkspace: () => Promise<void>;
  signInAdmin: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOutAdmin: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Collection CRUD
  saveCollection: (input: CollectionSaveInput) => Promise<boolean>;
  deleteCollection: (id: string) => Promise<boolean>;

  // Product CRUD
  saveProduct: (input: ProductSaveInput) => Promise<boolean>;
  duplicateProduct: (id: string) => Promise<boolean>;
  updateProductStatus: (
    id: string,
    status: AdminProduct["status"]
  ) => Promise<boolean>;
  bulkUpdateProductStatus: (
    ids: string[],
    status: AdminProduct["status"]
  ) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  bulkDeleteProducts: (ids: string[]) => Promise<boolean>;
  restockVariant: (
    productId: string,
    variantId: string,
    addQty: number
  ) => Promise<boolean>;

  // OMS mutations
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    note?: string
  ) => Promise<boolean>;
  updatePaymentStatus: (
    orderId: string,
    paymentStatus: PaymentStatus,
    note?: string
  ) => Promise<boolean>;
  updateOrderTracking: (
    orderId: string,
    tracking: NonNullable<AdminOrder["tracking"]>
  ) => Promise<boolean>;
  addOrderNote: (orderId: string, note: string) => Promise<boolean>;
  processOrderRefundOrReturn: (
    orderId: string,
    payload: {
      amount: number;
      reason: string;
      type: "Refund" | "Return";
      restockItems: boolean;
    }
  ) => Promise<boolean>;

  // UMS / Users mutations
  saveCustomer: (
    input: Partial<AdminCustomer> & {
      id?: string;
      fullName: string;
      email: string;
      phone: string;
      role?: "customer" | "admin";
      password?: string;
      title?: string;
    }
  ) => Promise<boolean>;
  updateCustomerStatus: (
    customerId: string,
    status: CustomerStatus
  ) => Promise<boolean>;
  updateCustomerSegment: (
    customerId: string,
    segment: CustomerSegment
  ) => Promise<boolean>;
  updateUserRole: (
    userId: string,
    role: "customer" | "admin"
  ) => Promise<boolean>;

  // Settings mutations
  updateStoreSettings: (settings: AdminStoreSettings) => Promise<boolean>;
  updateOwnProfile: (patch: {
    fullName: string;
    phone: string;
    title: string;
  }) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signIn, signOut, refreshProfile } =
    useAuth();
  const { refreshStorefront } = useStore();

  const [workspace, setWorkspace] =
    useState<AdminWorkspaceState>(EMPTY_WORKSPACE);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (
      title: string,
      description?: string,
      tone: AdminToast["tone"] = "success"
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const authState: AdminContextValue["authState"] = useMemo(() => {
    if (!user) return "unauthenticated";
    if (user.role !== "admin") return "customer_denied";
    return "authenticated";
  }, [user]);

  const refreshWorkspace = useCallback(async () => {
    if (!user || user.role !== "admin") return;
    setWorkspaceLoading(true);
    setWorkspaceError(null);
    try {
      const res = await fetch("/api/admin/workspace", {
        method: "GET",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        setWorkspaceError(
          data?.error || "Unable to load admin workspace from database."
        );
        return;
      }
      const w = data.workspace as Partial<AdminWorkspaceState> | undefined;
      setWorkspace({
        settings: w?.settings ?? EMPTY_WORKSPACE.settings,
        collections: Array.isArray(w?.collections) ? w.collections : [],
        products: Array.isArray(w?.products) ? w.products : [],
        orders: Array.isArray(w?.orders) ? w.orders : [],
        customers: Array.isArray(w?.customers) ? w.customers : [],
        admins: Array.isArray(w?.admins) ? w.admins : [],
        activityLogs: Array.isArray(w?.activityLogs) ? w.activityLogs : [],
        visitorMetrics: Array.isArray(w?.visitorMetrics)
          ? w.visitorMetrics
          : [],
      });
    } catch {
      setWorkspaceError("Network error while connecting to admin API.");
    } finally {
      setWorkspaceLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    if (authState === "authenticated") {
      void Promise.resolve().then(() => {
        if (active) return refreshWorkspace();
      });
    } else if (authState === "unauthenticated") {
      void Promise.resolve().then(() => {
        if (!active) return;
        setWorkspace(EMPTY_WORKSPACE);
        setWorkspaceError(null);
      });
    }
    return () => {
      active = false;
    };
  }, [authState, refreshWorkspace]);

  const currentAdmin: AdminAccount | null = useMemo(() => {
    if (authState !== "authenticated" || !user) return null;
    const matched = workspace.admins.find((a) => a.id === user.id);
    return (
      matched ?? {
        id: user.id,
        fullName: user.full_name || user.email.split("@")[0] || "ORIIKO Admin",
        email: user.email,
        phone: user.phone || "",
        role: "admin",
        title: "Administrator",
        status: "Active",
        lastActiveAt: new Date().toISOString(),
        createdAt: user.created_at || new Date().toISOString(),
      }
    );
  }, [authState, user, workspace.admins]);

  const notifications = useMemo(
    () => buildAdminNotifications(workspace, readNotificationIds),
    [workspace, readNotificationIds]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const signInAdmin = useCallback(
    async (email: string, password: string) => {
      const res = await signIn(email, password);
      if (!res.error) {
        await refreshProfile();
      }
      return res;
    },
    [signIn, refreshProfile]
  );

  const signOutAdmin = useCallback(async () => {
    await signOut();
    setWorkspace(EMPTY_WORKSPACE);
    notify("Signed Out", "Admin session ended.", "info");
  }, [signOut, notify]);

  const markNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setReadNotificationIds(notifications.map((n) => n.id));
  }, [notifications]);

  // Helper to call mutation API and refresh workspace + storefront
  const mutateApi = useCallback(
    async (
      url: string,
      method: "POST" | "PATCH" | "DELETE",
      body: unknown,
      successTitle: string,
      successDesc?: string
    ): Promise<boolean> => {
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          notify(
            "Action Failed",
            data?.error || "Database rejected this request.",
            "error"
          );
          return false;
        }
        await Promise.all([refreshWorkspace(), refreshStorefront()]);
        notify(successTitle, successDesc, "success");
        return true;
      } catch {
        notify("Network Error", "Could not reach ORIIKO server.", "error");
        return false;
      }
    },
    [notify, refreshWorkspace, refreshStorefront]
  );

  // ---------------- COLLECTIONS ----------------
  const saveCollection = useCallback(
    (input: CollectionSaveInput) =>
      mutateApi(
        "/api/admin/collections",
        input.id ? "PATCH" : "POST",
        input,
        input.id ? "Collection Updated" : "Collection Created",
        `${input.name} saved to Storefront Collections.`
      ),
    [mutateApi]
  );

  const deleteCollection = useCallback(
    (id: string) =>
      mutateApi(
        "/api/admin/collections",
        "DELETE",
        { id },
        "Collection Deleted",
        "Collection removed from catalog taxonomy."
      ),
    [mutateApi]
  );

  // ---------------- PRODUCTS ----------------
  const saveProduct = useCallback(
    (input: ProductSaveInput) =>
      mutateApi(
        "/api/admin/products",
        input.id ? "PATCH" : "POST",
        input,
        input.id ? "Product Updated" : "Product Published",
        `${input.name} saved with ${input.variants.length} variant(s).`
      ),
    [mutateApi]
  );

  const duplicateProduct = useCallback(
    async (id: string) => {
      const source = workspace.products.find((p) => p.id === id);
      if (!source) return false;
      const suffix = Date.now().toString().slice(-4);
      const dupPayload: ProductSaveInput = {
        name: `${source.name} (Copy)`,
        slug: `${source.slug}-copy-${suffix}`,
        subtitle: source.subtitle,
        collection: source.collection,
        category: source.category,
        collectionIds: [...source.collectionIds],
        subcategory: source.subcategory,
        status: "Draft",
        price: source.price,
        compareAtPrice: source.compareAtPrice,
        costPrice: source.costPrice,
        sku: `${source.sku || "ORK"}-CPY-${suffix}`,
        lowStockThreshold: source.lowStockThreshold,
        isFeatured: false,
        isBestseller: false,
        isNewArrival: source.isNewArrival,
        promoLabel: source.promoLabel,
        description: source.description,
        details: [...source.details],
        materials: source.materials,
        care: source.care,
        media: source.media.map((m) => ({
          url: m.url,
          mediaType: m.mediaType,
          altText: m.altText,
          isPrimary: m.isPrimary,
        })),
        variants: source.variants.map((v, i) => ({
          ...v,
          id: "",
          sku: `${v.sku || source.sku || "ORK"}-${suffix}-${i + 1}`,
        })),
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
      };
      return mutateApi(
        "/api/admin/products",
        "POST",
        dupPayload,
        "Product Duplicated",
        `${dupPayload.name} created as Draft.`
      );
    },
    [workspace.products, mutateApi]
  );

  const updateProductStatus = useCallback(
    (id: string, status: AdminProduct["status"]) =>
      mutateApi(
        "/api/admin/products",
        "PATCH",
        { ids: [id], status },
        `Marked ${status}`,
        "Product visibility updated."
      ),
    [mutateApi]
  );

  const bulkUpdateProductStatus = useCallback(
    (ids: string[], status: AdminProduct["status"]) =>
      mutateApi(
        "/api/admin/products",
        "PATCH",
        { ids, status },
        "Bulk Update Complete",
        `${ids.length} product(s) marked ${status}.`
      ),
    [mutateApi]
  );

  const deleteProduct = useCallback(
    (id: string) =>
      mutateApi(
        "/api/admin/products",
        "DELETE",
        { ids: [id] },
        "Product Deleted",
        "Removed permanently from catalog."
      ),
    [mutateApi]
  );

  const bulkDeleteProducts = useCallback(
    (ids: string[]) =>
      mutateApi(
        "/api/admin/products",
        "DELETE",
        { ids },
        "Products Deleted",
        `${ids.length} product(s) removed permanently.`
      ),
    [mutateApi]
  );

  const restockVariant = useCallback(
    async (productId: string, variantId: string, addQty: number) => {
      const target = workspace.products.find((p) => p.id === productId);
      if (!target) return false;
      const nextVariants = target.variants.map((v) =>
        v.id === variantId
          ? {
              ...v,
              stock: Math.max(0, v.stock + addQty),
              inStock: Math.max(0, v.stock + addQty) > 0,
            }
          : v
      );
      return saveProduct({
        id: target.id,
        name: target.name,
        slug: target.slug,
        subtitle: target.subtitle,
        collection: target.collection,
        category: target.category,
        collectionIds: target.collectionIds,
        subcategory: target.subcategory,
        status: target.status,
        price: target.price,
        compareAtPrice: target.compareAtPrice,
        costPrice: target.costPrice,
        sku: target.sku,
        lowStockThreshold: target.lowStockThreshold,
        isFeatured: target.isFeatured,
        isBestseller: target.isBestseller,
        isNewArrival: target.isNewArrival,
        promoLabel: target.promoLabel,
        description: target.description,
        details: target.details,
        materials: target.materials,
        care: target.care,
        media: target.media,
        variants: nextVariants,
        seoTitle: target.seoTitle,
        seoDescription: target.seoDescription,
      });
    },
    [workspace.products, saveProduct]
  );

  // ---------------- ORDERS ----------------
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, note?: string) => {
      const order = workspace.orders.find((o) => o.id === orderId);
      if (!order) return false;
      const actor = currentAdmin?.fullName || "Admin";
      const nextActivities = [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor,
          action: `Status -> ${status}`,
          note,
        },
        ...(order.activities ?? []),
      ];
      return mutateApi(
        "/api/admin/orders",
        "PATCH",
        {
          id: orderId,
          status: status.toLowerCase(),
          activities: nextActivities,
          logDetail: `Status set to ${status}`,
        },
        "Order Status Updated",
        `${order.orderNumber} -> ${status}`
      );
    },
    [workspace.orders, currentAdmin, mutateApi]
  );

  const updatePaymentStatus = useCallback(
    async (orderId: string, paymentStatus: PaymentStatus, note?: string) => {
      const order = workspace.orders.find((o) => o.id === orderId);
      if (!order) return false;
      const actor = currentAdmin?.fullName || "Admin";
      const nextActivities = [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor,
          action: `Payment -> ${paymentStatus}`,
          note,
        },
        ...(order.activities ?? []),
      ];
      return mutateApi(
        "/api/admin/orders",
        "PATCH",
        {
          id: orderId,
          paymentStatus,
          activities: nextActivities,
          logDetail: `Payment status -> ${paymentStatus}`,
        },
        "Payment Updated",
        `${order.orderNumber} marked ${paymentStatus}.`
      );
    },
    [workspace.orders, currentAdmin, mutateApi]
  );

  const updateOrderTracking = useCallback(
    async (
      orderId: string,
      tracking: NonNullable<AdminOrder["tracking"]>
    ) => {
      const order = workspace.orders.find((o) => o.id === orderId);
      if (!order) return false;
      const actor = currentAdmin?.fullName || "Admin";
      const nextActivities = [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor,
          action: "Tracking details updated",
          note: `${tracking.courier} · ${tracking.trackingNumber}`,
        },
        ...(order.activities ?? []),
      ];
      return mutateApi(
        "/api/admin/orders",
        "PATCH",
        {
          id: orderId,
          tracking,
          activities: nextActivities,
          logDetail: `${tracking.courier} AWB ${tracking.trackingNumber}`,
        },
        "Tracking Saved",
        `${tracking.courier} (${tracking.trackingNumber})`
      );
    },
    [workspace.orders, currentAdmin, mutateApi]
  );

  const addOrderNote = useCallback(
    async (orderId: string, note: string) => {
      const order = workspace.orders.find((o) => o.id === orderId);
      if (!order) return false;
      const actor = currentAdmin?.fullName || "Admin";
      const nextActivities = [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor,
          action: "Internal note updated",
          note: note.trim(),
        },
        ...(order.activities ?? []),
      ];
      return mutateApi(
        "/api/admin/orders",
        "PATCH",
        {
          id: orderId,
          internalNotes: note,
          activities: nextActivities,
          logDetail: "Updated internal notes",
        },
        "Order Note Saved"
      );
    },
    [workspace.orders, currentAdmin, mutateApi]
  );

  const processOrderRefundOrReturn = useCallback(
    async (
      orderId: string,
      payload: {
        amount: number;
        reason: string;
        type: "Refund" | "Return";
        restockItems: boolean;
      }
    ) => {
      const order = workspace.orders.find((o) => o.id === orderId);
      if (!order) return false;
      const actor = currentAdmin?.fullName || "Admin";
      const refundRecord = {
        id: `ref-${Date.now()}`,
        amount: Math.max(0, Math.round(payload.amount)),
        reason: payload.reason.trim() || `${payload.type} processed`,
        type: payload.type,
        restockItems: payload.restockItems,
        createdAt: new Date().toISOString(),
        actor,
      };
      const nextRefunds = [...(order.refunds ?? []), refundRecord];
      const totalRefunded = nextRefunds.reduce((s, r) => s + r.amount, 0);
      const nextPayStatus: PaymentStatus =
        totalRefunded >= order.total ? "Refunded" : "Partially Refunded";
      const nextStatus = payload.type === "Return" ? "returned" : order.status.toLowerCase();
      const nextActivities = [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor,
          action: `${payload.type} ₹${refundRecord.amount}`,
          note: refundRecord.reason,
        },
        ...(order.activities ?? []),
      ];
      return mutateApi(
        "/api/admin/orders",
        "PATCH",
        {
          id: orderId,
          status: nextStatus,
          paymentStatus: nextPayStatus,
          refunds: nextRefunds,
          activities: nextActivities,
          logDetail: `${payload.type} ₹${refundRecord.amount}`,
        },
        `${payload.type} Recorded`,
        `₹${refundRecord.amount.toLocaleString("en-IN")} logged for ${order.orderNumber}.`
      );
    },
    [workspace.orders, currentAdmin, mutateApi]
  );

  // ---------------- USERS ----------------
  const saveCustomer = useCallback(
    (
      input: Partial<AdminCustomer> & {
        id?: string;
        fullName: string;
        email: string;
        phone: string;
        role?: "customer" | "admin";
        password?: string;
        title?: string;
      }
    ) =>
      mutateApi(
        "/api/admin/users",
        input.id ? "PATCH" : "POST",
        input,
        input.id ? "Account Updated" : "Account Created",
        `${input.fullName} saved.`
      ),
    [mutateApi]
  );

  const updateCustomerStatus = useCallback(
    (customerId: string, status: CustomerStatus) =>
      mutateApi(
        "/api/admin/users",
        "PATCH",
        { id: customerId, status },
        "Account Status Updated",
        `Account marked ${status}.`
      ),
    [mutateApi]
  );

  const updateCustomerSegment = useCallback(
    (customerId: string, segment: CustomerSegment) =>
      mutateApi(
        "/api/admin/users",
        "PATCH",
        { id: customerId, segment },
        "Segment Updated",
        `Assigned to ${segment}.`
      ),
    [mutateApi]
  );

  const updateUserRole = useCallback(
    (userId: string, role: "customer" | "admin") =>
      mutateApi(
        "/api/admin/users",
        "PATCH",
        { id: userId, role },
        "Role Updated",
        `User role changed to "${role}".`
      ),
    [mutateApi]
  );

  // ---------------- SETTINGS ----------------
  const updateStoreSettings = useCallback(
    (storeSettings: AdminStoreSettings) =>
      mutateApi(
        "/api/admin/settings",
        "PATCH",
        { storeSettings },
        "Storefront Settings Saved",
        "Delivery fee, threshold, and favicon updated across ORIIKO."
      ),
    [mutateApi]
  );

  const updateOwnProfile = useCallback(
    async (patch: { fullName: string; phone: string; title: string }) => {
      const ok = await mutateApi(
        "/api/admin/settings",
        "PATCH",
        { ownProfile: patch },
        "Profile Updated",
        "Your administrator details have been saved."
      );
      if (ok) await refreshProfile();
      return ok;
    },
    [mutateApi, refreshProfile]
  );

  return (
    <AdminContext.Provider
      value={{
        ready: !authLoading,
        authLoading,
        workspaceLoading,
        workspaceError,
        authState,
        currentAdmin,
        workspace,
        notifications,
        unreadCount,
        toasts,
        notify,
        dismissToast,
        refreshWorkspace,
        signInAdmin,
        signOutAdmin,
        markNotificationRead,
        markAllNotificationsRead,
        saveCollection,
        deleteCollection,
        saveProduct,
        duplicateProduct,
        updateProductStatus,
        bulkUpdateProductStatus,
        deleteProduct,
        bulkDeleteProducts,
        restockVariant,
        updateOrderStatus,
        updatePaymentStatus,
        updateOrderTracking,
        addOrderNote,
        processOrderRefundOrReturn,
        saveCustomer,
        updateCustomerStatus,
        updateCustomerSegment,
        updateUserRole,
        updateStoreSettings,
        updateOwnProfile,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return ctx;
}
