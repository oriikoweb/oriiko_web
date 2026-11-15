"use client";

import React, { useMemo, useState } from "react";
import { useAdmin } from "@/lib/admin/context";
import { formatINR } from "@/lib/admin/repository";
import type {
  AdminProduct,
  AdminProductVariant,
  ProductStatus,
} from "@/lib/admin/types";
import type { CloudinaryMediaItem } from "@/lib/media/cloudinary";
import { AdminModal } from "../ui/AdminUI";
import { ProductMediaGalleryPicker } from "../ui/CloudinaryMediaPicker";
import { IconTrash } from "../ui/AdminIcons";
import { IconPlus } from "@/components/ui/Icons";

interface ProductFormModalProps {
  open: boolean;
  product: AdminProduct | null;
  onClose: () => void;
}

const SIZE_PRESETS: Array<{ label: string; sizes: string[] }> = [
  { label: "Tops (XS–XXL)", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "Core (S–XL)", sizes: ["S", "M", "L", "XL"] },
  { label: "Bottoms (28–36)", sizes: ["28", "30", "32", "34", "36"] },
  { label: "One Size", sizes: ["OS"] },
];

const QUICK_COLORS: Array<{ name: string; hex: string }> = [
  { name: "Obsidian Ink", hex: "#26231F" },
  { name: "Oxblood", hex: "#591623" },
  { name: "Crimson Wine", hex: "#8C072B" },
  { name: "Ecru Chalk", hex: "#F2F2F0" },
  { name: "Slate Ash", hex: "#76726D" },
  { name: "Espresso", hex: "#3D2B24" },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function skuPrefixFromTitle(title: string): string {
  const letters = title
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w.slice(0, 3))
    .join("");
  return letters ? `ORI-${letters}` : "ORI-ITEM";
}

function colorCode(colorName: string): string {
  return (
    colorName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 3) || "CLR"
  );
}

