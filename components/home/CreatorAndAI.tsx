"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Cpu, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import SectionHeader from "../ui/Title";

export const CreatorAndAI = () => {
  return (
    <section
      id="elevate-your-chess-coaching"
      className="py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto overflow-hidden relative"
    >
      <SectionHeader
        title="Elevate Your Chess Coaching"
        subtitle="Monetize your expertise as a creator, empower your students, and leverage advanced AI to analyze games effortlessly."
        center={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mt-12 relative z-10">
        {/* Left Banner: Creators */}
        <motion.div
          className="rounded-[2.5rem] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/10"
          style={{ backgroundColor: "var(--color-blue)" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="/learn.png"
              alt="Chess Creator Background"
              className="w-full h-full object-cover opacity-30 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-blue)] via-[var(--color-blue)/80] to-transparent" />
          </div>

          <div className="relative z-10">
            {/* Raw Logo Display */}
            <div className="mb-8">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-16 h-16 object-contain brightness-0 invert drop-shadow-lg"
              />
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest px-4 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-white/10 text-[var(--color-gold)] mb-6 inline-block">
              For Coaches & Masters
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              Join & Teach for Free
            </h2>

            <ul className="space-y-4 text-sm text-gray-200 mb-10">
              {[
                "Setup your professional profile in minutes",
                "Upload unlimited masterclasses and exercises",
                "Earn competitive commissions on every sale",
                "Real-time analytics for your revenue",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Check
                    className="w-5 h-5"
                    style={{ color: "var(--color-gold)" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10">
            <Link href="/login">
              <Button
                className="w-full sm:w-fit group shadow-xl px-8 py-4 rounded-2xl font-bold transition-all"
                style={{ backgroundColor: "var(--color-gold)", color: "#000" }}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right Banner: AI & Scanner */}
        <motion.div
          className="rounded-[2.5rem] p-8 sm:p-12 border shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border-custom)",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative z-10 flex flex-col items-center">
            <div
              className="mb-8 p-4 rounded-3xl shadow-inner"
              style={{ backgroundColor: "var(--color-gold-light)" }}
            >
              <Cpu
                className="w-12 h-12"
                style={{ color: "var(--color-gold)" }}
              />
            </div>

            {/* Animated Chess Piece */}
            <motion.div
              className="mb-8"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src="/piece.png"
                alt="Chess Piece"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl"
              />
            </motion.div>

            <h3
              className="text-3xl font-extrabold mb-4"
              style={{ color: "var(--color-text-main)" }}
            >
              Next-Gen AI Analysis
            </h3>
            <p
              className="max-w-md mb-6 leading-relaxed"
              style={{ color: "var(--color-text-muted)" }}
            >
              We are currently training a high-precision{" "}
              <strong>OCR Scanner</strong>. Soon, you will be able to capture
              any physical board position and instantly convert it into digital
              PGN notation using our cutting-edge neural engine.
            </p>

            <div
              className="px-4 py-2 rounded-full border flex items-center gap-2"
              style={{
                backgroundColor: "var(--color-gold-light)",
                borderColor: "var(--color-gold)",
              }}
            >
              <Sparkles
                className="w-4 h-4"
                style={{ color: "var(--color-gold)" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--color-gold)" }}
              >
                Coming Soon
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
