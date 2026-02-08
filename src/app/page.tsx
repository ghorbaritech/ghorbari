"use client"

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { IconCategories } from "@/components/sections/IconCategories";
import { PromoBannerSection } from "@/components/sections/PromoBannerSection";
import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { DesignServicesSection } from "@/components/sections/DesignServicesSection";
import { ServiceShowcase } from "@/components/sections/ServiceShowcase";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col font-sans bg-neutral-50">
      <Navbar />

      <div className="flex flex-col">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Menu/Categories */}
        <IconCategories />

        {/* 3. Design & Planning Services */}
        <DesignServicesSection />

        {/* 4. Segregated Product Categories */}
        <CategoryShowcase
          title="Sands & Bricks"
          category="Building Materials"
          bgClass="bg-white"
        />

        <CategoryShowcase
          title="Steel & Rods"
          category="Steel"
          bgClass="bg-neutral-50"
        />

        {/* 5. Promotional Banner */}
        <PromoBannerSection />

        <CategoryShowcase
          title="Electric & Plumbing"
          category="Plumbing"
          bgClass="bg-white"
        />

        <CategoryShowcase
          title="Tiles & Sanitary"
          category="Finishing"
          bgClass="bg-neutral-50"
        />

        {/* 6. Service Section */}
        <ServiceShowcase />
      </div>

      <Footer />
    </main>
  );
}
