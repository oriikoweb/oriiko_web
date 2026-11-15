"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAdmin } from "@/lib/admin/context";
import type { AdminCollection } from "@/lib/admin/types";
import {
  AdminModal,
  ConfirmDialog,
  EmptyState,
  LoadingState,
  StatusBadge,
} from "../ui/AdminUI";
import {
  IconCollections,
  IconEdit,
  IconExternalLink,
  IconTrash,
} from "../ui/AdminIcons";
import { IconPlus, IconSearch } from "@/components/ui/Icons";
import { SingleCloudinaryField } from "../ui/CloudinaryMediaPicker";

function slugifyCollection(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CollectionFormModal({
  open,
  collection,
  defaultSortOrder,
  onClose,
}: {
  open: boolean;
  collection: AdminCollection | null;
  defaultSortOrder: number;
  onClose: () => void;
}) {
  const { saveCollection } = useAdmin();

  const [name, setName] = useState(collection?.name || "");
  const [slug, setSlug] = useState(collection?.slug || "");
  const [slugEditedManually, setSlugEditedManually] = useState(
    Boolean(collection)
  );
  const [season, setSeason] = useState(collection?.season || "CORE");
  const [sortOrder, setSortOrder] = useState(
    String(collection?.sortOrder ?? defaultSortOrder)
  );
  const [isActive, setIsActive] = useState(collection?.isActive ?? true);
  const [description, setDescription] = useState(collection?.description || "");
  const [coverImage, setCoverImage] = useState(collection?.coverImage || "");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Collection name is required.");
      return;
    }

    const resolvedSlug = slugifyCollection(slug || name);
    if (!resolvedSlug) {
      setFormError("A valid URL slug is required.");
      return;
    }

    const parsedOrder = Number.parseInt(sortOrder, 10);
    setSaving(true);
    const ok = await saveCollection({
      id: collection?.id,
      name: name.trim(),
      slug: resolvedSlug,
      season: season.trim() || "CORE",
      sortOrder: Number.isFinite(parsedOrder) ? parsedOrder : 0,
      isActive,
      description: description.trim(),
      coverImage: coverImage.trim(),
    });
    setSaving(false);

    if (ok) {
      onClose();
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={
        collection
          ? `Edit Collection — ${collection.name}`
          : "Create Collection"
      }
      subtitle="Collections act as storefront categories. Products can be tagged to multiple collections."
      maxWidth="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:bg-[#26231F]/5 dark:hover:bg-[#F2F2F0]/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="collection-form"
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] disabled:opacity-50 transition-colors"
          >
            {saving
              ? "Saving..."
              : collection
              ? "Update Collection"
              : "Create Collection"}
          </button>
        </>
      }
    >
      <form id="collection-form" onSubmit={handleSave} className="space-y-4">
        {formError && (
          <div className="p-3 rounded-[4px] border border-[#8C072B] bg-[#8C072B]/10 text-xs text-[#8C072B]">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium mb-1">
              Collection Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                if (!slugEditedManually) {
                  setSlug(slugifyCollection(val));
                }
              }}
              placeholder="e.g. Heavyweight Fleece"
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlugEditedManually(true);
                setSlug(slugifyCollection(e.target.value));
              }}
              placeholder="heavyweight-fleece"
              className="w-full px-3 py-2 text-xs font-mono bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Season / Drop Label
            </label>
            <input
              type="text"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              placeholder="DROP 01 / AW26 / CORE"
              className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-[#591623]"
                />
                <span>Active</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            Collection Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short editorial summary displayed on the collection page..."
            className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          />
        </div>

        <SingleCloudinaryField
          label="Cover Image (Cloudinary CDN)"
          value={coverImage}
          onChange={setCoverImage}
          folder="oriiko/collections"
          helperText="Optional Cloudinary CDN cover image shown on storefront collection cards."
        />
      </form>
    </AdminModal>
  );
}

