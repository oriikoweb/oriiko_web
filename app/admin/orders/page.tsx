import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersView } from "@/components/admin/orders/OrdersView";
import { LoadingState } from "@/components/admin/ui/AdminUI";

export const metadata: Metadata = {
  title: "Order Management",
};

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading orders..." />}>
      <OrdersView />
    </Suspense>
  );
}

