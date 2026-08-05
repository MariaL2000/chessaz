"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Trophy, Globe } from "lucide-react";

const stats = [
  { icon: BookOpen, value: "10,000+", label: "Ready-to-teach lessons" },
  { icon: Users, value: "600+", label: "Professional coaches" },
  { icon: Trophy, value: "150+", label: "Lesson categories" },
  { icon: Globe, value: "20+", label: "Languages" },
];

export const StatsBar = () => {
  return (
    <section className="px-6 md:px-12 -mt-10 relative z-20 max-w-7xl mx-auto">
      <motion.div
        className="rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 items-center shadow-lg border"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderColor: "var(--color-border-custom)",
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-4 justify-center md:justify-start border-r last:border-r-0 border-gray-100 pr-4"
            >
              <div
                className="p-3 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: "var(--color-gold-light)",
                  color: "var(--color-gold)",
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3
                  className="text-2xl font-extrabold"
                  style={{ color: "var(--color-text-main)" }}
                >
                  {stat.value}
                </h3>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
};
