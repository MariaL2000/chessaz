"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Users, HelpCircle, FileText, Award } from "lucide-react";

export interface NavLinkSubitem {
  name: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NavLinkItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  sublinks?: NavLinkSubitem[];
}

export interface NavLinksProps {
  isScrolled?: boolean;
}

export const navLinks: NavLinkItem[] = [
  {
    name: "Lesson Catalog",
    href: "/lessons",
  },
  {
    name: "Learn", // Ruta que explica el sentido del proyecto en inglés y conecta con los profesores de forma responsiva
    href: "/learn",
  },
  {
    name: "Resources & Creators",
    href: "#",
    hasDropdown: true,
    sublinks: [
      {
        name: "Help & Guides",
        href: "/help", // Explicación en inglés, breve y responsiva sobre cómo el profesor sube su recurso, se notifica al admin y este aprueba el contenido
        description: "Platform guides and articles for chess coaches",
        icon: HelpCircle,
      },
      {
        name: "Elevate Your Chess Coaching",
        href: "#elevate-your-chess-coaching",
        description: "Take your chess teaching to the next level",
      },
    ],
  },
];

export const NavLinks: React.FC<NavLinksProps> = ({ isScrolled }) => {
  const pathname = usePathname();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  return (
    <div
      className="hidden md:flex items-center gap-8 relative"
      onMouseLeave={() => setHoveredPath(null)}
    >
      {navLinks.map((link) => {
        // Verifica si la ruta actual coincide con el enlace principal o alguno de sus subenlaces
        const isActive =
          pathname === link.href ||
          (link.sublinks && link.sublinks.some((sub) => pathname === sub.href));

        // Determina si este ítem en particular debe mostrar la línea indicadora
        const showUnderline =
          hoveredPath === link.href || (!hoveredPath && isActive);

        return (
          <div
            key={link.href}
            className="relative py-2"
            onMouseEnter={() => setHoveredPath(link.href)}
          >
            <Link
              href={link.href}
              className="text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5"
              style={{
                color:
                  isActive || hoveredPath === link.href
                    ? "var(--color-gold, #C59B6C)"
                    : isScrolled
                      ? "var(--color-dark, #0A0F1D)"
                      : "var(--color-text-main, #1A1A1A)",
              }}
            >
              <span>{link.name}</span>

              {link.hasDropdown && (
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    hoveredPath === link.href ? "rotate-180 text-[#C59B6C]" : ""
                  }`}
                />
              )}
            </Link>

            {/* Submenú desplegable en Escritorio */}
            {link.hasDropdown && link.sublinks && (
              <AnimatePresence>
                {hoveredPath === link.href && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-64 pt-2 z-50"
                  >
                    <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-xl">
                      {link.sublinks.map((sub) => {
                        const Icon = sub.icon;
                        const isSubActive = pathname === sub.href;

                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors group/sub ${
                              isSubActive ? "bg-white/10" : "hover:bg-white/5"
                            }`}
                          >
                            {Icon && (
                              <Icon className="w-5 h-5 text-[#C59B6C] shrink-0 mt-0.5 group-hover/sub:scale-110 transition-transform" />
                            )}
                            <div>
                              <p className="text-xs font-bold text-white uppercase tracking-wider group-hover/sub:text-[#C59B6C] transition-colors">
                                {sub.name}
                              </p>
                              {sub.description && (
                                <p className="text-[10px] text-gray-400 font-normal leading-tight mt-0.5">
                                  {sub.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Línea indicadora inferior animada */}
            {showUnderline && (
              <motion.div
                layoutId="activeUnderline"
                className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                style={{ backgroundColor: "var(--color-gold, #C59B6C)" }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
