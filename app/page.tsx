import { Header } from "@/components/layout/Header";
import { StatsBar } from "@/components/home/StatsBar";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BrowseLessons } from "@/components/home/BrowseLessons";
import { CreatorAndAI } from "@/components/home/CreatorAndAI";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-main)" }}
    >
      <Header />
      <StatsBar />
      <HowItWorks />
      <BrowseLessons />
      <CreatorAndAI />
      <Testimonials />
      <FinalCTA />
    </main>
  );
}
