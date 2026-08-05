"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export const Footer = () => {
  const [activeModal, setActiveModal] = useState<
    "help" | "terms" | "privacy" | null
  >(null);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer
        className="relative overflow-hidden pt-20 pb-12 px-6 md:px-12 border-t"
        style={{
          backgroundColor: "var(--color-blue)",
          borderColor: "var(--color-gold)",
          color: "#FFFFFF",
        }}
      >
        {/* Patrón de tablero sutil de fondo */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(45deg, var(--color-gold) 25%, transparent 25%), 
                              linear-gradient(-45deg, var(--color-gold) 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, var(--color-gold) 75%), 
                              linear-gradient(-45deg, transparent 75%, var(--color-gold) 75%)`,
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-14 border-b border-white/10 items-start">
            {/* Columna de Marca y Redes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative w-20 h-20 shrink-0"
                >
                  <Image
                    src="/logo.png"
                    alt="Chessaz Logo"
                    fill
                    className="object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                    priority
                  />
                </motion.div>
                <div className="flex flex-col">
                  <span
                    className="text-4xl font-black tracking-tight"
                    style={{ color: "var(--color-gold-light)" }}
                  >
                    Chessaz
                  </span>
                  <span className="text-[10px] tracking-widest uppercase text-[var(--color-gold)] font-semibold">
                    Elite Chess Platform
                  </span>
                </div>
              </div>

              <p
                className="max-w-sm leading-relaxed text-sm font-light"
                style={{ color: "var(--color-gray-accent)" }}
              >
                The all-in-one ecosystem for chess coaches and creators to
                teach, distribute advanced materials, and grow with absolute
                elegance.
              </p>

              <div className="flex items-center gap-3 pt-2">
                {[
                  {
                    label: "YouTube",
                    href: "https://youtube.com",
                    icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                  },
                  {
                    label: "Twitter",
                    href: "https://twitter.com",
                    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                  },
                  {
                    label: "Instagram",
                    href: "https://instagram.com",
                    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                  },
                ].map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--color-gold)] hover:text-black transition-colors"
                    aria-label={social.label}
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Columna: Product */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4 lg:col-span-1"
            >
              <h4
                className="font-bold text-xs uppercase tracking-widest border-l-2 pl-3 border-[var(--color-gold)]"
                style={{ color: "var(--color-gold)" }}
              >
                Product
              </h4>
              <ul className="space-y-3 text-sm font-medium flex flex-col">
                <li>
                  <Link
                    href="/learn"
                    className="hover:text-[var(--color-gold-light)] transition-colors inline-block py-0.5"
                    style={{ color: "var(--color-gray-accent)" }}
                  >
                    Learn
                  </Link>
                </li>

                <li>
                  <Link
                    href="/help"
                    className="hover:text-[var(--color-gold-light)] transition-colors inline-block py-0.5"
                    style={{ color: "var(--color-gray-accent)" }}
                  >
                    Help
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lessons"
                    className="hover:text-[var(--color-gold-light)] transition-colors inline-block py-0.5"
                    style={{ color: "var(--color-gray-accent)" }}
                  >
                    Lessons
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Columna: Support & Legal (Disparadores de Modales) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4 lg:col-span-1"
            >
              <h4
                className="font-bold text-xs uppercase tracking-widest border-l-2 pl-3 border-[var(--color-gold)]"
                style={{ color: "var(--color-gold)" }}
              >
                Support & Legal
              </h4>
              <ul className="space-y-3 text-sm font-medium flex flex-col">
                <li>
                  <button
                    onClick={() => setActiveModal("help")}
                    className="hover:text-[var(--color-gold-light)] transition-colors inline-block py-0.5 text-left"
                    style={{ color: "var(--color-gray-accent)" }}
                  >
                    Help & Guides
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal("terms")}
                    className="hover:text-[var(--color-gold-light)] transition-colors inline-block py-0.5 text-left"
                    style={{ color: "var(--color-gray-accent)" }}
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal("privacy")}
                    className="hover:text-[var(--color-gold-light)] transition-colors inline-block py-0.5 text-left"
                    style={{ color: "var(--color-gray-accent)" }}
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </motion.div>

            {/* Ficha de Ajedrez */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex lg:col-span-1 justify-center items-center lg:items-end relative"
            >
              <div className="absolute w-32 h-32 rounded-full bg-[var(--color-gold)] opacity-10 blur-2xl pointer-events-none" />
              <motion.div
                whileHover={{ y: -8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative w-36 h-48 md:w-40 md:h-56 filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
              >
                <Image
                  src="/piece.png"
                  alt="Chess Piece"
                  fill
                  className="object-contain object-bottom"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs font-light gap-4 text-center md:text-left">
            <p style={{ color: "var(--color-gray-accent)" }}>
              © {new Date().getFullYear()} Chessaz Inc. All rights reserved.
            </p>
            <p style={{ color: "var(--color-gray-accent)" }}>
              Crafted with tactical precision for professional chess players,
              creators, and elite academies.
            </p>
          </div>
        </div>
      </footer>

      {/* Sistema de Modales (Popups en Inglés) */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl bg-[var(--color-blue, #0f172a)] border border-[var(--color-gold)] rounded-3xl p-8 shadow-2xl text-white max-h-[85vh] overflow-y-auto"
            >
              {/* Botón de Cierre */}
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--color-gold)] hover:text-black flex items-center justify-center transition-colors font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>

              {/* Contenido dinámico según el modal seleccionado */}
              {activeModal === "help" && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-[var(--color-gold-light)] uppercase tracking-wide">
                    Help & Guides
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Welcome to Chessaz Support Center. Here is how you can
                    navigate our platform seamlessly:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                    <li>
                      <strong className="text-white">
                        For Students & Players:
                      </strong>{" "}
                      Explore professional training materials, download
                      structured study PDFs, and check recommended Elo rating
                      thresholds.
                    </li>
                    <li>
                      <strong className="text-white">
                        For Coaches & Creators:
                      </strong>{" "}
                      Access your teacher dashboard to upload certified digital
                      resources, manage pricing, and track student reviews.
                    </li>
                    <li>
                      <strong className="text-white">Support Channels:</strong>{" "}
                      If you encounter technical issues or payment
                      discrepancies, reach out directly via our community
                      Discord channel.
                    </li>
                  </ul>
                </div>
              )}

              {activeModal === "terms" && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-[var(--color-gold-light)] uppercase tracking-wide">
                    Terms of Service
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    By accessing and using Chessaz, you agree to abide by our
                    professional guidelines and community standards.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                    <li>
                      <strong className="text-white">
                        Intellectual Property:
                      </strong>{" "}
                      All resources, study notes, and digital materials uploaded
                      by creators remain protected under copyright laws.
                      Redistribution without license is prohibited.
                    </li>
                    <li>
                      <strong className="text-white">User Conduct:</strong>{" "}
                      Members must maintain respectful interactions within
                      reviews, forums, and coaching spaces.
                    </li>
                    <li>
                      <strong className="text-white">
                        Account Termination:
                      </strong>{" "}
                      Chessaz reserves the right to suspend accounts that
                      violate platform policies or attempt unauthorized access.
                    </li>
                  </ul>
                </div>
              )}

              {activeModal === "privacy" && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-[var(--color-gold-light)] uppercase tracking-wide">
                    Privacy Policy
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Your privacy is vital to us. This policy outlines how we
                    handle your personal data with absolute transparency:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                    <li>
                      <strong className="text-white">Data Collection:</strong>{" "}
                      We securely collect essential details such as your
                      username, email address, and authentication credentials
                      necessary for platform functionality.
                    </li>
                    <li>
                      <strong className="text-white">
                        Secure Transactions:
                      </strong>{" "}
                      Payment records and financial data are processed through
                      encrypted, industry-standard gateways. We never store raw
                      card numbers.
                    </li>
                    <li>
                      <strong className="text-white">Data Protection:</strong>{" "}
                      We do not sell or share your personal information with
                      third-party advertisers. Your profile data is solely used
                      to enhance your coaching and learning experience.
                    </li>
                  </ul>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 rounded-xl bg-[var(--color-gold)] text-black font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
