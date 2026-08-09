"use client";

import React from "react";
import Link from "next/link";
import {
  HelpCircle,
  Upload,
  BellCheck,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function HelpGuidesPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-beige)] text-[var(--color-text-main)] px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* --- HEADER SECTION --- */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-[var(--color-gold-light)] rounded-2xl text-[var(--color-gold)] mb-2 shadow-sm border border-[var(--color-gold)]/20">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-blue)]">
            Coach Submission & Help Center
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Everything you need to know about publishing premium study
            resources, managing student enrollments, and growing your teaching
            authority on Chessaz.
          </p>
        </div>

        {/* --- WORKFLOW PROCESS SHOWCASE --- */}
        <section className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-3xl p-8 sm:p-12 shadow-sm space-y-10">
          <div className="border-b border-[var(--color-border-custom)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                Streamlined Publishing Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-blue)] mt-1">
                How Resource & Lesson Submission Works
              </h2>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-blue)] hover:bg-[var(--color-blue-hover)] transition-colors shadow-sm"
            >
              Become a Coach Today
            </Link>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[var(--color-bg-beige)]/50 border border-[var(--color-border-custom)] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-blue)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[var(--color-blue)] text-xl">
                  1. Upload Material
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Chess coaches and content creators seamlessly upload study
                  files, PGN databases, and course guides directly through their
                  dedicated creator dashboard.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[var(--color-bg-beige)]/50 border border-[var(--color-border-custom)] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  <BellCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[var(--color-blue)] text-xl">
                  2. Admin Review & Notification
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  The system instantly notifies platform administrators that a
                  new resource is pending review, guaranteeing quality control
                  and platform safety.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[var(--color-bg-beige)]/50 border border-[var(--color-border-custom)] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-blue)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[var(--color-blue)] text-xl">
                  3. Approval & Monetization
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Once verified and approved, your material goes live instantly
                  to the global student community, unlocking earning potential
                  and student growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- IMAGES SECTION (4 PUBLIC IMAGES AS REQUESTED) --- */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-blue)]">
              Visual Guide to Success on Chessaz
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Explore snapshots of how our tools empower top educators and eager
              students daily.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {/* Image 1 */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl overflow-hidden shadow-sm group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/steps/step1.png"
                alt="Dashboard Setup Guide"
                className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-[var(--color-blue)] text-sm">
                  Creator Dashboard
                </h4>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Manage your active courses and earnings.
                </p>
              </div>
            </div>

            {/* Image 2 */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl overflow-hidden shadow-sm group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/learn1.png"
                alt="PGN Upload Process"
                className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-[var(--color-blue)] text-sm">
                  PGN Management
                </h4>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Upload and structure chess masterclasses easily.
                </p>
              </div>
            </div>

            {/* Image 3 */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl overflow-hidden shadow-sm group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/learn.png"
                alt="Student Interaction"
                className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-[var(--color-blue)] text-sm">
                  Student Community
                </h4>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Interact directly with eager chess learners.
                </p>
              </div>
            </div>

            {/* Image 4 */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl overflow-hidden shadow-sm group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/steps/stepz5.png"
                alt="Analytics & Payouts"
                className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-[var(--color-blue)] text-sm">
                  Secure Payouts
                </h4>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Track monthly revenue via Stripe integration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- BACK LINK --- */}
        <div className="text-center pt-4">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-blue)] hover:text-[var(--color-gold)] transition-colors"
          >
            ← Back to Learn Overview
          </Link>
        </div>
      </div>
    </main>
  );
}
