"use client";

import React from "react";
import Link from "next/link";
import {
  Trophy,
  BrainCircuit,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-beige)] text-[var(--color-text-main)] px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* --- HERO SECTION --- */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold-light)] border border-[var(--color-gold)]/30 text-[var(--color-gold)] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4" /> The Ultimate Chess Ecosystem
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--color-blue)]">
            Master the Game.{" "}
            <span className="text-[var(--color-gold)]">Elevate Your Mind.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed">
            Chessaz bridges traditional grandmaster strategy with
            next-generation AI analysis and elite coaching. Whether you are
            aiming for your first rating milestone or coaching global champions,
            your journey starts here.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-xl font-bold text-white bg-[var(--color-blue)] hover:bg-[var(--color-blue-hover)] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/lessons"
              className="px-8 py-4 rounded-xl font-bold text-[var(--color-blue)] bg-white border border-[var(--color-border-custom)] hover:bg-[var(--color-bg-beige-dark)]/40 transition-all shadow-sm flex items-center gap-2"
            >
              Explore Catalog <BookOpen className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* --- FEATURE 1: AI NOTATION SCANNING --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold-light)] text-[var(--color-gold)] flex items-center justify-center border border-[var(--color-gold)]/20 shadow-sm">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--color-blue)] tracking-tight">
              AI-Powered Notation & Game Review
            </h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed text-base">
              Stop guessing where you went wrong. Our proprietary AI notation
              engine instantly scans your matches, highlights tactical blunders,
              and offers deep positional insights in real-time.
            </p>
            <ul className="space-y-3">
              {[
                "Instant PGN import and deep analysis",
                "Personalized tactical weakness detection",
                "Grandmaster-level move suggestions",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-main)]"
                >
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-gold)] flex-shrink-0" />{" "}
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative group overflow-hidden rounded-2xl border border-[var(--color-border-custom)] shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/table.PNG"
              alt="Chessaz AI Analysis Dashboard"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* --- FEATURE 2: EXPERT COACHING NETWORK --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="order-2 lg:order-1 relative group overflow-hidden rounded-2xl border border-[var(--color-border-custom)] shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/steps/step1.PNG"
              alt="Expert Chess Coaches"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold-light)] text-[var(--color-gold)] flex items-center justify-center border border-[var(--color-gold)]/20 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--color-blue)] tracking-tight">
              Connect with Certified Grandmasters & Coaches
            </h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed text-base">
              Accelerate your progress by booking 1-on-1 private mentorship
              sessions with verified professionals. Access specialized study
              guides, custom repertoires, and exclusive training curricula.
            </p>
            <div className="pt-2">
              <Link
                href="/lessons"
                className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-blue)] hover:text-[var(--color-gold)] transition-colors uppercase tracking-wider"
              >
                Browse Available Teachers <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* --- STATS & VALUE PROPOSITION GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-blue)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-[var(--color-blue)]">
              Structured Paths
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Curated modules ranging from absolute beginner opening theory to
              complex endgame masterclasses.
            </p>
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-gold)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-[var(--color-blue)]">
              For Educators
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Monetize your expertise effortlessly with secure Stripe
              integration, automated material approval, and student analytics.
            </p>
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-blue)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-[var(--color-blue)]">
              Global Community
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Engage with active players worldwide, participate in discussions,
              and challenge peers to elevate your rating.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
