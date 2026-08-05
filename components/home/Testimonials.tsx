"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import SectionHeader from "../ui/Title";

const testimonials = [
  {
    quote:
      '"Chessaz saves me several hours every week when preparing content for my students."',
    name: "James Cooper",
    title: "FIDE Coach",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      '"My students improved faster because the interactive masterclasses and resources are complete."',
    name: "Sarah Kim",
    title: "Chess Academy Director",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      '"I\'ve built an additional income stream sharing my custom opening repertoires doing what I love."',
    name: "Carlos Mendes",
    title: "National Master & Creator",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <SectionHeader
        title="What coaches are saying"
        subtitle="Discover how top masters and academies streamline their teaching and scale their income with Chessaz."
        center={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((item, idx) => (
          <motion.div
            key={idx}
            className="p-8 rounded-3xl border shadow-sm flex flex-col justify-between text-left relative overflow-hidden group"
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderColor: "var(--color-border-custom)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div>
              <div
                className="flex gap-1 mb-4"
                style={{ color: "var(--color-gold)" }}
              >
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p
                className="text-sm font-medium leading-relaxed mb-6"
                style={{ color: "var(--color-text-main)" }}
              >
                {item.quote}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              <div className="relative w-11 h-11 rounded-full overflow-hidden shadow-sm">
                <Image
                  src={item.avatar}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4
                  className="text-xs font-bold"
                  style={{ color: "var(--color-text-main)" }}
                >
                  {item.name}
                </h4>
                <p
                  className="text-[10px] font-medium"
                  style={{ color: "var(--color-gold)" }}
                >
                  {item.title}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
