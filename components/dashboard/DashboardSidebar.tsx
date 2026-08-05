"use client";

import { ChangeEvent } from "react";
import Image from "next/image";
import {
  BookOpen,
  ShoppingBag,
  UploadCloud,
  Wallet,
  Library,
  LayoutDashboard,
  UserCircle,
  Camera,
  Loader2,
  X,
  Clock,
  Globe,
} from "lucide-react";
import { LogoutButton } from "@/components/ui/LogoutButton";

interface User {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
  role: string;
}

interface DashboardSidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPending: boolean;
  handleAvatarUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function DashboardSidebar({
  user,
  activeTab,
  setActiveTab,
  isPending,
  handleAvatarUpload,
  isOpen,
  setIsOpen,
}: DashboardSidebarProps) {
  // Definición de menús según el rol del usuario
  const getNavItems = () => {
    const role = user.role?.toUpperCase();
    if (role === "ADMIN") {
      return [
        {
          section: "My Account",
          items: [{ id: "profile", label: "My Profile", icon: UserCircle }],
        },
        {
          section: "Administration",
          items: [
            {
              id: "pending-resources",
              label: "Pending Approvals",
              icon: Clock,
            },
            {
              id: "community-resources",
              label: "Community Resources",
              icon: Globe,
            },
            {
              id: "upload-resource", // <-- ¡Añadido aquí para que aparezca en el menú!
              label: "Upload Resource",
              icon: UploadCloud,
            },
            { id: "market", label: "Marketplace", icon: ShoppingBag },
          ],
        },
      ];
    }

    if (role === "STUDENT") {
      return [
        {
          section: "My Account",
          items: [{ id: "profile", label: "My Profile", icon: UserCircle }],
        },
        {
          section: "Learning",
          items: [
            { id: "market", label: "Marketplace", icon: ShoppingBag },
            { id: "library", label: "My Downloads", icon: Library },
          ],
        },
      ];
    }

    // Por defecto: TEACHER / CREATOR
    return [
      {
        section: "My Account",
        items: [{ id: "profile", label: "My Profile", icon: UserCircle }],
      },
      {
        section: "Buyer",
        items: [
          { id: "market", label: "Marketplace", icon: ShoppingBag },
          { id: "library", label: "My Downloads", icon: Library },
        ],
      },
      {
        section: "Creator / Teacher",
        items: [
          { id: "uploads", label: "My Classes", icon: BookOpen },
          { id: "upload-new", label: "Sell Class", icon: UploadCloud },
          { id: "wallet", label: "Earnings", icon: Wallet },
        ],
      },
    ];
  };

  const navItems = getNavItems();

  const getPanelTitle = () => {
    const role = user.role?.toUpperCase();
    if (role === "ADMIN") return "Admin Panel";
    if (role === "STUDENT") return "Student Panel";
    return "Teacher Panel";
  };

  return (
    <>
      {/* Backdrop para dispositivos móviles */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[var(--color-border-custom)] bg-[var(--color-bg-card)] flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 shadow-xl md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Header & Close Button for Mobile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--color-gold-light)] text-[var(--color-gold)] border border-[var(--color-gold)]/20">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight text-[var(--color-text-main)]">
                  {getPanelTitle()}
                </h1>
                <p className="text-xs text-[var(--color-text-muted)] font-medium">
                  Chessaz Ecosystem
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-gold-light)] hover:text-[var(--color-text-main)] transition-colors"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-4 rounded-2xl bg-[var(--color-gold-light)]/50 border border-[var(--color-border-custom)] flex items-center gap-3 relative group">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[var(--color-gold)] bg-[var(--color-bg-card)] flex items-center justify-center shrink-0 shadow-xs">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <UserCircle className="w-10 h-10 text-[var(--color-text-muted)]" />
              )}

              <label
                htmlFor="sidebar-avatar-upload"
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                title="Change profile photo"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </label>
              <input
                id="sidebar-avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isPending}
              />
            </div>

            <div className="overflow-hidden">
              <h3 className="font-semibold text-sm truncate text-[var(--color-text-main)]">
                {user.name}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] truncate font-medium">
                {user.email}
              </p>
              <span className="inline-block mt-1 text-[10px] uppercase font-bold text-[var(--color-gold)] bg-[var(--color-gold-light)] px-2 py-0.5 rounded-full border border-[var(--color-gold)]/20">
                {user.role}
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-6">
            {navItems.map((group, idx) => (
              <div key={idx}>
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                  {group.section}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[var(--color-gold)] text-white shadow-md font-semibold"
                            : "hover:bg-[var(--color-gold-light)] text-[var(--color-text-main)] hover:text-[var(--color-gold)]"
                        }`}
                      >
                        <Icon className="h-4 w-4" /> {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[var(--color-border-custom)] space-y-3">
          <LogoutButton className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer" />
          <div className="text-[10px] text-[var(--color-text-muted)] text-center font-medium">
            Chessaz Dashboard &copy; {new Date().getFullYear()}
          </div>
        </div>
      </aside>
    </>
  );
}
