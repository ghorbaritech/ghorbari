import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { IconCategories } from "@/components/sections/IconCategories";
import { PromoBannerSection } from "@/components/sections/PromoBannerSection";
import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { DesignServicesSection } from "@/components/sections/DesignServicesSection";
import { ServiceShowcase } from "@/components/sections/ServiceShowcase";
import { getHomeContent } from "@/app/admin/cms/actions";

export default async function Home() {
  const contentMap = await getHomeContent();

  const rawFeatured = contentMap['featured_categories'];
  const featuredCategories = Array.isArray(rawFeatured) ? rawFeatured : (rawFeatured?.items || []);
  const designServices = contentMap['design_services'] || {};

  const productSections = contentMap['product_sections'] || [];
  const promoBanners = contentMap['promo_banners'] || [];
  const serviceShowcase = contentMap['service_showcase'] || {};

  console.log('HOME PAGE DEBUG:', {
    hasFeatured: !!rawFeatured,
    isArray: Array.isArray(rawFeatured),
    itemsCount: featuredCategories.length,
    keys: Object.keys(contentMap)
  });

  return (
    <main className="min-h-screen flex flex-col font-sans bg-neutral-50">
      <Navbar />

      <div className="flex flex-col">
        {/* 1. Hero Section (Dynamic) */}
        <HeroSection heroData={contentMap['hero_section']} />

        {/* 2. Menu/Categories */}
        <IconCategories
          items={featuredCategories}
          title={!Array.isArray(rawFeatured) ? rawFeatured?.title : undefined}
        />

        {/* 3. Design & Planning Services */}
        <DesignServicesSection
          title={designServices.title}
          items={designServices.items}
          sliderCount={designServices.slider_count}
        />

        {/* 4. Product Categories (Dynamic) */}
        {productSections.map((section: any) => (
          <CategoryShowcase
            key={section.id}
            title={section.title}
            category={section.category_id} // Passing category name/ID to filter
            bgClass={section.bg_style}
          />
        ))}

        {/* 5. Promotional Banner */}
        <PromoBannerSection
          title={contentMap['promo_banners']?.title}
          banners={Array.isArray(contentMap['promo_banners']) ? contentMap['promo_banners'] : contentMap['promo_banners']?.items}
        />

        {/* 6. Service Section */}
        <ServiceShowcase
          title={serviceShowcase.title}
          items={serviceShowcase.items}
        />
      </div>

      <Footer />
    </main>
  );
}

