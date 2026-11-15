"use client";

import React, { useMemo, useState } from "react";
import { useAdmin } from "@/lib/admin/context";
import { formatDateTime, formatINR } from "@/lib/admin/repository";
import {
  AdminModal,
  EmptyState,
  Pagination,
  StatusBadge,
} from "../ui/AdminUI";
import { SingleCloudinaryField } from "../ui/CloudinaryMediaPicker";
import { IconPlus, IconSearch } from "@/components/ui/Icons";

type SettingsTab = "storefront" | "profile" | "accounts" | "logs";
const LOG_PAGE_SIZE = 10;

export function SettingsView() {
  const {
    currentAdmin,
    workspace,
    updateStoreSettings,
    updateOwnProfile,
    saveCustomer,
    updateUserRole,
  } = useAdmin();

  const [tab, setTab] = useState<SettingsTab>("storefront");

  // Storefront settings state
  const [deliveryDraft, setDeliveryDraft] = useState<string | null>(null);
  const [thresholdDraft, setThresholdDraft] = useState<string | null>(null);
  const [faviconDraft, setFaviconDraft] = useState<string | null>(null);
  const [heroVideoDraft, setHeroVideoDraft] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const deliveryCharge =
    deliveryDraft ?? String(workspace.settings.deliveryCharge);
  const freeShippingThreshold =
    thresholdDraft ?? String(workspace.settings.freeShippingThreshold);
  const faviconUrl =
    faviconDraft !== null
      ? faviconDraft
      : workspace.settings.faviconUrl || "";

  const heroVideoUrl =
    heroVideoDraft !== null
      ? heroVideoDraft
      : workspace.settings.heroVideoUrl || "";

  // Own profile state
  const [profileNameDraft, setProfileNameDraft] = useState<string | null>(null);
  const [profilePhoneDraft, setProfilePhoneDraft] = useState<string | null>(null);
  const [profileTitleDraft, setProfileTitleDraft] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const profileName = profileNameDraft ?? currentAdmin?.fullName ?? "";
  const profilePhone = profilePhoneDraft ?? currentAdmin?.phone ?? "";
  const profileTitle = profileTitleDraft ?? currentAdmin?.title ?? "";

  // Add Admin modal state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [admName, setAdmName] = useState("");
  const [admEmail, setAdmEmail] = useState("");
  const [admPhone, setAdmPhone] = useState("+91 ");
  const [admTitle, setAdmTitle] = useState("Store Administrator");
  const [admPassword, setAdmPassword] = useState("");
  const [admError, setAdmError] = useState<string | null>(null);
  const [savingAdmin, setSavingAdmin] = useState(false);

  // Activity logs
  const [logQuery, setLogQuery] = useState("");
  const [logModuleFilter, setLogModuleFilter] = useState("ALL");
  const [logPage, setLogPage] = useState(1);

  const filteredLogs = useMemo(() => {
    const q = logQuery.trim().toLowerCase();
    return workspace.activityLogs.filter((log) => {
      if (logModuleFilter !== "ALL" && log.module !== logModuleFilter) {
        return false;
      }
      if (q) {
        return (
          log.actorName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.target.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [workspace.activityLogs, logQuery, logModuleFilter]);

  const totalLogPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / LOG_PAGE_SIZE)
  );
  const safeLogPage = Math.min(logPage, totalLogPages);
  const paginatedLogs = useMemo(
    () =>
      filteredLogs.slice(
        (safeLogPage - 1) * LOG_PAGE_SIZE,
        safeLogPage * LOG_PAGE_SIZE
      ),
    [filteredLogs, safeLogPage]
  );

  const handleSaveStorefront = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDelivery = Math.max(0, Number(deliveryCharge) || 0);
    const parsedThreshold = Math.max(0, Number(freeShippingThreshold) || 0);
    setSavingSettings(true);
    const ok = await updateStoreSettings({
      deliveryCharge: parsedDelivery,
      freeShippingThreshold: parsedThreshold,
      faviconUrl: faviconUrl.trim() || null,
      heroVideoUrl: heroVideoUrl.trim() || null,
    });
    setSavingSettings(false);
    if (ok) {
      setDeliveryDraft(null);
      setThresholdDraft(null);
      setFaviconDraft(null);
      setHeroVideoDraft(null);
    }
  };

  const handleResetHeroVideo = async () => {
    setSavingSettings(true);
    const ok = await updateStoreSettings({
      deliveryCharge: Math.max(0, Number(deliveryCharge) || 0),
      freeShippingThreshold: Math.max(0, Number(freeShippingThreshold) || 0),
      faviconUrl: faviconUrl.trim() || null,
      heroVideoUrl: null,
    });
    setSavingSettings(false);
    if (ok) setHeroVideoDraft(null);
  };

  const handleResetFavicon = async () => {
    setSavingSettings(true);
    const ok = await updateStoreSettings({
      deliveryCharge: Math.max(0, Number(deliveryCharge) || 0),
      freeShippingThreshold: Math.max(0, Number(freeShippingThreshold) || 0),
      faviconUrl: null,
      heroVideoUrl: heroVideoUrl.trim() || null,
    });
    setSavingSettings(false);
    if (ok) {
      setFaviconDraft(null);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setSavingProfile(true);
    const ok = await updateOwnProfile({
      fullName: profileName.trim(),
      phone: profilePhone.trim(),
      title: profileTitle.trim(),
    });
    setSavingProfile(false);
    if (ok) {
      setProfileNameDraft(null);
      setProfilePhoneDraft(null);
      setProfileTitleDraft(null);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdmError(null);
    if (!admName.trim() || !admEmail.includes("@")) {
      setAdmError("Please enter a valid full name and email address.");
      return;
    }
    if (admPassword.trim().length < 6) {
      setAdmError("Password must be at least 6 characters.");
      return;
    }
    setSavingAdmin(true);
    const ok = await saveCustomer({
      fullName: admName.trim(),
      email: admEmail.trim().toLowerCase(),
      phone: admPhone.trim(),
      title: admTitle.trim() || "Store Administrator",
      role: "admin",
      password: admPassword.trim(),
    });
    setSavingAdmin(false);
    if (ok) {
      setAdminModalOpen(false);
      setAdmName("");
      setAdmEmail("");
      setAdmPassword("");
    }
  };

  const logModules = useMemo(() => {
    const set = new Set(workspace.activityLogs.map((l) => l.module));
    return Array.from(set);
  }, [workspace.activityLogs]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-[#26231F] dark:text-[#F2F2F0]">
          Store Settings, Administrators &amp; Logs
        </h1>
        <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 mt-0.5">
          Configure storefront delivery charges, free-shipping threshold, Cloudinary favicon,
          admin accounts, and real-time audit trail.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 pb-3">
        {(
          [
            { id: "storefront", label: "Storefront & Shipping" },
            { id: "accounts", label: `Administrators (${workspace.admins.length})` },
            { id: "profile", label: "My Profile" },
            { id: "logs", label: `Activity Logs (${workspace.activityLogs.length})` },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded-[4px] border transition-colors ${
              tab === item.id
                ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                : "border-[#26231F]/15 dark:border-[#F2F2F0]/15 text-[#26231F]/80 dark:text-[#F2F2F0]/80 hover:border-[#591623]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* TAB 1: STOREFRONT SHIPPING & FAVICON */}
      {tab === "storefront" && (
        <form
          onSubmit={handleSaveStorefront}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
        >
          {/* Shipping Fees & Threshold */}
          <div className="lg:col-span-6 p-5 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                Delivery Charges &amp; Free-Shipping Threshold
              </h2>
              <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 mt-0.5">
                Live across the Cart Drawer, Announcement Bar, Shipping Policy, and Checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="setting-delivery-charge"
                  className="block text-xs font-medium mb-1.5"
                >
                  Standard Delivery Charge (&#8377;)
                </label>
                <input
                  id="setting-delivery-charge"
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryDraft(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
                />
                <p className="mt-1 text-[11px] text-[#26231F]/55 dark:text-[#F2F2F0]/55">
                  Applied when cart subtotal is below threshold.
                </p>
              </div>

              <div>
                <label
                  htmlFor="setting-shipping-threshold"
                  className="block text-xs font-medium mb-1.5"
                >
                  Free-Shipping Threshold (&#8377;)
                </label>
                <input
                  id="setting-shipping-threshold"
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={freeShippingThreshold}
                  onChange={(e) => setThresholdDraft(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
                />
                <p className="mt-1 text-[11px] text-[#26231F]/55 dark:text-[#F2F2F0]/55">
                  Set 0 for always-free shipping across all orders.
                </p>
              </div>
            </div>

            {/* Live Storefront Calculation Preview */}
            <div className="p-3.5 rounded-[5px] border border-[#26231F]/12 dark:border-[#F2F2F0]/12 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04] space-y-1 text-xs">
              <p className="font-semibold text-[#591623] dark:text-[#F2F2F0]">
                Live Storefront Rule Preview
              </p>
              <p className="text-[#26231F]/75 dark:text-[#F2F2F0]/75">
                Orders under{" "}
                <strong>{formatINR(Number(freeShippingThreshold) || 0)}</strong> pay{" "}
                <strong>{formatINR(Number(deliveryCharge) || 0)}</strong> delivery fee.
                Orders at or above{" "}
                <strong>{formatINR(Number(freeShippingThreshold) || 0)}</strong> ship{" "}
                <strong>FREE</strong>.
              </p>
            </div>
          </div>

          {/* Storefront Favicon Configuration */}
          <div className="lg:col-span-6 p-5 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                  Storefront Browser Favicon (Cloudinary CDN)
                </h2>
                <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 mt-0.5">
                  Upload or paste a square PNG, SVG, or ICO Cloudinary link to update browser tabs.
                </p>
              </div>
              {workspace.settings.faviconUrl && (
                <button
                  type="button"
                  onClick={handleResetFavicon}
                  disabled={savingSettings}
                  className="text-[11px] font-medium text-[#8C072B] hover:underline shrink-0"
                >
                  Reset to Default Emblem
                </button>
              )}
            </div>

            <SingleCloudinaryField
              label="Favicon Asset URL"
              value={faviconUrl}
              onChange={(url) => setFaviconDraft(url)}
              folder="oriiko/branding"
              accept="image/png,image/svg+xml,image/x-icon,.ico,.svg,.png,.webp"
              placeholder="https://res.cloudinary.com/<cloud>/image/upload/.../favicon.png"
            />

            {/* Browser Tab Mock Preview */}
            <div className="p-3 rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F] text-[#F2F2F0] flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-[3px] bg-[#F2F2F0] flex items-center justify-center overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={faviconUrl || "/api/favicon"}
                  alt="Browser tab favicon preview"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <span className="text-xs font-medium tracking-wide truncate">
                ORIIKO — Contemporary Essentials
              </span>
            </div>
          </div>

          {/* Hero Section Background Video */}
          <div className="lg:col-span-12 p-5 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                  Hero Section Background Video
                </h2>
                <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 mt-0.5">
                  Paste a direct MP4 video URL (Cloudinary, CDN, or any publicly accessible link).
                  Played muted &amp; looped behind the homepage hero. Falls back to poster images
                  when empty or on reduced-motion devices.
                </p>
              </div>
              {workspace.settings.heroVideoUrl && (
                <button
                  type="button"
                  onClick={handleResetHeroVideo}
                  disabled={savingSettings}
                  className="text-[11px] font-medium text-[#8C072B] hover:underline shrink-0"
                >
                  Remove Video
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {/* URL input */}
              <div>
                <label
                  htmlFor="setting-hero-video-url"
                  className="block text-xs font-medium mb-1.5"
                >
                  Video URL (MP4)
                </label>
                <input
                  id="setting-hero-video-url"
                  type="url"
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoDraft(e.target.value)}
                  placeholder="https://res.cloudinary.com/<cloud>/video/upload/.../hero.mp4"
                  className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0] font-mono"
                />
                <p className="mt-1 text-[11px] text-[#26231F]/55 dark:text-[#F2F2F0]/55">
                  Leave blank to use the default static poster slides on the homepage.
                </p>

                {/* Status indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                      heroVideoUrl.trim()
                        ? "bg-emerald-500"
                        : "bg-[#26231F]/25 dark:bg-[#F2F2F0]/25"
                    }`}
                  />
                  <span className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                    {heroVideoUrl.trim()
                      ? "Custom video active — will play on homepage hero"
                      : "No custom video — homepage shows static poster slideshow"}
                  </span>
                </div>
              </div>

              {/* Live preview thumbnail */}
              <div className="rounded-[5px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 overflow-hidden bg-[#26231F] aspect-video flex items-center justify-center relative">
                {heroVideoUrl.trim() ? (
                  <video
                    key={heroVideoUrl}
                    src={heroVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLVideoElement).style.display = "none";
                    }}
                  />
                ) : null}
                <div className="relative z-10 text-center px-4 pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-[#F2F2F0]/15 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
                    <svg className="w-3.5 h-3.5 text-[#F2F2F0]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-[#F2F2F0]/70 uppercase tracking-wider">
                    {heroVideoUrl.trim() ? "Video Preview" : "No Video Set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 text-xs font-semibold rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] disabled:opacity-50 transition-colors"
            >
              {savingSettings ? "Saving Settings..." : "Save Storefront Settings"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ADMINISTRATORS (Strictly Admin vs Customer roles) */}
      {tab === "accounts" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                Administrator Accounts
              </h2>
              <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                ORIIKO uses two roles only: <strong>admin</strong> and <strong>customer</strong>.
                You can promote or demote any customer in User Management too.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAdmError(null);
                setAdminModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#591623] text-[#F2F2F0] text-xs font-medium hover:bg-[#8C072B] transition-colors"
            >
              <IconPlus className="w-3.5 h-3.5" />
              Add Administrator
            </button>
          </div>

          <div className="border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[6px] bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#26231F]/[0.04] dark:bg-[#F2F2F0]/[0.05] border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 text-[11px] uppercase tracking-wider text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                  <tr>
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
                  {workspace.admins.map((adm) => {
                    const isSelf = adm.id === currentAdmin?.id;
                    return (
                      <tr key={adm.id}>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                            {adm.fullName} {isSelf ? "(You)" : ""}
                          </p>
                          <p className="text-[11px] text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                            {adm.email} • {adm.phone || "No phone"}
                          </p>
                        </td>
                        <td className="py-3 px-4">{adm.title}</td>
                        <td className="py-3 px-4">
                          <StatusBadge label="admin" />
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                          {formatDateTime(adm.lastActiveAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => updateUserRole(adm.id, "customer")}
                              className="px-2.5 py-1 text-[11px] font-medium rounded-[4px] border border-[#8C072B]/35 text-[#8C072B] hover:bg-[#8C072B] hover:text-[#F2F2F0] transition-colors"
                            >
                              Revoke Admin Role
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OWN PROFILE */}
      {tab === "profile" && currentAdmin && (
        <form
          onSubmit={handleProfileSave}
          className="max-w-xl p-5 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                Administrator Profile
              </h2>
              <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                {currentAdmin.email}
              </p>
            </div>
            <StatusBadge label="admin" />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileNameDraft(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhoneDraft(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={profileTitle}
                  onChange={(e) => setProfileTitleDraft(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-4 py-2 text-xs font-semibold rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] disabled:opacity-50 transition-colors"
          >
            {savingProfile ? "Updating..." : "Save Profile"}
          </button>
        </form>
      )}

      {/* TAB 4: ACTIVITY LOGS */}
      {tab === "logs" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.02] dark:bg-[#F2F2F0]/[0.04] flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <IconSearch className="w-3.5 h-3.5 text-[#26231F]/50 dark:text-[#F2F2F0]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={logQuery}
                onChange={(e) => {
                  setLogQuery(e.target.value);
                  setLogPage(1);
                }}
                placeholder="Search logs by admin, action, or target..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[4px]"
              />
            </div>
            <select
              value={logModuleFilter}
              onChange={(e) => {
                setLogModuleFilter(e.target.value);
                setLogPage(1);
              }}
              aria-label="Filter logs by module"
              className="px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[4px]"
            >
              <option value="ALL">All Modules</option>
              {logModules.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          {filteredLogs.length === 0 ? (
            <EmptyState
              title="No activity logs recorded yet"
              description="Mutations performed in Products, Collections, Orders, Users, and Settings are recorded automatically in PostgreSQL."
            />
          ) : (
            <div className="border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[6px] bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#26231F]/[0.04] dark:bg-[#F2F2F0]/[0.05] border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 text-[11px] uppercase tracking-wider text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Admin</th>
                      <th className="py-3 px-4">Module</th>
                      <th className="py-3 px-4">Action &amp; Target</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
                    {paginatedLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2.5 px-4 whitespace-nowrap text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="py-2.5 px-4 font-medium">
                          {log.actorName}
                        </td>
                        <td className="py-2.5 px-4">
                          <StatusBadge label={log.module} tone="outline" />
                        </td>
                        <td className="py-2.5 px-4 font-medium">
                          {log.action}: <span className="font-mono">{log.target}</span>
                        </td>
                        <td className="py-2.5 px-4 text-[#26231F]/75 dark:text-[#F2F2F0]/75">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={safeLogPage}
                totalPages={totalLogPages}
                totalItems={filteredLogs.length}
                pageSize={LOG_PAGE_SIZE}
                onPageChange={setLogPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Add Administrator Modal */}
      <AdminModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        title="Create Administrator Account"
        subtitle="Creates a user in PostgreSQL with the 'admin' role."
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAdminModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-admin-form"
              disabled={savingAdmin}
              className="px-4 py-2 text-xs font-semibold rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] disabled:opacity-50"
            >
              {savingAdmin ? "Creating..." : "Create Admin"}
            </button>
          </>
        }
      >
        <form id="add-admin-form" onSubmit={handleCreateAdmin} className="space-y-3">
          {admError && (
            <div className="p-2.5 rounded-[4px] border border-[#8C072B] bg-[#8C072B]/10 text-xs text-[#8C072B]">
              {admError}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={admName}
              onChange={(e) => setAdmName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              value={admEmail}
              onChange={(e) => setAdmEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Phone</label>
              <input
                type="text"
                value={admPhone}
                onChange={(e) => setAdmPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Title</label>
              <input
                type="text"
                value={admTitle}
                onChange={(e) => setAdmTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              Initial Password (min 6 chars) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={admPassword}
              onChange={(e) => setAdmPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
            />
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
