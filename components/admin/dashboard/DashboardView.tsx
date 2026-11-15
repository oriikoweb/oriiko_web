"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/lib/admin/context";
import {
  formatINR,
  formatShortDate,
  getLowStockVariants,
} from "@/lib/admin/repository";
import type { DateRangeKey } from "@/lib/admin/types";
import { IconArrowRight } from "@/components/ui/Icons";
import { IconAlertTriangle, IconImage } from "../ui/AdminIcons";
import { LoadingState, StatusBadge } from "../ui/AdminUI";

const RANGES: Array<{ key: DateRangeKey; label: string; days: number | null }> = [
  { key: "7D", label: "Last 7 Days", days: 7 },
  { key: "30D", label: "Last 30 Days", days: 30 },
  { key: "90D", label: "Last 90 Days", days: 90 },
  { key: "ALL", label: "All Time", days: null },
];

export function DashboardView() {
  const { workspace, workspaceLoading, restockVariant } = useAdmin();

  const [range, setRange] = useState<DateRangeKey>("30D");
  const [chartMetric, setChartMetric] = useState<"revenue" | "orders">(
    "revenue"
  );
  const [hoveredBucketIdx, setHoveredBucketIdx] = useState<number | null>(null);
  const [anchorNow] = useState(() => Date.now());

  const rangeDays = RANGES.find((r) => r.key === range)?.days ?? null;

  const cutoffMs = useMemo(() => {
    if (!rangeDays) return 0;
    return anchorNow - rangeDays * 24 * 60 * 60 * 1000;
  }, [rangeDays, anchorNow]);

  const filteredOrders = useMemo(
    () =>
      workspace.orders.filter((o) =>
        rangeDays ? new Date(o.createdAt).getTime() >= cutoffMs : true
      ),
    [workspace.orders, rangeDays, cutoffMs]
  );

  const filteredVisitors = useMemo(() => {
    if (!rangeDays) return workspace.visitorMetrics;
    return workspace.visitorMetrics.slice(-rangeDays);
  }, [workspace.visitorMetrics, rangeDays]);

  const kpis = useMemo(() => {
    const validOrders = filteredOrders.filter(
      (o) => o.status !== "Cancelled" && o.status !== "Returned"
    );
    const grossRevenue = validOrders.reduce((sum, o) => {
      const refunded = o.refunds.reduce((rs, r) => rs + r.amount, 0);
      return sum + Math.max(0, o.total - refunded);
    }, 0);
    const totalOrders = filteredOrders.length;
    const visitorsTotal = filteredVisitors.reduce(
      (sum, v) => sum + v.visitors,
      0
    );
    const aov =
      validOrders.length > 0 ? Math.round(grossRevenue / validOrders.length) : 0;
    const conversionRate =
      visitorsTotal > 0 ? ((totalOrders / visitorsTotal) * 100).toFixed(2) : "0.00";
    const deliveredCount = filteredOrders.filter(
      (o) => o.status === "Delivered"
    ).length;

    return {
      grossRevenue,
      totalOrders,
      validOrdersCount: validOrders.length,
      deliveredCount,
      visitorsTotal,
      conversionRate,
      aov,
    };
  }, [filteredOrders, filteredVisitors]);

  const chartBuckets = useMemo(() => {
    const bucketCount = range === "7D" ? 7 : range === "30D" ? 10 : 12;
    const daysSpan = rangeDays ?? 90;
    const now = anchorNow;
    const bucketDuration = (daysSpan * 24 * 60 * 60 * 1000) / bucketCount;

    return Array.from({ length: bucketCount }, (_, idx) => {
      const start = now - (bucketCount - idx) * bucketDuration;
      const end = start + bucketDuration;
      const startDate = new Date(start);
      const label = startDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

      const bucketOrders = filteredOrders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= start && (idx === bucketCount - 1 ? t <= now + 60000 : t < end);
      });

      const validBucketOrders = bucketOrders.filter(
        (o) => o.status !== "Cancelled" && o.status !== "Returned"
      );

      const actualRevenue = validBucketOrders.reduce(
        (s, o) => s + o.total,
        0
      );

      const visitorsInBucket = filteredVisitors
        .filter((v) => {
          const t = new Date(v.date).getTime();
          return t >= start && t <= end;
        })
        .reduce((s, v) => s + v.visitors, 0);

      return {
        label,
        revenue: actualRevenue,
        orders: bucketOrders.length,
        visitors: visitorsInBucket,
      };
    });
  }, [range, rangeDays, filteredOrders, filteredVisitors, anchorNow]);

  const maxChartValue = useMemo(() => {
    const values = chartBuckets.map((b) =>
      chartMetric === "revenue" ? b.revenue : b.orders
    );
    return Math.max(1, ...values);
  }, [chartBuckets, chartMetric]);

  const recentOrders = useMemo(
    () =>
      [...workspace.orders]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6),
    [workspace.orders]
  );

  const topSellingProducts = useMemo(() => {
    return [...workspace.products]
      .filter((p) => p.status !== "Archived")
      .sort((a, b) => b.salesCount * b.price - a.salesCount * a.price)
      .slice(0, 5);
  }, [workspace.products]);

  const lowStockAlerts = useMemo(
    () =>
      workspace.products.flatMap((product) =>
        getLowStockVariants(product).map((variant) => ({
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.name,
          sku: variant.sku,
          stock: variant.stock,
        }))
      ),
    [workspace.products]
  );

  if (
    workspaceLoading &&
    workspace.products.length === 0 &&
    workspace.orders.length === 0
  ) {
    return <LoadingState label="Syncing ORIIKO dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Date-Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#26231F] dark:text-[#F2F2F0]">
            ORIIKO Executive Overview
          </h1>
          <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 mt-0.5">
            Live revenue telemetry, storefront traffic, collections, and
            inventory health from PostgreSQL.
          </p>
        </div>

        <div
          className="inline-flex p-1 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04] self-start sm:self-auto"
          role="group"
          aria-label="Date range filter"
        >
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${
                range === r.key
                  ? "bg-[#591623] text-[#F2F2F0]"
                  : "text-[#26231F]/75 dark:text-[#F2F2F0]/75 hover:text-[#26231F] dark:hover:text-[#F2F2F0]"
              }`}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Primary KPI Cards (Strict 4 colors, zero gradients) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4 rounded-[6px] border border-[#591623]/25 dark:border-[#8C072B] bg-[#591623] text-[#F2F2F0]">
          <p className="text-[11px] uppercase tracking-wider text-[#F2F2F0]/75">
            Net Revenue ({range})
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">
            {formatINR(kpis.grossRevenue)}
          </p>
          <p className="mt-1.5 text-[11px] text-[#F2F2F0]/80">
            Across {kpis.validOrdersCount} active / fulfilled orders
          </p>
        </div>

        <div className="p-4 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04]">
          <p className="text-[11px] uppercase tracking-wider text-[#26231F]/65 dark:text-[#F2F2F0]/65">
            Total Orders ({range})
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#26231F] dark:text-[#F2F2F0]">
            {kpis.totalOrders}
          </p>
          <p className="mt-1.5 text-[11px] text-[#591623] dark:text-[#F2F2F0]/80 font-medium">
            {kpis.deliveredCount} delivered •{" "}
            {filteredOrders.filter((o) => o.status === "Pending").length}{" "}
            pending verification
          </p>
        </div>

        <div className="p-4 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04]">
          <p className="text-[11px] uppercase tracking-wider text-[#26231F]/65 dark:text-[#F2F2F0]/65">
            Website Visitors ({range})
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#26231F] dark:text-[#F2F2F0]">
            {kpis.visitorsTotal.toLocaleString("en-IN")}
          </p>
          <p className="mt-1.5 text-[11px] text-[#26231F]/70 dark:text-[#F2F2F0]/70">
            Storefront conversion:{" "}
            <strong className="text-[#8C072B] dark:text-[#F2F2F0]">
              {kpis.conversionRate}%
            </strong>
          </p>
        </div>

        <div className="p-4 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04]">
          <p className="text-[11px] uppercase tracking-wider text-[#26231F]/65 dark:text-[#F2F2F0]/65">
            Average Order Value
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#26231F] dark:text-[#F2F2F0]">
            {formatINR(kpis.aov)}
          </p>
          <p className="mt-1.5 text-[11px] text-[#26231F]/70 dark:text-[#F2F2F0]/70">
            Free shipping over{" "}
            {formatINR(workspace.settings.freeShippingThreshold)}
          </p>
        </div>
      </div>

      {/* Revenue & Order Chart + Low-Stock Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 p-5 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                {chartMetric === "revenue"
                  ? "Revenue Trajectory (INR)"
                  : "Order Volume Breakdown"}
              </h2>
              <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                Hover bars for period revenue and order count
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.05]">
              <button
                type="button"
                onClick={() => setChartMetric("revenue")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-[3px] transition-colors ${
                  chartMetric === "revenue"
                    ? "bg-[#591623] text-[#F2F2F0]"
                    : "text-[#26231F]/75 dark:text-[#F2F2F0]/75 hover:text-[#26231F] dark:hover:text-[#F2F2F0]"
                }`}
              >
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("orders")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-[3px] transition-colors ${
                  chartMetric === "orders"
                    ? "bg-[#8C072B] text-[#F2F2F0]"
                    : "text-[#26231F]/75 dark:text-[#F2F2F0]/75 hover:text-[#26231F] dark:hover:text-[#F2F2F0]"
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          <div className="h-56 flex items-end gap-2 sm:gap-3 pt-8 pb-1 border-b border-[#26231F]/15 dark:border-[#F2F2F0]/15 relative">
            {chartBuckets.map((bucket, idx) => {
              const rawVal =
                chartMetric === "revenue" ? bucket.revenue : bucket.orders;
              const pct = Math.max(
                rawVal > 0 ? 10 : 3,
                Math.round((rawVal / maxChartValue) * 100)
              );
              const isHovered = hoveredBucketIdx === idx;
              return (
                <div
                  key={`${bucket.label}-${idx}`}
                  onMouseEnter={() => setHoveredBucketIdx(idx)}
                  onMouseLeave={() => setHoveredBucketIdx(null)}
                  className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                >
                  {isHovered && (
                    <div className="absolute -top-7 z-10 px-2.5 py-1.5 rounded-[4px] bg-[#26231F] dark:bg-[#F2F2F0] text-[#F2F2F0] dark:text-[#26231F] text-[10px] whitespace-nowrap shadow-md pointer-events-none">
                      <span className="font-semibold">{bucket.label}:</span>{" "}
                      {formatINR(bucket.revenue)} ({bucket.orders} orders)
                    </div>
                  )}
                  <div
                    style={{ height: `${pct}%` }}
                    className={`w-full max-w-[38px] rounded-t-[4px] transition-all duration-200 ${
                      chartMetric === "revenue"
                        ? isHovered
                          ? "bg-[#8C072B]"
                          : "bg-[#591623]"
                        : isHovered
                        ? "bg-[#591623]"
                        : "bg-[#8C072B]"
                    } ${rawVal === 0 ? "opacity-20" : "opacity-100"}`}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 text-[10px] text-[#26231F]/65 dark:text-[#F2F2F0]/65 overflow-x-auto">
            {chartBuckets.map((b, i) => (
              <span
                key={`${b.label}-${i}`}
                className="flex-1 text-center truncate"
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Low-Stock Alerts */}
        <div className="xl:col-span-4 p-5 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-[4px] bg-[#8C072B]/12 dark:bg-[#8C072B]/35 text-[#8C072B] dark:text-[#F2F2F0] flex items-center justify-center">
                <IconAlertTriangle className="w-3.5 h-3.5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                  Low-Stock Alerts
                </h2>
                <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                  {lowStockAlerts.length} variant SKUs at or below threshold
                </p>
              </div>
            </div>
            <Link
              href="/admin/products"
              className="text-[11px] font-medium text-[#591623] dark:text-[#F2F2F0] hover:text-[#8C072B] dark:hover:text-[#F2F2F0]/75"
            >
              Catalog
            </Link>
          </div>

          <div className="mt-3 flex-1 space-y-2 max-h-64 overflow-y-auto pr-1">
            {lowStockAlerts.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                All active product variants have healthy stock coverage.
              </p>
            ) : (
              lowStockAlerts.map((alert) => (
                <div
                  key={alert.variantId}
                  className="p-2.5 rounded-[4px] border border-[#26231F]/12 dark:border-[#F2F2F0]/12 bg-[#26231F]/[0.02] dark:bg-[#F2F2F0]/[0.03] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products?focus=${encodeURIComponent(
                        alert.productId
                      )}`}
                      className="font-semibold text-[#26231F] dark:text-[#F2F2F0] hover:text-[#591623] dark:hover:text-[#F2F2F0]/75 truncate block"
                    >
                      {alert.productName}
                    </Link>
                    <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65 truncate">
                      {alert.variantName} •{" "}
                      <span className="font-mono">{alert.sku}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge
                      label={
                        alert.stock === 0 ? "0 left" : `${alert.stock} left`
                      }
                      tone={
                        alert.stock === 0 ? "solid-secondary" : "soft-secondary"
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        restockVariant(alert.productId, alert.variantId, 10)
                      }
                      title="Add 10 units"
                      className="px-2 py-1 text-[10px] font-medium rounded-[4px] border border-[#591623] dark:border-[#F2F2F0]/35 text-[#591623] dark:text-[#F2F2F0] hover:bg-[#591623] hover:text-[#F2F2F0] dark:hover:border-[#591623] transition-colors"
                    >
                      +10
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders + Top-Selling Products */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[6px] bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0]">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#591623] dark:text-[#F2F2F0] hover:text-[#8C072B] dark:hover:text-[#F2F2F0]/75"
            >
              Open OMS
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#26231F]/60 dark:text-[#F2F2F0]/60">
              No customer orders recorded in PostgreSQL yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.05] border-b border-[#26231F]/10 dark:border-[#F2F2F0]/10 text-[11px] text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                  <tr>
                    <th className="py-2.5 pl-5 pr-3 font-medium">Order</th>
                    <th className="py-2.5 px-3 font-medium">Customer</th>
                    <th className="py-2.5 px-3 font-medium">Status</th>
                    <th className="py-2.5 px-3 font-medium">Date</th>
                    <th className="py-2.5 pl-3 pr-5 text-right font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#26231F]/[0.025] dark:hover:bg-[#F2F2F0]/[0.04] transition-colors"
                    >
                      <td className="py-2.5 pl-5 pr-3 font-semibold">
                        <Link
                          href={`/admin/orders?focus=${encodeURIComponent(
                            order.id
                          )}`}
                          className="text-[#591623] dark:text-[#F2F2F0] hover:text-[#8C072B] dark:hover:text-[#F2F2F0]/75"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-[#26231F] dark:text-[#F2F2F0] truncate max-w-[150px]">
                        {order.customerName}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge label={order.status} />
                      </td>
                      <td className="py-2.5 px-3 text-[#26231F]/65 dark:text-[#F2F2F0]/65 whitespace-nowrap">
                        {formatShortDate(order.createdAt)}
                      </td>
                      <td className="py-2.5 pl-3 pr-5 text-right font-semibold">
                        {formatINR(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top-Selling Products */}
        <div className="xl:col-span-5 border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[6px] bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0]">
              Top-Selling Products
            </h2>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#591623] dark:text-[#F2F2F0] hover:text-[#8C072B] dark:hover:text-[#F2F2F0]/75"
            >
              All Products
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {topSellingProducts.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#26231F]/60 dark:text-[#F2F2F0]/60">
              No active products in catalog yet.
            </p>
          ) : (
            <div className="divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
              {topSellingProducts.map((product, idx) => {
                const estRevenue = product.salesCount * product.price;
                return (
                  <Link
                    key={product.id}
                    href={`/admin/products?focus=${encodeURIComponent(
                      product.id
                    )}`}
                    className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#26231F]/[0.025] dark:hover:bg-[#F2F2F0]/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-[#591623] dark:text-[#F2F2F0]/80 font-semibold w-4">
                        {idx + 1}.
                      </span>
                      {product.primaryImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.primaryImage}
                          alt={product.name}
                          className="w-9 h-10 object-cover rounded-[4px] border border-[#26231F]/12 dark:border-[#F2F2F0]/15 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-10 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 flex items-center justify-center shrink-0">
                          <IconImage className="w-4 h-4 opacity-40" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#26231F] dark:text-[#F2F2F0] truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                          {product.salesCount} units sold •{" "}
                          {formatINR(product.price)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#591623] dark:text-[#F2F2F0] shrink-0">
                      {formatINR(estRevenue)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
