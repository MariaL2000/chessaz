"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Star } from "lucide-react";

const headerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.15,
    },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.2, duration: 0.8, ease: "easeOut" },
  },
};

export const Header = () => {
  // Beige punto medio (N° 4: #E3DCCB) - Más claro y limpio
  const inlineThemeStyles = {
    "--bg-beige": "#E3DCCB",
    "--bg-beige-fade": "rgba(227, 220, 203, 0.4)",
    "--text-dark": "#1A1510",
  } as React.CSSProperties;

  return (
    <div
      className="relative text-white overflow-hidden min-h-[85vh] lg:min-h-[90vh] flex items-center pt-20 sm:pt-24 lg:pt-0"
      style={{
        ...inlineThemeStyles,
        backgroundColor: "var(--bg-beige)",
      }}
    >
      <motion.header
        className="w-full grid grid-cols-1 lg:grid-cols-2 items-center"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        {/* ==================== 50% IZQUIERDA: CONTENIDO Y TEXTOS ==================== */}
        <motion.div
          className="lg:col-span-1 px-5 sm:px-8 md:px-12 lg:pl-16 xl:pl-24 py-10 sm:py-14 lg:py-24 flex flex-col gap-6 sm:gap-7 z-10 max-w-2xl justify-self-start h-full justify-center"
          variants={textVariants}
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.15]"
            style={{ color: "var(--text-dark)" }}
            variants={textVariants}
          >
            Better{" "}
            <span className="italic" style={{ color: "var(--color-blue)" }}>
              lessons
            </span>
            .
            <br />
            Stronger students
            <br />
            <span className="text-[#ae8352] font-serif italic">
              More time for you
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg lg:text-xl text-gray-800 leading-relaxed max-w-xl font-medium"
            variants={textVariants}
          >
            Structured lessons, exercises and homework by topic and ELO level.
            Download, teach and see your students improve.
          </motion.p>

          {/* Botones de acción */}
          <motion.div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2"
            variants={textVariants}
          >
            {/* Botón 1: Estilo Principal (Azul Profundo) */}
            <Link href="#about" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full flex items-center justify-center gap-2 group text-white shadow-lg text-sm sm:text-base uppercase tracking-wide cursor-pointer"
                style={{
                  backgroundColor: "var(--color-blue)",
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Learn more
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            {/* Botón 2: Estilo Secundario (Dorado) */}
            <Link href="/signup" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full flex items-center justify-center gap-2 text-white shadow-md text-sm sm:text-base uppercase tracking-wide cursor-pointer border border-[var(--color-border-custom)]"
                style={{
                  backgroundColor: "var(--color-gold)",
                }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "var(--color-gold-hover)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                Become a Creator{" "}
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Reseñas / Trust metrics */}
          <motion.div
            className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-5 border-t border-[#1A1510]/15 mt-2"
            variants={textVariants}
          >
            <div className="flex items-center gap-1 text-[#9C7548]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current"
                />
              ))}
            </div>
            <span className="text-sm sm:text-base text-gray-800 font-semibold">
              Trusted by coaches worldwide
            </span>
          </motion.div>
        </motion.div>

        {/* ==================== 50% DERECHA: IMAGEN CON DIFUMINADO SUAVE ==================== */}
        <motion.div
          className="lg:col-span-1 relative w-full h-[340px] sm:h-[440px] md:h-[520px] lg:h-full min-h-[340px] sm:min-h-[440px] lg:min-h-[650px] flex items-center mt-6 lg:mt-0"
          variants={imageVariants}
        >
          {/* Imagen de fondo */}
          <Image
            src="/header.png"
            alt="Chessaz Platform Preview"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center lg:object-left-top"
          />

          {/* DIFUMINADO SUAVE */}
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none z-10"
            style={{
              background: `linear-gradient(
                to right, 
                var(--bg-beige) 0%, 
                var(--bg-beige-fade) 12%, 
                transparent 30%
              )`,
            }}
          />
          <div
            className="lg:hidden absolute inset-0 pointer-events-none z-10"
            style={{
              background: `linear-gradient(
                to bottom, 
                var(--bg-beige) 0%, 
                var(--bg-beige-fade) 12%, 
                transparent 28%
              )`,
            }}
          />

          {/* Badge flotante "Save hours" con animación de entrada y flotación */}
          <motion.div
            className="absolute bottom-12 left-5 sm:bottom-16 sm:left-10 lg:bottom-20 lg:left-8 bg-white/95 backdrop-blur-md text-[#1A1510] p-3 sm:p-4 rounded-full w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex flex-col items-center justify-center text-center shadow-xl border border-[#9C7548]/30 z-20"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            transition={{
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.6, delay: 0.5 },
              scale: { duration: 0.6, delay: 0.5 },
            }}
          >
            <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#9C7548] mb-1" />
            <span className="text-xs sm:text-sm md:text-base font-extrabold leading-tight">
              Save hours
            </span>
            <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">
              every week
            </span>
          </motion.div>
        </motion.div>
      </motion.header>

      {/* ==================== MÁSCARA DE OLA SVG RESTAURADA ==================== */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-20">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-10 sm:h-12 md:h-20 text-[#FFFDF9] fill-current"
        >
          <path d="M0,0 C300,90 900,90 1200,0 L1200,120 L0,120 Z"></path>
        </svg>
      </div>
    </div>
  );
};
