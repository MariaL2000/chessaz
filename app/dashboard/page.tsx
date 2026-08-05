import { auth } from "@/auth.config";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Obtener sesión del servidor
  const session = await auth();

  // 2. Si no hay sesión, redirige al login inmediatamente
  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
