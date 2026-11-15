"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/lib/admin/context";
import {
  formatDateTime,
  formatINR,
  formatShortDate,
  getCustomerOrderSummary,
} from "@/lib/admin/repository";
import type {
  AdminCustomer,
  CustomerAddress,
  CustomerSegment,
  CustomerStatus,
} from "@/lib/admin/types";
import { IconPlus } from "@/components/ui/Icons";
import { IconEdit, IconTrash } from "../ui/AdminIcons";
import { AdminDrawer, ConfirmDialog, StatusBadge } from "../ui/AdminUI";

const SEGMENTS: CustomerSegment[] = [
  "VIP Collectors",
  "Repeat Buyers",
  "First-Time",
  "Dormant / At-Risk",
  "Subscribers",
];

export function UserDetailDrawer({
  customer,
  open,
  onClose,
  onEditProfile,
}: {
  customer: AdminCustomer | null;
  open: boolean;
  onClose: () => void;
  onEditProfile: (customer: AdminCustomer) => void;
}) {
  const {
    currentAdmin,
    workspace,
    updateCustomerStatus,
    updateCustomerSegment,
    updateUserRole,
    saveCustomer,
  } = useAdmin();

  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null
  );
  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrType, setAddrType] = useState<"Shipping" | "Billing">(
    "Shipping"
  );
  const [addrLine1, setAddrLine1] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPin, setAddrPin] = useState("");
  const [addrDefault, setAddrDefault] = useState(false);

  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);

  const summary = useMemo(
    () =>
      customer
        ? getCustomerOrderSummary(customer, workspace.orders)
        : { orders: [], orderCount: 0, lifetimeSpent: 0, lastOrderAt: undefined },
    [customer, workspace.orders]
  );
  const completedOrders = useMemo(
    () =>
      summary.orders.filter(
        (o) => o.status !== "Cancelled" && o.status !== "Returned"
      ).length,
    [summary.orders]
  );

  const derivedTimeline = useMemo(() => {
    if (!customer) return [];
    const items: Array<{ id: string; summary: string; timestamp: string }> = [
      {
        id: "joined",
        summary: `Account created (${customer.role} role)`,
        timestamp: customer.joinedAt,
      },
    ];
    if (customer.lastActiveAt) {
      items.push({
        id: "active",
        summary: "Latest profile update / session sync",
        timestamp: customer.lastActiveAt,
      });
    }
    for (const ord of summary.orders.slice(0, 6)) {
      items.push({
        id: `ord-${ord.id}`,
        summary: `Placed order ${ord.orderNumber} (${ord.status}) — ${formatINR(ord.total)}`,
        timestamp: ord.createdAt,
      });
    }
    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [customer, summary.orders]);

  if (!customer) return null;

  const isSelf = customer.id === currentAdmin?.id;

  const openNewAddressForm = () => {
    setEditingAddress(null);
    setAddrLabel("Home");
    setAddrType("Shipping");
    setAddrLine1("");
    setAddrCity("");
    setAddrState("");
    setAddrPin("");
    setAddrDefault(customer.addresses.length === 0);
    setAddressFormOpen(true);
  };

  const openEditAddressForm = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setAddrLabel(addr.label);
    setAddrType(addr.type);
    setAddrLine1(addr.line1);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPin(addr.postalCode);
    setAddrDefault(addr.isDefault);
    setAddressFormOpen(true);
  };

  const persistAddresses = async (nextAddresses: CustomerAddress[]) => {
    await saveCustomer({
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      addresses: nextAddresses,
    });
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLine1.trim() || !addrCity.trim() || !addrPin.trim()) return;
    const record: CustomerAddress = {
      id: editingAddress?.id ?? `addr-${Date.now()}`,
      label: addrLabel.trim() || "Address",
      type: addrType,
      isDefault: addrDefault,
      fullName: customer.fullName,
      phone: customer.phone,
      line1: addrLine1.trim(),
      city: addrCity.trim(),
      state: addrState.trim() || "India",
      postalCode: addrPin.trim(),
      country: "India",
    };
    const withoutOld = customer.addresses.filter((a) => a.id !== record.id);
    const normalized = addrDefault
      ? withoutOld.map((a) => ({ ...a, isDefault: false }))
      : withoutOld;
    await persistAddresses([...normalized, record]);
    setAddressFormOpen(false);
  };

  const handleDeleteAddress = async (addrId: string) => {
    const next = customer.addresses.filter((a) => a.id !== addrId);
    await persistAddresses(next);
  };

  return (
    <>
      <AdminDrawer
        open={open}
        onClose={onClose}
        title={customer.fullName}
        subtitle={`Joined ${formatShortDate(customer.joinedAt)} • ${customer.email}`}
        widthClass="max-w-2xl"
        headerActions={
          <button
            type="button"
            onClick={() => onEditProfile(customer)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] border border-[#591623] dark:border-[#F2F2F0]/30 text-[#591623] dark:text-[#F2F2F0] hover:bg-[#591623] hover:text-[#F2F2F0] transition-colors"
          >
            <IconEdit className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        }
      >
        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04]">
            <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
              Lifetime Spending
            </p>
            <p className="mt-1 text-base font-bold text-[#591623] dark:text-[#F2F2F0]">
              {formatINR(summary.lifetimeSpent)}
            </p>
          </div>
          <div className="p-3 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04]">
            <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
              Total Orders
            </p>
            <p className="mt-1 text-base font-bold text-[#26231F] dark:text-[#F2F2F0]">
              {summary.orderCount}
            </p>
          </div>
          <div className="p-3 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04]">
            <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
              Avg Order Value
            </p>
            <p className="mt-1 text-base font-bold text-[#26231F] dark:text-[#F2F2F0]">
              {completedOrders > 0
                ? formatINR(Math.round(summary.lifetimeSpent / completedOrders))
                : formatINR(0)}
            </p>
          </div>
        </div>

        {/* Status, Role & Segmentation Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.02] dark:bg-[#F2F2F0]/[0.04]">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80 mb-1.5">
              Role
            </label>
            <select
              disabled={isSelf}
              value={customer.role}
              onChange={(e) =>
                updateUserRole(
                  customer.id,
                  e.target.value as "customer" | "admin"
                )
              }
              className="w-full px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] disabled:opacity-60"
            >
              <option value="customer">customer</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80 mb-1.5">
              Account Status
            </label>
            <select
              value={customer.status}
              onChange={(e) => {
                const next = e.target.value as CustomerStatus;
                if (next === "Blocked") {
                  setBlockConfirmOpen(true);
                } else {
                  updateCustomerStatus(customer.id, next);
                }
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
            >
              <option value="Active">Active</option>
              <option value="VIP">VIP</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80 mb-1.5">
              Segment
            </label>
            <select
              value={customer.segment}
              onChange={(e) =>
                updateCustomerSegment(
                  customer.id,
                  e.target.value as CustomerSegment
                )
              }
              className="w-full px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
            >
              {SEGMENTS.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact & Tags */}
        <div className="p-3.5 rounded-[5px] border border-[#26231F]/12 dark:border-[#F2F2F0]/15 space-y-2 text-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80">
            Contact &amp; Notes
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <p>
              <span className="text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                Email:
              </span>{" "}
              <span className="font-medium">{customer.email}</span>
            </p>
            <p>
              <span className="text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                Phone:
              </span>{" "}
              <span className="font-medium">{customer.phone || "—"}</span>
            </p>
            <p>
              <span className="text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                Marketing:
              </span>{" "}
              <span>
                {customer.emailOptIn ? "Opted in to drops" : "Unsubscribed"}
              </span>
            </p>
          </div>
          {customer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {customer.tags.map((tag) => (
                <StatusBadge key={tag} label={tag} tone="outline" />
              ))}
            </div>
          )}
          {customer.notes && (
            <p className="pt-1 text-xs text-[#26231F]/75 dark:text-[#F2F2F0]/75 italic">
              &ldquo;{customer.notes}&rdquo;
            </p>
          )}
        </div>

        {/* Billing & Shipping Addresses */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80">
              Billing &amp; Shipping Addresses ({customer.addresses.length})
            </p>
            <button
              type="button"
              onClick={openNewAddressForm}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-[4px] border border-[#591623] dark:border-[#F2F2F0]/30 text-[#591623] dark:text-[#F2F2F0] hover:bg-[#591623] hover:text-[#F2F2F0]"
            >
              <IconPlus className="w-3 h-3" />
              Add Address
            </button>
          </div>

          {addressFormOpen && (
            <form
              onSubmit={handleAddressSubmit}
              className="p-3 rounded-[5px] border border-[#591623]/30 dark:border-[#F2F2F0]/25 bg-[#591623]/[0.04] dark:bg-[#F2F2F0]/[0.04] space-y-2.5"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={addrLabel}
                  onChange={(e) => setAddrLabel(e.target.value)}
                  placeholder="Label (Home / Studio)"
                  className="px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                />
                <select
                  value={addrType}
                  onChange={(e) =>
                    setAddrType(e.target.value as "Shipping" | "Billing")
                  }
                  className="px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                >
                  <option value="Shipping">Shipping</option>
                  <option value="Billing">Billing</option>
                </select>
              </div>
              <input
                type="text"
                required
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                placeholder="Street Address Line 1"
                className="w-full px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  placeholder="City"
                  className="px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                />
                <input
                  type="text"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  placeholder="State"
                  className="px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                />
                <input
                  type="text"
                  required
                  value={addrPin}
                  onChange={(e) => setAddrPin(e.target.value)}
                  placeholder="PIN"
                  className="px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={addrDefault}
                    onChange={(e) => setAddrDefault(e.target.checked)}
                    className="accent-[#591623] dark:accent-[#8C072B]"
                  />
                  Default address
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddressFormOpen(false)}
                    className="px-2.5 py-1 text-xs rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {customer.addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-3 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#26231F] dark:text-[#F2F2F0] truncate">
                    {addr.label}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <StatusBadge
                      label={addr.type}
                      tone={addr.isDefault ? "soft-primary" : "outline"}
                    />
                    <button
                      type="button"
                      onClick={() => openEditAddressForm(addr)}
                      aria-label="Edit address"
                      className="p-1 text-[#26231F]/60 dark:text-[#F2F2F0]/60 hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      <IconEdit className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      aria-label="Delete address"
                      className="p-1 text-[#26231F]/60 dark:text-[#F2F2F0]/60 hover:text-[#8C072B] dark:hover:text-[#F2F2F0]"
                    >
                      <IconTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-[#26231F]/75 dark:text-[#F2F2F0]/75">
                  {addr.line1}
                </p>
                <p className="text-[#26231F]/75 dark:text-[#F2F2F0]/75">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase History */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80">
            Purchase History ({summary.orders.length})
          </p>
          {summary.orders.length === 0 ? (
            <p className="text-xs text-[#26231F]/60 dark:text-[#F2F2F0]/60 p-3 border border-dashed border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]">
              No orders placed yet.
            </p>
          ) : (
            <div className="border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[5px] divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
              {summary.orders.map((ord) => (
                <Link
                  key={ord.id}
                  href={`/admin/orders?focus=${encodeURIComponent(ord.id)}`}
                  className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-[#26231F]/[0.03] dark:hover:bg-[#F2F2F0]/[0.05] transition-colors"
                >
                  <div>
                    <p className="font-semibold text-[#591623] dark:text-[#F2F2F0]">
                      {ord.orderNumber}
                    </p>
                    <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                      {formatShortDate(ord.createdAt)} •{" "}
                      {ord.items.reduce((s, i) => s + i.quantity, 0)} items
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <StatusBadge label={ord.status} />
                    <span className="font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                      {formatINR(ord.total)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* User Activity */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80">
            User Activity Timeline
          </p>
          <div className="border-l-2 border-[#591623]/25 dark:border-[#F2F2F0]/25 pl-3.5 space-y-2.5">
            {derivedTimeline.map((act) => (
              <div key={act.id} className="relative text-xs">
                <span className="w-2 h-2 rounded-full bg-[#591623] dark:bg-[#8C072B] absolute -left-[19px] top-1.5" />
                <p className="text-[#26231F] dark:text-[#F2F2F0]">{act.summary}</p>
                <p className="text-[10px] text-[#26231F]/55 dark:text-[#F2F2F0]/55">
                  {formatDateTime(act.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AdminDrawer>

      <ConfirmDialog
        open={blockConfirmOpen}
        destructive
        title={`Block ${customer.fullName}`}
        description="Blocking restricts COD orders and flags future storefront checkouts for manual review. Continue?"
        confirmLabel="Block User"
        onConfirm={() => {
          updateCustomerStatus(customer.id, "Blocked");
          setBlockConfirmOpen(false);
        }}
        onCancel={() => setBlockConfirmOpen(false)}
      />
    </>
  );
}
