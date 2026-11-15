"use client";

import React, { useState } from "react";
import { useAdmin } from "@/lib/admin/context";
import { formatDateTime, formatINR } from "@/lib/admin/repository";
import type {
  AdminOrder,
  OrderStatus,
  PaymentStatus,
} from "@/lib/admin/types";
import { IconImage, IconPrinter } from "../ui/AdminIcons";
import { AdminDrawer, ConfirmDialog, StatusBadge } from "../ui/AdminUI";
import { InvoicePackingSlipModal } from "./InvoicePackingSlipModal";

const ALL_ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "Pending",
  "Paid",
  "COD Pending",
  "Partially Refunded",
  "Refunded",
];

export function OrderDetailDrawer({
  order,
  open,
  onClose,
}: {
  order: AdminOrder | null;
  open: boolean;
  onClose: () => void;
}) {
  const {
    updateOrderStatus,
    updatePaymentStatus,
    updateOrderTracking,
    addOrderNote,
    processOrderRefundOrReturn,
  } = useAdmin();

  const initialRefunded =
    order?.refunds.reduce((s, r) => s + r.amount, 0) ?? 0;

  const [courier, setCourier] = useState(
    order?.tracking?.courier || "BlueDart Express"
  );
  const [trackingNumber, setTrackingNumber] = useState(
    order?.tracking?.trackingNumber || ""
  );
  const [trackingUrl, setTrackingUrl] = useState(
    order?.tracking?.trackingUrl || ""
  );
  const [noteInput, setNoteInput] = useState("");

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundType, setRefundType] = useState<"Refund" | "Return">(
    "Return"
  );
  const [refundAmount, setRefundAmount] = useState(
    order ? String(Math.max(0, order.total - initialRefunded)) : ""
  );
  const [refundReason, setRefundReason] = useState("");
  const [restockItems, setRestockItems] = useState(true);

  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  if (!order) return null;

  const alreadyRefunded = order.refunds.reduce((s, r) => s + r.amount, 0);
  const refundableRemaining = Math.max(0, order.total - alreadyRefunded);
  const includedGst = Math.round((order.total * 12) / 112);

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOrderTracking(order.id, {
      courier: courier.trim() || "BlueDart Express",
      trackingNumber: trackingNumber.trim(),
      trackingUrl: trackingUrl.trim() || undefined,
    });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    await addOrderNote(order.id, noteInput.trim());
    setNoteInput("");
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(refundAmount) || 0;
    if (numeric <= 0 || !refundReason.trim()) return;
    await processOrderRefundOrReturn(order.id, {
      amount: numeric,
      reason: refundReason.trim(),
      type: refundType,
      restockItems,
    });
    setRefundOpen(false);
  };

  return (
    <>
      <AdminDrawer
        open={open}
        onClose={onClose}
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed ${formatDateTime(order.createdAt)} • ${order.paymentMethod}`}
        widthClass="max-w-3xl"
        headerActions={
          <button
            type="button"
            onClick={() => setInvoiceOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] border border-[#591623] dark:border-[#F2F2F0]/30 text-[#591623] dark:text-[#F2F2F0] hover:bg-[#591623] hover:text-[#F2F2F0] transition-colors"
          >
            <IconPrinter className="w-3.5 h-3.5" />
            Invoice / Packing Slip
          </button>
        }
      >
        {/* Top Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04]">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80 mb-1.5">
              Fulfilment Status
            </label>
            <div className="flex items-center gap-2">
              <select
                value={order.status}
                onChange={(e) => {
                  const next = e.target.value as OrderStatus;
                  if (next === "Cancelled") {
                    setCancelConfirmOpen(true);
                  } else {
                    updateOrderStatus(order.id, next);
                  }
                }}
                className="flex-1 px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
              >
                {ALL_ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <StatusBadge label={order.status} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80 mb-1.5">
              Payment Status
            </label>
            <div className="flex items-center gap-2">
              <select
                value={order.paymentStatus}
                onChange={(e) =>
                  updatePaymentStatus(
                    order.id,
                    e.target.value as PaymentStatus
                  )
                }
                className="flex-1 px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
              >
                {PAYMENT_STATUSES.map((ps) => (
                  <option key={ps} value={ps}>
                    {ps}
                  </option>
                ))}
              </select>
              <StatusBadge label={order.paymentStatus} />
            </div>
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div className="p-3.5 rounded-[5px] border border-[#26231F]/12 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#26231F]/70 dark:text-[#F2F2F0]/70 mb-2.5">
            Fulfilment Pipeline
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {(
              [
                "Pending",
                "Confirmed",
                "Processing",
                "Packed",
                "Shipped",
                "Delivered",
              ] as OrderStatus[]
            ).map((step, idx) => {
              const pipelineOrder = [
                "Pending",
                "Confirmed",
                "Processing",
                "Packed",
                "Shipped",
                "Delivered",
              ];
              const currentIdx = pipelineOrder.indexOf(order.status);
              const reached =
                currentIdx >= idx &&
                order.status !== "Cancelled" &&
                order.status !== "Returned";
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => updateOrderStatus(order.id, step)}
                  className={`py-1.5 px-2 rounded-[4px] text-[11px] font-medium border text-center transition-colors ${
                    reached
                      ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                      : "bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04] text-[#26231F]/65 dark:text-[#F2F2F0]/70 border-[#26231F]/15 dark:border-[#F2F2F0]/15 hover:border-[#591623] dark:hover:border-[#F2F2F0]/40"
                  }`}
                >
                  {step}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-[5px] border border-[#26231F]/12 dark:border-[#F2F2F0]/15">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80 mb-1.5">
              Customer Details
            </p>
            <p className="text-xs font-semibold text-[#26231F] dark:text-[#F2F2F0]">
              {order.customerName}
            </p>
            <p className="text-xs text-[#26231F]/75 dark:text-[#F2F2F0]/75 mt-0.5">
              {order.customerEmail}
            </p>
            <p className="text-xs text-[#26231F]/75 dark:text-[#F2F2F0]/75">
              {order.customerPhone}
            </p>
            {order.paymentReference && (
              <p className="mt-2 text-[11px] font-mono text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                Ref: {order.paymentReference}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-[5px] border border-[#26231F]/12 dark:border-[#F2F2F0]/15">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80 mb-1.5">
              Shipping Destination
            </p>
            <p className="text-xs font-semibold text-[#26231F] dark:text-[#F2F2F0]">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-xs text-[#26231F]/75 dark:text-[#F2F2F0]/75 mt-0.5">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2
                ? `, ${order.shippingAddress.line2}`
                : ""}
            </p>
            <p className="text-xs text-[#26231F]/75 dark:text-[#F2F2F0]/75">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        {/* Ordered Items & Pricing Breakdown */}
        <div className="border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[5px] overflow-hidden">
          <div className="px-3.5 py-2.5 bg-[#26231F]/[0.04] dark:bg-[#F2F2F0]/[0.05] border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#26231F] dark:text-[#F2F2F0]">
              Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </span>
            <span className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
              INR Inclusive Tax
            </span>
          </div>
          <div className="divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-10 h-12 object-cover rounded-[4px] border border-[#26231F]/12 dark:border-[#F2F2F0]/15 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-12 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 flex items-center justify-center shrink-0">
                      <IconImage className="w-4 h-4 opacity-40" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-[#26231F] dark:text-[#F2F2F0] truncate">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                      {item.variantName} •{" "}
                      <span className="font-mono">{item.sku}</span>
                    </p>
                    <p className="text-[11px] text-[#26231F]/70 dark:text-[#F2F2F0]/70 mt-0.5">
                      {formatINR(item.unitPrice)} &times; {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-[#26231F] dark:text-[#F2F2F0] shrink-0">
                  {formatINR(item.lineTotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3.5 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04] border-t border-[#26231F]/12 dark:border-[#F2F2F0]/12 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                Subtotal
              </span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-[#8C072B] dark:text-[#F2F2F0]">
                <span>Discount</span>
                <span>-{formatINR(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                Shipping
              </span>
              <span>
                {order.shippingAmount === 0
                  ? "Free"
                  : formatINR(order.shippingAmount)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
              <span>Included GST (12%)</span>
              <span>{formatINR(includedGst)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#26231F]/12 dark:border-[#F2F2F0]/12 text-sm font-bold text-[#591623] dark:text-[#F2F2F0]">
              <span>Order Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
            {alreadyRefunded > 0 && (
              <div className="flex justify-between text-xs font-semibold text-[#8C072B] dark:text-[#F2F2F0]/80">
                <span>Total Refunded</span>
                <span>-{formatINR(alreadyRefunded)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping & Tracking Management */}
        <form
          onSubmit={handleSaveShipping}
          className="p-3.5 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80">
              Shipping &amp; Courier Tracking
            </p>
            {order.tracking?.trackingNumber && (
              <span className="text-[11px] font-mono text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                AWB: {order.tracking.trackingNumber}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            >
              <option value="BlueDart Express">BlueDart Express</option>
              <option value="Delhivery Air">Delhivery Air</option>
              <option value="Delhivery Surface">Delhivery Surface</option>
              <option value="Xpressbees">Xpressbees</option>
              <option value="Ecom Express">Ecom Express</option>
            </select>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="AWB Tracking Number"
              className="px-2.5 py-2 text-xs font-mono bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            />
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="Tracking URL (optional)"
              className="px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B]"
            >
              Save Tracking Info
            </button>
            {order.status !== "Cancelled" && (
              <button
                type="button"
                onClick={() => setCancelConfirmOpen(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-[4px] border border-[#8C072B] text-[#8C072B] dark:bg-[#8C072B] dark:text-[#F2F2F0] hover:bg-[#8C072B] hover:text-[#F2F2F0] dark:hover:bg-[#591623] transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </form>

        {/* Refund & Return Section */}
        <div className="p-3.5 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80">
                Refunds &amp; Returns
              </p>
              <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                Refundable balance: {formatINR(refundableRemaining)}
              </p>
            </div>
            {refundableRemaining > 0 && !refundOpen && (
              <button
                type="button"
                onClick={() => setRefundOpen(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-[4px] bg-[#8C072B] text-[#F2F2F0] hover:bg-[#591623]"
              >
                Issue Refund / Return
              </button>
            )}
          </div>

          {order.refunds.length > 0 && (
            <div className="space-y-2">
              {order.refunds.map((ref) => (
                <div
                  key={ref.id}
                  className="p-2.5 rounded-[4px] border border-[#8C072B]/25 dark:border-[#8C072B] bg-[#8C072B]/[0.05] dark:bg-[#8C072B]/25 text-xs flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-semibold text-[#8C072B] dark:text-[#F2F2F0]">
                      {ref.type} — {formatINR(ref.amount)}
                    </p>
                    <p className="text-[11px] text-[#26231F]/75 dark:text-[#F2F2F0]/80">
                      {ref.reason}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#26231F]/60 dark:text-[#F2F2F0]/70">
                    {ref.actor} • {formatDateTime(ref.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {refundOpen && (
            <form
              onSubmit={handleRefundSubmit}
              className="p-3 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04] space-y-2.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <select
                  value={refundType}
                  onChange={(e) =>
                    setRefundType(e.target.value as "Refund" | "Return")
                  }
                  className="px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                >
                  <option value="Return">Return &amp; Refund</option>
                  <option value="Refund">Refund Only (No Return)</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={refundableRemaining}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Refund Amount (INR)"
                  className="px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                />
              </div>
              <input
                type="text"
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for refund / return (e.g. Size exchange requested)"
                className="w-full px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
              />
              <label className="flex items-center gap-2 text-xs text-[#26231F] dark:text-[#F2F2F0]">
                <input
                  type="checkbox"
                  checked={restockItems}
                  onChange={(e) => setRestockItems(e.target.checked)}
                  className="accent-[#591623] dark:accent-[#8C072B]"
                />
                Restock returned garment quantities back into inventory
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRefundOpen(false)}
                  className="px-3 py-1.5 text-xs rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium rounded-[4px] bg-[#8C072B] text-[#F2F2F0] hover:bg-[#591623]"
                >
                  Confirm Refund
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order Activity Timeline & Note */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80">
            Order Activity Timeline
          </p>
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add internal fulfilment or customer note..."
              className="flex-1 px-3 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium rounded-[4px] border border-[#591623] dark:border-[#F2F2F0]/30 text-[#591623] dark:text-[#F2F2F0] hover:bg-[#591623] hover:text-[#F2F2F0]"
            >
              Log Note
            </button>
          </form>

          <div className="border-l-2 border-[#591623]/25 dark:border-[#F2F2F0]/25 pl-3.5 space-y-3">
            {order.activities.map((act) => (
              <div key={act.id} className="relative">
                <span className="w-2 h-2 rounded-full bg-[#591623] dark:bg-[#8C072B] absolute -left-[19px] top-1.5" />
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <p className="text-xs font-medium text-[#26231F] dark:text-[#F2F2F0]">
                    {act.action}
                  </p>
                  <span className="text-[10px] text-[#26231F]/55 dark:text-[#F2F2F0]/55">
                    {formatDateTime(act.timestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                  By {act.actor}
                  {act.note ? ` — "${act.note}"` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AdminDrawer>

      <InvoicePackingSlipModal
        open={invoiceOpen}
        order={order}
        onClose={() => setInvoiceOpen(false)}
      />

      <ConfirmDialog
        open={cancelConfirmOpen}
        destructive
        title={`Cancel Order ${order.orderNumber}`}
        description="Cancelling this order will halt dispatch and automatically return item quantities to live product inventory. Proceed?"
        confirmLabel="Cancel Order"
        onConfirm={() => {
          updateOrderStatus(
            order.id,
            "Cancelled",
            "Cancelled from OMS order inspector"
          );
          setCancelConfirmOpen(false);
        }}
        onCancel={() => setCancelConfirmOpen(false)}
      />
    </>
  );
}
