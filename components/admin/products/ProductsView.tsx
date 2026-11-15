"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAdmin } from "@/lib/admin/context";
import { formatINR, getProductTotalStock } from "@/lib/admin/repository";
import type { AdminProduct, ProductStatus } from "@/lib/admin/types";
import { IconPlus, IconSearch } from "@/components/ui/Icons";
import {
  IconArchive,
  IconCollections,
  IconCopy,
  IconEdit,
  IconImage,
  IconSort,
  IconTrash,
} from "../ui/AdminIcons";
import {
  ConfirmDialog,
  EmptyState,
  LoadingState,
  Pagination,
  StatusBadge,
} from "../ui/AdminUI";
import { ProductFormModal } from "./ProductFormModal";

type SortKey = "name" | "price" | "stock" | "sales" | "updatedAt";
const PAGE_SIZE = 8;

export function ProductsView() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");

  const {
    workspace,
    workspaceLoading,
    duplicateProduct,
    updateProductStatus,
    bulkUpdateProductStatus,
    deleteProduct,
    bulkDeleteProducts,
  } = useAdmin();

  const [query, setQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProductStatus>("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW" | "OUT">("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [closedFocusId, setClosedFocusId] = useState<string | null>(null);

  const focusedProduct =
    !productModalOpen && focusId && focusId !== closedFocusId
      ? workspace.products.find((p) => p.id === focusId) ?? null
      : null;

  const activeModalProduct = editingProduct ?? focusedProduct;
  const isModalOpen = productModalOpen || Boolean(focusedProduct);

  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "bulk-delete" | "archive";
    productId?: string;
    label: string;
  } | null>(null);

  const collectionMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of workspace.collections) {
      map.set(c.id, c.name);
    }
    return map;
  }, [workspace.collections]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workspace.products
      .filter((p) => {
        if (q) {
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.collection.toLowerCase().includes(q) ||
            p.subcategory.toLowerCase().includes(q) ||
            p.variants.some((v) => v.sku.toLowerCase().includes(q));
          if (!matches) return false;
        }
        if (
          collectionFilter !== "ALL" &&
          !p.collectionIds.includes(collectionFilter)
        ) {
          return false;
        }
        if (statusFilter !== "ALL" && p.status !== statusFilter) {
          return false;
        }
        const totalStock = getProductTotalStock(p);
        const hasLowVariant = p.variants.some(
          (v) => v.stock <= p.lowStockThreshold
        );
        if (stockFilter === "LOW" && !hasLowVariant) return false;
        if (
          stockFilter === "OUT" &&
          totalStock > 0 &&
          p.variants.every((v) => v.stock > 0)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const mult = sortDir === "asc" ? 1 : -1;
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name) * mult;
          case "price":
            return (a.price - b.price) * mult;
          case "stock":
            return (getProductTotalStock(a) - getProductTotalStock(b)) * mult;
          case "sales":
            return (a.salesCount - b.salesCount) * mult;
          case "updatedAt":
          default:
            return a.updatedAt.localeCompare(b.updatedAt) * mult;
        }
      });
  }, [
    workspace.products,
    query,
    collectionFilter,
    statusFilter,
    stockFilter,
    sortBy,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const allOnPageSelected =
    paginated.length > 0 &&
    paginated.every((p) => selectedIds.includes(p.id));

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      const pageSet = new Set(paginated.map((p) => p.id));
      setSelectedIds((prev) => prev.filter((id) => !pageSet.has(id)));
    } else {
      setSelectedIds((prev) =>
        Array.from(new Set([...prev, ...paginated.map((p) => p.id)]))
      );
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirmExecute = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === "delete" && confirmAction.productId) {
      await deleteProduct(confirmAction.productId);
      setSelectedIds((prev) =>
        prev.filter((x) => x !== confirmAction.productId)
      );
    } else if (confirmAction.type === "bulk-delete") {
      await bulkDeleteProducts(selectedIds);
      setSelectedIds([]);
    } else if (confirmAction.type === "archive" && confirmAction.productId) {
      await updateProductStatus(confirmAction.productId, "Archived");
    }
    setConfirmAction(null);
  };

  const activeCount = workspace.products.filter(
    (p) => p.status === "Active"
  ).length;
  const lowStockCount = workspace.products.filter((p) =>
    p.variants.some((v) => v.stock <= p.lowStockThreshold)
  ).length;

  if (workspaceLoading && workspace.products.length === 0) {
    return <LoadingState label="Loading product catalog..." />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#26231F] dark:text-[#F2F2F0]">
            Product Catalog &amp; Inventory
          </h1>
          <p className="text-xs text-[#26231F]/65 dark:text-[#F2F2F0]/65 mt-0.5">
            {workspace.products.length} products ({activeCount} active) •{" "}
            {lowStockCount} SKU alerts • Cloudinary CDN media &amp; multi-collection tags
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/collections"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 text-[#26231F] dark:text-[#F2F2F0] hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10 transition-colors"
          >
            <IconCollections className="w-3.5 h-3.5" />
            Manage Collections
          </Link>
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setProductModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] transition-colors"
          >
            <IconPlus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-3.5 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#26231F]/[0.02] dark:bg-[#F2F2F0]/[0.04] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
        <div className="lg:col-span-5 relative">
          <IconSearch className="w-3.5 h-3.5 text-[#26231F]/55 dark:text-[#F2F2F0]/55 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, SKU, variant SKU, or collection..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] placeholder:text-[#26231F]/45 dark:placeholder:text-[#F2F2F0]/45 border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          />
        </div>

        <div className="lg:col-span-2">
          <select
            value={collectionFilter}
            onChange={(e) => {
              setCollectionFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by collection"
            className="w-full px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          >
            <option value="ALL">All Collections</option>
            {workspace.collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "ALL" | ProductStatus);
              setPage(1);
            }}
            aria-label="Filter by status"
            className="w-full px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as "ALL" | "LOW" | "OUT");
              setPage(1);
            }}
            aria-label="Filter by inventory health"
            className="w-full px-2.5 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] border border-[#26231F]/15 dark:border-[#F2F2F0]/20 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="LOW">Low / Depleted Variants</option>
            <option value="OUT">Contains Out-of-Stock Size</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-[5px] bg-[#591623] text-[#F2F2F0] text-xs">
          <span className="font-medium">
            {selectedIds.length} product(s) selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                bulkUpdateProductStatus(selectedIds, "Active");
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 rounded-[4px] bg-[#F2F2F0] text-[#591623] font-medium hover:opacity-90"
            >
              Set Active
            </button>
            <button
              type="button"
              onClick={() => {
                bulkUpdateProductStatus(selectedIds, "Draft");
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 rounded-[4px] border border-[#F2F2F0]/40 hover:bg-[#F2F2F0]/15"
            >
              Set Draft
            </button>
            <button
              type="button"
              onClick={() => {
                bulkUpdateProductStatus(selectedIds, "Archived");
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 rounded-[4px] border border-[#F2F2F0]/40 hover:bg-[#F2F2F0]/15"
            >
              Archive
            </button>
            <button
              type="button"
              onClick={() =>
                setConfirmAction({
                  type: "bulk-delete",
                  label: `${selectedIds.length} selected product(s)`,
                })
              }
              className="px-2.5 py-1 rounded-[4px] bg-[#8C072B] text-[#F2F2F0] font-medium hover:bg-[#26231F]"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Adjust search terms or collection filters, or add a new product using Cloudinary CDN media."
          action={
            workspace.products.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setProductModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B]"
              >
                Add First Product
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCollectionFilter("ALL");
                  setStatusFilter("ALL");
                  setStockFilter("ALL");
                }}
                className="px-3.5 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:bg-[#26231F]/6 dark:hover:bg-[#F2F2F0]/10"
              >
                Reset Filters
              </button>
            )
          }
        />
      ) : (
        <div className="border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[6px] bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.04] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#26231F]/[0.04] dark:bg-[#F2F2F0]/[0.05] border-b border-[#26231F]/12 dark:border-[#F2F2F0]/12 text-[11px] uppercase tracking-wider text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                <tr>
                  <th className="py-3 pl-4 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Select all products on page"
                      className="accent-[#591623] dark:accent-[#8C072B]"
                    />
                  </th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Product <IconSort />
                    </button>
                  </th>
                  <th className="py-3 px-3">Collections</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("price")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Price <IconSort />
                    </button>
                  </th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("stock")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Stock &amp; Sizes <IconSort />
                    </button>
                  </th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("sales")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-[#591623] dark:hover:text-[#F2F2F0]"
                    >
                      Units Sold <IconSort />
                    </button>
                  </th>
                  <th className="py-3 pl-3 pr-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
                {paginated.map((product) => {
                  const totalStock = getProductTotalStock(product);
                  const lowVariants = product.variants.filter(
                    (v) => v.stock <= product.lowStockThreshold
                  ).length;
                  const uniqueSizes = Array.from(
                    new Set(product.variants.map((v) => v.size).filter(Boolean))
                  );
                  const taggedCollections = product.collectionIds
                    .map((cid) => collectionMap.get(cid))
                    .filter(Boolean) as string[];

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#26231F]/[0.025] dark:hover:bg-[#F2F2F0]/[0.04] transition-colors"
                    >
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleRow(product.id)}
                          aria-label={`Select ${product.name}`}
                          className="accent-[#591623] dark:accent-[#8C072B]"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3 min-w-[210px]">
                          {product.primaryImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.primaryImage}
                              alt={product.name}
                              className="w-10 h-12 object-cover rounded-[4px] border border-[#26231F]/12 dark:border-[#F2F2F0]/15 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-12 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 flex items-center justify-center shrink-0 text-[#26231F]/40 dark:text-[#F2F2F0]/40">
                              <IconImage className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(product);
                                setProductModalOpen(true);
                              }}
                              className="font-semibold text-[#26231F] dark:text-[#F2F2F0] hover:text-[#591623] dark:hover:text-[#F2F2F0]/75 text-left truncate block max-w-[220px]"
                            >
                              {product.name}
                            </button>
                            <p className="text-[11px] font-mono text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                              {product.sku} • {product.subcategory}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {taggedCollections.length > 0 ? (
                            taggedCollections.map((colName) => (
                              <span
                                key={colName}
                                className="px-1.5 py-0.5 text-[10px] font-medium rounded-[3px] border border-[#26231F]/15 dark:border-[#F2F2F0]/20 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.06]"
                              >
                                {colName}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#26231F]/50 dark:text-[#F2F2F0]/50">
                              {product.collection || "Unassigned"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge label={product.status} />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="font-semibold text-[#26231F] dark:text-[#F2F2F0]">
                          {formatINR(product.price)}
                        </p>
                        {product.compareAtPrice && (
                          <p className="text-[11px] line-through text-[#26231F]/50 dark:text-[#F2F2F0]/50">
                            {formatINR(product.compareAtPrice)}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#26231F] dark:text-[#F2F2F0]">
                              {totalStock} in stock
                            </span>
                            {lowVariants > 0 && (
                              <StatusBadge
                                label={
                                  totalStock === 0 ? "Out of Stock" : "Low Stock"
                                }
                              />
                            )}
                          </div>
                          <span className="text-[11px] text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                            Sizes: {uniqueSizes.join(", ") || "OS"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium">
                        {product.salesCount}
                      </td>
                      <td className="py-3 pl-3 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Edit product"
                            onClick={() => {
                              setEditingProduct(product);
                              setProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-[4px] text-[#26231F]/70 dark:text-[#F2F2F0]/70 hover:text-[#591623] dark:hover:text-[#F2F2F0] hover:bg-[#591623]/10 dark:hover:bg-[#F2F2F0]/10"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Duplicate as Draft"
                            onClick={() => duplicateProduct(product.id)}
                            className="p-1.5 rounded-[4px] text-[#26231F]/70 dark:text-[#F2F2F0]/70 hover:text-[#591623] dark:hover:text-[#F2F2F0] hover:bg-[#591623]/10 dark:hover:bg-[#F2F2F0]/10"
                          >
                            <IconCopy className="w-3.5 h-3.5" />
                          </button>
                          {product.status !== "Archived" && (
                            <button
                              type="button"
                              title="Archive product"
                              onClick={() =>
                                setConfirmAction({
                                  type: "archive",
                                  productId: product.id,
                                  label: product.name,
                                })
                              }
                              className="p-1.5 rounded-[4px] text-[#26231F]/70 dark:text-[#F2F2F0]/70 hover:text-[#591623] dark:hover:text-[#F2F2F0] hover:bg-[#591623]/10 dark:hover:bg-[#F2F2F0]/10"
                            >
                              <IconArchive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Delete product"
                            onClick={() =>
                              setConfirmAction({
                                type: "delete",
                                productId: product.id,
                                label: product.name,
                              })
                            }
                            className="p-1.5 rounded-[4px] text-[#26231F]/70 dark:text-[#F2F2F0]/70 hover:text-[#8C072B] dark:hover:text-[#F2F2F0] hover:bg-[#8C072B]/10 dark:hover:bg-[#8C072B]/60"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      <ProductFormModal
        key={`${activeModalProduct?.id || "new"}-${isModalOpen ? "open" : "closed"}`}
        open={isModalOpen}
        product={activeModalProduct}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
          if (focusId) setClosedFocusId(focusId);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        destructive={confirmAction?.type !== "archive"}
        title={
          confirmAction?.type === "archive"
            ? "Archive Product"
            : "Delete Product"
        }
        description={
          confirmAction?.type === "archive"
            ? `Archive "${confirmAction.label}"? It will be hidden from active storefront drops while preserving historical order records.`
            : `Permanently delete ${confirmAction?.label}? This cannot be undone.`
        }
        confirmLabel={
          confirmAction?.type === "archive" ? "Archive Product" : "Delete"
        }
        onConfirm={handleConfirmExecute}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
