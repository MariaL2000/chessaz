export const CHESS_CATEGORIES = {
  OPENINGS: "OPENINGS",
  TACTICS: "TACTICS",
  STRATEGY: "STRATEGY",
  ENDGAMES: "ENDGAMES",
  LESSON_PLAN: "LESSON_PLAN",
} as const;

export const RESOURCE_TYPES = {
  PDF_LESSON: "PDF_LESSON",
  PGN_FILE: "PGN_FILE",
  WORKSHEET: "WORKSHEET",
  BUNDLE: "BUNDLE",
} as const;

export type ChessCategory = keyof typeof CHESS_CATEGORIES;
export type ResourceType = keyof typeof RESOURCE_TYPES;

export interface FormDataState {
  title: string;
  description: string;
  category: ChessCategory;
  type: ResourceType;
  minElo: number;
  maxElo: number;
  price: number;
  hasHomework: boolean;
  isPublished: false;
}
