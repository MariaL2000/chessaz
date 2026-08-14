"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ResourceSearchBar } from "./ResourceSearchBar";
import { ResourceCard } from "./ResourceCard";
import { useResourceStore } from "@/store/resource-store";
import { CHESS_CATEGORIES, RESOURCE_TYPES } from "@/types/chess";

export const BrowseLessons = () => {
  const { recentResources, fetchRecentResources, hasHydrated } =
    useResourceStore();

  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [selectedType, setSelectedType] = React.useState<string>("ALL");
  const carouselRef = useRef<HTMLDivElement>(null);

  // Sincronizamos con Zustand solo si no hay datos cargados o para refrescar de forma inteligente
  useEffect(() => {
    if (recentResources.length === 0) {
      fetchRecentResources(10);
    }
  }, [fetchRecentResources, recentResources.length]);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.75;
      carouselRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const filteredLessons = recentResources.filter((lesson) => {
    const matchCat =
      selectedCategory === "ALL" || lesson?.category === selectedCategory;
    const matchType = selectedType === "ALL" || lesson?.type === selectedType;
    return matchCat && matchType;
  });

  return (
    <section className="py-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-main)]">
            Browse thousands of Homeworks
          </h2>
          <p className="text-sm mt-1 text-[var(--color-text-muted)] font-medium">
            High quality study material directly uploaded by professional chess
            coaches.
          </p>
        </div>

        <Link
          href="/lessons"
          className="text-xs font-bold flex items-center gap-1.5 transition-all text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] hover:underline shrink-0"
        >
          View all lessons <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 p-3.5 rounded-2xl bg-[var(--color-bg-beige-dark)]/50 border border-[var(--color-border-custom)] shadow-sm">
        <div className="w-full lg:max-w-xs shrink-0">
          <ResourceSearchBar />
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {[
              "ALL",
              CHESS_CATEGORIES.TACTICS,
              CHESS_CATEGORIES.STRATEGY,
              CHESS_CATEGORIES.OPENINGS,
              CHESS_CATEGORIES.ENDGAMES,
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-[var(--color-blue)] text-white shadow-sm"
                    : "bg-[var(--color-bg-card)] text-[var(--color-text-main)] hover:bg-[var(--color-gold-light)] border border-[var(--color-border-custom)]"
                }`}
              >
                {cat === "ALL" ? "All Topics" : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] px-3 py-1.5 rounded-xl shadow-sm">
            <Filter className="w-3.5 h-3.5 text-[var(--color-gray-accent)]" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[var(--color-text-main)] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Formats</option>
              <option value={RESOURCE_TYPES.BUNDLE}>Bundle</option>
              <option value={RESOURCE_TYPES.PDF_LESSON}>PDF Lesson</option>
              <option value={RESOURCE_TYPES.PGN_FILE}>PGN File</option>
              <option value={RESOURCE_TYPES.WORKSHEET}>Worksheet</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--color-bg-card)] shadow-lg border border-[var(--color-border-custom)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5 text-[var(--color-text-main)]" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--color-bg-card)] shadow-lg border border-[var(--color-border-custom)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5 text-[var(--color-text-main)]" />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-6 pt-2 px-1"
        >
          {filteredLessons.length > 0 ? (
            filteredLessons.map((lesson) => (
              <div key={lesson.id} className="inline-block">
                <ResourceCard resource={lesson} />
              </div>
            ))
          ) : (
            <div className="text-sm text-[var(--color-text-muted)] py-12 px-4">
              {hasHydrated
                ? "No lessons found matching these filters..."
                : "Loading resources from the database..."}
            </div>
          )}

          <motion.div
            whileHover={{ y: -6 }}
            onClick={() => (window.location.href = "/login")}
            className="flex-shrink-0 w-[280px] sm:w-[310px] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden text-white bg-[var(--color-blue)] shadow-md cursor-pointer"
          >
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
              <Image
                src="https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&w=800&q=80"
                alt="Marketplace"
                fill
                sizes="(max-width: 768px) 100vw, 310px"
                className="object-cover"
              />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-[var(--color-gold-light)]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                Explore the Marketplace
              </h3>
              <p className="text-xs text-gray-200 leading-relaxed">
                Discover hundreds of custom study materials created by
                grandmasters and verified coaches.
              </p>
            </div>

            <div className="w-full relative z-10 mt-6">
              <Link href="/lessons" className="w-full">
                <Button
                  variant="login"
                  size="sm"
                  className="w-full font-bold bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-white border-none shadow-md"
                >
                  EXPLORE ALL LESSONS
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
