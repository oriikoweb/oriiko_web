"use client";

import React, { useEffect } from "react";
import { IconCheck, IconClose } from "@/components/ui/Icons";
import { IconAlertTriangle } from "./AdminIcons";
import type { AdminToast } from "@/lib/admin/context";

/**
 * Strictly 4-color semantic badge system (#591623, #8C072B, #F2F2F0, #26231F).
 */
export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone?: "solid-primary" | "solid-secondary" | "soft-primary" | "soft-secondary" | "outline" | "dark";
}) {
  const resolvedTone = tone ?? inferBadgeTone(label);
  const styles: Record<NonNullable<typeof tone>, string> = {
    "solid-primary": "bg-[#591623] text-[#F2F2F0] border-[#591623] dark:border-[#8C072B]",
    "solid-secondary": "bg-[#8C072B] text-[#F2F2F0] border-[#8C072B]",
    "soft-primary":
      "bg-[#591623]/10 dark:bg-[#591623]/35 text-[#591623] dark:text-[#F2F2F0] border-[#591623]/25 dark:border-[#8C072B]/50",
    "soft-secondary":
      "bg-[#8C072B]/12 dark:bg-[#8C072B]/30 text-[#8C072B] dark:text-[#F2F2F0] border-[#8C072B]/30 dark:border-[#8C072B]/60",
    dark: "bg-[#26231F] dark:bg-[#F2F2F0]/15 text-[#F2F2F0] border-[#26231F] dark:border-[#F2F2F0]/25",
    outline:
      "bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.06] text-[#26231F]/80 dark:text-[#F2F2F0]/85 border-[#26231F]/20 dark:border-[#F2F2F0]/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide border rounded-[4px] whitespace-nowrap ${styles[resolvedTone]}`}
    >
      {label}
    </span>
  );
}

function inferBadgeTone(
  label: string
): "solid-primary" | "solid-secondary" | "soft-primary" | "soft-secondary" | "outline" | "dark" {
  switch (label) {
    case "Active":
    case "Delivered":
    case "Paid":
    case "VIP Collectors":
    case "admin":
    case "Admin":
      return "solid-primary";
    case "Confirmed":
    case "Processing":
    case "Packed":
    case "Shipped":
    case "Repeat Buyers":
      return "soft-primary";
    case "Returned":
    case "Cancelled":
    case "Refunded":
    case "Partially Refunded":
    case "Blocked":
    case "Suspended":
    case "Out of Stock":
      return "solid-secondary";
    case "Pending":
    case "COD Pending":
    case "Low Stock":
    case "Dormant / At-Risk":
      return "soft-secondary";
    case "Archived":
    case "Inactive":
      return "dark";
    default:
      return "outline";
  }
}

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = "max-w-2xl",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#26231F]/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] flex flex-col bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[6px] shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12">
          <div>
            <h2
              id="admin-modal-title"
              className="text-base font-semibold tracking-tight text-[#26231F] dark:text-[#F2F2F0]"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-[4px] text-[#26231F]/70 dark:text-[#F2F2F0]/70 hover:text-[#26231F] dark:hover:text-[#F2F2F0] hover:bg-[#26231F]/8 dark:hover:bg-[#F2F2F0]/10 transition-colors"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#26231F]/12 dark:border-[#F2F2F0]/12 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminDrawer({
  open,
  onClose,
  title,
  subtitle,
  headerActions,
  widthClass = "max-w-2xl",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  widthClass?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#26231F]/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClass} h-full flex flex-col bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border-l border-[#26231F]/20 dark:border-[#F2F2F0]/20 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 bg-[#26231F]/[0.02] dark:bg-[#F2F2F0]/[0.04]">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-[#26231F] dark:text-[#F2F2F0] truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="p-1.5 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 text-[#26231F]/75 dark:text-[#F2F2F0]/75 hover:text-[#26231F] dark:hover:text-[#F2F2F0] hover:bg-[#26231F]/8 dark:hover:bg-[#F2F2F0]/10 transition-colors"
            >
              <IconClose className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AdminModal
      open={open}
      onClose={onCancel}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-medium rounded-[4px] text-[#F2F2F0] transition-colors ${
              destructive
                ? "bg-[#8C072B] hover:bg-[#591623]"
                : "bg-[#591623] hover:bg-[#8C072B]"
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-[#26231F]/80 dark:text-[#F2F2F0]/80">{description}</p>
    </AdminModal>
  );
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (nextPage: number) => void;
}) {
  if (totalItems === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#26231F]/12 dark:border-[#F2F2F0]/12 text-xs text-[#26231F]/70 dark:text-[#F2F2F0]/70">
      <span>
        Showing <strong className="text-[#26231F] dark:text-[#F2F2F0]">{start}</strong>–
        <strong className="text-[#26231F] dark:text-[#F2F2F0]">{end}</strong> of{" "}
        <strong className="text-[#26231F] dark:text-[#F2F2F0]">{totalItems}</strong>
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-2.5 py-1.5 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 text-[#26231F] dark:text-[#F2F2F0] disabled:opacity-40 hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 transition-colors"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (n) =>
              n === 1 || n === totalPages || Math.abs(n - page) <= 1
          )
          .map((n, idx, arr) => {
            const prev = arr[idx - 1];
            const showEllipsis = prev && n - prev > 1;
            return (
              <React.Fragment key={n}>
                {showEllipsis && <span className="px-1">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(n)}
                  className={`min-w-7 px-2 py-1.5 rounded-[4px] border text-center transition-colors ${
                    n === page
                      ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                      : "border-[#26231F]/15 dark:border-[#F2F2F0]/15 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10"
                  }`}
                >
                  {n}
                </button>
              </React.Fragment>
            );
          })}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-2.5 py-1.5 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 text-[#26231F] dark:text-[#F2F2F0] disabled:opacity-40 hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 border border-dashed border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[6px] bg-[#26231F]/[0.02] dark:bg-[#F2F2F0]/[0.03]">
      <h3 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0]">{title}</h3>
      <p className="mt-1 text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 max-w-md">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading console..." }: { label?: string }) {
  return (
    <div className="min-h-[260px] flex flex-col items-center justify-center gap-3 py-12 text-[#26231F]/70 dark:text-[#F2F2F0]/70">
      <div className="w-6 h-6 rounded-full border-2 border-[#591623]/20 dark:border-[#F2F2F0]/25 border-t-[#591623] dark:border-t-[#F2F2F0] animate-spin" />
      <p className="text-xs tracking-wide uppercase">{label}</p>
    </div>
  );
}

