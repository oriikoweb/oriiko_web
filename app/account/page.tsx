"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../context/StoreContext";
import { AuthShell } from "../../components/auth/AuthShell";
import { IconArrowRight, IconLogOut, IconBag } from "../../components/ui/Icons";

export default function AccountPage() {
  const { user, profile, loading, signOut } = useAuth();
  const { triggerToast, freeShippingThreshold, formatPrice } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  const handleSignOut = async () => {
    await signOut();
    triggerToast("Signed out of ORIIKO");
    router.push("/signin");
  };

  if (loading || !user) {
    return (
      <AuthShell mode="storefront" eyebrow="Account" title="Verifying Session">
        <div className="py-8 text-center text-xs text-[#26231F]/60 dark:text-[#F2F2F0]/60 font-sans tracking-wider uppercase">
          Loading Profile...
        </div>
      </AuthShell>
    );
  }

  const initial = (
    profile?.full_name?.[0] ||
    user.email?.[0] ||
    "O"
  ).toUpperCase();

  const roleLabel =
    profile?.role === "admin" ? "ORIIKO Admin" : "Member Account";

  return (
    <AuthShell
      mode="storefront"
      eyebrow={roleLabel}
      title={profile?.full_name || "ORIIKO Member"}
      subtitle={user.email}
    >
      <div className="space-y-6">
        {/* Monogram Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#26231F]/10 dark:border-[#F2F2F0]/10">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#26231F]/55 dark:text-[#F2F2F0]/55 block font-sans">
              Status
            </span>
            <p className="text-xs font-medium text-[#591623] dark:text-[#F2F2F0] uppercase tracking-wider">
              Active Session
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#591623]/10 dark:bg-[#591623]/40 text-[#591623] dark:text-[#F2F2F0] border border-[#591623]/25 dark:border-[#8C072B]/60 flex items-center justify-center font-serif text-lg">
            {initial}
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3 text-xs font-sans">
          <div className="p-4 rounded-xl border border-[#26231F]/12 dark:border-[#F2F2F0]/15 space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-[#26231F]/50 dark:text-[#F2F2F0]/55 block">
              Member Benefits
            </span>
            <p className="text-[#26231F] dark:text-[#F2F2F0] leading-relaxed">
              {freeShippingThreshold <= 0
                ? "Free pan-India express shipping on all orders and early access to new drops."
                : `Free pan-India express shipping on orders above ${formatPrice(freeShippingThreshold)} and early access to new drops.`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-1">
          <Link
            href="/shop"
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-full bg-[#591623] hover:bg-[#8C072B] text-[#F2F2F0] transition-colors group"
          >
            <span className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] font-medium">
              <IconBag size={15} />
              Explore Collection
            </span>
            <IconArrowRight
              size={15}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-[#8C072B]/35 dark:border-[#8C072B]/70 text-[#8C072B] dark:text-[#F2F2F0] hover:bg-[#8C072B] hover:text-[#F2F2F0] text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
          >
            <IconLogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

