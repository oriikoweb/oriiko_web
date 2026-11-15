"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdmin } from "@/lib/admin/context";
import { formatINR, formatShortDate } from "@/lib/admin/repository";
import type { OrderStatus, PaymentStatus } from "@/lib/admin/types";
import { IconSearch } from "@/components/ui/Icons";
import { IconPrinter, IconSort } from "../ui/AdminIcons";
import {
  EmptyState,
  LoadingState,
  Pagination,
  StatusBadge,
} from "../ui/AdminUI";
import { InvoicePackingSlipModal } from "./InvoicePackingSlipModal";
import { OrderDetailDrawer } from "./OrderDetailDrawer";

type SortKey = "createdAt" | "total" | "orderNumber" | "status";
const PAGE_SIZE = 7;

const ORDER_STATUSES: Array<"ALL" | OrderStatus> = [
  "ALL",
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];

export function OrdersView() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");

  const { workspace, workspaceLoading } = useAdmin();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | PaymentStatus>(
    "ALL"
  );
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [closedFocusId, setClosedFocusId] = useState<string | null>(null);
  const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);

  const activeOrderId =
    selectedOrderId ??
    (focusId && focusId !== closedFocusId ? focusId : null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workspace.orders
      .filter((o) => {
        if (q) {
          const hit =
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.customerEmail.toLowerCase().includes(q) ||
            (o.tracking?.trackingNumber || "").toLowerCase().includes(q) ||
            o.items.some((i) => i.productName.toLowerCase().includes(q));
          if (!hit) return false;
        }
        if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
        if (paymentFilter !== "ALL" && o.paymentStatus !== paymentFilter)
          return false;
        return true;
      })
      .sort((a, b) => {
        const mult = sortDir === "asc" ? 1 : -1;
        switch (sortBy) {
          case "total":
            return (a.total - b.total) * mult;
          case "orderNumber":
            return a.orderNumber.localeCompare(b.orderNumber) * mult;
          case "status":
            return a.status.localeCompare(b.status) * mult;
          case "createdAt":
          default:
            return a.createdAt.localeCompare(b.createdAt) * mult;
        }
      });
  }, [workspace.orders, query, statusFilter, paymentFilter, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () =>
      filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const activeOrder =
    workspace.orders.find((o) => o.id === activeOrderId) ?? null;
  const invoiceOrder =
    workspace.orders.find((o) => o.id === invoiceOrderId) ?? null;

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  if (workspaceLoading && workspace.orders.length === 0) {
    return <LoadingState label="Loading orders from PostgreSQL..." />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#26231F] dark:text-[#F2F2F0]">
            Order Management System (OMS)
          </h1>
          <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 mt-0.5">
            Track fulfilment, courier AWB, GST invoices, COD verification, and
            returns across {workspace.orders.length} live database orders.
          </p>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {ORDER_STATUSES.map((st) => {
          const count =
            st === "ALL"
              ? workspace.orders.length
              : workspace.orders.filter((o) => o.status === st).length;
          const active = statusFilter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] border transition-colors ${
                active
                  ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                  : "bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] text-[#26231F]/80 dark:text-[#F2F2F0]/80 border-[#26231F]/15 dark:border-[#F2F2F0]/15 hover:border-[#591623] dark:hover:border-[#F2F2F0]/40"
              }`}
            >
              {st === "ALL" ? "All Orders" : st}{" "}
              <span className="opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search + Payment Filter */}
      <div className="p-3.5 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.02] dark:bg-[#F2F2F0]/[0.04] grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-8 relative">
          <IconSearch className="w-3.5 h-3.5 text-[#26231F]/55 dark:text-[#F2F2F0]/55 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order #, customer name, email, garment, or AWB tracking..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as "ALL" | PaymentStatus);
              setPage(1);
            }}
            aria-label="Filter by payment status"
            className="w-full px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          >
            <option value="ALL">All Payment States</option>
            <option value="Paid">Paid</option>
            <option value="COD Pending">COD Pending</option>
            <option value="Pending">Pending</option>
            <option value="Partially Refunded">Partially Refunded</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={
            workspace.orders.length === 0
              ? "Orders placed on the ORIIKO storefront will appear here automatically."
              : "Clear search or status filters to view all customer orders."
          }
          action={
            workspace.orders.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("ALL");
                  setPaymentFilter("ALL");
                }}
                className="px-3.5 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10"
              >
                Reset Filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[6px] bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#26231F]/[0.04] dark:bg-[#F2F2F0]/[0.05] border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 text-[11px] uppercase tracking-wider text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                <tr>
                  <th className="py-3 pl-4 pr-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("orderNumber")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Order <IconSort />
                    </button>
                  </th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("createdAt")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Date <IconSort />
                    </button>
                  </th>
                  <th className="py-3 px-3 font-semibold">Customer</th>
                  <th className="py-3 px-3 font-semibold">Items &amp; Tracking</th>
                  <th className="py-3 px-3 font-semibold">Payment</th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("status")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Fulfilment <IconSort />
                    </button>
                  </th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("total")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Total <IconSort />
                    </button>
                  </th>
                  <th className="py-3 pl-3 pr-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
                {paginated.map((order) => {
                  const unitCount = order.items.reduce(
                    (s, i) => s + i.quantity,
                    0
                  );
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#26231F]/[0.025] dark:hover:bg-[#F2F2F0]/[0.04] transition-colors"
                    >
                      <td className="py-3 pl-4 pr-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(order.id)}
                          className="font-semibold text-[#591623] dark:text-[#F2F2F0] hover:text-[#8C072B] dark:hover:text-[#F2F2F0]/75"
                        >
                          {order.orderNumber}
                        </button>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[#26231F]/75 dark:text-[#F2F2F0]/75">
                        {formatShortDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-3 min-w-[170px]">
                        <p className="font-medium text-[#26231F] dark:text-[#F2F2F0] truncate">
                          {order.customerName}
                        </p>
                        <p className="text-[11px] text-[#26231F]/60 dark:text-[#F2F2F0]/60 truncate">
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}
                        </p>
                      </td>
                      <td className="py-3 px-3 min-w-[180px]">
                        <p className="text-[#26231F] dark:text-[#F2F2F0] truncate max-w-[200px]">
                          {unitCount} item{unitCount === 1 ? "" : "s"}
                          {order.items[0]?.productName
                            ? ` — ${order.items[0].productName}`
                            : ""}
                        </p>
                        <p className="text-[11px] font-mono text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                          {order.tracking?.trackingNumber
                            ? `${order.tracking.courier} • ${order.tracking.trackingNumber}`
                            : "Awaiting AWB assignment"}
                        </p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge label={order.paymentStatus} />
                          <span className="text-[10px] text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge label={order.status} />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                        {formatINR(order.total)}
                      </td>
                      <td className="py-3 pl-3 pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Invoice & Packing Slip"
                            onClick={() => setInvoiceOrderId(order.id)}
                            className="p-1.5 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/20 text-[#26231F]/75 dark:text-[#F2F2F0]/75 hover:text-[#591623] dark:hover:text-[#F2F2F0] hover:border-[#591623] dark:hover:border-[#F2F2F0]"
                          >
                            <IconPrinter className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(order.id)}
                            className="px-2.5 py-1.5 text-[11px] font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B]"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      <OrderDetailDrawer
        key={activeOrder?.id || "closed"}
        order={activeOrder}
        open={Boolean(activeOrder)}
        onClose={() => {
          setSelectedOrderId(null);
          if (focusId) setClosedFocusId(focusId);
        }}
      />

      <InvoicePackingSlipModal
        open={Boolean(invoiceOrder)}
        order={invoiceOrder}
        onClose={() => setInvoiceOrderId(null)}
      />
    </div>
  );
}
