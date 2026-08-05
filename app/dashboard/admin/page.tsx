import { auth } from "@/auth.config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard/teacher");
  }

  let dbUser = null;
  let dbError = false;

  // 1. El try/catch gestiona exclusivamente la seguridad y obtención del usuario administrador
  try {
    dbUser = await prisma.user.findUnique({
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
  } catch (error) {
    console.error("Error crítico al conectar con la base de datos:", error);
    dbError = true;
  }

  // 2. Fallback visual ante errores críticos de conexión
  if (dbError || !dbUser) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Error de conexión
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            No se pudo establecer comunicación con la base de datos en este
            momento. Por favor, verifica tu conexión o intenta recargar la
            página más tarde.
          </p>
          <a
            href="/dashboard/admin"
            className="inline-block rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Reintentar
          </a>
        </div>
      </div>
    );
  }

  // 3. Renderizado limpio pasando únicamente la sesión del usuario validada por el servidor
  return (
    <AdminDashboard
      initialUser={{
        id: dbUser.id,
        name: dbUser.name || "Administrador",
        email: dbUser.email || "",
        image: dbUser.image || null,
        role: dbUser.role,
      }}
    />
  );
}
