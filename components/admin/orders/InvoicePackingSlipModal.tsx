"use client";

import React, { useState } from "react";
import { formatINR, formatShortDate } from "@/lib/admin/repository";
import type { AdminOrder } from "@/lib/admin/types";
import { IconPrinter } from "../ui/AdminIcons";
import { AdminModal } from "../ui/AdminUI";

export function InvoicePackingSlipModal({
  open,
  order,
  onClose,
}: {
  open: boolean;
  order: AdminOrder | null;
  onClose: () => void;
}) {
  const [docType, setDocType] = useState<"invoice" | "packing">("invoice");

  if (!order) return null;

  const totalRefunded = order.refunds.reduce((s, r) => s + r.amount, 0);
  const includedGst = Math.round((order.total * 12) / 112);

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={`${order.orderNumber} — ${
        docType === "invoice" ? "GST Tax Invoice" : "Warehouse Packing Slip"
      }`}
      maxWidth="max-w-3xl"
      footer={
        <div className="w-full flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDocType("invoice")}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] border transition-colors ${
                docType === "invoice"
                  ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                  : "border-[#26231F]/20 dark:border-[#F2F2F0]/20 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10"
              }`}
            >
              Tax Invoice
            </button>
            <button
              type="button"
              onClick={() => setDocType("packing")}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] border transition-colors ${
                docType === "packing"
                  ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                  : "border-[#26231F]/20 dark:border-[#F2F2F0]/20 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10"
              }`}
            >
              Packing Slip
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B]"
            >
              <IconPrinter className="w-3.5 h-3.5" />
              Print Document
            </button>
          </div>
        </div>
      }
    >
      <div className="p-5 sm:p-7 border border-[#26231F]/20 rounded-[4px] bg-[#F2F2F0] text-[#26231F] space-y-6">
        {/* Document Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#26231F]/15">
          <div>
            <p className="text-base font-bold tracking-[0.22em] uppercase text-[#591623]">
              ORIIKO
            </p>
            <p className="mt-1 text-[11px] text-[#26231F]/70 leading-relaxed">
              ORIIKO Apparel Private Limited
              <br />
              Plot 42, Lower Parel Industrial Estate, Mumbai 400013
              <br />
              GSTIN: 27AAACO9481Q1Z9 • support@oriiko.in
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-[#8C072B]">
              {docType === "invoice" ? "Tax Invoice" : "Packing Slip"}
            </p>
            <p className="mt-1 text-sm font-semibold">{order.orderNumber}</p>
            <p className="text-[11px] text-[#26231F]/65">
              Order Date: {formatShortDate(order.createdAt)}
            </p>
            {order.tracking?.trackingNumber && (
              <p className="text-[11px] font-mono text-[#26231F]/75">
                AWB: {order.tracking.trackingNumber} ({order.tracking.courier})
              </p>
            )}
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-[4px] border border-[#26231F]/12 bg-[#26231F]/[0.02]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#591623] mb-1">
              Deliver To
            </p>
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-[#26231F]/80 mt-0.5">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2
                ? `, ${order.shippingAddress.line2}`
                : ""}
            </p>
            <p className="text-[#26231F]/80">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-[#26231F]/70 mt-0.5">
              {order.shippingAddress.phone}
            </p>
          </div>

          <div className="p-3 rounded-[4px] border border-[#26231F]/12 bg-[#26231F]/[0.02]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#591623] mb-1">
              {docType === "invoice" ? "Billing & Settlement" : "Dispatch Info"}
            </p>
            <p className="font-semibold">{order.billingAddress.fullName}</p>
            <p className="text-[#26231F]/80 mt-0.5">
              Payment Method: {order.paymentMethod} ({order.paymentStatus})
            </p>
            {order.paymentReference && (
              <p className="text-[#26231F]/70 font-mono text-[11px]">
                Txn Ref: {order.paymentReference}
              </p>
            )}
            <p className="text-[#26231F]/70 mt-0.5">
              Fulfilment Status: {order.status}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-[#26231F]/15 rounded-[4px] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#591623] text-[#F2F2F0] text-[11px]">
              <tr>
                <th className="py-2 px-3">SKU</th>
                <th className="py-2 px-3">Garment &amp; Variant</th>
                <th className="py-2 px-3 text-center">Qty</th>
                {docType === "invoice" ? (
                  <>
                    <th className="py-2 px-3 text-right">Unit Rate</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </>
                ) : (
                  <th className="py-2 px-3 text-right">QC Checked</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26231F]/12">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {item.sku}
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-[11px] text-[#26231F]/65">
                      {item.variantName}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold">
                    {item.quantity}
                  </td>
                  {docType === "invoice" ? (
                    <>
                      <td className="py-2.5 px-3 text-right">
                        {formatINR(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold">
                        {formatINR(item.lineTotal)}
                      </td>
                    </>
                  ) : (
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-block w-4 h-4 border border-[#26231F]/40 rounded-[2px]" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals or Warehouse Footer */}
        {docType === "invoice" ? (
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#26231F]/70">Merchandise Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#8C072B]">
                  <span>Discount</span>
                  <span>-{formatINR(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#26231F]/70">Shipping</span>
                <span>
                  {order.shippingAmount === 0
                    ? "Complimentary"
                    : formatINR(order.shippingAmount)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#26231F]/65">
                <span>Included GST (12% HSN 6109)</span>
                <span>{formatINR(includedGst)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#26231F]/20 text-sm font-bold text-[#591623]">
                <span>Invoice Total</span>
                <span>{formatINR(order.total)}</span>
              </div>
              {totalRefunded > 0 && (
                <div className="flex justify-between text-xs font-medium text-[#8C072B]">
                  <span>Refunded</span>
                  <span>-{formatINR(totalRefunded)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-[4px] border border-dashed border-[#26231F]/25 text-[11px] text-[#26231F]/75 flex flex-wrap justify-between gap-2">
            <span>
              Total Units to Pack:{" "}
              <strong>
                {order.items.reduce((s, i) => s + i.quantity, 0)}
              </strong>
            </span>
            <span>Packed By: ___________________</span>
            <span>QC Stamp: ___________________</span>
          </div>
        )}
      </div>
    </AdminModal>
  );
}
