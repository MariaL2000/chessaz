/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useTransition } from "react";
import { ResourceFilterOptions } from "@/actions/resources/getResourceActions";
import { ResourceCard } from "@/components/home/ResourceCard";
import { ResourceSearchBar } from "@/components/home/ResourceSearchBar";
import { CHESS_CATEGORIES, RESOURCE_TYPES } from "@/types/chess";
import { useResourceStore } from "@/store/resource-store";
import {
  Loader2,
  SlidersHorizontal,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface LessonsClientProps {
  initialResources: any[];
}

export default function LessonsClient({
  initialResources,
}: LessonsClientProps) {
  const { resources, fetchFilteredResources, hasHydrated } = useResourceStore();
  const [isPending, startTransition] = useTransition();

  // Filtros locales
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [minElo, setMinElo] = useState<number>(0);
  const [maxElo, setMaxElo] = useState<number>(2800);
  const [hasHomework, setHasHomework] = useState<boolean>(false);
  const [isFree, setIsFree] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  // Inicializar estado global con los datos del servidor
  useEffect(() => {
    if (initialResources.length > 0 && resources.length === 0) {
      useResourceStore.setState({ resources: initialResources });
    }
  }, [initialResources, resources.length]);

  const handleApplyFilters = (
    overrideHomework?: boolean,
    overrideFree?: boolean,
  ) => {
    const homeworkVal =
      overrideHomework !== undefined ? overrideHomework : hasHomework;
    const freeVal = overrideFree !== undefined ? overrideFree : isFree;

    const filters: ResourceFilterOptions = {
      category:
        selectedCategory !== "ALL" ? (selectedCategory as any) : undefined,
      type: selectedType !== "ALL" ? (selectedType as any) : undefined,
      minElo: minElo > 0 ? minElo : undefined,
      maxElo: maxElo < 2800 ? maxElo : undefined,
      hasHomework: homeworkVal ? true : undefined,
      isFree: freeVal ? true : undefined,
      maxPrice: !freeVal && maxPrice ? maxPrice : undefined,
    };

    startTransition(async () => {
      await fetchFilteredResources(filters);
    });
  };

  const currentResources =
    hasHydrated && resources.length > 0 ? resources : initialResources;

  // Funciones para desplazar el carrusel horizontalmente de forma fluida
  const scrollCarousel = (direction: "left" | "right", id: string) => {
    const container = document.getElementById(id);
    if (container) {
      const scrollAmount = direction === "left" ? -340 : 340;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-main)] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Search Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--color-gold)] shrink-0" />
              Lessons Catalog
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
              Explore all chess classes taught by verified coaches.
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <ResourceSearchBar />
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--color-gold)]">
              <SlidersHorizontal className="w-4 h-4" /> Search Filters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
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

            {/* Resource Type Filter */}
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

            {/* Min ELO */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">
                Min ELO:{" "}
                <span className="text-[var(--color-gold)]">{minElo}</span>
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

            {/* Max ELO */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">
                Max ELO:{" "}
                <span className="text-[var(--color-gold)]">{maxElo}</span>
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
              {/* Checkbox With Homework corregido para disparar la acción inmediata o al aplicar */}
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

              {/* Checkbox Free Only corregido para disparar la acción inmediata o al aplicar */}
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

        {/* Lessons Section con formato CARRUSEL (Similar a Browse Lessons) */}
        {isPending ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-gold)]" />
          </div>
        ) : currentResources.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">
                Featured Lessons
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollCarousel("left", "lessons-carousel")}
                  className="p-2 rounded-full border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-beige-dark)] transition-colors shadow-sm"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel("right", "lessons-carousel")}
                  className="p-2 rounded-full border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-beige-dark)] transition-colors shadow-sm"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenedor del Carrusel Horizontal */}
            <div
              id="lessons-carousel"
              className="flex gap-6 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {currentResources.map((resource) => (
                <div
                  key={resource.id}
                  className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0"
                >
                  <ResourceCard resource={resource} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl">
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              No lessons found matching the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
