"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "@/lib/admin/context";
import { formatINR } from "@/lib/admin/repository";
import type { ModuleKey } from "@/lib/admin/types";
import {
  IconChevronRight,
  IconClose,
  IconLogOut,
  IconMenu,
  IconSearch,
} from "@/components/ui/Icons";
import {
  IconAlertTriangle,
  IconBell,
  IconCollections,
  IconDashboard,
  IconExternalLink,
  IconOrders,
  IconProducts,
  IconRefresh,
  IconSettings,
  IconSidebarToggle,
  IconUsers,
} from "./ui/AdminIcons";
import { AdminToastViewport, StatusBadge } from "./ui/AdminUI";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavItem {
  key: ModuleKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: IconDashboard },
  {
    key: "products",
    label: "Products",
    href: "/admin/products",
    icon: IconProducts,
  },
  {
    key: "collections",
    label: "Collections",
    href: "/admin/collections",
    icon: IconCollections,
  },
  {
    key: "orders",
    label: "Order Management",
    href: "/admin/orders",
    icon: IconOrders,
  },
  {
    key: "users",
    label: "User Management",
    href: "/admin/users",
    icon: IconUsers,
  },
  {
    key: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: IconSettings,
  },
];

const ROUTE_LABELS: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/collections": "Collections",
  "/admin/orders": "Order Management",
  "/admin/users": "User Management",
  "/admin/settings": "Settings",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const {
    currentAdmin,
    workspace,
    workspaceLoading,
    workspaceError,
    refreshWorkspace,
    notifications,
    unreadCount,
    toasts,
    dismissToast,
    signOutAdmin,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAdmin();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { products: [], collections: [], orders: [], customers: [] };

    const products = workspace.products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const collections = workspace.collections
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.season.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const orders = workspace.orders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const customers = workspace.customers
      .filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      )
      .slice(0, 4);

    return { products, collections, orders, customers };
  }, [searchQuery, workspace]);

  const hasSearchResults =
    searchResults.products.length > 0 ||
    searchResults.collections.length > 0 ||
    searchResults.orders.length > 0 ||
    searchResults.customers.length > 0;

  const breadcrumbs = useMemo(() => {
    const crumbs = [{ label: "ORIIKO Admin", href: "/admin" }];
    const currentLabel = ROUTE_LABELS[pathname];
    if (currentLabel && pathname !== "/admin") {
      crumbs.push({ label: currentLabel, href: pathname });
    } else {
      crumbs.push({ label: "Dashboard", href: "/admin" });
    }
    return crumbs;
  }, [pathname]);

  const pendingOrderCount = useMemo(
    () =>
      workspace.orders.filter(
        (o) => o.status === "Pending" || o.status === "Confirmed"
      ).length,
    [workspace.orders]
  );

  const initials = useMemo(() => {
    if (!currentAdmin?.fullName) return "OA";
    return currentAdmin.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }, [currentAdmin]);

  const isRouteActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleNotificationSelect = (
    notifId: string,
    mod: ModuleKey,
    targetId?: string
  ) => {
    markNotificationRead(notifId);
    setNotificationsOpen(false);
    const route =
      mod === "orders"
        ? `/admin/orders${targetId ? `?focus=${encodeURIComponent(targetId)}` : ""}`
        : mod === "products"
        ? `/admin/products${targetId ? `?focus=${encodeURIComponent(targetId)}` : ""}`
        : mod === "collections"
        ? `/admin/collections${targetId ? `?focus=${encodeURIComponent(targetId)}` : ""}`
        : `/admin`;
    router.push(route);
  };

  const renderSidebarContent = (collapsed: boolean) => (
    <div className="h-full flex flex-col bg-[#591623] text-[#F2F2F0] select-none">
      {/* Brand header */}
      <div
        className={`h-14 flex items-center border-b border-[#F2F2F0]/15 px-3.5 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link
          href="/admin"
          className="flex items-center gap-2.5 min-w-0"
          title="ORIIKO Admin Home"
        >
          <span className="w-7 h-7 rounded-[4px] bg-[#F2F2F0] text-[#591623] font-bold text-xs tracking-wider flex items-center justify-center shrink-0">
            OR
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F2F2F0] truncate">
                ORIIKO
              </p>
              <p className="text-[10px] text-[#F2F2F0]/70 tracking-wider uppercase truncate">
                Control Suite
              </p>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse sidebar"
            className="hidden lg:inline-flex p-1.5 rounded-[4px] text-[#F2F2F0]/75 hover:text-[#F2F2F0] hover:bg-[#F2F2F0]/10 transition-colors"
          >
            <IconSidebarToggle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand toggle when collapsed */}
      {collapsed && (
        <div className="hidden lg:flex justify-center py-2 border-b border-[#F2F2F0]/12">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="p-1.5 rounded-[4px] text-[#F2F2F0]/75 hover:text-[#F2F2F0] hover:bg-[#F2F2F0]/10 transition-colors"
          >
            <IconSidebarToggle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation items */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto" aria-label="Admin Modules">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-xs font-medium transition-colors ${
                active
                  ? "bg-[#8C072B] text-[#F2F2F0]"
                  : "text-[#F2F2F0]/80 hover:bg-[#F2F2F0]/10 hover:text-[#F2F2F0]"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.key === "orders" && pendingOrderCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-[4px] bg-[#F2F2F0] text-[#591623]">
                      {pendingOrderCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Storefront shortcut & admin badge */}
      <div className="p-3 border-t border-[#F2F2F0]/15 space-y-2">
        {!collapsed && currentAdmin && (
          <div className="px-2.5 py-2 rounded-[4px] bg-[#26231F]/30 border border-[#F2F2F0]/12">
            <p className="text-[11px] font-medium text-[#F2F2F0] truncate">
              {currentAdmin.fullName}
            </p>
            <p className="text-[10px] text-[#F2F2F0]/70 uppercase tracking-wider truncate">
              {currentAdmin.role}
            </p>
          </div>
        )}
        <Link
          href="/"
          title={collapsed ? "View Storefront" : undefined}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] text-[11px] text-[#F2F2F0]/80 hover:text-[#F2F2F0] hover:bg-[#F2F2F0]/10 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <IconExternalLink className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>View Storefront</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0]">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 border-r border-[#26231F]/15 dark:border-[#F2F2F0]/15 print:hidden ${
          sidebarCollapsed ? "w-[68px]" : "w-60"
        }`}
      >
        <div className="sticky top-0 h-screen">
          {renderSidebarContent(sidebarCollapsed)}
        </div>
      </aside>

      {/* Mobile / Tablet Slide-over Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex print:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#26231F]/55"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[82vw] h-full shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-3.5 right-3 z-20 p-1 rounded-[4px] text-[#F2F2F0]/80 hover:text-[#F2F2F0]"
            >
              <IconClose className="w-4 h-4" />
            </button>
            {renderSidebarContent(false)}
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-14 bg-[#F2F2F0] dark:bg-[#26231F] border-b border-[#26231F]/15 dark:border-[#F2F2F0]/15 px-3 sm:px-6 flex items-center justify-between gap-3 print:hidden">
          {/* Left: Mobile Trigger + Breadcrumbs */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-1.5 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10"
            >
              <IconMenu className="w-4 h-4" />
            </button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs min-w-0">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={`${crumb.href}-${idx}`}>
                    {idx > 0 && (
                      <IconChevronRight className="w-3.5 h-3.5 text-[#26231F]/40 dark:text-[#F2F2F0]/45 shrink-0" />
                    )}
                    {isLast ? (
                      <span className="font-semibold text-[#26231F] dark:text-[#F2F2F0] truncate">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="hidden sm:inline text-[#26231F]/65 dark:text-[#F2F2F0]/65 hover:text-[#591623] dark:hover:text-[#F2F2F0] transition-colors truncate"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Right: Global Search, Refresh, Theme Switcher, Notifications, Admin Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Global Search */}
            <div ref={searchRef} className="relative">
              <div className="relative flex items-center">
                <IconSearch className="w-3.5 h-3.5 text-[#26231F]/55 dark:text-[#F2F2F0]/55 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  placeholder="Search catalog, collections, orders..."
                  aria-label="Global search"
                  className="w-32 sm:w-52 md:w-68 pl-8 pr-11 py-1.5 text-xs bg-[#26231F]/[0.04] dark:bg-[#F2F2F0]/[0.06] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[4px] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 focus:outline-none focus:bg-[#F2F2F0] dark:focus:bg-[#F2F2F0]/10 focus:border-[#591623] dark:focus:border-[#F2F2F0] transition-colors"
                />
                <kbd className="hidden md:inline-block absolute right-2 px-1.5 py-0.5 text-[10px] font-mono text-[#26231F]/55 dark:text-[#F2F2F0]/55 border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[3px]">
                  ⌘K
                </kbd>
              </div>

              {searchFocused && searchQuery.trim() && (
                <div className="absolute right-0 mt-1.5 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[6px] shadow-xl z-40 overflow-hidden">
                  {!hasSearchResults ? (
                    <p className="p-4 text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 text-center">
                      No matching products, collections, orders, or customers found.
                    </p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
                      {searchResults.collections.length > 0 && (
                        <div className="p-2">
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/75">
                            Collections
                          </p>
                          {searchResults.collections.map((col) => (
                            <button
                              key={col.id}
                              type="button"
                              onClick={() => {
                                setSearchFocused(false);
                                setSearchQuery("");
                                router.push(
                                  `/admin/collections?focus=${encodeURIComponent(col.id)}`
                                );
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-[4px] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="truncate font-medium text-[#26231F] dark:text-[#F2F2F0]">
                                {col.name}
                              </span>
                              <span className="shrink-0 text-[11px] font-mono text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                                {col.productCount} items
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.orders.length > 0 && (
                        <div className="p-2">
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/75">
                            Orders
                          </p>
                          {searchResults.orders.map((order) => (
                            <button
                              key={order.id}
                              type="button"
                              onClick={() => {
                                setSearchFocused(false);
                                setSearchQuery("");
                                router.push(
                                  `/admin/orders?focus=${encodeURIComponent(order.id)}`
                                );
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-[4px] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="truncate font-medium text-[#26231F] dark:text-[#F2F2F0]">
                                {order.orderNumber} — {order.customerName}
                              </span>
                              <span className="shrink-0 text-[11px] text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                                {formatINR(order.total)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.products.length > 0 && (
                        <div className="p-2">
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/75">
                            Products
                          </p>
                          {searchResults.products.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                setSearchFocused(false);
                                setSearchQuery("");
                                router.push(
                                  `/admin/products?focus=${encodeURIComponent(product.id)}`
                                );
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-[4px] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="truncate font-medium text-[#26231F] dark:text-[#F2F2F0]">
                                {product.name}
                              </span>
                              <span className="shrink-0 text-[11px] font-mono text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                                {product.sku}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.customers.length > 0 && (
                        <div className="p-2">
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]/75">
                            Customers
                          </p>
                          {searchResults.customers.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => {
                                setSearchFocused(false);
                                setSearchQuery("");
                                router.push(
                                  `/admin/users?focus=${encodeURIComponent(customer.id)}`
                                );
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-[4px] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="truncate font-medium text-[#26231F] dark:text-[#F2F2F0]">
                                {customer.fullName}
                              </span>
                              <span className="shrink-0 text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65 truncate max-w-[140px]">
                                {customer.email}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Refresh DB Workspace */}
            <button
              type="button"
              onClick={() => refreshWorkspace()}
              disabled={workspaceLoading}
              aria-label="Sync database workspace"
              title="Refresh data from PostgreSQL"
              className="hidden sm:inline-flex p-2 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 disabled:opacity-50 transition-colors"
            >
              <IconRefresh
                className={`w-3.5 h-3.5 ${workspaceLoading ? "animate-spin" : ""}`}
              />
            </button>

            {/* Admin-Only Theme Toggler */}
            <ThemeToggle variant="admin" />

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((v) => !v);
                  setProfileOpen(false);
                }}
                aria-label="Open notifications"
                className="relative p-2 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 transition-colors"
              >
                <IconBell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#8C072B] text-[#F2F2F0] text-[10px] font-semibold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-1.5 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[6px] shadow-xl z-40 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12">
                    <span className="text-xs font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                      Operational Alerts ({unreadCount} unread)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-medium text-[#591623] dark:text-[#F2F2F0] hover:text-[#8C072B] dark:hover:text-[#F2F2F0]/75"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                        All caught up. No operational alerts right now.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          type="button"
                          onClick={() =>
                            handleNotificationSelect(
                              notif.id,
                              notif.module,
                              notif.targetId
                            )
                          }
                          className={`w-full text-left px-4 py-3 hover:bg-[#26231F]/5 dark:hover:bg-[#F2F2F0]/8 transition-colors flex items-start gap-2.5 ${
                            !notif.read ? "bg-[#591623]/[0.04] dark:bg-[#591623]/25" : ""
                          }`}
                        >
                          <span
                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                              notif.read
                                ? "bg-[#26231F]/25 dark:bg-[#F2F2F0]/25"
                                : notif.severity === "attention"
                                ? "bg-[#8C072B]"
                                : "bg-[#591623] dark:bg-[#F2F2F0]"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-[#26231F] dark:text-[#F2F2F0]">
                              {notif.title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65 truncate">
                              {notif.description}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Administrator Profile */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotificationsOpen(false);
                }}
                aria-label="Administrator profile menu"
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 transition-colors"
              >
                <span className="w-6 h-6 rounded-[4px] bg-[#591623] text-[#F2F2F0] text-[11px] font-semibold flex items-center justify-center">
                  {initials}
                </span>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-medium text-[#26231F] dark:text-[#F2F2F0] max-w-[120px] truncate">
                    {currentAdmin?.fullName}
                  </p>
                  <p className="text-[10px] text-[#26231F]/65 dark:text-[#F2F2F0]/65 uppercase tracking-wider truncate">
                    {currentAdmin?.role}
                  </p>
                </div>
              </button>

              {profileOpen && currentAdmin && (
                <div className="absolute right-0 mt-1.5 w-64 bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[6px] shadow-xl z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#26231F] dark:text-[#F2F2F0] truncate">
                        {currentAdmin.fullName}
                      </p>
                      <StatusBadge label="Admin" />
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65 truncate">
                      {currentAdmin.email}
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-[4px] text-xs text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 transition-colors"
                    >
                      <IconSettings className="w-3.5 h-3.5" />
                      <span>Storefront &amp; Profile</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        signOutAdmin();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[4px] text-xs text-[#8C072B] dark:text-[#F2F2F0] hover:bg-[#8C072B]/8 dark:hover:bg-[#8C072B]/30 transition-colors"
                    >
                      <IconLogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Active Module Workspace */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto space-y-4">
          {workspaceError && (
            <div
              role="alert"
              className="p-3.5 rounded-[5px] border border-[#8C072B] bg-[#8C072B]/10 text-[#8C072B] dark:text-[#F2F2F0] flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <IconAlertTriangle className="w-4 h-4 shrink-0" />
                <span className="truncate">{workspaceError}</span>
              </div>
              <button
                type="button"
                onClick={() => refreshWorkspace()}
                className="px-3 py-1 rounded-[4px] bg-[#8C072B] text-[#F2F2F0] text-[11px] font-medium hover:bg-[#591623] transition-colors shrink-0"
              >
                Retry Sync
              </button>
            </div>
          )}
          {children}
        </main>
      </div>

      <AdminToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
