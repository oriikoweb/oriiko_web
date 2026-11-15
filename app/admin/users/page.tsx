import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersView } from "@/components/admin/users/UsersView";
import { LoadingState } from "@/components/admin/ui/AdminUI";

export const metadata: Metadata = {
  title: "User Management",
};

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading customer directory..." />}>
      <UsersView />
    </Suspense>
  );
}

