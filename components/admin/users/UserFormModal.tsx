"use client";

import React, { useState } from "react";
import { useAdmin } from "@/lib/admin/context";
import type {
  AdminCustomer,
  CustomerAddress,
  CustomerSegment,
  CustomerStatus,
} from "@/lib/admin/types";
import { AdminModal } from "../ui/AdminUI";

const SEGMENTS: CustomerSegment[] = [
  "VIP Collectors",
  "Repeat Buyers",
  "First-Time",
  "Dormant / At-Risk",
  "Subscribers",
];

export function UserFormModal({
  open,
  customer,
  onClose,
}: {
  open: boolean;
  customer: AdminCustomer | null;
  onClose: () => void;
}) {
  const { saveCustomer } = useAdmin();

  const [fullName, setFullName] = useState(customer?.fullName ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "+91 ");
  const [role, setRole] = useState<"customer" | "admin">(
    customer?.role ?? "customer"
  );
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<CustomerStatus>(
    customer?.status ?? "Active"
  );
  const [segment, setSegment] = useState<CustomerSegment>(
    customer?.segment ?? "First-Time"
  );
  const [emailOptIn, setEmailOptIn] = useState(customer?.emailOptIn ?? true);
  const [tagsText, setTagsText] = useState(
    customer ? customer.tags.join(", ") : "Drop Subscriber"
  );
  const [notes, setNotes] = useState(customer?.notes ?? "");

  // Initial address fields when creating new user
  const [city, setCity] = useState("Mumbai");
  const [stateName, setStateName] = useState("Maharashtra");
  const [line1, setLine1] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError("User full name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Valid email address is required.");
      return;
    }
    if (!customer && password.trim().length < 6) {
      setError("An initial password (minimum 6 characters) is required for new users.");
      return;
    }

    const addresses: CustomerAddress[] = customer
      ? customer.addresses
      : line1.trim()
      ? [
          {
            id: `addr-${Date.now()}`,
            label: "Primary Address",
            type: "Shipping",
            isDefault: true,
            fullName: fullName.trim(),
            phone: phone.trim(),
            line1: line1.trim(),
            city: city.trim() || "Mumbai",
            state: stateName.trim() || "Maharashtra",
            postalCode: postalCode.trim() || "400001",
            country: "India",
          },
        ]
      : [];

    setSaving(true);
    const saved = await saveCustomer({
      id: customer?.id,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      password: password.trim() || undefined,
      status,
      segment,
      emailOptIn,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes.trim(),
      addresses,
    });
    setSaving(false);

    if (saved) onClose();
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={customer ? `Edit User — ${customer.fullName}` : "Add User Profile"}
      subtitle="Manage user contact details, role ('customer' or 'admin'), segmentation, and notes."
      maxWidth="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            form="oriiko-customer-form"
            className="px-4 py-2 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] disabled:opacity-50"
          >
            {saving ? "Saving..." : customer ? "Save User" : "Create User"}
          </button>
        </>
      }
    >
      <form id="oriiko-customer-form" onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-3 rounded-[4px] border border-[#8C072B]/40 dark:border-[#8C072B] bg-[#8C072B]/8 dark:bg-[#8C072B] text-xs text-[#8C072B] dark:text-[#F2F2F0]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "customer" | "admin")
              }
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            >
              <option value="customer">customer</option>
              <option value="admin">admin</option>
            </select>
          </div>
        </div>

        {!customer && (
          <div>
            <label className="block text-[11px] font-medium mb-1">
              Initial Password (min 6 characters) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium mb-1">
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CustomerStatus)}
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            >
              <option value="Active">Active</option>
              <option value="VIP">VIP</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1">
              Customer Segment
            </label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as CustomerSegment)}
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            >
              {SEGMENTS.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!customer && (
          <div className="p-3 rounded-[5px] border border-[#26231F]/12 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.02] dark:bg-[#F2F2F0]/[0.04] space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/80">
              Default Shipping Address (Optional)
            </p>
            <input
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="Street / Flat / Building"
              className="w-full px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
              />
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="State"
                className="px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
              />
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="PIN Code"
                className="px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="Drop 01, Mumbai, Size L"
            className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium mb-1">
            Concierge Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-[#26231F] dark:text-[#F2F2F0]">
          <input
            type="checkbox"
            checked={emailOptIn}
            onChange={(e) => setEmailOptIn(e.target.checked)}
            className="accent-[#591623] dark:accent-[#8C072B]"
          />
          Subscribed to ORIIKO Drop &amp; Newsletter emails
        </label>
      </form>
    </AdminModal>
  );
}
