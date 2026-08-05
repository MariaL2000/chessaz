"use client";

import React from "react";
import Image from "next/image";

interface AuthBackgroundProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[var(--color-bg-beige)] text-[var(--color-text-main)] overflow-hidden">
      {/* ==================== SECCIÓN IZQUIERDA: FORMULARIO ==================== */}
      <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center items-center px-6 sm:px-12 py-10 lg:py-16 z-20 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Encabezado del Formulario */}
          {(title || subtitle) && (
            <div className="text-center lg:text-left space-y-2">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Formulario (Children) */}
          <div className="bg-[var(--color-bg-card)] p-6 sm:p-8 rounded-3xl shadow-xl border border-[var(--color-border-custom)] backdrop-blur-sm bg-opacity-95">
            {children}
          </div>
        </div>
      </div>

      {/* ==================== SECCIÓN DERECHA: HERO / LAPTOP ==================== */}
      <div className="lg:col-span-7 xl:col-span-7 relative min-h-[300px] sm:min-h-[400px] lg:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Imagen Chezz Hero Laptop */}
        <Image
          src="/chess-hero-laptop.png"
          alt="Chezz Platform Preview"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover object-center lg:object-left-center"
        />

        {/* Degradado para Desktop */}
        <div
          className="hidden lg:block absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(
              to right, 
              var(--color-bg-beige) 0%, 
              rgba(245, 242, 236, 0.4) 20%, 
              transparent 45%
            )`,
          }}
        />

        {/* Overlay para Mobile / Tablet */}
        <div className="lg:hidden absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-none z-10" />

        {/* Badge Flotante Acentuado */}
        <div className="absolute bottom-6 right-6 lg:bottom-12 lg:right-12 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-[var(--color-border-custom)] shadow-lg z-20 hidden sm:flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--color-gold)" }}
          />
          <span className="text-xs sm:text-sm font-bold text-[var(--color-text-main)]">
            Ready-to-teach Chess Lessons
          </span>
        </div>
      </div>
    </div>
  );
};
