"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "../../components/product/ProductCard";
import { IconFilter, IconClose, IconChevronDown } from "../../components/ui/Icons";
import { useStore } from "../../context/StoreContext";

function ShopContent() {
  const { products, collections, catalogLoading } = useStore();
  const searchParams = useSearchParams();
  const initialCollection =
    searchParams.get("collection") || searchParams.get("category") || "all";
  const initialSort = searchParams.get("sort") || "featured";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCollection, setSelectedCollection] =
    useState(initialCollection);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.availableSizes.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [products]);

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) =>
      p.availableColors.forEach((c) => {
        if (!map.has(c.name)) map.set(c.name, c.hex);
      })
    );
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  const priceCeiling = useMemo(() => {
    const highest = products.reduce((max, p) => Math.max(max, p.price), 5000);
    return Math.ceil(highest / 500) * 500;
  }, [products]);

  const effectiveMaxPrice = Math.min(maxPrice, priceCeiling);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSelectedCollection("all");
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(priceCeiling);
  };

  const activeFilterCount =
    (selectedCollection !== "all" ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (effectiveMaxPrice < priceCeiling ? 1 : 0);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (initialSearch) {
          const q = initialSearch.toLowerCase();
          const matches =
            product.name.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q) ||
            product.materials.toLowerCase().includes(q) ||
            (product.collectionNames ?? []).some((n) =>
              n.toLowerCase().includes(q)
            );
          if (!matches) return false;
        }

        if (selectedCollection !== "all") {
          const matchesSlug = (product.collectionSlugs ?? []).includes(
            selectedCollection
          );
          const matchesId = (product.collectionIds ?? []).includes(
            selectedCollection
          );
          const matchesLegacyCategory =
            product.category.toLowerCase() === selectedCollection.toLowerCase();
          if (!matchesSlug && !matchesId && !matchesLegacyCategory) {
            return false;
          }
        }

        if (product.price > effectiveMaxPrice) {
          return false;
        }

        if (selectedSizes.length > 0) {
          const hasSize = product.availableSizes.some((s) =>
            selectedSizes.includes(s)
          );
          if (!hasSize) return false;
        }

        if (selectedColors.length > 0) {
          const hasColor = product.availableColors.some((c) =>
            selectedColors.includes(c.name)
          );
          if (!hasColor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "price-asc") return a.price - b.price;
        if (selectedSort === "price-desc") return b.price - a.price;
        if (selectedSort === "newest")
          return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        if (selectedSort === "bestselling")
          return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
        return 0;
      });
  }, [
    products,
    initialSearch,
    selectedCollection,
    selectedSort,
    selectedSizes,
    selectedColors,
    effectiveMaxPrice,
  ]);

  const activeCollectionObj = collections.find(
    (c) => c.slug === selectedCollection || c.id === selectedCollection
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16">
      <div className="border-b border-[#26231F]/15 pb-6 sm:pb-10 space-y-3 sm:space-y-4">
        <nav
          aria-label="Breadcrumb"
          className="text-[11px] tracking-widest uppercase text-[#26231F]/50 flex items-center gap-2"
        >
          <Link href="/" className="hover:text-[#591623]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#26231F]">Shop</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div>
            <span className="text-[11px] tracking-[0.28em] uppercase text-[#591623] font-semibold block mb-1">
              {activeCollectionObj?.season || "ORIIKO Catalog"}
            </span>
            <h1
              className="text-2xl sm:text-5xl font-serif text-[#26231F] font-normal"
              style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
            >
              {activeCollectionObj?.name || "The Complete Collection"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#26231F]/70 max-w-md font-sans leading-relaxed">
            {activeCollectionObj?.description ||
              "Heavyweight hoodies, embroidered tees, boxy sweatshirts, and stacked streetwear essentials built for India."}
          </p>
        </div>

        {/* Collection Filter Pills */}
        {collections.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
            <button
              type="button"
              onClick={() => setSelectedCollection("all")}
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-medium border whitespace-nowrap transition-colors cursor-pointer ${
                selectedCollection === "all"
                  ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                  : "border-[#26231F]/20 text-[#26231F]/75 hover:border-[#591623]"
              }`}
            >
              All Collections
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setSelectedCollection(col.slug)}
                className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-medium border whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCollection === col.slug || selectedCollection === col.id
                    ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                    : "border-[#26231F]/20 text-[#26231F]/75 hover:border-[#591623]"
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controls Toolbar */}
      <div className="py-4 sm:py-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-[#26231F]/15">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[40px] rounded-lg border border-[#26231F]/20 text-[#26231F] hover:border-[#591623] hover:text-[#591623] text-[11px] sm:text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <IconFilter size={15} />
            <span>Filter</span>
            <span className="hidden sm:inline">Products</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#8C072B] text-[#F2F2F0] text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-[11px] sm:text-xs text-[#26231F]/60">
            {filteredProducts.length} / {products.length} Items
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="text-xs uppercase tracking-wider text-[#26231F]/60 hidden sm:inline">
            Sort By:
          </span>
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="appearance-none bg-[#F2F2F0] border border-[#26231F]/20 rounded-lg pl-3 pr-8 py-2 min-h-[40px] text-base sm:text-xs uppercase tracking-wider text-[#26231F] focus:outline-none focus:border-[#591623] cursor-pointer"
            >
              <option value="featured">Featured Drop</option>
              <option value="newest">Newest Arrivals</option>
              <option value="bestselling">Bestsellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <IconChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#26231F]/60 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="py-4 flex flex-wrap items-center gap-2 border-b border-[#26231F]/10">
          <span className="text-[10px] tracking-widest uppercase text-[#26231F]/50 font-semibold mr-1">
            Active Filters:
          </span>
          {selectedCollection !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#591623] text-[#F2F2F0] text-[10px] uppercase tracking-wider">
              Collection: {activeCollectionObj?.name || selectedCollection}
              <button onClick={() => setSelectedCollection("all")}>
                <IconClose size={12} />
              </button>
            </span>
          )}
          {selectedSizes.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#591623] text-[#F2F2F0] text-[10px] uppercase tracking-wider"
            >
              Size {s}
              <button onClick={() => toggleSize(s)}>
                <IconClose size={12} />
              </button>
            </span>
          ))}
          {selectedColors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#591623] text-[#F2F2F0] text-[10px] uppercase tracking-wider"
            >
              {c}
              <button onClick={() => toggleColor(c)}>
                <IconClose size={12} />
              </button>
            </span>
          ))}
          {effectiveMaxPrice < priceCeiling && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#591623] text-[#F2F2F0] text-[10px] uppercase tracking-wider">
              Under ₹{effectiveMaxPrice.toLocaleString("en-IN")}
              <button onClick={() => setMaxPrice(priceCeiling)}>
                <IconClose size={12} />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-[10px] uppercase tracking-widest text-[#8C072B] hover:underline ml-2 font-medium"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {isFilterOpen && (
          <aside className="lg:col-span-3 space-y-8 border-b lg:border-b-0 lg:border-r border-[#26231F]/15 pr-0 lg:pr-8 pb-8 lg:pb-0">
            <div className="space-y-3">
              <span className="text-[11px] tracking-[0.2em] uppercase text-[#26231F] font-semibold block">
                Collections
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCollection("all")}
                  className={`block w-full text-left text-xs uppercase tracking-wider py-1 transition-colors ${
                    selectedCollection === "all"
                      ? "text-[#591623] font-bold"
                      : "text-[#26231F]/70 hover:text-[#591623]"
                  }`}
                >
                  All Collections
                </button>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollection(col.slug)}
                    className={`block w-full text-left text-xs uppercase tracking-wider py-1 transition-colors ${
                      selectedCollection === col.slug
                        ? "text-[#591623] font-bold"
                        : "text-[#26231F]/70 hover:text-[#591623]"
                    }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </div>

            {availableSizes.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-[#26231F]/10">
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#26231F] font-semibold block">
                  Size
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider border transition-all ${
                          isSelected
                            ? "bg-[#591623] text-[#F2F2F0] border-[#591623]"
                            : "border-[#26231F]/20 text-[#26231F] hover:border-[#591623]"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {availableColors.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-[#26231F]/10">
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#26231F] font-semibold block">
                  Colorway
                </span>
                <div className="space-y-2">
                  {availableColors.map((color) => {
                    const isSelected = selectedColors.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        onClick={() => toggleColor(color.name)}
                        className="flex items-center gap-3 w-full text-left text-xs text-[#26231F] hover:text-[#591623] transition-colors"
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border border-[#26231F]/20 ${
                            isSelected ? "ring-2 ring-[#591623] ring-offset-1" : ""
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span
                          className={
                            isSelected ? "font-bold text-[#591623]" : ""
                          }
                        >
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-6 border-t border-[#26231F]/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#26231F] font-semibold">
                  Maximum Price
                </span>
                <span className="font-semibold text-[#591623]">
                  ₹{effectiveMaxPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max={priceCeiling}
                step="250"
                value={effectiveMaxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#591623] cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={clearAllFilters}
                className="w-full py-2.5 rounded-full border border-[#26231F]/20 text-[#26231F] hover:border-[#8C072B] hover:text-[#8C072B] text-xs uppercase tracking-widest font-medium transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </aside>
        )}

        <div className={isFilterOpen ? "lg:col-span-9" : "lg:col-span-12"}>
          {catalogLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-xl bg-[#26231F]/8 animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              className={`grid grid-cols-2 gap-3.5 sm:gap-6 lg:gap-8 ${
                isFilterOpen ? "lg:grid-cols-3" : "lg:grid-cols-4"
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-4 border border-[#26231F]/15 rounded-2xl p-8 bg-[#F2F2F0]">
              <h3 className="text-2xl font-serif text-[#26231F]">
                {products.length === 0
                  ? "No active drops published yet"
                  : "No matching pieces found"}
              </h3>
              <p className="text-xs text-[#26231F]/60 max-w-sm mx-auto">
                {products.length === 0
                  ? "Publish products and collections in the ORIIKO Admin Console to showcase them here."
                  : "Try adjusting or resetting your filter criteria to see more drops."}
              </p>
              {products.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 rounded-full bg-[#591623] text-[#F2F2F0] text-xs uppercase tracking-widest hover:bg-[#8C072B] transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <main className="flex-1 bg-[#F2F2F0] py-6 sm:py-16">
      <Suspense
        fallback={
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-24 text-center text-xs tracking-widest uppercase text-[#26231F]/50">
            Loading Collection...
          </div>
        }
      >
        <ShopContent />
      </Suspense>
    </main>
  );
}
