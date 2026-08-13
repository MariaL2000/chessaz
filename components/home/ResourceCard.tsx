/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Check } from "lucide-react";

interface ResourceCardProps {
  resource?: any;
  href?: string;
  [key: string]: any;
}

export const ResourceCard: React.FC<ResourceCardProps> = (props) => {
  const resource = props.resource || props;
  // Permitir un href personalizado o por defecto llevar al detalle/login según convenga
  const cardHref = props.href || "/login";

  const title = resource?.title || "Lección de Ajedrez";
  const category = resource?.category || "TACTICS";
  const type = resource?.type || "PDF_LESSON";
  const minElo = resource?.minElo ?? 1000;
  const maxElo = resource?.maxElo ?? 1500;
  const hasHomework = resource?.hasHomework ?? false;
  const price = resource?.price ?? 0;

  // Validación de imagen con fallback seguro
  const rawPreview = resource?.previewUrl || resource?.imageUrl || null;
  const initialPreview =
    rawPreview && (rawPreview.startsWith("http") || rawPreview.startsWith("/"))
      ? rawPreview
      : "/fallback.png";

  const [imgSrc, setImgSrc] = useState<string>(initialPreview);

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
    resource?.teacher?.user?.name || resource?.teacherName || "Verified Coach";

  const teacherImage =
    resource?.teacher?.user?.image ||
    resource?.teacherImage ||
    "/default-avatar.png";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-sm sm:max-w-none rounded-2xl overflow-hidden border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] shadow-sm flex flex-col justify-between group/card cursor-pointer"
    >
      <Link href={cardHref} className="flex flex-col h-full">
        {/* Banner de Imagen */}
        <div className="relative w-full h-44 sm:h-48 shrink-0 overflow-hidden bg-[var(--color-bg-beige-dark)]">
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            className="object-cover group-hover/card:scale-105 transition-transform duration-500"
            onError={() => setImgSrc("/fallback.png")}
          />

          <span className="absolute top-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full shadow-md bg-[#3b82f6]/80 backdrop-blur-md">
            ELO {minElo} - {maxElo}
          </span>

          {hasHomework && (
            <span className="absolute top-3 right-3 text-[10px] font-semibold bg-[var(--color-gold)] text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <Check className="w-3 h-3" /> Homework
            </span>
          )}
        </div>

        {/* Detalle de Contenido */}
        <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow">
          <div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-gold)] bg-[var(--color-gold-light)] px-2 py-0.5 rounded">
                  {category}
                </span>
                <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
                  {type?.replace("_", " ")}
                </span>
              </div>

              <span className="font-bold text-xs sm:text-sm text-[var(--color-text-main)] shrink-0">
                {price === 0 ? "FREE" : `$${price}`}
              </span>
            </div>

            <h3 className="font-bold text-sm sm:text-base leading-snug mb-3 line-clamp-2 text-[var(--color-text-main)] group-hover/card:text-[var(--color-gold)] transition-colors">
              {title}
            </h3>
          </div>

          {/* Footer de Tarjeta */}
          <div className="pt-4 border-t border-[var(--color-border-custom)] flex items-center justify-between mt-auto gap-2">
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
              <span className="text-xs font-medium text-[var(--color-text-muted)] truncate max-w-[100px] sm:max-w-[120px]">
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
        </div>
      </Link>
    </motion.div>
  );
};
