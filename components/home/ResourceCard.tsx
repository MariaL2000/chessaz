/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Check,
  BookOpen,
  ShoppingCart,
  Eye,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { reviewResource } from "@/actions/resources/adminResourceActions";
import { useAuthStore } from "@/store/useAuthStore";
import { useResourceStore } from "@/store/resource-store";
import type { ResourceDTO } from "@/types/resource";

interface ResourceCardProps {
  resource: ResourceDTO;
  userRole?: string | "guest";
  onDelete?: (resourceId: string) => void;
  onEdit?: (resource: ResourceDTO) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  userRole = "guest",
  onDelete,
  onEdit,
}) => {
  const slug = resource.slug || resource.id;
  const resourceId = resource.id;
  const title = resource.title;
  const category = resource.category;
  const type = resource.type;
  const minElo = resource.minElo;
  const maxElo = resource.maxElo;
  const hasHomework = resource.hasHomework;
  const price = resource.price;
  const isPublished = resource.isPublished;

  const { user } = useAuthStore();
  const { fetchPendingResources, fetchRecentResources } = useResourceStore();
  const [isPending, startTransition] = useTransition();

  const handleReview = (action: "APPROVE" | "REJECT") => {
    if (!user?.id) return;

    startTransition(async () => {
      const result = await reviewResource({
        resourceId,
        adminUserId: user.id,
        action,
      });

      if (result.ok) {
        if (typeof fetchPendingResources === "function")
          fetchPendingResources();
        if (typeof fetchRecentResources === "function")
          fetchRecentResources(50);
      } else {
        alert(result.message);
      }
    });
  };

  const isAdmin = userRole === "ADMIN" || user?.role === "ADMIN";
  const isTeacher = userRole === "TEACHER" || user?.role === "TEACHER";

  //  Ampliamos la búsqueda de la imagen en distintas propiedades posibles del DTO y permitimos rutas relativas o absolutas
  const rawPreview =
    resource.previewUrl ||
    resource.imageUrl ||
    (resource as any).image ||
    (resource as any).thumbnail ||
    null;

  const initialPreview =
    rawPreview && (rawPreview.startsWith("http") || rawPreview.startsWith("/"))
      ? rawPreview
      : "/fallback.png";

  const [imgSrc, setImgSrc] = useState<string>(initialPreview);
  const [hasError, setHasError] = useState(false);

  const reviewsCount = resource.reviewsCount ?? 0;
  const rating =
    resource.rating !== undefined && resource.rating !== null
      ? resource.rating
      : "New";

  const teacherName =
    resource.teacher?.user?.name ||
    resource.teacherName ||
    "Verified Instructor";
  const teacherImage =
    resource.teacher?.user?.image || resource.teacherImage || "/user.jpg";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-sm sm:max-w-[320px] rounded-2xl overflow-hidden border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] shadow-xs flex flex-col justify-between group/card mx-auto relative"
    >
      <div className="flex flex-col h-full min-w-0">
        <Link href={`/resources/${slug}`} className="flex flex-col min-w-0">
          <div className="relative w-full h-44 sm:h-48 shrink-0 overflow-hidden bg-[var(--color-bg-beige-dark)] cursor-pointer">
            {!hasError && imgSrc ? (
              <Image
                src={imgSrc}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                onError={() => {
                  // Si falla la principal, intenta cargar explícitamente el fallback.png, si ya falló este, muestra el icono
                  if (imgSrc !== "/fallback.png") {
                    setImgSrc("/fallback.png");
                  } else {
                    setHasError(true);
                  }
                }}
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
                {price === 0 ? "FREE" : `$${price}`}
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

            {!isPublished && isAdmin ? (
              <div className="pt-2 border-t border-[var(--color-border-custom)] flex gap-2 w-full">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleReview("APPROVE");
                  }}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-semibold py-2 px-2 rounded-xl transition-colors disabled:opacity-50 text-xs cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Approve</span>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleReview("REJECT");
                  }}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-semibold py-2 px-2 rounded-xl transition-colors disabled:opacity-50 text-xs cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Reject</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full pt-1">
                {isAdmin || isTeacher ? (
                  <div className="flex items-center gap-2 w-full">
                    <Link
                      href={`/resources/${slug}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[var(--color-gold-light)] text-[var(--color-text-main)] hover:bg-[var(--color-gold)]/20 transition-colors rounded-xl text-xs font-bold"
                    >
                      <Eye className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                      <span>View</span>
                    </Link>

                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onEdit(resource);
                        }}
                        className="p-2.5 bg-[var(--color-bg-beige-dark)] hover:bg-[var(--color-border-custom)] text-[var(--color-text-main)] rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                        title="Edit Resource"
                        aria-label="Edit Resource"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

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
                ) : (
                  <Link
                    href={`/resources/${slug}`}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[var(--color-gold)] text-white hover:opacity-90 transition-opacity rounded-xl text-xs font-bold shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>
                      {price === 0 ? "Get Resource" : `Buy for $${price}`}
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
