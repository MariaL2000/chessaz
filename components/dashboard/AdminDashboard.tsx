/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Menu,
  BookOpen,
  Clock,
  UploadCloud,
  Globe,
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
} from "@/actions/resources/get-user-purchases"; // Asegúrate de ajustar la ruta de importación

interface AdminDashboardProps {
  initialUser?: {
    id: string;
    name: string | null;
    email?: string;
    image?: string | null;
    role: string;
  };
  initialPendingResources?: ResourceDTO[];
  initialAllResources?: ResourceDTO[];
}

export default function AdminDashboard({
  initialUser,
  initialPendingResources = [],
  initialAllResources = [],
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("pending-resources");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showPendingBanner, setShowPendingBanner] = useState(false);

  // Estado para las descargas del sistema (Admin ve todas)
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
    pendingResources,
    fetchPendingResources,
    recentResources,
    fetchRecentResources,
  } = useResourceStore();

  useEffect(() => {
    fetchPendingResources();
    fetchRecentResources(50);
  }, [fetchPendingResources, fetchRecentResources]);

  // Cargar las descargas globales cuando se abre la pestaña "library"
  useEffect(() => {
    if (activeTab === "library" && userId) {
      let isMounted = true;

      const fetchDownloads = async () => {
        setIsLoadingDownloads(true);
        try {
          const res = await getUserDownloads(userId, "ADMIN");
          if (res.ok && isMounted) {
            setDownloads(res.downloads);
          }
        } catch (error) {
          console.error("Error loading downloads:", error);
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

  const currentPendingResources =
    pendingResources.length > 0 ? pendingResources : initialPendingResources;

  const currentAllResources =
    recentResources.length > 0 ? recentResources : initialAllResources;

  const [toast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
            Admin Panel
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
                {activeTab === "pending-resources" &&
                  "Pending Resources Review"}
                {activeTab === "market" && "Chess Resource Marketplace"}
                {activeTab === "library" && "Platform Downloads History"}
                {activeTab === "profile" && "Profile Settings"}
                {activeTab === "community-resources" && "Community Resources"}
                {activeTab === "upload-resource" && "Upload Resource"}
              </h2>
            </div>
            {(activeTab === "market" ||
              activeTab === "community-resources") && (
              <DashboardResourceSearchBar />
            )}
          </div>

          {activeTab === "profile" && (
            <div className="max-w-4xl space-y-6">
              <ProfileSettings />
            </div>
          )}

          {activeTab === "pending-resources" && (
            <div className="space-y-6">
              {currentPendingResources.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-3">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/50" />
                  <p className="text-lg font-semibold text-[var(--color-text-main)]">
                    All caught up! No pending resources to review.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  {currentPendingResources.map((resource) => (
                    <div key={resource.id} className="relative flex flex-col">
                      <ResourceCard resource={resource} />
                      <div className="mt-2 flex items-center justify-between px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-semibold">
                        <span className="text-amber-700/80 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Action Required
                        </span>
                        <span className="text-amber-700 font-bold">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sección de Downloads para el Admin */}
          {activeTab === "library" && (
            <div className="space-y-6">
              {isLoadingDownloads ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)]">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Loading downloads...
                  </p>
                </div>
              ) : downloads.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-3">
                  <Download className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-lg font-semibold text-[var(--color-text-main)]">
                    No download records found on the platform yet.
                  </p>
                </div>
              ) : (
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--color-border-custom)] bg-[var(--color-gold-light)]/30 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                          <th className="p-4">Resource</th>
                          <th className="p-4">User</th>
                          <th className="p-4">Category / Type</th>
                          <th className="p-4">Price Type</th>
                          <th className="p-4">Date</th>
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
                              <div className="font-medium text-[var(--color-text-main)]">
                                {item.user.name || "Anonymous"}
                              </div>
                              <div className="text-xs text-[var(--color-text-muted)]">
                                {item.user.email}
                              </div>
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
                              {new Date(item.createdAt).toLocaleDateString()}{" "}
                              {new Date(item.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
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

              {currentAllResources.filter(
                (r) =>
                  selectedCategory === "ALL" || r.category === selectedCategory,
              ).length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-3">
                  <BookOpen className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-lg font-semibold text-[var(--color-text-main)]">
                    No resources found in this category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  {currentAllResources
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
                            {resource.isPublished ? "Published" : "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "community-resources" && (
            <div className="space-y-6">
              <div className="p-6 bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-[var(--color-gold)]" />
                  <h3 className="text-lg font-bold">
                    Community Resources Management
                  </h3>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Aquí puedes supervisar todos los recursos subidos por la
                  comunidad global de ajedrez.
                </p>
              </div>
            </div>
          )}

          {activeTab === "upload-resource" && (
            <div className="max-w-3xl space-y-6">
              <UploadResourceForm
                userId={userId}
                onSuccess={() => {
                  setShowPendingBanner(true);
                  setActiveTab("pending-resources");
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
