import type { Metadata } from "next";
import { AdminProvider } from "@/lib/admin/context";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Admin Console",
    template: "%s — Admin — ORIIKO",
  },
  description:
    "ORIIKO e-commerce operations, catalog, collections, order management, customer directory, and store settings console.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminAuthGate>
        <AdminShell>{children}</AdminShell>
      </AdminAuthGate>
    </AdminProvider>
  );
}

