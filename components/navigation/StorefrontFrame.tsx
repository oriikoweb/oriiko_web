"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "./AnnouncementBar";
import { MainHeader } from "./MainHeader";
import { NavigationDrawer } from "./NavigationDrawer";
import { SearchDrawer } from "./SearchDrawer";
import { CartDrawer } from "../cart/CartDrawer";
import { QuickViewModal } from "../product/QuickViewModal";
import { Footer } from "../footer/Footer";

function isStandaloneAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/")
  );
}

/**
 * Conditionally wraps routes in the global storefront header, drawers, and
 * footer, leaving dedicated authentication routes focused without duplicate branding.
 */
export function StorefrontFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isStandaloneAuthRoute(pathname)) {
    return <div className="flex-1 flex flex-col">{children}</div>;
  }

  return (
    <>
      <AnnouncementBar />
      <MainHeader />
      <NavigationDrawer />
      <SearchDrawer />
      <CartDrawer />
      <QuickViewModal />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
    </>
  );
}

