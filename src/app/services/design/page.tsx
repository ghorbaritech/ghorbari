"use client"

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Quote, Building2, Ruler, Sofa, Loader2, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { featuredProjects, clientReviews } from "@/data/dummyDesignData";
import { useLanguage } from "@/context/LanguageContext";
import { getL } from "@/utils/localization";
import { getAllDesignPackages } from "@/services/packageService";
import { getCategories } from "@/services/categoryService";

const topBanners = [
    {
        title: "Structural & Architectural Design",
        titleBn: "স্ট্রাকচারাল এবং আর্কিটেকচারাল ডিজাইন",
        icon: Building2,
        href: "/services/design/book?service=structural",
        overlay: "bg-[#064e3b]/90",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&fit=crop"
    },
    {
        title: "Interior Design",
        titleBn: "ইন্টেরিয়র ডিজাইন",
        icon: Sofa,
        href: "/services/design/book?service=interior",
        overlay: "bg-[#172554]/90",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&fit=crop"
    }
];

export default function DesignServicesPage() {
    const { t, language } = useLanguage();
    const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
    const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
    const [packages, setPackages] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [pkgData, catData] = await Promise.all([
                    getAllDesignPackages(),
                    getCategories('design')
                ]);
                setPackages(pkgData);
                setCategories(catData);
            } catch (error) {
                console.error("Error fetching design data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredServices = packages.filter(service => {
        const pkgCat = service.category;

        // Category Hierarchy Filter
        if (selectedSubId) {
            const isDirectMatch = service.category_id === selectedSubId;
            const isChildMatch = pkgCat?.parent_id === selectedSubId;
            if (!isDirectMatch && !isChildMatch) return false;
        } else if (selectedRootId) {
            const isDirectMatch = service.category_id === selectedRootId;
            const isChildMatch = pkgCat?.parent_id === selectedRootId;
            const subCat = categories.find(c => c.id === pkgCat?.parent_id);
            const isGrandchildMatch = subCat?.parent_id === selectedRootId;

            if (!isDirectMatch && !isChildMatch && !isGrandchildMatch) return false;
        }

        return true;
    });

    const rootCategories = categories.filter(c => c.level === 0 || !c.parent_id);
    const subCategories = selectedRootId ? categories.filter(c => c.parent_id === selectedRootId) : [];

    const handleRootClick = (id: string) => {
        setSelectedRootId(prev => prev === id ? null : id);
        setSelectedSubId(null);
    };

    const handleSubClick = (id: string) => {
        setSelectedSubId(prev => prev === id ? null : id);
    };

    const resetFilters = () => {
        setSelectedRootId(null);
        setSelectedSubId(null);
    };

    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50/50">
            <Navbar />

            {/* 1. Hero / Top Banner Section */}
            <section className="pt-8 pb-12 px-8 container mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight mb-4">
                        {t.design_hero_title}
                    </h1>
                    <p className="text-neutral-500 max-w-2xl mx-auto font-medium">
                        {t.design_hero_subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6">
                    {topBanners.map((banner, idx) => (
                        <div key={idx} className="group relative h-60 rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${banner.image})` }}
                            />
                            {/* Overlay */}
                            <div className={`absolute inset-0 ${banner.overlay} transition-opacity duration-300 group-hover:opacity-95`} />

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center text-white">
                                <div className="mb-4 p-3 bg-white/20 backdrop-blur-md rounded-full transform group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white/20">
                                    <banner.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-black mb-4 tracking-tight text-white drop-shadow-sm">
                                    {getL(banner.title, banner.titleBn, language)}
                                </h3>
                                <Link href={banner.href}>
                                    <Button className="bg-white/20 hover:bg-white hover:text-neutral-900 text-white border border-white/50 backdrop-blur-md rounded-full px-6 py-2 h-auto font-bold text-xs tracking-wide shadow-lg group-hover:shadow-2xl transition-all">
                                        {t.design_book_service} <ArrowRight className="w-3 h-3 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Service List Section */}
            <section className="py-16 bg-white border-y border-neutral-100">
                <div className="container mx-auto px-8">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Sidebar */}
                        <aside className="w-full lg:w-72 flex-shrink-0">
                            <div className="sticky top-24 space-y-8 bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
                                <div>
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-bold text-neutral-900 tracking-tight italic">
                                            {t.design_categories_title}
                                        </h3>
                                        {(selectedRootId || selectedSubId) && (
                                            <button
                                                onClick={resetFilters}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 underline"
                                            >
                                                {language === 'BN' ? 'সব দেখুন' : 'View All'}
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={resetFilters}
                                            className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${!selectedRootId && !selectedSubId
                                                ? 'bg-neutral-900 text-white shadow-lg scale-105'
                                                : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                                                }`}
                                        >
                                            {t.design_all_services}
                                        </button>

                                        {rootCategories.map(root => (
                                            <div key={root.id} className="space-y-3">
                                                {/* Root Category Label */}
                                                <div
                                                    className={`flex items-center space-x-3 group cursor-pointer p-4 rounded-2xl transition-all ${selectedRootId === root.id ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                                                    onClick={() => handleRootClick(root.id)}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${selectedRootId === root.id ? 'bg-primary-600' : 'bg-neutral-200 group-hover:bg-primary-600'}`} />
                                                    <label className={`text-sm font-bold tracking-tight cursor-pointer transition-colors ${selectedRootId === root.id ? 'text-primary-600' : 'text-neutral-500 group-hover:text-primary-600'}`}>
                                                        {language === 'BN' ? root.name_bn || root.name : root.name}
                                                    </label>
                                                </div>

                                                {/* Nested Subcategories */}
                                                {selectedRootId === root.id && subCategories.length > 0 && (
                                                    <div className="ml-6 space-y-4 pt-1 border-l-2 border-primary-100 pl-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {subCategories.map(sub => (
                                                            <div key={sub.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleSubClick(sub.id)}>
                                                                <Checkbox
                                                                    id={sub.id}
                                                                    checked={selectedSubId === sub.id}
                                                                    onCheckedChange={() => handleSubClick(sub.id)}
                                                                    className="border-neutral-300 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                                                                />
                                                                <label htmlFor={sub.id} className={`text-xs font-bold tracking-tight cursor-pointer transition-colors ${selectedSubId === sub.id ? 'text-primary-600' : 'text-neutral-400 group-hover:text-primary-500'}`}>
                                                                    {language === 'BN' ? sub.name_bn || sub.name : sub.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {rootCategories.length === 0 && !loading && (
                                            <p className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest italic">
                                                {t.products_no_subs}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Grid */}
                        <div className="flex-1">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                                    {t.design_available_packages}
                                </h2>
                                <p className="text-neutral-500 text-sm font-medium">
                                    {t.design_showing_packages.replace('{count}', filteredServices.length.toString())}
                                </p>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-neutral-100 shadow-sm">
                                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                                    <p className="text-neutral-500 font-bold">{t.products_loading}</p>
                                </div>
                            ) : filteredServices.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredServices.map((service: any) => (
                                        <ProductCard
                                            key={service.id}
                                            id={service.id}
                                            name={service.title}
                                            nameBn={service.title_bn}
                                            price={service.price?.toLocaleString() || "0"}
                                            image={service.images?.[0] || ""}
                                            rating={service.rating || 4.5}
                                            category={service.category?.name}
                                            categoryBn={service.category?.name_bn}
                                            categoryId={service.category_id}
                                            sellerId={service.designer_id}
                                            sellerName={service.designer?.company_name}
                                            sellerNameBn={service.designer?.company_name_bn}
                                            tag={service.unit}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-neutral-50 rounded-[32px] p-12 text-center border border-dashed border-neutral-200">
                                    <p className="text-neutral-400 font-bold">{t.design_no_services}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Project Showcase Section */}
            <section className="py-20 bg-neutral-50 text-neutral-900 overflow-hidden">
                <div className="container mx-auto px-8 mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
                    <div>
                        <span className="text-primary-600 font-black tracking-widest uppercase text-xs mb-2 block">
                            {t.design_portfolio_label}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
                            {t.design_portfolio_title}
                        </h2>
                    </div>
                    <Button variant="outline" className="text-neutral-900 border-neutral-200 hover:bg-neutral-900 hover:text-white rounded-full px-8">
                        {t.design_view_all_projects}
                    </Button>
                </div>

                <div className="container mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProjects.map((project: any) => (
                            <div key={project.id} className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-200 cursor-pointer">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                                    style={{ backgroundImage: `url(${project.image})` }}
                                />
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-white">
                                    <span className="text-primary-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                                        {getL(project.category, project.category_bn, language)}
                                    </span>
                                    <h4 className="text-xl font-bold leading-tight">
                                        {getL(project.title, project.title_bn, language)}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. User Reviews Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-8 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-4">
                            {t.design_client_stories}
                        </h2>
                        <div className="h-1 w-20 bg-primary-600 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {clientReviews.map((review: any) => (
                            <div key={review.id} className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 relative group">
                                <Quote className="absolute top-8 right-8 w-8 h-8 text-primary-100 group-hover:text-primary-200 transition-colors" />

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary-100">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${review.image})` }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 text-lg leading-none mb-1">
                                            {getL(review.name, review.name_bn, language)}
                                        </h4>
                                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                                            {getL(review.role, review.role_bn, language)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                <p className="text-neutral-500 font-medium italic leading-relaxed">
                                    "{getL(review.quote, review.quote_bn, language)}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
