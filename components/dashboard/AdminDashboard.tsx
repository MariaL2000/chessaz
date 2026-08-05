"use client";

import React, { useState, useTransition, ChangeEvent, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Menu,
  Clock,
  Check,
  X,
  BookOpen,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Trash2,
} from "lucide-react";

import { updateUserProfile } from "@/actions/profile/update-profile";
import {
  reviewResource,
  deleteResource,
} from "@/actions/resources/adminResourceActions";
import { downloadResourceAction } from "@/actions/resources/downloadResource";
import { getPaginatedUsers } from "@/actions/admin/getpaginatedusers";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { UploadResourceForm } from "@/components/dashboard/UploadResourceForm";
import { ResourceDetailCard } from "@/components/resources/ResourceDetailCard";
import { DashboardResourceSearchBar } from "@/components/dashboard/DashboardResourceSearchBar";
import { useResourceStore } from "@/store/resource-store";
import type { ResourceDTO } from "@/types/resource";

interface AdminDashboardProps {
  initialUser?: {
    id: string;
    name: string;
    email?: string;
    image?: string | null;
    role: string;
  };
  initialPendingResources?: ResourceDTO[];
  initialAllResources?: ResourceDTO[];
  initialCommunityResources?: ResourceDTO[];
}

export default function AdminDashboard({
  initialUser,
  initialPendingResources = [],
  initialAllResources = [],
  initialCommunityResources = [],
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("pending-resources");
  const [isPending, startTransition] = useTransition();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updatedAvatar, setUpdatedAvatar] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const {
    recentResources,
    fetchRecentResources,
    pendingResources,
    fetchPendingResources,
    communityResources,
    fetchCommunityResources,
    updateResourceStatusLocally,
    removeResourceLocally,
  } = useResourceStore();

  useEffect(() => {
    fetchRecentResources(50);
    fetchPendingResources();
    fetchCommunityResources(50);
  }, [fetchRecentResources, fetchPendingResources, fetchCommunityResources]);

  useEffect(() => {
    if (activeTab === "users-management") {
      startTransition(async () => {
        const res = await getPaginatedUsers({
          page: userPage,
          take: 8,
          query: userSearchQuery,
        });
        if (res.ok) {
          setUsers(res.users);
          setUserTotalPages(res.totalPages || 1);
        }
      });
    }
  }, [activeTab, userPage, userSearchQuery]);

  const allResources =
    recentResources.length > 0 ? recentResources : initialAllResources;

  const currentCommunityResources =
    communityResources.length > 0
      ? communityResources
      : initialCommunityResources;

  const currentPendingResources =
    pendingResources.length > 0 || recentResources.length > 0
      ? pendingResources
      : initialPendingResources;

  const user = {
    id: initialUser?.id || "",
    name: initialUser?.name || "Admin User",
    email: initialUser?.email || "",
    image: updatedAvatar || initialUser?.image || "",
    role: initialUser?.role || "ADMIN",
  };

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleViewFile = (slug: string) => {
    startTransition(async () => {
      const res = await downloadResourceAction(slug);
      if (res.ok && res.fileUrl) {
        window.open(res.fileUrl, "_blank", "noopener,noreferrer");
      } else {
        setToast({
          type: "error",
          message: res.message || "Could not open file.",
        });
        setTimeout(() => setToast(null), 4000);
      }
    });
  };

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
            message: "Profile picture updated successfully!",
          });
        } else {
          setToast({
            type: "error",
            message: res.message || "Error updating profile picture.",
          });
        }
        setTimeout(() => setToast(null), 4000);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleReviewAction = (
    resourceId: string,
    action: "APPROVE" | "REJECT",
  ) => {
    startTransition(async () => {
      const res = await reviewResource({
        resourceId,
        adminUserId: user.id,
        action,
      });
      if (res.ok) {
        if (action === "APPROVE") {
          updateResourceStatusLocally(resourceId, true);
        } else {
          removeResourceLocally(resourceId);
        }
        setToast({ type: "success", message: res.message });
      } else {
        setToast({ type: "error", message: res.message });
      }
      setTimeout(() => setToast(null), 4000);
    });
  };

  const handleDeleteResource = (resourceId: string) => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;

    startTransition(async () => {
      const res = await deleteResource({
        resourceId,
        adminUserId: user.id,
      });

      if (res.ok) {
        removeResourceLocally(resourceId);
        setToast({ type: "success", message: res.message });
      } else {
        setToast({ type: "error", message: res.message });
      }
      setTimeout(() => setToast(null), 4000);
    });
  };

  return (
    <div className="flex w-full bg-[var(--color-bg-beige)] text-[var(--color-text-main)] relative box-border min-h-screen">
      <DashboardSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPending={isPending}
        handleAvatarUpload={handleAvatarUpload}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 w-full relative bg-[var(--color-bg-beige)] overflow-visible">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--color-border-custom)] bg-[var(--color-bg-card)] sticky top-0 z-40 shadow-xs">
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

        <div className="p-4 sm:p-6 md:p-10 pt-6 sm:pt-8 flex-1 max-w-7xl mx-auto w-full box-border">
          {activeTab === "profile" && (
            <div className="max-w-4xl space-y-6 pt-2 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[var(--color-bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--color-border-custom)] shadow-xs relative z-20">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
                    Profile Settings
                  </h2>
                </div>
              </div>
              <ProfileSettings user={user} />
            </div>
          )}

          {activeTab === "users-management" && (
            <div className="space-y-6 pt-2 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[var(--color-bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--color-border-custom)] shadow-xs relative z-20">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
                    Users Management
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium mt-0.5">
                    List of registered users on the platform.
                  </p>
                </div>
                <div className="relative w-full md:w-72 z-30">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  />
                </div>
              </div>

              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[var(--color-border-custom)] bg-[var(--color-gold-light)]/30 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        <th className="p-4">User</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4 text-right">Registration Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-custom)] text-sm">
                      {users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-8 text-center text-[var(--color-text-muted)]"
                          >
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-[var(--color-gold-light)]/10 transition-colors"
                          >
                            <td className="p-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[var(--color-gold-light)] overflow-hidden flex items-center justify-center shrink-0 border border-[var(--color-border-custom)]">
                                {u.image ? (
                                  <img
                                    src={u.image}
                                    alt={u.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Shield className="w-4 h-4 text-[var(--color-gold)]" />
                                )}
                              </div>
                              <span className="font-semibold text-[var(--color-text-main)] truncate max-w-[150px] sm:max-w-[200px]">
                                {u.name}
                              </span>
                            </td>
                            <td className="p-4 text-[var(--color-text-muted)] truncate max-w-[180px] sm:max-w-[220px]">
                              {u.email}
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--color-gold-light)] text-[var(--color-gold)]">
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4 text-right text-xs text-[var(--color-text-muted)]">
                              {u.createdAt
                                ? new Date(u.createdAt).toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-[var(--color-border-custom)] bg-[var(--color-bg-card)]">
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">
                    Page {userPage} of {userTotalPages || 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
                      disabled={userPage === 1 || isPending}
                      className="p-2 rounded-xl border border-[var(--color-border-custom)] disabled:opacity-40 hover:bg-[var(--color-gold-light)] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setUserPage((p) => Math.min(p + 1, userTotalPages))
                      }
                      disabled={userPage >= userTotalPages || isPending}
                      className="p-2 rounded-xl border border-[var(--color-border-custom)] disabled:opacity-40 hover:bg-[var(--color-gold-light)] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pending-resources" && (
            <div className="space-y-6 pt-2 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[var(--color-bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--color-border-custom)] shadow-xs relative z-20">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
                    Pending Approvals
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
                    Review educational materials submitted by instructors.
                  </p>
                </div>
              </div>

              {currentPendingResources.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] space-y-3">
                  <Clock className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-base sm:text-lg font-semibold text-[var(--color-text-main)]">
                    No resources pending review.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                  {currentPendingResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="relative group flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl p-4 shadow-xs"
                    >
                      <ResourceDetailCard resource={resource} />

                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border-custom)]">
                        {resource.fileUrl && (
                          <button
                            onClick={() => handleViewFile(resource.slug)}
                            disabled={isPending}
                            className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[var(--color-border-custom)] hover:bg-[var(--color-gold-light)] transition-colors text-[var(--color-text-main)] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                            View File
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleReviewAction(resource.id, "APPROVE")
                          }
                          disabled={isPending}
                          className="flex items-center justify-center p-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleReviewAction(resource.id, "REJECT")
                          }
                          disabled={isPending}
                          className="flex items-center justify-center p-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          disabled={isPending}
                          className="flex items-center justify-center p-2 bg-rose-600 text-white rounded-xl shadow-md opacity-90 hover:opacity-100 hover:bg-rose-700 transition-all cursor-pointer"
                          title="Delete resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "upload-resource" && (
            <div className="space-y-6 pt-2 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[var(--color-bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--color-border-custom)] shadow-xs relative z-20">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
                    Upload Resource
                  </h2>
                </div>
              </div>
              <UploadResourceForm userId={user.id} />
            </div>
          )}

          {activeTab === "community-resources" && (
            <div className="space-y-6 pt-2 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[var(--color-bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--color-border-custom)] shadow-xs relative z-20">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
                    Resources of the Community
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
                    Explore and manage all community-contributed materials.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                {currentCommunityResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="relative group flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl p-4 shadow-xs"
                  >
                    <ResourceDetailCard resource={resource} />
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      disabled={isPending}
                      className="absolute top-3 right-3 p-2 bg-rose-600 text-white rounded-xl shadow-md opacity-90 hover:opacity-100 hover:bg-rose-700 transition-all cursor-pointer z-10"
                      title="Delete resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "market" && (
            <div className="space-y-6 pt-2 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[var(--color-bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--color-border-custom)] shadow-xs relative z-20">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
                    Marketplace Overview
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
                    Explore and manage all published public resources.
                  </p>
                </div>
                <div className="w-full md:w-80 relative z-30">
                  <DashboardResourceSearchBar />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                {allResources
                  .filter((r) => r.isPublished)
                  .map((resource) => (
                    <div
                      key={resource.id}
                      className="relative group flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl p-4 shadow-xs"
                    >
                      <ResourceDetailCard resource={resource} />
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        disabled={isPending}
                        className="absolute top-3 right-3 p-2 bg-rose-600 text-white rounded-xl shadow-md opacity-90 hover:opacity-100 hover:bg-rose-700 transition-all cursor-pointer z-10"
                        title="Delete resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
