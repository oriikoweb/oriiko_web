"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "../../components/product/ProductCard";
import { IconFilter, IconClose, IconChevronDown } from "../../components/ui/Icons";
import { PRODUCTS } from "../../data/products";

const CATEGORIES = [
  { label: "All Drops", value: "all" },
  { label: "Hoodies", value: "hoodies" },
  { label: "Embroidered T-Shirts", value: "t-shirts" },
  { label: "Sweatshirts", value: "sweatshirts" },
  { label: "Cargos & Bottoms", value: "bottoms" },
  { label: "Caps & Accessories", value: "accessories" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "28", "30", "32", "34", "One Size"];

const COLORS = [
  { name: "Dark Charcoal", hex: "#26231F" },
  { name: "Deep Burgundy", hex: "#591623" },
  { name: "Rich Burgundy", hex: "#8C072B" },
  { name: "Off-White", hex: "#F2F2F0" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSort = searchParams.get("sort") || "featured";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Toggle size
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Toggle color
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(5000);
  };

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (maxPrice < 5000 ? 1 : 0);

  // Filter & Sort calculation
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Search
      if (initialSearch) {
        const q = initialSearch.toLowerCase();
        const matches =
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.materials.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      // Max price
      if (product.price > maxPrice) {
        return false;
      }

      // Sizes
      if (selectedSizes.length > 0) {
        const hasSize = product.availableSizes.some((s) =>
          selectedSizes.includes(s)
        );
        if (!hasSize) return false;
      }

      // Colors
      if (selectedColors.length > 0) {
        const hasColor = product.availableColors.some((c) =>
          selectedColors.includes(c.name)
        );
        if (!hasColor) return false;
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === "price-asc") return a.price - b.price;
      if (selectedSort === "price-desc") return b.price - a.price;
      if (selectedSort === "newest") return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      if (selectedSort === "bestselling") return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      return 0; // featured default
    });
  }, [
    initialSearch,
    selectedCategory,
    selectedSort,
    selectedSizes,
    selectedColors,
    maxPrice,
  ]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
      {/* 6.1 Collection Header */}
      <div className="border-b border-[#26231F]/15 pb-10 space-y-4">
        <nav aria-label="Breadcrumb" className="text-[11px] tracking-widest uppercase text-[#26231F]/50 flex items-center gap-2">
          <Link href="/" className="hover:text-[#591623]">Home</Link>
          <span>/</span>
          <span className="text-[#26231F]">Shop</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] tracking-[0.28em] uppercase text-[#591623] font-semibold block mb-1">
              Drop 01 — 2026
            </span>
            <h1
              className="text-3xl sm:text-5xl font-serif text-[#26231F] font-normal"
              style={{ fontFamily: '"Cormorant Garamond", "Didot", serif' }}
            >
              The Complete Collection
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#26231F]/70 max-w-md font-sans leading-relaxed">
            Heavyweight hoodies, embroidered tees, boxy sweatshirts, and stacked streetwear essentials built for India.
          </p>
        </div>
      </div>

      {/* 6.4 Controls Toolbar: Filter Button + Count + Sort Dropdown */}
      <div className="py-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#26231F]/15">
        {/* Filter toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2.5 rounded-lg border border-[#26231F]/20 hover:border-[#591623] hover:text-[#591623] text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2.5"
          >
            <IconFilter size={15} />
            <span>Filter Products</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#8C072B] text-[#F2F2F0] text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Active count */}
          <span className="text-xs text-[#26231F]/60">
            Showing {filteredProducts.length} of {PRODUCTS.length} Products
          </span>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-[#26231F]/60 hidden sm:inline">
            Sort By:
          </span>
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="appearance-none bg-[#F2F2F0] border border-[#26231F]/20 rounded-lg pl-3.5 pr-8 py-2 text-xs uppercase tracking-wider text-[#26231F] focus:outline-none focus:border-[#591623] cursor-pointer"
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
          {selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#591623] text-[#F2F2F0] text-[10px] uppercase tracking-wider">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory("all")}><IconClose size={12} /></button>
            </span>
          )}
          {selectedSizes.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#591623] text-[#F2F2F0] text-[10px] uppercase tracking-wider">
              Size {s}
              <button onClick={() => toggleSize(s)}><IconClose size={12} /></button>
            </span>
          ))}
          {selectedColors.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#591623] text-[#F2F2F0] text-[10px] uppercase tracking-wider">
              {c}
              <button onClick={() => toggleColor(c)}><IconClose size={12} /></button>
            </span>
          ))}
          {maxPrice < 5000 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#591623] text-[#F2F2F0] text-[10px] uppercase tracking-wider">
              Under ₹{maxPrice.toLocaleString("en-IN")}
              <button onClick={() => setMaxPrice(5000)}><IconClose size={12} /></button>
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

      {/* Main Body: Filter Drawer + Product Grid */}
      <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Expandable Filter Sidebar */}
        {isFilterOpen && (
          <aside className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-left duration-200 border-b lg:border-b-0 lg:border-r border-[#26231F]/15 pr-0 lg:pr-8 pb-8 lg:pb-0">
            {/* Category Filter */}
            <div className="space-y-3">
              <span className="text-[11px] tracking-[0.2em] uppercase text-[#26231F] font-semibold block">
                Category
              </span>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`block w-full text-left text-xs uppercase tracking-wider py-1 transition-colors ${
                      selectedCategory === cat.value
                        ? "text-[#591623] font-bold"
                        : "text-[#26231F]/70 hover:text-[#591623]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-3 pt-6 border-t border-[#26231F]/10">
              <span className="text-[11px] tracking-[0.2em] uppercase text-[#26231F] font-semibold block">
                Size
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((size) => {
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

            {/* Color Filter */}
            <div className="space-y-3 pt-6 border-t border-[#26231F]/10">
              <span className="text-[11px] tracking-[0.2em] uppercase text-[#26231F] font-semibold block">
                Color Harmony
              </span>
              <div className="space-y-2">
                {COLORS.map((color) => {
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
                      <span className={isSelected ? "font-bold text-[#591623]" : ""}>
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3 pt-6 border-t border-[#26231F]/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#26231F] font-semibold">
                  Maximum Price
                </span>
                <span className="font-semibold text-[#591623]">₹{maxPrice.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="5000"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#591623] cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={clearAllFilters}
                className="w-full py-2.5 rounded-full border border-[#26231F]/20 hover:border-[#8C072B] hover:text-[#8C072B] text-xs uppercase tracking-widest font-medium transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </aside>
        )}

        {/* 6.2 Product Grid */}
        <div className={isFilterOpen ? "lg:col-span-9" : "lg:col-span-12"}>
          {filteredProducts.length > 0 ? (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 ${
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
                No matching pieces found
              </h3>
              <p className="text-xs text-[#26231F]/60 max-w-sm mx-auto">
                Try adjusting or resetting your filter criteria to see more drops.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 rounded-full bg-[#591623] text-[#F2F2F0] text-xs uppercase tracking-widest hover:bg-[#8C072B] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <main className="flex-1 bg-[#F2F2F0] py-10 sm:py-16">
      <Suspense
        fallback={
          <div className="max-w-[1440px] mx-auto px-6 py-24 text-center text-xs tracking-widest uppercase text-[#26231F]/50">
            Loading Collection...
          </div>
        }
      >
        <ShopContent />
      </Suspense>
    </main>
  );
}
