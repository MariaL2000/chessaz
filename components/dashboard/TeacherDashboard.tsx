/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition, ChangeEvent, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileCheck,
  DollarSign,
  Menu,
  BookOpen,
} from "lucide-react";

import { updateUserProfile } from "@/actions/profile/update-profile";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { UploadResourceForm } from "@/components/dashboard/UploadResourceForm";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { DashboardResourceSearchBar } from "@/components/dashboard/DashboardResourceSearchBar";
import { ResourceDetailCard } from "@/components/resources/ResourceDetailCard";
import { useResourceStore } from "@/store/resource-store";
import type { ResourceDTO } from "@/types/resource";

interface TeacherDashboardProps {
  initialUser?: {
    id: string;
    name: string;
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
  const [isPending, startTransition] = useTransition();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updatedAvatar, setUpdatedAvatar] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const {
    recentResources,
    fetchRecentResources,
    teacherResources,
    fetchTeacherResources,
  } = useResourceStore();

  const user = {
    id: initialUser?.id || "",
    name: initialUser?.name || "User",
    email: initialUser?.email || "",
    image: updatedAvatar || initialUser?.image || "",
    role: (initialUser?.role || "TEACHER") as
      | "STUDENT"
      | "TEACHER"
      | "ADMIN"
      | "guest",
  };

  useEffect(() => {
    fetchRecentResources(50);
    if (user.id) {
      fetchTeacherResources(user.id);
    }
  }, [fetchRecentResources, fetchTeacherResources, user.id]);

  const allResources =
    recentResources.length > 0 ? recentResources : initialMarketResources;

  const currentTeacherResources =
    teacherResources.length > 0 ? teacherResources : initialTeacherResources;

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
        setActiveTab={setActiveTab}
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
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-medium">
                {activeTab === "market" &&
                  "Explore and acquire educational material created by other instructors fetched directly from the database."}
                {activeTab === "profile" &&
                  "Manage your personal information and account settings."}
                {activeTab === "upload-new" &&
                  "Publish your professional PGN files, courses, and PDFs."}
                {activeTab === "library" &&
                  "Acquired resources ready for study."}
                {activeTab === "uploads" &&
                  "Manage the PGN guides and PDFs you have put up for sale."}
                {activeTab === "wallet" &&
                  "Monitor your earnings and sales metrics."}
              </p>
            </div>
            {activeTab === "market" && <DashboardResourceSearchBar />}
          </div>

          {activeTab === "profile" && (
            <div className="max-w-4xl space-y-6">
              <ProfileSettings user={user} />
            </div>
          )}

          {activeTab === "upload-new" && (
            <div className="max-w-3xl space-y-6">
              <UploadResourceForm
                userId={user.id}
                onSuccess={() => setActiveTab("uploads")}
              />
            </div>
          )}

          {activeTab === "market" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-[var(--color-bg-card)] p-4 rounded-2xl border border-[var(--color-border-custom)]">
                <div className="flex flex-wrap items-center gap-2 w-full">
                  <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mr-2">
                    Categoría:
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
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-medium">
                Acquired resources ready for study.
              </p>
            </div>
          )}

          {activeTab === "uploads" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-[var(--color-bg-card)] p-4 rounded-2xl border border-[var(--color-border-custom)]">
                <div className="flex flex-wrap items-center gap-2 w-full">
                  <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mr-2">
                    Categoría:
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

              {currentTeacherResources.filter(
                (r) =>
                  selectedCategory === "ALL" || r.category === selectedCategory,
              ).length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-3">
                  <BookOpen className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-lg font-semibold text-[var(--color-text-main)]">
                    No has publicado recursos todavía o están pendientes de
                    aprobación.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  {currentTeacherResources
                    .filter(
                      (r) =>
                        selectedCategory === "ALL" ||
                        r.category === selectedCategory,
                    )
                    .map((resource) => (
                      <div key={resource.id} className="relative flex flex-col">
                        <ResourceDetailCard
                          resource={resource}
                          userRole={user.role}
                        />
                        <div className="mt-2 flex items-center justify-between px-2 py-1 bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-xl text-xs font-semibold">
                          <span className="text-[var(--color-text-muted)]">
                            Estado:
                          </span>
                          <span
                            className={
                              resource.isPublished
                                ? "text-emerald-600 font-bold"
                                : "text-amber-600 font-bold"
                            }
                          >
                            {resource.isPublished
                              ? "Aprobado / Publicado"
                              : "Pendiente de revisión"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                    <span className="font-medium text-sm">Total Balance</span>
                    <DollarSign className="w-5 h-5 text-[var(--color-gold)]" />
                  </div>
                  <p className="text-3xl font-extrabold text-[var(--color-text-main)]">
                    $0.00 USD
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                    <span className="font-medium text-sm">Completed Sales</span>
                    <FileCheck className="w-5 h-5 text-[var(--color-gold)]" />
                  </div>
                  <p className="text-3xl font-extrabold text-[var(--color-text-main)]">
                    0
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                    <span className="font-medium text-sm">
                      Growth This Month
                    </span>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-extrabold text-[var(--color-text-main)]">
                    0%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
