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

        {/* Botón superior modernizado con back.png y texto blanco */}
        <Link href="/lessons">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="relative px-5 py-2.5 rounded-full overflow-hidden flex items-center gap-2 shadow-md cursor-pointer shrink-0 border border-white/20 group"
          >
            <div className="absolute inset-0">
              <Image
                src="/back.png"
                alt="Background"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] group-hover:bg-black/40 transition-colors" />
            </div>
            <span className="relative z-10 text-xs font-bold text-white tracking-wide">
              View all lessons
            </span>
            <motion.span
              className="relative z-10 text-white"
              animate={{ x: [0, 4, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.div>
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
              <div
                key={lesson.id}
                className="flex-shrink-0 w-[280px] sm:w-[310px] inline-block"
              >
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

          {/* Tarjeta Extra al final del carrusel con la imagen more.png */}
          <motion.div
            whileHover={{ y: -6 }}
            onClick={() => (window.location.href = "/lessons")}
            className="flex-shrink-0 w-[280px] sm:w-[310px] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden text-white bg-[var(--color-blue)] shadow-md cursor-pointer group"
          >
            <div className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity">
              <Image
                src="/more.png"
                alt="More Marketplace"
                fill
                sizes="(max-width: 768px) 100vw, 310px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/10">
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
              <Link href="/lessons" className="w-full block">
                <button
                  type="button"
                  className="w-full py-2 px-4 rounded-md font-bold bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-white border-none shadow-md transition-colors cursor-pointer text-center text-xs"
                >
                  EXPLORE ALL LESSONS
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
