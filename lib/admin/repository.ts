import type {
  AdminCustomer,
  AdminNotification,
  AdminOrder,
  AdminProduct,
  AdminWorkspaceState,
} from "./types";

export const EMPTY_WORKSPACE: AdminWorkspaceState = {
  settings: {
    deliveryCharge: 149,
    freeShippingThreshold: 2999,
    faviconUrl: null,
    heroVideoUrl: null,
  },
  collections: [],
  products: [],
  orders: [],
  customers: [],
  admins: [],
  activityLogs: [],
  visitorMetrics: [],
};

export function formatINR(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: safe % 1 === 0 ? 0 : 2,
  }).format(safe);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getProductTotalStock(product: AdminProduct): number {
  return (product.variants ?? []).reduce((sum, v) => sum + (v.stock || 0), 0);
}

export function getLowStockVariants(product: AdminProduct) {
  return (product.variants ?? []).filter(
    (v) => v.stock <= product.lowStockThreshold
  );
}

export function getCustomerOrderSummary(
  customer: AdminCustomer,
  orders: AdminOrder[]
) {
  const customerOrders = orders.filter(
    (o) =>
      o.customerId === customer.id ||
      (customer.email &&
        o.customerEmail.toLowerCase() === customer.email.toLowerCase())
  );
  const validOrders = customerOrders.filter(
    (o) => o.status !== "Cancelled" && o.status !== "Returned"
  );
  const lifetimeSpent = validOrders.reduce((sum, o) => {
    const refunded = (o.refunds ?? []).reduce((rSum, r) => rSum + r.amount, 0);
    return sum + Math.max(0, o.total - refunded);
  }, 0);
  const lastOrder = [...customerOrders].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  return {
    orderCount: customerOrders.length,
    lifetimeSpent,
    lastOrderAt: lastOrder?.createdAt,
    orders: customerOrders,
  };
}

export function buildAdminNotifications(
  state: AdminWorkspaceState,
  readIds: string[] = []
): AdminNotification[] {
  const readSet = new Set(readIds);
  const items: AdminNotification[] = [];

  for (const order of state.orders) {
    if (order.status === "Pending") {
      const id = `notif-order-${order.id}`;
      items.push({
        id,
        title: `New order ${order.orderNumber} awaiting confirmation`,
        description: `${order.customerName} · ${formatINR(order.total)} via ${order.paymentMethod}`,
        module: "orders",
        targetId: order.id,
        severity: "attention",
        timestamp: order.createdAt,
        read: readSet.has(id),
      });
    }
  }

  for (const product of state.products) {
    if (product.status === "Archived") continue;
    const lowVariants = getLowStockVariants(product);
    if (lowVariants.length > 0) {
      const id = `notif-stock-${product.id}`;
      const minStock = Math.min(...lowVariants.map((v) => v.stock));
      items.push({
        id,
        title:
          minStock === 0
            ? `Out of stock variant: ${product.name}`
            : `Low stock alert: ${product.name}`,
        description: `${lowVariants.length} variant(s) at or below ${product.lowStockThreshold} units`,
        module: "products",
        targetId: product.id,
        severity: "attention",
        timestamp: product.updatedAt,
        read: readSet.has(id),
      });
    }
  }

  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function downloadCSV(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>
): void {
  if (typeof window === "undefined") return;
  const escape = (val: string | number) => {
    const str = String(val ?? "");
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
