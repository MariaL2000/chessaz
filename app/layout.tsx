import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/home/Footer";
import ChessChat from "@/components/chatboot/ChessChat";

// Configuración de las fuentes
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// SEO Avanzado con todas las palabras y frases clave posibles
export const metadata: Metadata = {
  title: {
    default: "Chessaz - Chess Training Platform & Marketplace for Coaches",
    template: "%s | Chessaz",
  },
  description:
    "Chessaz is the ultimate online chess platform. Learn chess strategies, study openings, master tactics, and empower chess coaches and teachers to publish, share, and monetize their own courses and chess lessons.",
  keywords: [
    "chess platform",
    "online chess courses",
    "chess coaching software",
    "sell chess lessons",
    "chess teachers marketplace",
    "learn chess strategy",
    "chess openings and tactics",
    "chess training resources",
    "plataforma de ajedrez",
    "cursos de ajedrez online",
    "vender clases de ajedrez",
    "entrenadores de ajedrez",
  ],
  authors: [{ name: "Chessaz Team" }],
  creator: "Chessaz",
  publisher: "Chessaz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://chessaz.com"), // Cambia por tu dominio real cuando esté en producción
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "es-ES": "/es",
    },
  },
  openGraph: {
    title: "Chessaz - Chess Training Platform & Marketplace for Coaches",
    description:
      "Better lessons, stronger students, more time for you. Discover professional chess courses or start selling your own chess lessons as a coach.",
    url: "https://chessaz.com",
    siteName: "Chessaz",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chessaz - Chess Platform for Players & Coaches",
    description:
      "Improve your chess tactics, learn openings, and monetize your chess teaching content.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-bg-main text-text-main">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        {/* Chatbot con IA integrado globalmente */}
        <ChessChat />
      </body>
    </html>
  );
}
