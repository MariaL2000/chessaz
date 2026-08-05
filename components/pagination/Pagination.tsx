"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { generatePaginationNumbers } from "@/util/pagination";

interface PaginationProps {
  totalPages: number;
}

export const Pagination: React.FC<PaginationProps> = ({ totalPages }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageString = searchParams.get("page") ?? "1";
  const currentPage = isNaN(Number(pageString)) ? 1 : Number(pageString);

  // Si solo hay una página o menos, no se renderiza la paginación
  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number | string): string => {
    const params = new URLSearchParams(searchParams.toString());

    if (
      pageNumber === "..." ||
      Number(pageNumber) <= 0 ||
      Number(pageNumber) > totalPages
    ) {
      return `${pathname}?${params.toString()}`;
    }

    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePaginationNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-8 mb-4 flex justify-center">
      <ul className="inline-flex items-center gap-1.5 text-sm font-semibold">
        {/* Botón Anterior */}
        <li>
          <Link
            href={createPageUrl(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-all duration-200 ${
              currentPage <= 1
                ? "pointer-events-none opacity-40 cursor-not-allowed"
                : "hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] cursor-pointer"
            }`}
            style={{
              borderColor: "var(--color-border-custom)",
              backgroundColor: "var(--color-bg-card)",
              color: "var(--color-text-main)",
            }}
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </li>

        {/* Páginas e Indicadores (...) */}
        {allPages.map((page, index) => {
          const isCurrent = currentPage === page;
          const isEllipsis = page === "...";

          if (isEllipsis) {
            return (
              <li key={`ellipsis-${index}`} className="px-2 select-none">
                <span style={{ color: "var(--color-text-subtle)" }}>...</span>
              </li>
            );
          }

          return (
            <li key={page}>
              <Link
                href={createPageUrl(page)}
                className="flex items-center justify-center h-10 min-w-[2.5rem] px-3.5 rounded-xl border text-sm font-bold transition-all duration-200"
                style={
                  isCurrent
                    ? {
                        backgroundColor: "var(--color-gold)",
                        borderColor: "var(--color-gold)",
                        color: "#18181b",
                      }
                    : {
                        borderColor: "var(--color-border-custom)",
                        backgroundColor: "var(--color-bg-card)",
                        color: "var(--color-text-main)",
                      }
                }
              >
                {page}
              </Link>
            </li>
          );
        })}

        {/* Botón Siguiente */}
        <li>
          <Link
            href={createPageUrl(currentPage + 1)}
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
            className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-all duration-200 ${
              currentPage >= totalPages
                ? "pointer-events-none opacity-40 cursor-not-allowed"
                : "hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] cursor-pointer"
            }`}
            style={{
              borderColor: "var(--color-border-custom)",
              backgroundColor: "var(--color-bg-card)",
              color: "var(--color-text-main)",
            }}
            aria-label="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </li>
      </ul>
    </nav>
  );
};
