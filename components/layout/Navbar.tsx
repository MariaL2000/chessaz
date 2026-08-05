"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { NavLinks, navLinks } from "./NavLinks";
import { Button } from "../ui/Button";

const navbarVariants: Variants = {
  hidden: { opacity: 0, y: -25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 flex items-center justify-between transition-all duration-300 ${
        isScrolled ? "py-2 shadow-md" : "py-2.5"
      }`}
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      style={{
        backgroundColor: isScrolled ? "#FFFFFF" : "rgba(255, 255, 255, 0.75)",
        backdropFilter: isScrolled ? "none" : "blur(20px) saturate(190%)",
        WebkitBackdropFilter: isScrolled ? "none" : "blur(20px) saturate(190%)",
        borderBottom: isScrolled
          ? "1px solid #E8E6E1"
          : "1px solid rgba(255, 255, 255, 0.4)",
        boxShadow: isScrolled
          ? "0 10px 30px -10px rgba(0, 0, 0, 0.08)"
          : "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
      }}
    >
      {/* Logo */}
      <motion.div
        className="flex items-center cursor-pointer"
        whileHover={{ scale: 1.02 }}
      >
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Chessaz Logo"
            className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-all duration-300"
          />
        </Link>
      </motion.div>

      {/* Links Escritorio */}
      <NavLinks isScrolled={isScrolled} />

      {/* Botones Desktop: Uso estricto de las variantes login y register */}
      <div className="hidden md:flex items-center gap-3">
        <Link href="/login">
          <Button variant="login" size="sm">
            Log in
          </Button>
        </Link>

        <Link href="/signup">
          <Button variant="register" size="sm">
            Get Started
          </Button>
        </Link>
      </div>

      {/* Botón menú Móvil */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-[#0A0F1D] p-2 focus:outline-none"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Menú Desplegable Móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 bg-[#0A0F1D] border-b border-white/10 px-6 py-6 md:hidden shadow-2xl overflow-hidden"
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => {
                if (link.hasDropdown && link.sublinks) {
                  return (
                    <li key={link.href} className="border-b border-white/5">
                      <button
                        onClick={() =>
                          setMobileAccordionOpen(!mobileAccordionOpen)
                        }
                        className="w-full flex justify-between items-center py-4 text-xl font-bold text-white uppercase tracking-tight"
                      >
                        {link.name}
                        <ChevronDown
                          className={`transition-transform duration-300 ${
                            mobileAccordionOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {mobileAccordionOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white/5 rounded-lg mb-4"
                          >
                            {link.sublinks.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-6 py-3.5 text-xs font-bold text-[#C59B6C] uppercase tracking-widest border-b border-white/5 last:border-none"
                              >
                                <ChevronRight size={14} /> {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                }

                return (
                  <li key={link.href} className="border-b border-white/5">
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-4 text-xl font-bold text-white uppercase tracking-tight hover:text-[#C59B6C] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Botones Auth en Móvil */}
            <div className="flex flex-col gap-3 pt-6 border-t border-white/10 mt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="login" size="lg" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="register" size="lg" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
