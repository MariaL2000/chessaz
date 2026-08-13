import React from "react";
import { getFilteredResources } from "@/actions/resources/getResourceActions";
import LessonsClient from "@/components/lessons/LessonsClient";
import { ResourceDTO } from "@/types/resource";
import { AlertCircle } from "lucide-react";
import { ChessCategory, ResourceType } from "@/app/generated/prisma/client";

interface LessonsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LessonsPage({ searchParams }: LessonsPageProps) {
  const resolvedParams = await searchParams;

  // Extraer y formatear los parámetros de la URL
  const page = resolvedParams.page ? Number(resolvedParams.page) : 1;
  const query =
    typeof resolvedParams.query === "string" ? resolvedParams.query : undefined;

  const categoryParam = resolvedParams.category;
  const category =
    typeof categoryParam === "string" && categoryParam !== "ALL"
      ? (categoryParam as ChessCategory)
      : undefined;

  const typeParam = resolvedParams.type;
  const type =
    typeof typeParam === "string" && typeParam !== "ALL"
      ? (typeParam as ResourceType)
      : undefined;

  const minElo = resolvedParams.minElo
    ? Number(resolvedParams.minElo)
    : undefined;
  const maxElo = resolvedParams.maxElo
    ? Number(resolvedParams.maxElo)
    : undefined;
  const hasHomework = resolvedParams.hasHomework === "true";
  const isFree = resolvedParams.isFree === "true";
  const maxPrice = resolvedParams.maxPrice
    ? Number(resolvedParams.maxPrice)
    : undefined;

  let resources: ResourceDTO[] = [];
  let totalPages = 1;
  let errorMessage: string | null = null;

  try {
    const response = await getFilteredResources({
      query,
      category,
      type,
      minElo,
      maxElo,
      hasHomework,
      isFree,
      maxPrice,
      page,
      limit: 9, // 9 lecciones por página estilo tienda
    });

    if (response.ok) {
      resources = response.resources;
      totalPages = response.totalPages;
    } else {
      errorMessage = "No se pudieron cargar los recursos en este momento.";
    }
  } catch (error) {
    console.error("Error crítico de conexión en LessonsPage:", error);
    errorMessage =
      "Error de conexión con el servidor. Por favor, intenta más tarde.";
  }

  if (errorMessage) {
    return (
      <div className="flex h-[calc(100vh-5rem)] mt-20 items-center justify-center p-6 bg-[var(--color-bg-beige)]">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 mx-auto text-rose-500" />
          <h3 className="text-xl font-bold text-[var(--color-text-main)]">
            Problema de Conexión
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] font-medium">
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  return <LessonsClient resources={resources} totalPages={totalPages} />;
}
