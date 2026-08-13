/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { reviewResource } from "@/actions/resources/adminResourceActions";
import { useAuthStore } from "@/store/useAuthStore";
import { useResourceStore } from "@/store/resource-store";
import type { ResourceDTO } from "@/types/resource";

export function DashboardResourceCard({ resource }: { resource: ResourceDTO }) {
  const { user } = useAuthStore();
  const { fetchPendingResources, fetchRecentResources } = useResourceStore();
  const [isPending, startTransition] = useTransition();

  const handleReview = (action: "APPROVE" | "REJECT") => {
    if (!user?.id) return;

    startTransition(async () => {
      const result = await reviewResource({
        resourceId: resource.id,
        adminUserId: user.id,
        action,
      });

      if (result.ok) {
        fetchPendingResources();
        fetchRecentResources(50);
        console.log(result.message);
      } else {
        console.error(result.message);
      }
    });
  };

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  return (
    <div className="flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
      {/* Contenedor envolvente con Link para que toda la tarjeta lleve a la vista de detalles (/resources/[slug]) */}
      <Link
        href={`/resources/${resource.slug}`}
        className="flex flex-col flex-1 group"
      >
        {/* 1. SECCIÓN VISUAL (Imagen y Precio) */}
        <div className="relative w-full h-48 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <img
            src={resource.previewUrl || "/fallback.png"}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Etiqueta de Precio */}
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
            {resource.price === 0 ? "Free" : `$${resource.price}`}
          </div>
        </div>

        {/* 2. SECCIÓN DE INFORMACIÓN */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md">
              {resource.category}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] font-medium bg-[var(--color-bg-custom)] px-2 py-1 rounded-md">
              Elo: {resource.minElo} - {resource.maxElo}
            </span>
          </div>

          <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-[var(--color-gold)] transition-colors">
            {resource.title}
          </h3>

          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-4 flex-1">
            {resource.description || "No description provided."}
          </p>
        </div>
      </Link>

      {/* 3. CONTROLES DE ADMINISTRADOR - Solo para Admins en recursos pendientes */}
      {!resource.isPublished && isAdmin && (
        <div className="p-4 pt-0 mt-auto">
          <div className="pt-4 border-t border-[var(--color-border-custom)] flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleReview("APPROVE");
              }}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Approve
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleReview("REJECT");
              }}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
