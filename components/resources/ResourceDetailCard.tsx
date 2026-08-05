/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Check,
  BookOpen,
  Download,
  ShoppingCart,
  Eye,
  Trash2,
} from "lucide-react";

interface ResourceDetailCardProps {
  resource?: any;
  userRole?: "ADMIN" | "TEACHER" | "STUDENT" | "guest";
  onDelete?: (resourceId: string) => void;
  [key: string]: any;
}

export const ResourceDetailCard: React.FC<ResourceDetailCardProps> = ({
  resource: propResource,
  userRole = "guest",
  onDelete,
  ...rest
}) => {
  const resource = propResource || rest.resource || rest;

  const slug = resource?.slug || resource?.id || "";
  const resourceId = resource?.id || "";
  const title = resource?.title || "Chess Lesson";
  const category = resource?.category || "TACTICS";
  const type = resource?.type || "PDF_LESSON";
  const minElo = resource?.minElo ?? 1000;
  const maxElo = resource?.maxElo ?? 1500;
  const hasHomework = resource?.hasHomework ?? false;
  const price = resource?.price ?? 0;
  const isFree = price === 0;

  const isAdmin = userRole === "ADMIN";
  const canDownload = isAdmin || isFree;

  const rawPreview = resource?.previewUrl || resource?.imageUrl || null;
  const initialPreview =
    rawPreview && rawPreview.startsWith("http") ? rawPreview : null;

  const [imgSrc, setImgSrc] = useState<string | null>(initialPreview);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = resource?.reviews || [];
  const reviewsCount = resource?.reviewsCount ?? (reviews.length || 0);

  const rating =
    resource?.rating ??
    (reviewsCount > 0
      ? (
          reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) /
          reviewsCount
        ).toFixed(1)
      : "New");

  const teacherName =
    resource?.teacher?.user?.name ||
    resource?.teacherName ||
    "Verified Instructor";

  const teacherImage =
    resource?.teacher?.user?.image ||
    resource?.teacherImage ||
    "/default-avatar.png";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-sm sm:max-w-[320px] rounded-2xl overflow-hidden border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] shadow-xs flex flex-col justify-between group/card mx-auto relative"
    >
      <div className="flex flex-col h-full min-w-0">
        <Link href={`/resources/${slug}`} className="flex flex-col min-w-0">
          <div className="relative w-full h-44 sm:h-48 shrink-0 overflow-hidden bg-[var(--color-bg-beige-dark)] cursor-pointer">
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                onError={() => setImgSrc(null)}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-[var(--color-text-muted)] opacity-50">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
            )}

            <span className="absolute top-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full shadow-md bg-[#3b82f6]/90 backdrop-blur-md">
              ELO {minElo} - {maxElo}
            </span>

            {hasHomework && (
              <span className="absolute top-3 right-3 text-[10px] font-semibold bg-[var(--color-gold)] text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <Check className="w-3 h-3" /> Homework
              </span>
            )}
          </div>
        </Link>

        <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow min-w-0">
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-gold)] bg-[var(--color-gold-light)] px-2 py-0.5 rounded truncate max-w-[120px]">
                  {category}
                </span>
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] truncate max-w-[100px]">
                  {type?.replace("_", " ")}
                </span>
              </div>

              <span className="font-bold text-xs sm:text-sm text-[var(--color-text-main)] shrink-0">
                {isFree ? "FREE" : `$${price}`}
              </span>
            </div>

            <Link href={`/resources/${slug}`}>
              <h3 className="font-bold text-sm sm:text-base leading-snug mb-3 line-clamp-2 text-[var(--color-text-main)] group-hover/card:text-[var(--color-gold)] transition-colors break-words cursor-pointer">
                {title}
              </h3>
            </Link>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-[var(--color-border-custom)] mt-auto flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-[var(--color-bg-beige-dark)] overflow-hidden relative shrink-0">
                  <Image
                    src={teacherImage}
                    alt={teacherName}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-medium text-[var(--color-text-muted)] truncate max-w-[90px] sm:max-w-[110px]">
                  {teacherName}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-gold)] shrink-0">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{rating}</span>
                {reviewsCount > 0 && (
                  <span className="text-gray-400 font-normal">
                    ({reviewsCount})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full pt-1">
              {isAdmin ? (
                <div className="flex items-center gap-2 w-full">
                  <Link
                    href={`/resources/${slug}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[var(--color-gold-light)] text-[var(--color-text-main)] hover:bg-[var(--color-gold)]/20 transition-colors rounded-xl text-xs font-bold"
                  >
                    <Eye className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                    <span>View Details</span>
                  </Link>
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(resourceId);
                      }}
                      className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                      title="Delete Resource"
                      aria-label="Delete Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : canDownload ? (
                <Link
                  href={`/resources/${slug}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[var(--color-gold-light)] text-[var(--color-text-main)] hover:bg-[var(--color-gold)]/20 transition-colors rounded-xl text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                  <span>Download Resource</span>
                </Link>
              ) : (
                <Link
                  href={`/resources/${slug}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[var(--color-gold)] text-white hover:opacity-90 transition-opacity rounded-xl text-xs font-bold shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Buy for ${price}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
