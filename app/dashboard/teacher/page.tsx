import { auth } from "@/auth.config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import { mapResourceToDTO } from "@/actions/resources/resourceMappers";

export default async function TeacherDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ paypal?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // Pre-cargamos los recursos del marketplace directamente en el servidor
  const rawResources = await prisma.resource.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      reviews: { select: { rating: true } },
      teacher: {
        include: {
          user: { select: { name: true, image: true } },
        },
      },
    },
  });

  const initialMarketResources = rawResources.map(mapResourceToDTO);

  return (
    <TeacherDashboard
      initialUser={{
        id: dbUser.id,
        name: dbUser.name || "Profesor",
        email: dbUser.email || "",
        image: dbUser.image || null,
        role: dbUser.role,
      }}
      initialMarketResources={initialMarketResources}
      initialPaypalReturn={params.paypal === "return"}
    />
  );
}
