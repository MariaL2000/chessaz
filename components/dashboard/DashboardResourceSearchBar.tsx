"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { Search, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { searchResourcesByName } from "@/actions/resources/getResourceActions";
import type { ResourceDTO } from "@/types/resource";

export const DashboardResourceSearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResourceDTO[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Cache local para evitar llamadas repetidas innecesarias a la DB
  const cacheRef = useRef<Map<string, ResourceDTO[]>>(new Map());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    const trimmedValue = value.trim();

    if (trimmedValue.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Verificar caché de forma inmediata al escribir
    if (cacheRef.current.has(trimmedValue)) {
      setResults(cacheRef.current.get(trimmedValue) || []);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const trimmedQuery = query.trim();

    // Evitar consultas innecesarias si la cadena es muy corta o ya está en caché
    if (trimmedQuery.length < 2 || cacheRef.current.has(trimmedQuery)) {
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await searchResourcesByName(trimmedQuery);
        if (res.ok && res.resources) {
          // Guardar en caché
          cacheRef.current.set(trimmedQuery, res.resources);
          setResults(res.resources);
          setIsOpen(true);
        } else {
          setResults([]);
          setIsOpen(true);
        }
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search lesson by title..."
          className="w-full pl-10 pr-10 py-2.5 text-xs font-medium rounded-full border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] placeholder-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all shadow-sm"
        />
        {isPending && (
          <Loader2 className="absolute right-3.5 w-4 h-4 animate-spin text-[var(--color-gold)]" />
        )}
      </div>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto"
          onMouseLeave={() => setIsOpen(false)}
        >
          {results.length > 0 ? (
            results.map((item) => (
              <Link
                key={item.id}
                href={`/resources/${item.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 hover:bg-[var(--color-gold-light)] transition-colors border-b border-[var(--color-border-custom)] last:border-0"
              >
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-main)] line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {item.teacherName || "Verified Coach"} • ELO {item.minElo}-
                    {item.maxElo}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-[var(--color-gold)]" />
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
              {isPending ? "Searching..." : "No lessons found with that title."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
