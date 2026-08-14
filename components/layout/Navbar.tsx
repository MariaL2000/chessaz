"use client";

import React, { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User,
  Camera,
  Loader2,
  Edit3,
  Check,
} from "lucide-react";
import { NavLinks, navLinks } from "./NavLinks";
import { Button } from "../ui/Button";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUserProfile } from "@/actions/profile/update-profile";

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
  const { user, setUser } = useAuthStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(false);

  // Estados para el Modal/Popup de actualización de perfil
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Inicializamos directamente con el usuario actual para evitar el useEffect
  const [name, setName] = useState(user?.name || "");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [preview, setPreview] = useState(user?.image || "");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Cada vez que se abre el popup, nos aseguramos de tener los datos más frescos del usuario
  const handleTogglePopup = () => {
    if (!showProfilePopup && user) {
      setName(user.name || "");
      setPreview(user.image || "");
      setMessage(null);
    }
    setShowProfilePopup(!showProfilePopup);
  };

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

  const getDashboardPath = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "TEACHER":
        return "/dashboard/teacher";

      case "ADMIN":
        return "/dashboard/admin";
      default:
        return "/dashboard";
    }
  };

  // Manejo de la conversión de imagen a Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImageBase64(base64String);
      setPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Envío del formulario consumiendo la Server Action `updateUserProfile`
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setMessage(null);

    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: { ok: boolean; message: string; user?: any } =
        await updateUserProfile({
          userId: user.id,
          name,
          imageBase64: imageBase64 ? imageBase64 : undefined,
        });

      if (result.ok) {
        setMessage({ type: "success", text: result.message });

        // Actualizamos el estado global en Zustand/AuthStore
        if (setUser) {
          setUser({
            ...user,
            name: name,
            image: preview,
            ...(result.user || {}),
          });
        }

        // Limpiar el estado base64 temporal
        setImageBase64("");

        // Ocultar mensaje de éxito tras unos segundos
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

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

      {/* Botones Desktop / Perfil */}
      <div className="hidden md:flex items-center gap-3 relative">
        {user ? (
          <div className="relative">
            {/* Botón desencadenador del Popup */}
            <button
              onClick={handleTogglePopup}
              className="flex items-center gap-2.5 py-1.5 px-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-xs cursor-pointer focus:outline-none"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center shrink-0">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center">
                    <User size={14} />
                  </div>
                )}
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-gray-900 leading-tight">
                  {user.name}
                </span>
                <span className="block text-[10px] font-semibold text-[#C59B6C] uppercase">
                  {user.role}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${
                  showProfilePopup ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* POPUP DE EDICIÓN UTILIZANDO LA LÓGICA DE PROFILE SETTINGS */}
            <AnimatePresence>
              {showProfilePopup && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-50 text-gray-800"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Edit3 size={15} className="text-[#C59B6C]" /> Profile
                      Settings
                    </h4>
                    <button
                      onClick={() => setShowProfilePopup(false)}
                      className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Mensajes de Feedback */}
                  {message && (
                    <div
                      className={`mb-4 p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                        message.type === "success"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Selector de Foto */}
                    <div className="flex flex-col items-center">
                      <div className="relative h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-[#C59B6C] shadow-sm shrink-0 group">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Profile Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-gray-400" />
                        )}

                        <label
                          htmlFor="navbar-popup-image"
                          className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-semibold gap-1"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Cambiar</span>
                        </label>
                        <input
                          id="navbar-popup-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          disabled={isPending}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Haz clic en la imagen para subir una nueva
                      </p>
                    </div>

                    {/* Campo de Nombre */}
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C59B6C] transition-all font-medium"
                      />
                    </div>

                    {/* Botón de Guardar */}
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-2.5 px-4 bg-[var(--color-blue,#0A0F1D)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4" /> Save Changes
                        </>
                      )}
                    </button>
                  </form>

                  {/* Acceso al Dashboard */}
                  <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                    <Link
                      href={getDashboardPath(user.role)}
                      onClick={() => setShowProfilePopup(false)}
                      className="text-xs font-bold text-[#C59B6C] hover:underline"
                    >
                      Dashboard {user.role} &rarr;
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
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
          </>
        )}
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
              {user ? (
                <Link
                  href={getDashboardPath(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="register" size="lg" className="w-full">
                    Go to Dashboard ({user.role})
                  </Button>
                </Link>
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