export function ProductFormModal({
  open,
  product,
  onClose,
}: ProductFormModalProps) {
  const { workspace, saveProduct, saveCollection } = useAdmin();

  const isEditing = Boolean(product);

  // Core catalog fields
  const [name, setName] = useState(() => product?.name || "");
  const [subtitle, setSubtitle] = useState(() => product?.subtitle || "");
  const [slug, setSlug] = useState(() => product?.slug || "");
  const [slugTouched, setSlugTouched] = useState(() => Boolean(product));
  const [sku, setSku] = useState(() => product?.sku || "");
  const [skuTouched, setSkuTouched] = useState(() => Boolean(product));
  const [subcategory, setSubcategory] = useState(
    () => product?.subcategory || "Tops & Outerwear"
  );
  const [status, setStatus] = useState<ProductStatus>(
    () => product?.status || "Active"
  );

  // Merchandising flags
  const [isNewArrival, setIsNewArrival] = useState(
    () => product?.isNewArrival ?? true
  );
  const [isBestseller, setIsBestseller] = useState(
    () => product?.isBestseller ?? false
  );
  const [isFeatured, setIsFeatured] = useState(
    () => product?.isFeatured ?? false
  );
  const [promoLabel, setPromoLabel] = useState(() => product?.promoLabel || "");

  // Multi-collection tagging
  const [collectionIds, setCollectionIds] = useState<string[]>(() => {
    if (product?.collectionIds?.length) return product.collectionIds;
    const first = workspace.collections[0];
    return first ? [first.id] : [];
  });
  const [quickColOpen, setQuickColOpen] = useState(false);
  const [quickColName, setQuickColName] = useState("");
  const [quickColCreating, setQuickColCreating] = useState(false);

  // Cloudinary CDN Media
  const [media, setMedia] = useState<CloudinaryMediaItem[]>(() => {
    if (product?.media?.length) return product.media;
    const items: CloudinaryMediaItem[] = [];
    if (product?.primaryImage && product.primaryImage.startsWith("http")) {
      items.push({
        url: product.primaryImage,
        mediaType: "image",
        isPrimary: true,
      });
    }
    if (
      product?.secondaryImage &&
      product.secondaryImage.startsWith("http") &&
      product.secondaryImage !== product.primaryImage
    ) {
      items.push({
        url: product.secondaryImage,
        mediaType: "image",
        isPrimary: items.length === 0,
      });
    }
    return items;
  });

  // Pricing & margin
  const [price, setPrice] = useState(() => (product ? String(product.price) : ""));
  const [compareAtPrice, setCompareAtPrice] = useState(() =>
    product?.compareAtPrice ? String(product.compareAtPrice) : ""
  );
  const [costPrice, setCostPrice] = useState(() =>
    product?.costPrice ? String(product.costPrice) : ""
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(() =>
    String(product?.lowStockThreshold ?? 5)
  );

  // Narrative & garment specs
  const [description, setDescription] = useState(() => product?.description || "");
  const [detailsText, setDetailsText] = useState(() =>
    product?.details?.length
      ? product.details.join("\n")
      : "100% heavy combed cotton jersey\nPre-shrunk tailored relaxed silhouette"
  );
  const [materials, setMaterials] = useState(
    () => product?.materials || "480 GSM Heavyweight 100% Combed Cotton"
  );
  const [care, setCare] = useState(
    () => product?.care || "Cold gentle wash inside-out. Dry flat in shade."
  );

  // Variants & Oktopus-style Matrix Generator
  const [variants, setVariants] = useState<AdminProductVariant[]>(() => {
    if (product?.variants?.length) return product.variants;
    return ["S", "M", "L", "XL"].map((sz) => ({
      id: `var-${sz}-${Date.now()}`,
      name: `Obsidian Ink / ${sz}`,
      size: sz,
      color: "Obsidian Ink",
      colorHex: "#26231F",
      sku: `ORI-NEW-OBS-${sz}`,
      stock: 15,
      inStock: true,
    }));
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => {
    if (product?.variants?.length) {
      return Array.from(new Set(product.variants.map((v) => v.size)));
    }
    return ["S", "M", "L", "XL"];
  });
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [selectedColors, setSelectedColors] = useState<
    Array<{ name: string; hex: string }>
  >(() => {
    if (product?.variants?.length) {
      const seen = new Map<string, string>();
      for (const v of product.variants) {
        if (!seen.has(v.color)) seen.set(v.color, v.colorHex || "#26231F");
      }
      return Array.from(seen.entries()).map(([colorName, hex]) => ({
        name: colorName,
        hex,
      }));
    }
    return [{ name: "Obsidian Ink", hex: "#26231F" }];
  });
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#591623");
  const [bulkStockInput, setBulkStockInput] = useState("15");

  // Collapsible SEO
  const [seoOpen, setSeoOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState(() => product?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    () => product?.seoDescription || ""
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pricingMetrics = useMemo(() => {
    const p = Number(price) || 0;
    const c = Number(costPrice) || 0;
    const mrp = Number(compareAtPrice) || 0;
    const profit = p - c;
    const margin = p > 0 ? Math.round(((p - c) / p) * 100) : 0;
    const discountPct =
      mrp > p && mrp > 0 ? Math.round(((mrp - p) / mrp) * 100) : 0;
    return { p, c, mrp, profit, margin, discountPct };
  }, [price, costPrice, compareAtPrice]);

  const totalInventory = useMemo(
    () => variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0),
    [variants]
  );

  const toggleCollection = (id: string) => {
    setCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleQuickCreateCollection = async () => {
    const trimmed = quickColName.trim();
    if (!trimmed) return;
    setQuickColCreating(true);
    const createdSlug = slugify(trimmed);
    const ok = await saveCollection({
      name: trimmed,
      slug: createdSlug,
      description: "",
      coverImage: "",
      season: "CORE",
      isActive: true,
      sortOrder: workspace.collections.length + 1,
    });
    setQuickColCreating(false);
    if (ok) {
      setQuickColName("");
      setQuickColOpen(false);
    }
  };

  const toggleSizeOption = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  const addCustomSize = () => {
    const clean = customSizeInput.trim().toUpperCase();
    if (!clean) return;
    if (!selectedSizes.includes(clean)) {
      setSelectedSizes((prev) => [...prev, clean]);
    }
    setCustomSizeInput("");
  };

  const toggleColorOption = (color: { name: string; hex: string }) => {
    setSelectedColors((prev) =>
      prev.some((c) => c.name.toLowerCase() === color.name.toLowerCase())
        ? prev.filter((c) => c.name.toLowerCase() !== color.name.toLowerCase())
        : [...prev, color]
    );
  };

  const addCustomColor = () => {
    const clean = customColorName.trim();
    if (!clean) return;
    if (!selectedColors.some((c) => c.name.toLowerCase() === clean.toLowerCase())) {
      setSelectedColors((prev) => [...prev, { name: clean, hex: customColorHex }]);
    }
    setCustomColorName("");
  };

  const generateVariantMatrix = () => {
    const sizes = selectedSizes.length > 0 ? selectedSizes : ["OS"];
    const colors =
      selectedColors.length > 0
        ? selectedColors
        : [{ name: "Obsidian Ink", hex: "#26231F" }];
    const baseSku = (sku.trim() || skuPrefixFromTitle(name)).toUpperCase();
    const defaultQty = Math.max(0, Number.parseInt(bulkStockInput, 10) || 0);

    const existingMap = new Map<string, AdminProductVariant>();
    for (const v of variants) {
      existingMap.set(`${v.color.toLowerCase()}__${v.size.toLowerCase()}`, v);
    }

    const next: AdminProductVariant[] = [];
    for (const col of colors) {
      for (const sz of sizes) {
        const key = `${col.name.toLowerCase()}__${sz.toLowerCase()}`;
        const prev = existingMap.get(key);
        const qty = prev ? prev.stock : defaultQty;
        next.push({
          id: prev?.id || `var-${colorCode(col.name)}-${sz}-${Date.now()}`,
          name: `${col.name} / ${sz}`,
          size: sz,
          color: col.name,
          colorHex: col.hex,
          sku: prev?.sku || `${baseSku}-${colorCode(col.name)}-${sz}`,
          stock: qty,
          inStock: qty > 0,
        });
      }
    }
    setVariants(next);
  };

  const applyBulkStock = () => {
    const qty = Math.max(0, Number.parseInt(bulkStockInput, 10) || 0);
    setVariants((prev) =>
      prev.map((v) => ({ ...v, stock: qty, inStock: qty > 0 }))
    );
  };

  const updateVariantField = <K extends keyof AdminProductVariant>(
    idx: number,
    field: K,
    value: AdminProductVariant[K]
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== idx) return v;
        const updated = { ...v, [field]: value };
        if (field === "stock") {
          updated.inStock = Number(value) > 0;
        }
        updated.name = `${updated.color} / ${updated.size}`;
        return updated;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Product title is required.");
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setErrorMsg("Selling price must be greater than ₹0.");
      return;
    }

    if (media.length === 0) {
      setErrorMsg(
        "Add at least one Cloudinary CDN image or video before saving."
      );
      return;
    }

    if (variants.length === 0) {
      setErrorMsg("Add or generate at least one Size/Color variant.");
      return;
    }

    const selectedCollectionNames = workspace.collections
      .filter((c) => collectionIds.includes(c.id))
      .map((c) => c.name);

    const resolvedSlug = slugify(slug || name);
    const resolvedSku = (sku.trim() || skuPrefixFromTitle(name)).toUpperCase();
    const numericCompare = Number(compareAtPrice);
    const numericCost = Number(costPrice);

    setSubmitting(true);
    const ok = await saveProduct({
      id: product?.id,
      name: name.trim(),
      slug: resolvedSlug,
      subtitle: subtitle.trim() || undefined,
      collection: selectedCollectionNames.join(", ") || "CORE",
      category:
        selectedCollectionNames[0]?.toLowerCase() ||
        subcategory.trim().toLowerCase() ||
        "apparel",
      collectionIds,
      subcategory: subcategory.trim() || "Apparel",
      status,
      price: numericPrice,
      compareAtPrice:
        Number.isFinite(numericCompare) && numericCompare > numericPrice
          ? numericCompare
          : undefined,
      costPrice:
        Number.isFinite(numericCost) && numericCost >= 0 ? numericCost : 0,
      sku: resolvedSku,
      lowStockThreshold: Math.max(
        0,
        Number.parseInt(lowStockThreshold, 10) || 5
      ),
      isFeatured,
      isBestseller,
      isNewArrival,
      promoLabel: promoLabel.trim() || undefined,
      description: description.trim(),
      details: detailsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      materials: materials.trim(),
      care: care.trim(),
      media,
      variants: variants.map((v) => ({
        ...v,
        name: `${v.color || "Default"} / ${v.size || "OS"}`,
        inStock: v.stock > 0,
      })),
      seoTitle: seoTitle.trim() || `${name.trim()} — ORIIKO`,
      seoDescription:
        seoDescription.trim() || description.trim().slice(0, 155),
    });
    setSubmitting(false);

    if (ok) {
      onClose();
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit Product — ${product?.name}` : "Add New Product"}
      subtitle="Single-flow apparel builder: Cloudinary CDN media, multi-collection tags, and 1-click size × color matrix."
      maxWidth="max-w-5xl"
      footer={
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-[#26231F]/65 dark:text-[#F2F2F0]/65">
            {variants.length} variant{variants.length === 1 ? "" : "s"} •{" "}
            {totalInventory} total units • {collectionIds.length} collection tag
            {collectionIds.length === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:bg-[#26231F]/5 dark:hover:bg-[#F2F2F0]/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="oktopus-product-form"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] disabled:opacity-50 transition-colors"
            >
              {submitting
                ? "Saving Product..."
                : isEditing
                ? "Update Product"
                : "Publish Product"}
            </button>
          </div>
        </div>
      }
    >
      <form
        id="oktopus-product-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {errorMsg && (
          <div
            role="alert"
            className="p-3 rounded-[4px] border border-[#8C072B] bg-[#8C072B]/10 text-xs text-[#8C072B] font-medium"
          >
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN (7/12): Title, Media, Description, Variant Matrix */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Basic Details */}
            <section className="p-4 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.03] space-y-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]">
                1. Product Identity
              </h3>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setName(val);
                    if (!slugTouched) setSlug(slugify(val));
                    if (!skuTouched) setSku(skuPrefixFromTitle(val));
                  }}
                  placeholder="e.g. Heavyweight Boxy Hoodie — Oxblood"
                  className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Subtitle / Fit Line
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="480 GSM Drop-Shoulder Fleece"
                    className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Garment Type / Subcategory
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Hoodies / Graphic Tees / Bottoms"
                    className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    URL Handle (Auto)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="heavyweight-boxy-hoodie-oxblood"
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Master SKU Prefix
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => {
                      setSkuTouched(true);
                      setSku(e.target.value.toUpperCase());
                    }}
                    placeholder="ORI-HBH"
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe fabric weight, wash finish, construction seams, and fit..."
                  className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px] focus:outline-none focus:border-[#591623] dark:focus:border-[#F2F2F0]"
                />
              </div>
            </section>

            {/* 2. Cloudinary CDN Media Gallery */}
            <section className="p-4 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.03] space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]">
                2. Cloudinary Media (Images &amp; Videos) *
              </h3>
              <ProductMediaGalleryPicker media={media} onChange={setMedia} />
            </section>

            {/* 3. Oktopus-Style Size & Color Variant Matrix */}
            <section className="p-4 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.03] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]">
                    3. Sizes, Colorways &amp; Inventory Matrix *
                  </h3>
                  <p className="text-[11px] text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                    Pick sizes + colorways, then click Generate Matrix to build SKU rows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateVariantMatrix}
                  className="px-3 py-1.5 text-xs font-semibold rounded-[4px] bg-[#591623] text-[#F2F2F0] hover:bg-[#8C072B] transition-colors"
                >
                  Generate Matrix ({selectedSizes.length || 1} &times;{" "}
                  {selectedColors.length || 1})
                </button>
              </div>

              {/* Size selector */}
              <div className="space-y-2 p-3 rounded-[5px] border border-[#26231F]/12 dark:border-[#F2F2F0]/12">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Sizes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setSelectedSizes(preset.sizes)}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-[3px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:border-[#591623] dark:hover:border-[#F2F2F0]"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Array.from(
                    new Set(["XS", "S", "M", "L", "XL", "XXL", ...selectedSizes])
                  ).map((sz) => {
                    const active = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSizeOption(sz)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-[4px] border transition-colors ${
                          active
                            ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                            : "border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:border-[#591623]"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                  <div className="inline-flex items-center gap-1 ml-1">
                    <input
                      type="text"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSize();
                        }
                      }}
                      placeholder="Custom (e.g. 38)"
                      className="w-28 px-2 py-1 text-[11px] bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                    />
                    <button
                      type="button"
                      onClick={addCustomSize}
                      className="px-2 py-1 text-[11px] font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Colorway selector */}
              <div className="space-y-2 p-3 rounded-[5px] border border-[#26231F]/12 dark:border-[#F2F2F0]/12">
                <span className="text-[11px] font-semibold uppercase tracking-wider block">
                  Colorways
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COLORS.map((col) => {
                    const active = selectedColors.some(
                      (c) => c.name.toLowerCase() === col.name.toLowerCase()
                    );
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => toggleColorOption(col)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-[4px] border transition-colors ${
                          active
                            ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                            : "border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:border-[#591623]"
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-[#26231F]/30"
                          style={{ backgroundColor: col.hex }}
                        />
                        {col.name}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    aria-label="Pick color hex"
                    className="w-7 h-7 rounded-[4px] border border-[#26231F]/20 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomColor();
                      }
                    }}
                    placeholder="Add custom colorway..."
                    className="flex-1 min-w-[150px] px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="px-3 py-1.5 text-xs font-medium rounded-[4px] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:border-[#591623]"
                  >
                    Add Color
                  </button>
                </div>
              </div>

              {/* Bulk Stock Fill & Variant Table */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                    Bulk Qty:
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={bulkStockInput}
                    onChange={(e) => setBulkStockInput(e.target.value)}
                    className="w-20 px-2 py-1 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                  />
                  <button
                    type="button"
                    onClick={applyBulkStock}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-[4px] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 hover:border-[#591623]"
                  >
                    Apply to All Rows
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setVariants((prev) => [
                      ...prev,
                      {
                        id: `var-custom-${Date.now()}`,
                        name: "Obsidian Ink / OS",
                        size: "OS",
                        color: "Obsidian Ink",
                        colorHex: "#26231F",
                        sku: `${(sku || "ORI").toUpperCase()}-OS-${prev.length + 1}`,
                        stock: 10,
                        inStock: true,
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#591623] dark:text-[#F2F2F0] hover:underline"
                >
                  <IconPlus className="w-3 h-3" />
                  Add Single Row
                </button>
              </div>

              <div className="border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[5px] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#26231F]/[0.04] dark:bg-[#F2F2F0]/[0.05] text-[10px] uppercase tracking-wider text-[#26231F]/70 dark:text-[#F2F2F0]/70">
                    <tr>
                      <th className="py-2 px-2.5">Color</th>
                      <th className="py-2 px-2.5 w-20">Size</th>
                      <th className="py-2 px-2.5">Variant SKU</th>
                      <th className="py-2 px-2.5 w-24">Stock</th>
                      <th className="py-2 px-2 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26231F]/10 dark:divide-[#F2F2F0]/10">
                    {variants.map((variant, idx) => (
                      <tr key={variant.id}>
                        <td className="py-1.5 px-2.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={variant.colorHex || "#26231F"}
                              onChange={(e) =>
                                updateVariantField(idx, "colorHex", e.target.value)
                              }
                              aria-label="Variant hex"
                              className="w-5 h-5 rounded-[3px] border border-[#26231F]/20 bg-transparent cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={variant.color}
                              onChange={(e) =>
                                updateVariantField(idx, "color", e.target.value)
                              }
                              className="w-full min-w-[90px] px-2 py-1 text-xs bg-transparent border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[3px]"
                            />
                          </div>
                        </td>
                        <td className="py-1.5 px-2.5">
                          <input
                            type="text"
                            value={variant.size}
                            onChange={(e) =>
                              updateVariantField(idx, "size", e.target.value)
                            }
                            className="w-full px-2 py-1 text-xs bg-transparent border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[3px]"
                          />
                        </td>
                        <td className="py-1.5 px-2.5">
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) =>
                              updateVariantField(
                                idx,
                                "sku",
                                e.target.value.toUpperCase()
                              )
                            }
                            className="w-full min-w-[120px] px-2 py-1 text-xs font-mono bg-transparent border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[3px]"
                          />
                        </td>
                        <td className="py-1.5 px-2.5">
                          <input
                            type="number"
                            min={0}
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariantField(
                                idx,
                                "stock",
                                Math.max(0, Number.parseInt(e.target.value, 10) || 0)
                              )
                            }
                            className="w-full px-2 py-1 text-xs bg-transparent border border-[#26231F]/15 dark:border-[#F2F2F0]/15 rounded-[3px]"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right">
                          <button
                            type="button"
                            disabled={variants.length <= 1}
                            onClick={() =>
                              setVariants((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            aria-label="Remove variant"
                            className="p-1 rounded-[3px] text-[#8C072B] disabled:opacity-25 hover:bg-[#8C072B]/10"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. Garment Specs */}
            <section className="p-4 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.03] space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]">
                4. Fabric &amp; Garment Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Materials &amp; GSM
                  </label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Care Instructions
                  </label>
                  <input
                    type="text"
                    value={care}
                    onChange={(e) => setCare(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Bullet Highlights (one per line)
                </label>
                <textarea
                  rows={3}
                  value={detailsText}
                  onChange={(e) => setDetailsText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN (5/12): Status, Multi-Collection Tags, Pricing, SEO */}
          <div className="lg:col-span-5 space-y-5">
            {/* Status & Visibility */}
            <section className="p-4 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.03] space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]">
                Publish &amp; Storefront Placements
              </h3>

              <div>
                <label className="block text-xs font-medium mb-1.5">
                  Catalog Status
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["Active", "Draft", "Archived"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`py-2 text-xs font-medium rounded-[4px] border transition-colors ${
                        status === st
                          ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                          : "border-[#26231F]/20 dark:border-[#F2F2F0]/20 hover:border-[#591623]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center justify-between px-3 py-2 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 cursor-pointer text-xs">
                  <span>Show in New Arrivals</span>
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="accent-[#591623]"
                  />
                </label>
                <label className="flex items-center justify-between px-3 py-2 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 cursor-pointer text-xs">
                  <span>Highlight as Bestseller</span>
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="accent-[#591623]"
                  />
                </label>
                <label className="flex items-center justify-between px-3 py-2 rounded-[4px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 cursor-pointer text-xs">
                  <span>Feature on Home Spotlight</span>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-[#591623]"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Badge / Promo Pill (Optional)
                </label>
                <input
                  type="text"
                  value={promoLabel}
                  onChange={(e) => setPromoLabel(e.target.value)}
                  placeholder="DROP 01 / LIMITED / NEW"
                  className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                />
              </div>
            </section>

            {/* Multi-Collection Tagging */}
            <section className="p-4 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.03] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]">
                    Collections (Multi-Select Tags)
                  </h3>
                  <p className="text-[11px] text-[#26231F]/60 dark:text-[#F2F2F0]/60">
                    Tag this item under one or more storefront collections.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickColOpen((v) => !v)}
                  className="text-[11px] font-semibold text-[#591623] dark:text-[#F2F2F0] hover:underline shrink-0"
                >
                  {quickColOpen ? "Close" : "+ New"}
                </button>
              </div>

              {quickColOpen && (
                <div className="flex items-center gap-1.5 p-2 rounded-[4px] border border-[#591623]/30 bg-[#591623]/[0.04]">
                  <input
                    type="text"
                    value={quickColName}
                    onChange={(e) => setQuickColName(e.target.value)}
                    placeholder="New collection name..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/20 dark:border-[#F2F2F0]/20 rounded-[4px]"
                  />
                  <button
                    type="button"
                    disabled={quickColCreating || !quickColName.trim()}
                    onClick={handleQuickCreateCollection}
                    className="px-3 py-1.5 text-xs font-medium rounded-[4px] bg-[#591623] text-[#F2F2F0] disabled:opacity-50"
                  >
                    {quickColCreating ? "..." : "Create"}
                  </button>
                </div>
              )}

              {workspace.collections.length === 0 ? (
                <p className="text-xs text-[#26231F]/60 dark:text-[#F2F2F0]/60 py-2">
                  No collections yet. Click &ldquo;+ New&rdquo; above to create one.
                </p>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {workspace.collections.map((col) => {
                    const checked = collectionIds.includes(col.id);
                    return (
                      <label
                        key={col.id}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-[4px] border text-xs cursor-pointer transition-colors ${
                          checked
                            ? "border-[#591623] bg-[#591623]/10 dark:bg-[#591623]/35 text-[#26231F] dark:text-[#F2F2F0]"
                            : "border-[#26231F]/15 dark:border-[#F2F2F0]/15 hover:border-[#591623]/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCollection(col.id)}
                            className="accent-[#591623]"
                          />
                          <span className="font-medium truncate">{col.name}</span>
                        </div>
                        <span className="text-[10px] font-mono opacity-65 shrink-0">
                          {col.season || col.slug}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Pricing & Margin */}
            <section className="p-4 rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.03] space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]">
                Pricing &amp; Margin
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Selling Price (&#8377;) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2499"
                    className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Compare-At MRP (&#8377;)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="3499"
                    className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Unit Cost (&#8377;)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="890"
                    className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Low-Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                  />
                </div>
              </div>

              {pricingMetrics.p > 0 && (
                <div className="p-2.5 rounded-[4px] border border-[#26231F]/12 dark:border-[#F2F2F0]/12 bg-[#26231F]/[0.03] dark:bg-[#F2F2F0]/[0.04] flex items-center justify-between text-[11px]">
                  <span>
                    Profit: <strong>{formatINR(pricingMetrics.profit)}</strong> (
                    {pricingMetrics.margin}% margin)
                  </span>
                  {pricingMetrics.discountPct > 0 && (
                    <span className="font-semibold text-[#591623] dark:text-[#F2F2F0]">
                      {pricingMetrics.discountPct}% OFF MRP
                    </span>
                  )}
                </div>
              )}
            </section>

            {/* Collapsible SEO */}
            <section className="rounded-[6px] border border-[#26231F]/15 dark:border-[#F2F2F0]/15 bg-[#F2F2F0] dark:bg-[#F2F2F0]/[0.03] overflow-hidden">
              <button
                type="button"
                onClick={() => setSeoOpen((v) => !v)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#591623] dark:text-[#F2F2F0]"
              >
                <span>Search Engine Metadata (Optional)</span>
                <span className="text-[11px] font-normal">
                  {seoOpen ? "Hide" : "Edit"}
                </span>
              </button>
              {seoOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#26231F]/10 dark:border-[#F2F2F0]/10 pt-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder={`${name || "Product"} — ORIIKO`}
                      className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="155-character search preview snippet..."
                      className="w-full px-3 py-2 text-xs bg-[#F2F2F0] dark:bg-[#26231F] border border-[#26231F]/25 dark:border-[#F2F2F0]/25 rounded-[4px]"
                    />
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </form>
    </AdminModal>
  );
}
