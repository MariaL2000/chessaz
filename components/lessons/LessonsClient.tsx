/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { ResourceCard } from "@/components/home/ResourceCard";
import { ResourceSearchBar } from "@/components/home/ResourceSearchBar";
import { ResourceFilters } from "@/components/filters/ResourceFilters";
import { Pagination } from "@/components/pagination/Pagination";
import { BookOpen } from "lucide-react";

interface LessonsClientProps {
  resources?: any[]; // Cambiado a opcional
  totalPages?: number;
}

export default function LessonsClient({
  resources = [], // Valor por defecto
  totalPages = 1,
}: LessonsClientProps) {
  const searchParams = useSearchParams();

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

        {/* Filtros */}
        <ResourceFilters key={searchParams.toString()} />

        {/* Lessons Grid (Estilo tienda) */}
        {resources && resources.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <div key={resource.id} className="w-full">
                  <ResourceCard resource={resource} />
                </div>
              ))}
            </div>

            {/* Componente de Paginación */}
            <Pagination totalPages={totalPages} />
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
