import type { CloudinaryMediaItem } from "@/lib/media/cloudinary";

export type ProductStatus = "Draft" | "Active" | "Archived";

export interface AdminProductVariant {
  id: string;
  name: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  stock: number;
  inStock: boolean;
}

export interface AdminCollection {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImage: string;
  season: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  collection: string;
  category: string;
  collectionIds: string[];
  subcategory: string;
  status: ProductStatus;
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
  primaryImage: string;
  secondaryImage: string;
  media: CloudinaryMediaItem[];
  variants: AdminProductVariant[];
  seoTitle: string;
  seoDescription: string;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "COD Pending"
  | "Partially Refunded"
  | "Refunded";

export type PaymentMethod = "UPI" | "Card" | "NetBanking" | "COD";

export interface OrderAddressSnapshot {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderActivity {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

export interface OrderRefundRecord {
  id: string;
  amount: number;
  reason: string;
  type: "Refund" | "Return";
  restockItems: boolean;
  createdAt: string;
  actor: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  shippingAddress: OrderAddressSnapshot;
  billingAddress: OrderAddressSnapshot;
  tracking?: {
    courier: string;
    trackingNumber: string;
    trackingUrl?: string;
  };
  internalNotes: string;
  refunds: OrderRefundRecord[];
  activities: OrderActivity[];
  createdAt: string;
  updatedAt: string;
}

export type CustomerStatus = "Active" | "Blocked" | "VIP";

export type CustomerSegment =
  | "VIP Collectors"
  | "Repeat Buyers"
  | "First-Time"
  | "Dormant / At-Risk"
  | "Subscribers";

export interface CustomerAddress {
  id: string;
  label: string;
  type: "Shipping" | "Billing";
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  status: CustomerStatus;
  segment: CustomerSegment;
  emailOptIn: boolean;
  tags: string[];
  notes: string;
  addresses: CustomerAddress[];
  joinedAt: string;
  lastActiveAt?: string;
}

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "admin";
  title: string;
  status: "Active" | "Suspended";
  lastActiveAt: string;
  createdAt: string;
}

export interface AdminStoreSettings {
  deliveryCharge: number;
  freeShippingThreshold: number;
  faviconUrl: string | null;
  heroVideoUrl?: string | null;
  updatedAt?: string;
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  module: string;
  action: string;
  target: string;
  details: string;
}

export type DateRangeKey = "7D" | "30D" | "90D" | "ALL";

export interface VisitorDailyMetric {
  date: string;
  label: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  newSignups?: number;
}

export type ModuleKey =
  | "dashboard"
  | "products"
  | "collections"
  | "orders"
  | "users"
  | "settings";

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  module: ModuleKey;
  targetId?: string;
  severity: "info" | "attention";
  timestamp: string;
  read: boolean;
}

export interface AdminWorkspaceState {
  settings: AdminStoreSettings;
  collections: AdminCollection[];
  products: AdminProduct[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  admins: AdminAccount[];
  activityLogs: AdminActivityLog[];
  visitorMetrics: VisitorDailyMetric[];
}