export function WorkspaceErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="border border-[#8C072B]/25 dark:border-[#8C072B]/60 bg-[#8C072B]/[0.05] dark:bg-[#8C072B]/20 rounded-[6px] p-8 text-center max-w-lg mx-auto my-8">
      <div className="w-10 h-10 rounded-full bg-[#8C072B]/12 dark:bg-[#8C072B]/35 text-[#8C072B] dark:text-[#F2F2F0] flex items-center justify-center mx-auto">
        <IconAlertTriangle className="w-5 h-5" />
      </div>
      <h2 className="mt-3 text-base font-semibold text-[#26231F] dark:text-[#F2F2F0]">
        Unable to Load Workspace Data
      </h2>
      <p className="mt-1.5 text-xs text-[#26231F]/70 dark:text-[#F2F2F0]/70 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] transition-colors"
        >
          Retry Sync
        </button>
      )}
    </div>
  );
}

export function AdminToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: AdminToast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] print:hidden"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const borderClass =
          toast.tone === "error"
            ? "border-[#8C072B] bg-[#F2F2F0] dark:bg-[#26231F]"
            : toast.tone === "info"
            ? "border-[#26231F]/30 dark:border-[#F2F2F0]/25 bg-[#F2F2F0] dark:bg-[#26231F]"
            : "border-[#591623] dark:border-[#8C072B] bg-[#F2F2F0] dark:bg-[#26231F]";

        const accentClass =
          toast.tone === "error"
            ? "bg-[#8C072B] text-[#F2F2F0]"
            : "bg-[#591623] text-[#F2F2F0]";

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-2.5 p-3 border rounded-[6px] shadow-lg ${borderClass}`}
          >
            <span
              className={`mt-0.5 w-5 h-5 shrink-0 rounded-[4px] flex items-center justify-center ${accentClass}`}
            >
              <IconCheck className="w-3 h-3" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-[11px] text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-[#26231F]/50 dark:text-[#F2F2F0]/55 hover:text-[#26231F] dark:hover:text-[#F2F2F0] p-0.5"
            >
              <IconClose className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

