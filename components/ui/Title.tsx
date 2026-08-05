"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  titleColor?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  center = true,
  titleColor = "var(--color-text-main)",
}: SectionHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  // Progreso de scroll sobre el encabezado
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start 85%", "end 45%"],
  });

  // Animación suave del trazo
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      ref={headerRef}
      className={`${
        center ? "text-center max-w-4xl mx-auto" : "max-w-2xl"
      } mb-12 md:mb-16 relative flex flex-col items-center justify-center`}
    >
      {/* ==================== TRAZO CURVO ONDULADO DE FONDO ==================== */}
      <div className="absolute -top-6 w-full max-w-2xl h-36 pointer-events-none z-0 overflow-visible">
        <svg
          className="w-full h-full"
          viewBox="0 0 600 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Guía tenue clara */}
          <path
            d="M 50,20 C 150,0 200,80 300,50 C 400,20 450,100 550,75"
            stroke="var(--color-gold-light, #FDE68A)"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.4"
            strokeLinecap="round"
          />

          {/* Trazo activo animado (Dorado Claro / Cálido) */}
          <motion.path
            d="M 50,20 C 150,0 200,80 300,50 C 400,20 450,100 550,75"
            stroke="var(--color-gold, #F59E0B)"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              pathLength,
              filter: "drop-shadow(0px 2px 6px rgba(245, 158, 11, 0.3))",
            }}
          />
        </svg>
      </div>

      {/* Título Principal con la fuente Serif (Playfair Display) */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-geist-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide leading-[1.2] relative z-10"
        style={{ color: titleColor }}
      >
        {title}
      </motion.h2>

      {/* Subtítulo (se mantiene en font-sans) */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-geis mt-6 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed font-light relative z-10"
          style={{
            color: "var(--color-text-muted)",
            marginInline: center ? "auto" : "0",
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
