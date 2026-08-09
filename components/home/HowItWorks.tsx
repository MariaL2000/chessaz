"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Download, GraduationCap, DollarSign } from "lucide-react";
import SectionHeader from "@/components/ui/Title";

const steps = [
  {
    icon: Search,
    num: "1. Find",
    desc: "Search by topic, ELO, duration and language.",
    image: "/steps/step1.png",
  },
  {
    icon: Download,
    num: "2. Download",
    desc: "Get your PDF, exercises, solutions and homework.",
    image: "/steps/step3.png",
  },
  {
    icon: GraduationCap,
    num: "3. Teach",
    desc: "Use structured materials and teach with confidence.",
    image: "/steps/stepz4.png",
  },
  {
    icon: DollarSign,
    num: "4. Earn",
    desc: "Upload your lessons and earn money with every sale.",
    image: "/steps/stepz5.png",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="about"
      className="py-20 px-6 md:px-12 max-w-7xl mx-auto text-center relative overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
    >
      <SectionHeader
        title="How Chessaz works"
        subtitle="Everything you need to level up your chess teaching, structured step by step."
        titleColor="var(--color-text-main)"
      />

      {/* Grid de Pasos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 relative z-10 mt-12">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center group bg-white/50 backdrop-blur-md rounded-3xl p-4 border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 w-full"
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Contenedor de la Imagen */}
              <div className="relative w-full h-56 sm:h-60 rounded-2xl overflow-hidden mb-6 shadow-sm border border-black/5 bg-slate-100 group-hover:border-[var(--color-gold)]/50 transition-colors duration-500 shrink-0">
                <Image
                  src={step.image}
                  alt={step.num}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Sombra suave inferior sobre la imagen */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Badge flotante de Ícono */}
                <div
                  className="absolute bottom-3 right-3 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110 z-10"
                  style={{
                    backgroundColor: "var(--color-blue)",
                    color: "#FFFFFF",
                  }}
                >
                  <Icon className="w-5 h-5 text-[var(--color-gold-light)]" />
                </div>
              </div>

              {/* Título del Paso */}
              <h3
                className="text-xl font-bold mb-2 tracking-tight"
                style={{
                  color: "var(--color-text-main)",
                  fontFamily: "var(--font-geist-sans), sans-serif",
                }}
              >
                {step.num}
              </h3>

              {/* Explicación de los pasos */}
              <p
                className="text-sm sm:text-base leading-relaxed font-normal max-w-xs"
                style={{
                  color: "var(--color-text-main)",
                  opacity: 0.8,
                  fontFamily: "var(--font-geist-sans), sans-serif",
                }}
              >
                {step.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
