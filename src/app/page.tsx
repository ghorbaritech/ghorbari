import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { IconCategories } from "@/components/sections/IconCategories";
import { PromoBannerSection } from "@/components/sections/PromoBannerSection";
import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { DesignServicesSection } from "@/components/sections/DesignServicesSection";
import { ServiceShowcase } from "@/components/sections/ServiceShowcase";
import { GenericCardSlider } from "@/components/sections/GenericCardSlider";
import { HeroContainer } from "@/components/sections/HeroContainer";
import { SingleSlider } from "@/components/sections/SingleSlider";
import { MovingIconSlider } from "@/components/sections/MovingIconSlider";
import { InfoCardSlider } from "@/components/sections/InfoCardSlider";
import { BlogSlider } from "@/components/sections/BlogSlider";
import TestimonialSlider from "@/components/sections/TestimonialSlider";
import { getHomeContent } from "@/app/admin/cms/actions";

// Always fetch fresh data — prevents Next.js from serving a stale cached build
export const dynamic = 'force-dynamic';

export default async function Home() {
  const contentMap = await getHomeContent();

  const rawFeatured = contentMap['featured_categories'];
  const featuredCategories = Array.isArray(rawFeatured) ? rawFeatured : (rawFeatured?.items || []);
  const designServices = contentMap['design_services'] || {};

  const productSections = contentMap['product_sections'] || [];
  const serviceSections = contentMap['service_sections'] || [];
  const promoBanners = contentMap['promo_banners'] || [];
  const serviceShowcaseFallback = contentMap['service_showcase'] || {};

  console.log('HOME PAGE DEBUG:', {
    hasFeatured: !!rawFeatured,
    isArray: Array.isArray(rawFeatured),
    itemsCount: featuredCategories.length,
    keys: Object.keys(contentMap)
  });

  const pageLayout = contentMap['page_layout'] || [];
  console.log('FINAL PAGE LAYOUT ORDER:', pageLayout.map((l: any) => l.data_key));

  return (
    <main className="min-h-screen flex flex-col font-sans bg-neutral-50 overflow-x-hidden">
      <Navbar />

      <div className="flex flex-col">
        {pageLayout.map((layoutItem: any) => {
          if (layoutItem.hidden) return null;

          switch (layoutItem.type) {
            case 'HeroSlider':
              return <HeroSection key={layoutItem.id} heroData={contentMap[layoutItem.data_key]} />;

            case 'IconSlider':
              const cats = contentMap[layoutItem.data_key];
              return (
                <IconCategories
                  key={layoutItem.id}
                  items={Array.isArray(cats) ? cats : (cats?.items || [])}
                  title={layoutItem.title || (!Array.isArray(cats) ? cats?.title : undefined)}
                />
              );

            case 'DesignServices':
              const ds = contentMap[layoutItem.data_key] || {};
              return (
                <DesignServicesSection
                  key={layoutItem.id}
                  title={layoutItem.title || ds.title}
                  items={ds.enriched_items || ds.items}
                  sliderCount={ds.slider_count}
                />
              );

            case 'PromoBanners':
              const promos = contentMap[layoutItem.data_key];
              return (
                <PromoBannerSection
                  key={layoutItem.id}
                  title={layoutItem.title || promos?.title}
                  banners={Array.isArray(promos) ? promos : promos?.items}
                />
              );

            case 'CardSlider':
              const cardSecData = contentMap[layoutItem.data_key] || {};
              return (
                <GenericCardSlider
                  key={layoutItem.id}
                  title={layoutItem.title || cardSecData.title}
                  items={cardSecData.items || []}
                />
              );

            case 'HeroContainer':
              const heroContData = contentMap[layoutItem.data_key] || {};
              return (
                <HeroContainer
                  key={layoutItem.id}
                  title={layoutItem.title || heroContData.title}
                  items={heroContData.items || []}
                />
              );

            case 'SingleSlider':
              const singleContData = contentMap[layoutItem.data_key] || {};
              return (
                <SingleSlider
                  key={layoutItem.id}
                  title={layoutItem.title || singleContData.title}
                  items={singleContData.items || []}
                />
              );

            case 'ThreeSliderBanner':
              const thriceContData = contentMap[layoutItem.data_key] || {};
              return (
                <PromoBannerSection
                  key={layoutItem.id}
                  title={layoutItem.title || thriceContData.title}
                  banners={thriceContData.items || []}
                />
              );

            case 'MovingIconSlider':
              const movingIconData = contentMap[layoutItem.data_key] || {};
              return (
                <MovingIconSlider
                  key={layoutItem.id}
                  title={layoutItem.title || movingIconData.title}
                  items={movingIconData.items || []}
                />
              );

            case 'InfoCardSlider':
              const infoCardData = contentMap[layoutItem.data_key] || {};
              return (
                <InfoCardSlider
                  key={layoutItem.id}
                  title={layoutItem.title || infoCardData.title}
                  items={infoCardData.items || []}
                />
              );

            case 'BlogSlider':
              const blogData = contentMap[layoutItem.data_key] || {};
              return (
                <BlogSlider
                  key={layoutItem.id}
                  title={layoutItem.title || blogData.title}
                  items={blogData.items || []}
                />
              );

            case 'TestimonialSlider':
              const testimonialData = contentMap[layoutItem.data_key] || {};
              return (
                <TestimonialSlider
                  key={layoutItem.id}
                  title={layoutItem.title || testimonialData.title}
                  items={testimonialData.items || []}
                />
              );

            case 'CategoryShowcase':
              // For dynamically generated product sections, the data_key might look like "product_sections[0]"
              let secData;
              if (layoutItem.data_key.startsWith('product_sections[')) {
                const indexMatch = layoutItem.data_key.match(/\[(\d+)\]/);
                if (indexMatch && productSections[indexMatch[1]]) {
                  secData = productSections[indexMatch[1]];
                }
              } else {
                secData = contentMap[layoutItem.data_key];
              }
              if (!secData) return null;
              return (
                <CategoryShowcase
                  key={layoutItem.id}
                  title={layoutItem.title || secData.title}
                  category={secData.category_id}
                  bgClass={secData.bg_style}
                />
              );

            case 'ServiceShowcase':
              let s_secData;
              if (layoutItem.data_key.startsWith('service_sections[')) {
                const indexMatch = layoutItem.data_key.match(/\[(\d+)\]/);
                if (indexMatch && serviceSections[indexMatch[1]]) {
                  s_secData = serviceSections[indexMatch[1]];
                }
              } else {
                s_secData = contentMap[layoutItem.data_key];
              }
              if (!s_secData) return null;
              return (
                <ServiceShowcase
                  key={layoutItem.id}
                  title={layoutItem.title || s_secData.title}
                  category={s_secData.category_source || s_secData.category_id}
                  bgClass={s_secData.bg_style}
                />
              );

            case 'ServiceShowcaseOld':
              return (
                <ServiceShowcase
                  key={layoutItem.id}
                  title={layoutItem.title || serviceShowcaseFallback.title}
                  items={serviceShowcaseFallback.items}
                />
              );

            default:
              return null;
          }
        })}
      </div>

      <Footer />
    </main>
  );
}

