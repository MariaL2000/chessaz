"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Trophy, Globe } from "lucide-react";

const stats = [
  { icon: BookOpen, value: "1,200+", label: "Lessons & tactics" },
  { icon: Users, value: "45+", label: "Certified coaches" },
  { icon: Trophy, value: "12+", label: "Skill levels" },
  { icon: Globe, value: "5+", label: "Supported languages" },
];

export const StatsBar = () => {
  return (
    <section className="px-4 sm:px-6 md:px-12 -mt-6 sm:-mt-10 relative z-20 max-w-7xl mx-auto">
      <motion.div
        className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center border backdrop-blur-xl bg-transparent sm:bg-[var(--color-bg-card)] shadow-none sm:shadow-xl"
        style={{
          borderColor: "var(--color-border-custom)",
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-left group lg:border-r lg:last:border-r-0 border-gray-100/10 lg:pr-6"
            >
              {/* Icono oculto o muy sutil en móvil estilo Apple, visible/destacado en escritorio */}
              <div
                className="hidden sm:flex p-3 rounded-2xl items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  backgroundColor: "var(--color-gold-light)",
                  color: "var(--color-gold)",
                }}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 sm:block">
                  <span className="sm:hidden text-[var(--color-gold)]">
                    <Icon className="w-4 h-4 inline-block mb-1" />
                  </span>
                  <h3
                    className="text-2xl sm:text-3xl font-semibold tracking-tight"
                    style={{
                      color: "var(--color-text-main)",
                      fontFamily: "var(--font-geist-sans), sans-serif",
                    }}
                  >
                    {stat.value}
                  </h3>
                </div>
                <p
                  className="text-[11px] sm:text-sm font-normal tracking-tight mt-0.5"
                  style={{
                    color: "var(--color-text-subtle)",
                    fontFamily: "var(--font-geist-sans), sans-serif",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};