export function CollectionsView() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus") || "";

  const { workspace, workspaceLoading, deleteCollection } = useAdmin();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Inactive">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<AdminCollection | null>(null);
  const [closedFocusId, setClosedFocusId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminCollection | null>(null);

  const focusedCollection =
    !modalOpen && focusId && focusId !== closedFocusId
      ? workspace.collections.find((c) => c.id === focusId) ?? null
      : null;

  const activeModalCollection = editingCollection ?? focusedCollection;
  const isModalOpen = modalOpen || Boolean(focusedCollection);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...workspace.collections]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .filter((col) => {
        if (statusFilter === "Active" && !col.isActive) return false;
        if (statusFilter === "Inactive" && col.isActive) return false;
        if (!q) return true;
        return (
          col.name.toLowerCase().includes(q) ||
          col.slug.toLowerCase().includes(q) ||
          col.season.toLowerCase().includes(q) ||
          col.description.toLowerCase().includes(q)
        );
      });
  }, [workspace.collections, search, statusFilter]);

  if (workspaceLoading && workspace.collections.length === 0) {
    return <LoadingState label="Loading collections from PostgreSQL..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#26231F] dark:text-[#F2F2F0]">
            Collections (Storefront Categories)
          </h1>
          <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 mt-0.5">
            Manage product categories displayed as Collections across storefront navigation, filters, and product tags.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCollection(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#591623] text-[#F2F2F0] text-xs font-medium hover:bg-[#8C072B] transition-colors self-start sm:self-auto"
        >
          <IconPlus className="w-3.5 h-3.5" />
          New Collection
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[6px] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="w-3.5 h-3.5 text-[#26231F]/50 dark:text-[#F2F2F0]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections by name, slug, or season..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.06] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[4px] text-[#26231F] dark:text-[#F2F2F0] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(["ALL", "Active", "Inactive"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] border transition-colors ${
                statusFilter === status
                  ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                  : "border-[#26231F]/15 dark:border-[#F2F2F0]/15 text-[#26231F]/80 dark:text-[#F2F2F0]/80 hover:border-[#591623]"
              }`}
            >
              {status === "ALL" ? `All (${workspace.collections.length})` : status}
            </button>
          ))}
        </div>
      </div>

      {/* Collections Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No collections found"
          description="Create your first collection (e.g., Street Drops, Minimal Essentials, Heavyweight Outerwear) to organize storefront products."
          action={
            <button
              type="button"
              onClick={() => {
                setEditingCollection(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] transition-colors"
            >
              Create Collection
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((col) => (
            <div
              key={col.id}
              className="bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[6px] overflow-hidden flex flex-col"
            >
              <div className="relative h-40 bg-[#26231F]/5 dark:bg-[#F2F2F0]/5 border-b border-[#26231F]/10 dark:border-[#F2F2F0]/10 overflow-hidden">
                {col.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={col.coverImage}
                    alt={col.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[#26231F]/40 dark:text-[#F2F2F0]/40">
                    <IconCollections className="w-6 h-6" />
                    <span className="text-[11px] uppercase tracking-wider">
                      No Cloudinary Cover
                    </span>
                  </div>
                )}

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <StatusBadge label={col.isActive ? "Active" : "Inactive"} />
                  {col.season && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-[4px] bg-[#26231F] text-[#F2F2F0]">
                      {col.season}
                    </span>
                  )}
                </div>

                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-mono rounded-[4px] bg-[#F2F2F0] text-[#26231F] border border-[#26231F]/20">
                  Order #{col.sortOrder}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-[#26231F] dark:text-[#F2F2F0] truncate">
                        {col.name}
                      </h2>
                      <p className="text-[11px] font-mono text-[#26231F]/60 dark:text-[#F2F2F0]/60 truncate">
                        /shop?collection={col.slug}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-semibold bg-[#591623]/10 dark:bg-[#591623]/35 text-[#591623] dark:text-[#F2F2F0] shrink-0">
                      {col.productCount} {col.productCount === 1 ? "product" : "products"}
                    </span>
                  </div>
                  {col.description && (
                    <p className="mt-2 text-xs text-[#26231F]/70 dark:text-[#F2F2F0]/70 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#26231F]/10 dark:border-[#F2F2F0]/10 flex items-center justify-between gap-2">
                  <Link
                    href={`/shop?collection=${encodeURIComponent(col.slug)}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#591623] dark:text-[#F2F2F0] hover:underline"
                  >
                    <IconExternalLink className="w-3 h-3" />
                    Storefront View
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCollection(col);
                        setModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 text-[11px] font-medium hover:border-[#591623] dark:hover:border-[#F2F2F0] transition-colors"
                    >
                      <IconEdit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(col)}
                      aria-label={`Delete ${col.name}`}
                      className="p-1.5 rounded-[4px] border border-[#8C072B]/30 text-[#8C072B] hover:bg-[#8C072B] hover:text-[#F2F2F0] transition-colors"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CollectionFormModal
        key={`${activeModalCollection?.id || "new"}-${isModalOpen ? "open" : "closed"}`}
        open={isModalOpen}
        collection={activeModalCollection}
        defaultSortOrder={workspace.collections.length + 1}
        onClose={() => {
          setModalOpen(false);
          setEditingCollection(null);
          if (focusId) setClosedFocusId(focusId);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await deleteCollection(confirmDelete.id);
          setConfirmDelete(null);
        }}
        title={`Delete "${confirmDelete?.name}"?`}
        description="Products tagged to this collection will remain in your catalog and simply be untagged from this collection."
        confirmLabel="Delete Collection"
        destructive
      />
    </div>
  );
}
