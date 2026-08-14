import { ResourceDTO } from "@/types/resource";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapResourceToDTO(item: any): ResourceDTO {
  const reviews = item.reviews || [];
  const reviewsCount = reviews.length;

  const averageRating =
    reviewsCount > 0
      ? Number(
          (
            reviews.reduce(
              (acc: number, r: { rating: number }) => acc + r.rating,
              0,
            ) / reviewsCount
          ).toFixed(1),
        )
      : 5.0;

  const teacherData = item.teacher?.user || item.teacher || {};

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description ?? undefined,
    category: item.category,
    type: item.type,
    minElo: item.minElo,
    maxElo: item.maxElo,
    rating: averageRating,
    reviewsCount,
    hasHomework: item.hasHomework,
    imageUrl: item.previewUrl ? item.previewUrl : "/header.png",
    previewUrl: item.previewUrl ?? undefined,
    fileUrl: item.fileUrl ?? undefined,
    teacherName: teacherData.name ?? "Verified Coach",
    teacherImage: teacherData.image ?? undefined,
    teacher: item.teacher
      ? {
          user: {
            name: item.teacher.user?.name ?? undefined,
            image: item.teacher.user?.image ?? undefined,
          },
        }
      : undefined,
    price: item.price,
    isPublished: item.isPublished ?? false,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    reviews: [],
  };
}
