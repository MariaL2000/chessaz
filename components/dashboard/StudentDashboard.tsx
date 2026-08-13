/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Menu,
  BookOpen,
  Download,
} from "lucide-react";

import {
  getUserDownloads,
  type DownloadItemDTO,
} from "@/actions/resources/get-user-purchases";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { DashboardResourceSearchBar } from "@/components/dashboard/DashboardResourceSearchBar";
import { ResourceDetailCard } from "@/components/resources/ResourceDetailCard";
import { useResourceStore } from "@/store/resource-store";
import { useAuthStore } from "@/store/useAuthStore";
import type { ResourceDTO } from "@/types/resource";

interface AdminDashboardProps {
  initialUser?: {
    id: string;
    name: string | null;
    email?: string;
    image?: string | null;
    role: string;
  };
  initialMarketResources?: ResourceDTO[];
}

export default function AdminDashboard({
  initialUser,
  initialMarketResources = [],
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("market");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [downloads, setDownloads] = useState<DownloadItemDTO[]>([]);
  const [isLoadingDownloads, setIsLoadingDownloads] = useState<boolean>(false);

  const { recentResources, fetchRecentResources } = useResourceStore();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (initialUser) {
      setUser({
        id: initialUser.id,
        name: initialUser.name,
        email: initialUser.email || "",
        role: initialUser.role as "TEACHER" | "STUDENT" | "ADMIN",
        image: initialUser.image || null,
      });
    }
  }, [initialUser, setUser]);

  const userId = user?.id || initialUser?.id || "";
  const userRole = user?.role || initialUser?.role || "ADMIN";

  useEffect(() => {
    fetchRecentResources(50);
  }, [fetchRecentResources]);

  // Cargar las descargas (o compras) cuando hace clic en la pestaña "library"
  useEffect(() => {
    if (activeTab === "library" && downloads.length === 0) {
      let isMounted = true;
      const fetchDownloads = async () => {
        setIsLoadingDownloads(true);
        try {
          const res = await getUserDownloads(userId, userRole);
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
  }, [activeTab, userId, userRole, downloads.length]);

  const allResources =
    recentResources.length > 0 ? recentResources : initialMarketResources;

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
                {activeTab === "market" && "Chess Resource Marketplace"}
                {activeTab === "profile" && "Profile Settings"}
                {activeTab === "library" && "My Downloads & Purchases"}
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-medium">
                {activeTab === "market" &&
                  "Explore, filter and acquire study materials."}
                {activeTab === "profile" &&
                  "Manage your personal information and account settings."}
                {activeTab === "library" &&
                  "Access your acquired resources and downloaded materials ready for study."}
              </p>
            </div>
            {activeTab === "market" && <DashboardResourceSearchBar />}
          </div>

          {activeTab === "profile" && (
            <div className="max-w-4xl space-y-6">
              <ProfileSettings />
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
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Published resources will appear here automatically.
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
                      <ResourceDetailCard
                        key={resource.id}
                        resource={resource}
                        userRole={user?.role || "ADMIN"}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-6">
              {isLoadingDownloads ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-3">
                  <Download className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-50 animate-pulse" />
                  <p className="text-lg font-semibold text-[var(--color-text-main)]">
                    Loading your downloads...
                  </p>
                </div>
              ) : downloads.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-3">
                  <BookOpen className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-lg font-semibold text-[var(--color-text-main)]">
                    You haven&apos;t acquired any resources or lessons yet.
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Your purchases and downloads will appear here for your
                    study.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  {downloads.map((item) => (
                    <ResourceDetailCard
                      key={item.id}
                      resource={item.resource}
                      userRole={user?.role || "ADMIN"}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
