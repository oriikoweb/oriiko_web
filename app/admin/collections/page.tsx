import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionsView } from "@/components/admin/collections/CollectionsView";
import { LoadingState } from "@/components/admin/ui/AdminUI";

export const metadata: Metadata = {
  title: "Collections",
};

export default function AdminCollectionsPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading Collections..." />}>
      <CollectionsView />
    </Suspense>
  );
}

