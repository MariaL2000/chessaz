import React from "react";
import { getFilteredResources } from "@/actions/resources/getResourceActions";
import LessonsClient from "@/components/lessons/LessonsClient";
import { ResourceDTO } from "@/types/resource"; // <--- Importa el tipo DTO
import { AlertCircle } from "lucide-react";

export default async function LessonsPage() {
  // Tipado explícito para evitar que TypeScript infiera 'any[]'
  let initialResources: ResourceDTO[] = [];
  let errorMessage: string | null = null;

  try {
    const response = await getFilteredResources({ minElo: 0, maxElo: 3000 });

    if (response.ok && response.resources) {
      initialResources = response.resources;
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

  return <LessonsClient initialResources={initialResources} />;
}
