"use client"

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Quote, Building2, Ruler, Sofa, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getAllDesignPackages } from "@/services/packageService";
import { getCategories } from "@/services/categoryService";
import { getHomeContent } from "@/app/admin/cms/actions";

// New Dynamic Sections
import { DesignHero } from "@/components/sections/DesignHero";
import { DesignWorkflowSlider } from "@/components/sections/DesignWorkflowSlider";
import { DesignL3Display } from "@/components/sections/DesignL3Display";
import TestimonialSlider from "@/components/sections/TestimonialSlider";

export default function DesignServicesPage() {
    const { t, language } = useLanguage();
    const [packages, setPackages] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [cmsContent, setCmsContent] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [pkgData, catData, cmsData] = await Promise.all([
                    getAllDesignPackages(),
                    getCategories('design'),
                    getHomeContent()
                ]);
                setPackages(pkgData);
                setCategories(catData);
                setCmsContent(cmsData);
            } catch (error) {
                console.error("Error fetching design data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const layout = cmsContent['design_page_layout'] || [
        { id: '1', type: 'DesignHero', data_key: 'design_hero', hidden: false },
        { id: '2', type: 'DesignWorkflow', data_key: 'design_workflow', hidden: false },
        { id: '3', type: 'DesignShowcase', data_key: 'design_display_config', hidden: false }
    ];

    const renderSection = (section: any) => {
        if (section.hidden) return null;

        switch (section.type) {
            case 'DesignHero':
                return <DesignHero key={section.id} data={cmsContent[section.data_key]} />;
            case 'DesignWorkflow':
                return <DesignWorkflowSlider key={section.id} data={cmsContent[section.data_key]} />;
            case 'DesignShowcase':
                return (
                    <DesignL3Display
                        key={section.id}
                        packages={packages}
                        categories={categories}
                        loading={loading}
                        config={cmsContent[section.data_key]}
                    />
                );
            case 'UserReviews':
                return (
                    <section key={section.id} className="py-24 bg-white overflow-hidden">
                        <div className="container mx-auto px-8">
                            <div className="flex flex-col items-center mb-16 text-center">
                                <h2 className="text-3xl md:text-5xl font-black text-neutral-900 mb-4 tracking-tight">
                                    {language === 'BN' ? 'ক্লায়েন্টদের গল্প' : 'Client Stories'}
                                </h2>
                                <div className="w-20 h-1.5 bg-blue-600 rounded-full" />
                            </div>
                            <TestimonialSlider
                                items={(cmsContent['user_reviews']?.items || []).map((r: any) => ({
                                    id: r.id || r.title,
                                    title: r.title,
                                    subtitle: r.subtitle,
                                    description: r.description,
                                    image: r.image
                                }))}
                            />
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen flex flex-col font-sans bg-white">
            <Navbar />

            <div className="flex-1">
                {layout.map((section: any) => renderSection(section))}
            </div>

            <Footer />
        </main>
    );
}
