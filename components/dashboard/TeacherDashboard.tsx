/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Menu,
  BookOpen,
  Clock,
  Download,
} from "lucide-react";

import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { UploadResourceForm } from "@/components/dashboard/UploadResourceForm";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { DashboardResourceSearchBar } from "@/components/dashboard/DashboardResourceSearchBar";
import { ResourceCard } from "@/components/home/ResourceCard";
import { useResourceStore } from "@/store/resource-store";
import { useAuthStore } from "@/store/useAuthStore";
import type { ResourceDTO } from "@/types/resource";
import {
  getUserDownloads,
  DownloadItemDTO,
} from "@/actions/resources/get-user-purchases";
import { SecureDownloadButton } from "@/components/resources/SecureDownloadButton";

interface TeacherDashboardProps {
  initialUser?: {
    id: string;
    name: string | null;
    email?: string;
    image?: string | null;
    role: string;
  };
  initialMarketResources?: ResourceDTO[];
  initialTeacherResources?: ResourceDTO[];
}

export default function TeacherDashboard({
  initialUser,
  initialMarketResources = [],
  initialTeacherResources = [],
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("market");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Nuevo estado para controlar si se acaba de crear un recurso con éxito
  const [showPendingBanner, setShowPendingBanner] = useState(false);

  // Estados para la pestaña de descargas del profesor (My Downloads)
  const [downloads, setDownloads] = useState<DownloadItemDTO[]>([]);
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(false);

  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (initialUser) {
      setUser({
        id: initialUser.id,
        name: initialUser.name,
        email: initialUser.email || "",
        role: initialUser.role as "TEACHER" | "ADMIN",
        image: initialUser.image || null,
      });
    }
  }, [initialUser, setUser]);

  const userId = user?.id || initialUser?.id || "";

  const {
    recentResources,
    fetchRecentResources,
    teacherResources,
    fetchTeacherResources,
  } = useResourceStore();

  useEffect(() => {
    fetchRecentResources(50);
    if (userId) {
      fetchTeacherResources(userId);
    }
  }, [fetchRecentResources, fetchTeacherResources, userId]);

  // Cargar las descargas del profesor cuando hace clic en la pestaña "library"
  useEffect(() => {
    if (activeTab === "library" && userId) {
      let isMounted = true;

      const fetchDownloads = async () => {
        setIsLoadingDownloads(true);
        try {
          const res = await getUserDownloads(userId, "TEACHER");
          if (res.ok && isMounted) {
            setDownloads(res.downloads);
          }
        } catch (error) {
          console.error("Error loading teacher downloads:", error);
        } finally {
          if (isMounted) {
            setIsLoadingDownloads(false);
          }
        }
      };

      fetchDownloads();

      return () => {
        isMounted = false;
      };
    }
  }, [activeTab, userId]);

  const allResources =
    recentResources.length > 0 ? recentResources : initialMarketResources;

  const currentTeacherResources =
    teacherResources.length > 0 ? teacherResources : initialTeacherResources;

  const [toast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Declaración correcta de las categorías para evitar el error de referencia
  const categories = ["ALL", "TACTICS", "OPENINGS", "ENDGAME", "STRATEGY"];

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] bg-[var(--color-bg-beige)] text-[var(--color-text-main)] relative box-border mt-16">
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden relative bg-[var(--color-bg-beige)]">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--color-border-custom)] bg-[var(--color-bg-card)] sticky top-0 z-20 shadow-xs">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-[var(--color-gold-light)] text-[var(--color-text-main)] hover:bg-[var(--color-gold)]/20 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm tracking-tight text-[var(--color-text-main)]">
            Teacher Panel
          </span>
          <div className="w-6" />
        </header>

        {toast && (
          <div
            className={`fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm transition-all ${
              toast.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700"
                : "bg-rose-500/15 border-rose-500/40 text-rose-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 md:p-10 flex-1 max-w-7xl mx-auto w-full box-border space-y-6 pt-6 md:pt-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
                {activeTab === "market" && "Chess Resource Marketplace"}
                {activeTab === "profile" && "Profile Settings"}
                {activeTab === "upload-new" && "Upload New Resource"}
                {activeTab === "library" && "My Downloads & Purchases"}
                {activeTab === "uploads" && "My Published Classes & Resources"}
                {activeTab === "wallet" && "Earnings Dashboard"}
              </h2>
            </div>
            {activeTab === "market" && <DashboardResourceSearchBar />}
          </div>

          {activeTab === "profile" && (
            <div className="max-w-4xl space-y-6">
              <ProfileSettings />
            </div>
          )}

          {activeTab === "upload-new" && (
            <div className="max-w-3xl space-y-6">
              {/* 
                TODO (Platform Commission Integration):
                When implementing the server action or payment webhook (Stripe/Checkout) that processes 
                the sale of a teacher's resource, calculate the earnings split as follows:
                
                const adminFee = resource.price * 0.05; // Admin keeps 5% commission
                const teacherEarnings = resource.price - adminFee; // Teacher gets 95%
                
                Save these computed amounts inside your database transaction (e.g., in Purchase or Wallet transaction records) 
                so the admin wallet reflects the 5% cut and the teacher's earnings dashboard reflects the remainder.
              */}
              <UploadResourceForm
                userId={userId}
                onSuccess={() => {
                  setShowPendingBanner(true);
                  setActiveTab("uploads");
                }}
              />
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-6">
              {isLoadingDownloads ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)]">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Loading your downloads...
                  </p>
                </div>
              ) : downloads.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-3">
                  <Download className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-lg font-semibold text-[var(--color-text-main)]">
                    You haven&apos;t downloaded or acquired any resources yet.
                  </p>
                </div>
              ) : (
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--color-border-custom)] bg-[var(--color-gold-light)]/30 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                          <th className="p-4">Resource</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price Type</th>
                          <th className="p-4">Date</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border-custom)] text-sm">
                        {downloads.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-[var(--color-gold-light)]/10 transition-colors"
                          >
                            <td className="p-4 font-semibold text-[var(--color-text-main)]">
                              {item.resource.title}
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-gold-light)] text-[var(--color-gold)]">
                                {item.resource.category}
                              </span>
                            </td>
                            <td className="p-4 font-bold">
                              {item.isFree ? (
                                <span className="text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg text-xs">
                                  FREE
                                </span>
                              ) : (
                                <span className="text-[var(--color-gold)]">
                                  ${item.pricePaid.toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-xs text-[var(--color-text-muted)]">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <SecureDownloadButton
                                resourceId={item.resource.id}
                                userId={user?.id}
                                email={user?.email}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "market" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-[var(--color-bg-card)] p-4 rounded-2xl border border-[var(--color-border-custom)]">
                <div className="flex flex-wrap items-center gap-2 w-full">
                  <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mr-2">
                    Category:
                  </span>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === cat
                          ? "bg-[var(--color-gold)] text-white shadow-sm"
                          : "bg-[var(--color-gold-light)] text-[var(--color-text-main)] hover:bg-[var(--color-gold)]/20"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {allResources.filter(
                (r) =>
                  r.isPublished &&
                  (selectedCategory === "ALL" ||
                    r.category === selectedCategory),
              ).length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-3">
                  <BookOpen className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-lg font-semibold text-[var(--color-text-main)]">
                    No resources available in the marketplace yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  {allResources
                    .filter((r) => r.isPublished)
                    .filter(
                      (r) =>
                        selectedCategory === "ALL" ||
                        r.category === selectedCategory,
                    )
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "uploads" && (
            <div className="space-y-6">
              {showPendingBanner && (
                <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-800 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-xl">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">
                        Resource submitted successfully!
                      </h4>
                      <p className="text-xs text-amber-700/80">
                        Your resource is currently pending admin review before
                        appearing in the public marketplace.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPendingBanner(false)}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-900 px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {currentTeacherResources
                  .filter(
                    (r) =>
                      selectedCategory === "ALL" ||
                      r.category === selectedCategory,
                  )
                  .map((resource) => (
                    <div key={resource.id} className="relative flex flex-col">
                      <ResourceCard resource={resource} />
                      <div className="mt-2 flex items-center justify-between px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-xl text-xs font-semibold">
                        <span className="text-[var(--color-text-muted)]">
                          Status:
                        </span>
                        <span
                          className={
                            resource.isPublished
                              ? "text-emerald-600 font-bold"
                              : "text-amber-600 font-bold"
                          }
                        >
                          {resource.isPublished
                            ? "Approved / Published"
                            : "Pending admin review"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
