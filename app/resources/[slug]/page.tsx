import { getResourceDetails } from "@/actions/resources/getResourceDetails";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Check, BookOpen, ShieldCheck } from "lucide-react";
import { ResourceActions } from "@/components/resources/ResourceActions";
import ResourceReviews from "@/components/resources/ResourceReviews";
import { auth } from "@/auth.config";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await getResourceDetails(slug);

  if (!res.ok || !res.resource) {
    notFound();
  }

  const resource = res.resource;
  const previewUrl = resource.previewUrl || "/header.png";
  const teacherName = resource.teacher?.user?.name || "Verified Instructor";
  const teacherImage = resource.teacher?.user?.image || "/user.jpg";
  const teacherEmail = resource.teacher?.user?.email || ""; // Correo del instructor disponible si se requiere

  const rawReviews = resource.reviews || [];
  const processedReviews = rawReviews.map((r) => ({
    ...r,
    user:
      r.user && r.user.name
        ? {
            name: r.user.name,
            image: r.user.image || "/user.jpg",
          }
        : {
            name: "Verified Guest",
            image: "/user.jpg",
          },
  }));

  const reviewsCount = processedReviews.length;
  const averageRating =
    reviewsCount > 0
      ? (
          processedReviews.reduce(
            (acc: number, r: { rating: number }) => acc + r.rating,
            0,
          ) / reviewsCount
        ).toFixed(1)
      : "New";

  const session = await auth();
  const cookieStore = await cookies();
  const verifiedEmailCookie = cookieStore.get("verified_checkout_email")?.value;

  const userId = session?.user?.id || "";
  const guestIdentifier = verifiedEmailCookie || "";
  const userRole =
    (session?.user?.role as "ADMIN" | "TEACHER" | "guest") || "guest";

  return (
    <div className="min-h-screen bg-[var(--color-bg-beige)] text-[var(--color-text-main)] pt-28 pb-16 px-4 sm:px-6 lg:px-8 box-border overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-8 w-full min-w-0">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full min-w-0 box-border">
          <div className="lg:col-span-5 space-y-4 w-full min-w-0">
            <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-[var(--color-bg-beige-dark)] border border-[var(--color-border-custom)] shadow-inner">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={resource.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-[var(--color-text-muted)] opacity-50">
                  <BookOpen className="w-16 h-16" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-gold-light)] border border-[var(--color-border-custom)] min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] truncate mr-2">
                Recommended Elo Range
              </span>
              <span className="text-sm font-bold text-[var(--color-gold)] shrink-0">
                {resource.minElo} - {resource.maxElo}
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 w-full min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-gold)] bg-[var(--color-gold-light)] px-3 py-1 rounded-md">
                  {resource.category}
                </span>
                <span className="text-xs font-semibold px-3 py-1 bg-[var(--color-border-custom)] text-[var(--color-text-muted)] rounded-md uppercase">
                  {resource.type?.replace("_", " ")}
                </span>
                {resource.hasHomework && (
                  <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-md flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Includes Homework
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-main)] break-words">
                {resource.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-2 min-w-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-border-custom)] bg-[var(--color-bg-beige-dark)] shrink-0">
                  <Image
                    src={teacherImage}
                    alt={teacherName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--color-text-muted)] font-medium">
                    Instructor
                  </p>
                  <p className="text-sm font-bold text-[var(--color-text-main)] truncate">
                    {teacherName}
                  </p>
                </div>

                <div className="ml-auto flex items-center gap-1 text-sm font-bold text-[var(--color-gold)] bg-[var(--color-gold-light)] px-3 py-1 rounded-xl shrink-0">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{averageRating}</span>
                  <span className="text-xs text-[var(--color-text-muted)] font-normal">
                    ({reviewsCount})
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-border-custom)] pt-6 space-y-3 min-w-0">
              <h3 className="font-bold text-base text-[var(--color-text-main)]">
                Lesson Description
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line break-words">
                {resource.description ||
                  "No detailed description provided for this resource."}
              </p>
            </div>

            <div className="border-t border-[var(--color-border-custom)] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-medium">
                  Resource Price
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-main)]">
                  {resource.price === 0
                    ? "FREE"
                    : `$${resource.price.toFixed(2)}`}
                </p>
              </div>

              <div className="w-full sm:w-auto">
                <ResourceActions
                  slug={resource.slug}
                  resourceId={resource.id}
                  title={resource.title}
                  price={resource.price}
                  userRole={userRole}
                  fileUrl={resource.fileUrl}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">
                Verified material available on the platform.
              </span>
            </div>
          </div>
        </div>

        <div className="w-full min-w-0">
          <ResourceReviews
            resourceId={resource.id}
            userId={userId}
            guestIdentifier={guestIdentifier}
            initialReviews={processedReviews}
          />
        </div>
      </div>
    </div>
  );
}
