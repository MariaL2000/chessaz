"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "../ui/Button";
import SectionHeader from "../ui/Title";

export const FinalCTA = () => {
  return (
    <section
      className="py-20 sm:py-28 px-6 sm:px-8 md:px-16 relative overflow-hidden m-0 flex items-center justify-center border-t border-[var(--color-gold)]/20"
      style={{ backgroundColor: "var(--color-blue)" }}
    >
      {/* Background Image Layer with adjusted opacity */}
      <div className="absolute inset-0 z-0">
        <img
          src="/ai.png"
          alt="AI Background"
          className="w-full h-full object-cover opacity-25"
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center w-full">
        {/* Reutilizando el SectionHeader moderno y simple */}
        <SectionHeader
          title="Join thousands of coaches teaching better every day for free."
          subtitle="Sign up now at zero cost, build your professional teacher profile, and start sharing your knowledge with students worldwide effortlessly."
          center={true}
          titleColor="#FFFFFF"
        />

        {/* Botones de acción */}
        <motion.div
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 w-full sm:w-auto mt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <Link href="/signup">
            <Button
              variant="register"
              size="md"
              className="w-full sm:w-auto text-lg px-10 py-5 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Get started for free
            </Button>
          </Link>
          <Link href="/lessons">
            <Button
              variant="login"
              size="md"
              className="w-full sm:w-auto text-lg px-10 py-5 border-2 border-white text-white hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300"
            >
              Browse lessons
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
