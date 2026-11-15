"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdmin } from "@/lib/admin/context";
import {
  formatINR,
  formatShortDate,
  getCustomerOrderSummary,
} from "@/lib/admin/repository";
import type {
  AdminCustomer,
  CustomerSegment,
  CustomerStatus,
} from "@/lib/admin/types";
import { IconPlus, IconSearch } from "@/components/ui/Icons";
import { IconSort } from "../ui/AdminIcons";
import {
  EmptyState,
  LoadingState,
  Pagination,
  StatusBadge,
} from "../ui/AdminUI";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { UserFormModal } from "./UserFormModal";

type SortKey = "fullName" | "orders" | "spent" | "joinedAt";
const PAGE_SIZE = 7;

const SEGMENTS: Array<"ALL" | CustomerSegment> = [
  "ALL",
  "VIP Collectors",
  "Repeat Buyers",
  "First-Time",
  "Dormant / At-Risk",
  "Subscribers",
];

export function UsersView() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");

  const { workspace, workspaceLoading } = useAdmin();

  const [query, setQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<"ALL" | CustomerSegment>(
    "ALL"
  );
  const [statusFilter, setStatusFilter] = useState<"ALL" | CustomerStatus>(
    "ALL"
  );
  const [sortBy, setSortBy] = useState<SortKey>("spent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [closedFocusId, setClosedFocusId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<AdminCustomer | null>(
    null
  );

  const activeCustomerId =
    selectedCustomerId ??
    (focusId && focusId !== closedFocusId ? focusId : null);

  const enriched = useMemo(
    () =>
      workspace.customers.map((c) => ({
        customer: c,
        summary: getCustomerOrderSummary(c, workspace.orders),
      })),
    [workspace.customers, workspace.orders]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched
      .filter(({ customer }) => {
        if (q) {
          const hit =
            customer.fullName.toLowerCase().includes(q) ||
            customer.email.toLowerCase().includes(q) ||
            customer.phone.toLowerCase().includes(q) ||
            customer.role.toLowerCase().includes(q) ||
            customer.tags.some((t) => t.toLowerCase().includes(q)) ||
            customer.addresses.some((a) => a.city.toLowerCase().includes(q));
          if (!hit) return false;
        }
        if (segmentFilter !== "ALL" && customer.segment !== segmentFilter) {
          return false;
        }
        if (statusFilter !== "ALL" && customer.status !== statusFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const mult = sortDir === "asc" ? 1 : -1;
        switch (sortBy) {
          case "fullName":
            return (
              a.customer.fullName.localeCompare(b.customer.fullName) * mult
            );
          case "orders":
            return (a.summary.orderCount - b.summary.orderCount) * mult;
          case "spent":
            return (
              (a.summary.lifetimeSpent - b.summary.lifetimeSpent) * mult
            );
          case "joinedAt":
          default:
            return (
              a.customer.joinedAt.localeCompare(b.customer.joinedAt) * mult
            );
        }
      });
  }, [enriched, query, segmentFilter, statusFilter, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () =>
      filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const activeCustomer =
    workspace.customers.find((c) => c.id === activeCustomerId) ?? null;

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  if (workspaceLoading && workspace.customers.length === 0) {
    return <LoadingState label="Loading user directory..." />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#26231F] dark:text-[#F2F2F0]">
            User Management System
          </h1>
          <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 mt-0.5">
            {workspace.customers.length} customer accounts • Track lifetime
            spend, addresses, segmentation, and Customer / Admin role assignments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCustomer(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] transition-colors self-start sm:self-auto"
        >
          <IconPlus className="w-3.5 h-3.5" />
          Add User
        </button>
      </div>

      {/* Segment Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {SEGMENTS.map((seg) => {
          const count =
            seg === "ALL"
              ? workspace.customers.length
              : workspace.customers.filter((c) => c.segment === seg).length;
          const active = segmentFilter === seg;
          return (
            <button
              key={seg}
              type="button"
              onClick={() => {
                setSegmentFilter(seg);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] border transition-colors ${
                active
                  ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                  : "bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] text-[#26231F]/80 dark:text-[#F2F2F0]/80 border-[#26231F]/15 dark:border-[#F2F2F0]/15 hover:border-[#591623] dark:hover:border-[#F2F2F0]/40"
              }`}
            >
              {seg === "ALL" ? "All Segments" : seg}{" "}
              <span className="opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search + Status */}
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
            placeholder="Search by user name, email, phone, city, role, or tag..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "ALL" | CustomerStatus);
              setPage(1);
            }}
            aria-label="Filter by customer status"
            className="w-full px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="Active">Active</option>
            <option value="VIP">VIP</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            workspace.customers.length === 0
              ? "Customers who register on the storefront will appear here automatically."
              : "Clear filters or add a new user record."
          }
          action={
            workspace.customers.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSegmentFilter("ALL");
                  setStatusFilter("ALL");
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
                      onClick={() => toggleSort("fullName")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      User <IconSort />
                    </button>
                  </th>
                  <th className="py-3 px-3 font-semibold">Role</th>
                  <th className="py-3 px-3 font-semibold">Location</th>
                  <th className="py-3 px-3 font-semibold">Segment</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("orders")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Orders <IconSort />
                    </button>
                  </th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("spent")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Lifetime Spend <IconSort />
                    </button>
                  </th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("joinedAt")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Joined <IconSort />
                    </button>
                  </th>
                  <th className="py-3 pl-3 pr-4 text-right font-semibold">
                    Profile
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
                {paginated.map(({ customer, summary }) => {
                  const primaryAddr = customer.addresses[0];
                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-[#26231F]/[0.025] dark:hover:bg-[#F2F2F0]/[0.04] transition-colors"
                    >
                      <td className="py-3 pl-4 pr-3 min-w-[200px]">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className="font-semibold text-[#26231F] dark:text-[#F2F2F0] hover:text-[#591623] dark:hover:text-[#F2F2F0]/75 text-left"
                        >
                          {customer.fullName}
                        </button>
                        <p className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65 truncate">
                          {customer.email} • {customer.phone || "No phone"}
                        </p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge
                          label={customer.role}
                          tone={
                            customer.role === "admin"
                              ? "solid-primary"
                              : "outline"
                          }
                        />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[#26231F]/75 dark:text-[#F2F2F0]/75">
                        {primaryAddr
                          ? `${primaryAddr.city}, ${primaryAddr.state}`
                          : "—"}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge label={customer.segment} />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge label={customer.status} />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium">
                        {summary.orderCount}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-semibold text-[#591623] dark:text-[#F2F2F0]">
                        {formatINR(summary.lifetimeSpent)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                        {formatShortDate(customer.joinedAt)}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className="px-2.5 py-1.5 text-[11px] font-medium rounded-[4px] border border-[#591623] dark:border-[#F2F2F0]/30 text-[#591623] dark:text-[#F2F2F0] hover:bg-[#591623] hover:text-[#F2F2F0] transition-colors"
                        >
                          Inspect
                        </button>
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

      <UserDetailDrawer
        customer={activeCustomer}
        open={Boolean(activeCustomer)}
        onClose={() => {
          setSelectedCustomerId(null);
          if (focusId) setClosedFocusId(focusId);
        }}
        onEditProfile={(cust) => {
          setEditingCustomer(cust);
          setFormOpen(true);
        }}
      />

      <UserFormModal
        key={`${editingCustomer?.id || "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        customer={editingCustomer}
        onClose={() => {
          setFormOpen(false);
          setEditingCustomer(null);
        }}
      />
    </div>
  );
}
