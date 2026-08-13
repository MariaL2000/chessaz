/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CHESS_CATEGORIES, RESOURCE_TYPES } from "@/types/chess";
import { Loader2, SlidersHorizontal } from "lucide-react";

export function ResourceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Inicializar estados locales directamente desde la URL (sin efectos ni bucles)
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "ALL",
  );
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get("type") || "ALL",
  );
  const [minElo, setMinElo] = useState<number>(
    Number(searchParams.get("minElo")) || 0,
  );
  const [maxElo, setMaxElo] = useState<number>(
    searchParams.get("maxElo") ? Number(searchParams.get("maxElo")) : 2800,
  );
  const [hasHomework, setHasHomework] = useState<boolean>(
    searchParams.get("hasHomework") === "true",
  );
  const [isFree, setIsFree] = useState<boolean>(
    searchParams.get("isFree") === "true",
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
  );

  const handleApplyFilters = (
    overrideHomework?: boolean,
    overrideFree?: boolean,
  ) => {
    const homeworkVal =
      overrideHomework !== undefined ? overrideHomework : hasHomework;
    const freeVal = overrideFree !== undefined ? overrideFree : isFree;

    const params = new URLSearchParams();
    if (selectedCategory !== "ALL") params.set("category", selectedCategory);
    if (selectedType !== "ALL") params.set("type", selectedType);
    if (minElo > 0) params.set("minElo", minElo.toString());
    if (maxElo < 2800) params.set("maxElo", maxElo.toString());
    if (homeworkVal) params.set("hasHomework", "true");
    if (freeVal) params.set("isFree", "true");
    if (!freeVal && maxPrice) params.set("maxPrice", maxPrice.toString());

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--color-gold)]">
          <SlidersHorizontal className="w-4 h-4" /> Search Filters
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-main)] text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
          >
            <option value="ALL">All Categories</option>
            {Object.entries(CHESS_CATEGORIES).map(([key, value]) => (
              <option key={key} value={value}>
                {key.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">
            Resource Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-main)] text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
          >
            <option value="ALL">All Types</option>
            {Object.entries(RESOURCE_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {key.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">
            Min ELO: <span className="text-[var(--color-gold)]">{minElo}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2800"
            step="100"
            value={minElo}
            onChange={(e) => setMinElo(Number(e.target.value))}
            className="w-full mt-2 accent-[var(--color-gold)] cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">
            Max ELO: <span className="text-[var(--color-gold)]">{maxElo}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2800"
            step="100"
            value={maxElo}
            onChange={(e) => setMaxElo(Number(e.target.value))}
            className="w-full mt-2 accent-[var(--color-gold)] cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[var(--color-border-custom)]">
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={hasHomework}
              onChange={(e) => {
                const val = e.target.checked;
                setHasHomework(val);
                handleApplyFilters(val, isFree);
              }}
              className="w-4 h-4 rounded border-[var(--color-border-custom)] text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
            />
            With Homework
          </label>

          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => {
                const val = e.target.checked;
                setIsFree(val);
                handleApplyFilters(hasHomework, val);
              }}
              className="w-4 h-4 rounded border-[var(--color-border-custom)] text-[var(--color-gold)] focus:ring-[var(--color-gold)]"
            />
            Free Only
          </label>
        </div>

        <button
          onClick={() => handleApplyFilters()}
          disabled={isPending}
          className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[var(--color-gold)] text-white shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Apply Filters
        </button>
      </div>
    </div>
  );
}
