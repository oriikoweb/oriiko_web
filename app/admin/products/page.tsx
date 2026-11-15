import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsView } from "@/components/admin/products/ProductsView";
import { LoadingState } from "@/components/admin/ui/AdminUI";

export const metadata: Metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading product catalog..." />}>
      <ProductsView />
    </Suspense>
  );
}

