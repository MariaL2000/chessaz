/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition, ChangeEvent, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Menu,
  BookOpen,
  Download,
} from "lucide-react";

import { updateUserProfile } from "@/actions/profile/update-profile";
import { getUserPurchases } from "@/actions/resources/get-user-purchases";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { DashboardResourceSearchBar } from "@/components/dashboard/DashboardResourceSearchBar";
import { ResourceDetailCard } from "@/components/resources/ResourceDetailCard";
import { useResourceStore } from "@/store/resource-store";
import type { ResourceDTO } from "@/types/resource";

interface StudentDashboardProps {
  initialUser?: {
    id: string;
    name: string;
    email?: string;
    image?: string | null;
    role: string;
  };
  initialMarketResources?: ResourceDTO[];
}

export default function StudentDashboard({
  initialUser,
  initialMarketResources = [],
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("market");
  const [isPending, startTransition] = useTransition();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updatedAvatar, setUpdatedAvatar] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [purchasedResources, setPurchasedResources] = useState<ResourceDTO[]>(
    [],
  );
  const [isLoadingPurchases, setIsLoadingPurchases] = useState<boolean>(false);

  const { recentResources, fetchRecentResources } = useResourceStore();

  const user = {
    id: initialUser?.id || "",
    name: initialUser?.name || "User",
    email: initialUser?.email || "",
    image: updatedAvatar || initialUser?.image || "",
    role: (initialUser?.role || "STUDENT") as
      | "STUDENT"
      | "TEACHER"
      | "ADMIN"
      | "guest",
  };

  useEffect(() => {
    fetchRecentResources(50);
  }, [fetchRecentResources]);

  // Función controlada para cambiar de pestaña y cargar datos bajo demanda
  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);

    if (tab === "library" && user.id && purchasedResources.length === 0) {
      setIsLoadingPurchases(true);
      try {
        const res = await getUserPurchases(user.id);
        if (res.ok) {
          setPurchasedResources(res.resources);
        }
      } catch (error) {
        console.error("Error loading purchases:", error);
      } finally {
        setIsLoadingPurchases(false);
      }
    }
  };

  const allResources =
    recentResources.length > 0 ? recentResources : initialMarketResources;

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        type: "error",
        message: "Please select a valid image file.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;

      startTransition(async () => {
        const res = await updateUserProfile({
          userId: user.id,
          imageBase64: base64Image,
        });

        if (res.ok && res.user) {
          setUpdatedAvatar(res.user.image || null);
          setToast({
            type: "success",
            message: "Profile picture successfully updated!",
          });
        } else {
          setToast({
            type: "error",
            message: res.message || "Error updating picture.",
          });
        }

        setTimeout(() => setToast(null), 4000);
      });
    };
    reader.readAsDataURL(file);
  };

  const categories = ["ALL", "TACTICS", "OPENINGS", "ENDGAME", "STRATEGY"];

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] bg-[var(--color-bg-beige)] text-[var(--color-text-main)] relative box-border mt-16">
      <DashboardSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isPending={isPending}
        handleAvatarUpload={handleAvatarUpload}
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
            Student Panel
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
                  "Explore, filter and acquire study materials and PGN files."}
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
              <ProfileSettings user={user} />
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
                        userRole={user.role}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-6">
              {isLoadingPurchases ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-3">
                  <Download className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-50 animate-pulse" />
                  <p className="text-lg font-semibold text-[var(--color-text-main)]">
                    Loading your downloads...
                  </p>
                </div>
              ) : purchasedResources.length === 0 ? (
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
                  {purchasedResources.map((resource) => (
                    <ResourceDetailCard
                      key={resource.id}
                      resource={resource}
                      userRole={user.role}
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
