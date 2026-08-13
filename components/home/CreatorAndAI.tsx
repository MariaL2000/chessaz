"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Camera, Cpu, ArrowRight, Clock } from "lucide-react";
import { Button } from "../ui/Button";
import SectionHeader from "../ui/Title";

export const CreatorAndAI = () => {
  return (
    <section
      id="elevate-your-chess-coaching"
      className="py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto overflow-hidden"
    >
      <SectionHeader
        title="Elevate Your Chess Coaching"
        subtitle="Monetize your expertise as a creator, empower your students, and leverage advanced AI to analyze games effortlessly."
        center={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mt-12">
        {/* Banner Izquierdo: Creadores (Teachers / Coaches) */}
        <motion.div
          className="rounded-[2.5rem] p-8 sm:p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/10"
          style={{ backgroundColor: "var(--color-blue)" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Imagen de fondo learn.PNG */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="/learn.png"
              alt="Chess Creator Background"
              className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-1000 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center shadow-lg backdrop-blur-xl border border-white/20"
              style={{ backgroundColor: "rgba(183, 147, 71, 0.25)" }}
            >
              <span className="text-3xl">👑</span>
            </motion.div>

            <span
              className="text-xs uppercase font-extrabold tracking-widest px-4 py-1.5 rounded-full border mb-6 inline-block backdrop-blur-md shadow-sm"
              style={{
                color: "var(--color-gold)",
                borderColor: "rgba(183, 147, 71, 0.4)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              For Coaches & Masters
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Join & Teach for Free
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mb-8 leading-relaxed font-light">
              Log in for free today to share your courses, opening repertoires,
              and masterclasses with ambitious players worldwide while earning
              revenue.
            </p>

            <ul className="space-y-4 text-sm text-gray-200 mb-10 font-normal">
              {[
                "Log in completely free and setup your profile in minutes",
                "Upload unlimited masterclasses, guides, and student exercises",
                "Earn competitive commissions on every resource sold",
                "Advanced analytics to monitor your stats and earnings",
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3.5"
                >
                  <div
                    className="p-1.5 rounded-full shrink-0 shadow-sm"
                    style={{
                      backgroundColor: "rgba(183, 147, 71, 0.25)",
                      color: "var(--color-gold)",
                    }}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 pt-4">
            <Link href="/login">
              <Button
                variant="login"
                size="md"
                className="w-full sm:w-fit group shadow-xl justify-center cursor-pointer px-8 py-3.5 rounded-2xl font-semibold tracking-wide transition-transform active:scale-95"
              >
                Log in
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Banners Derechos: AI Analysis & Photo to PGN */}
        <div className="flex flex-col gap-6 justify-between">
          {/* AI Analysis */}
          <motion.div
            className="rounded-[2.5rem] p-8 sm:p-10 border shadow-lg flex flex-col justify-between relative overflow-hidden flex-1 group"
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderColor: "var(--color-border-custom)",
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Imagen ai.PNG totalmente visible y nítida */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="/ai.png"
                alt="AI Analysis Background"
                className="w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000 group-hover:scale-100"
              />
              {/* Degradado muy suave abajo para asegurar contraste del texto sin blanquear */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-zinc-950/90 dark:via-zinc-950/40" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h3
                  className="text-2xl sm:text-3xl font-extrabold flex items-center gap-4 tracking-tight"
                  style={{ color: "var(--color-text-main)" }}
                >
                  <div
                    className="p-3 rounded-2xl shadow-md border shrink-0 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80"
                    style={{ borderColor: "var(--color-border-custom)" }}
                  >
                    <Cpu
                      className="w-6 h-6 sm:w-7 sm:h-7"
                      style={{ color: "var(--color-gold)" }}
                    />
                  </div>
                  AI Game Analysis
                </h3>
                <span className="text-[11px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-2 shadow-xs backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Próximamente
                </span>
              </div>

              <p
                className="text-sm sm:text-base mb-8 leading-relaxed font-medium bg-white/60 dark:bg-black/50 p-3 rounded-xl backdrop-blur-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Let our cutting-edge neural chess engine break down your matches
                move by move to pinpoint tactical blindspots.
              </p>

              <ul className="space-y-3.5 text-sm mb-8 font-semibold text-zinc-800 dark:text-zinc-200">
                {[
                  "Explore the finest curated chess lessons organized by skill level",
                  "Choose from master-led courses, tactical guides, and free resources",
                  "Filter by ELO ratings, categories, homework, and pricing",
                  "Boost your strategic vision and elevate your game at your own pace",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3.5 bg-white/40 dark:bg-black/30 p-2 rounded-lg backdrop-blur-2xs"
                  >
                    <Check
                      className="w-4 h-4 shrink-0 stroke-[3]"
                      style={{ color: "var(--color-gold)" }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 pt-2">
              <Button
                variant="login"
                size="sm"
                disabled
                className="w-full sm:w-fit shadow-xs justify-center opacity-60 cursor-not-allowed rounded-xl px-6 py-2.5 font-semibold"
              >
                Working on...
              </Button>
            </div>
          </motion.div>

          {/* Photo to PGN (OCR) */}
          <motion.div
            className="rounded-[2.5rem] p-8 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-lg group"
            style={{
              backgroundColor: "var(--color-gold-light)",
              borderColor: "var(--color-border-custom)",
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Imagen photo.PNG totalmente visible y nítida */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="/photo.png"
                alt="Photo to PGN Background"
                className="w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-transparent dark:from-zinc-950/80 dark:via-zinc-950/40" />
            </div>

            <div className="flex items-start sm:items-center gap-5 relative z-10 w-full">
              <div className="p-4 bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-lg border border-black/5 shrink-0 backdrop-blur-md">
                <Camera
                  className="w-7 h-7"
                  style={{ color: "var(--color-gold)" }}
                />
              </div>
              <div className="flex-1">
                <span
                  className="text-[11px] uppercase font-bold tracking-widest px-3 py-1 rounded-md bg-white/95 dark:bg-black/60 inline-block mb-2 shadow-xs"
                  style={{ color: "var(--color-gold)" }}
                >
                  Comming soon • Powered by AI
                </span>
                <h4
                  className="text-lg font-extrabold tracking-tight"
                  style={{ color: "var(--color-text-main)" }}
                >
                  Photo to PGN Converter
                </h4>
                <p className="text-xs sm:text-sm mt-1 leading-relaxed font-medium text-zinc-700 dark:text-zinc-300">
                  Convert physical board captures instantly into digital
                  notation files.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
