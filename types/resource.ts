import { ChessCategory, ResourceType } from "@/app/generated/prisma/client";
import { z } from "zod";

export interface ResourceDTO {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: ChessCategory;
  type: ResourceType;
  minElo: number;
  maxElo: number;
  rating?: number;
  reviewsCount?: number;
  hasHomework: boolean;
  imageUrl?: string | null;
  previewUrl?: string | null;
  fileUrl?: string;
  teacherName?: string | null;
  teacherImage?: string | null;
  teacher?: {
    user?: {
      name?: string | null;
      image?: string | null;
    };
  };
  price: number;
  isPublished: boolean;
  createdAt?: Date;
}

export const createResourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long."),
  category: z.nativeEnum(ChessCategory),
  type: z.nativeEnum(ResourceType),
  minElo: z.number().min(0, "Minimum ELO cannot be negative."),
  maxElo: z.number().min(0, "Maximum ELO cannot be negative."),
  price: z.number().min(0, "Price cannot be negative."),
  hasHomework: z.boolean(),
  fileBase64: z.string().min(1, "The main file is required."),
  previewBase64: z.string().optional(),
  userId: z.string().min(1, "User ID is required."),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
