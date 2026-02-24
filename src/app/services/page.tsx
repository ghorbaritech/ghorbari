"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { useState, useEffect } from "react";
import { PromoBannerSection } from "@/components/sections/PromoBannerSection";
import { useLanguage } from "@/context/LanguageContext";
import { getL } from "@/utils/localization";
import { getAllServicePackages } from "@/services/packageService";
import { getCategories } from "@/services/productService";

export default function ServicesPage() {
    const { t, language } = useLanguage();
    const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
    const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [packages, setPackages] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [pkgData, catData] = await Promise.all([
                    getAllServicePackages(),
                    getCategories('service')
                ]);
                setPackages(pkgData);
                setCategories(catData);
            } catch (error) {
                console.error("Error fetching service data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filter services based on state
    const filteredServices = packages.filter(service => {
        const pkgCat = service.category;

        // Category Hierarchy Filter
        if (selectedSubId) {
            // Show packages in this subcategory (L1) or its items (L2)
            const isDirectMatch = service.category_id === selectedSubId;
            const isChildMatch = pkgCat?.parent_id === selectedSubId;
            if (!isDirectMatch && !isChildMatch) return false;
        } else if (selectedRootId) {
            // Show packages under this root (L0)
            const isDirectMatch = service.category_id === selectedRootId;
            const isChildMatch = pkgCat?.parent_id === selectedRootId;
            // Or grandchild match (L2 item -> L1 sub -> L0 root)
            const subCat = categories.find(c => c.id === pkgCat?.parent_id);
            const isGrandchildMatch = subCat?.parent_id === selectedRootId;

            if (!isDirectMatch && !isChildMatch && !isGrandchildMatch) return false;
        }

        // Price Filter
        const price = service.price;
        if (minPrice && price < parseInt(minPrice)) return false;
        if (maxPrice && price > parseInt(maxPrice)) return false;

        return true;
    });

    const rootCategories = categories.filter(c => c.level === 0 || !c.parent_id);
    const subCategories = selectedRootId ? categories.filter(c => c.parent_id === selectedRootId) : [];

    const handleRootClick = (id: string) => {
        setSelectedRootId(id);
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

            {/* 1. Offers Section */}
            <PromoBannerSection />

            <div className="container mx-auto px-8 pt-12">
                {/* Header Label */}
                <div className="mb-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
                        {t.services_marketplace_title}
                    </h1>
                    <p className="text-neutral-500 font-medium mt-1">
                        {t.services_marketplace_subtitle}
                    </p>
                    <div className="h-1 w-20 bg-primary-600 mt-3 rounded-full" />
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="hidden lg:block space-y-8 bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm sticky top-24">
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-neutral-900 uppercase tracking-tighter text-sm italic">
                                        {selectedRootId ? (
                                            categories.find(c => c.id === selectedRootId)?.name
                                        ) : (
                                            t.services_categories_sidebar
                                        )}
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
                                    {!selectedRootId ? (
                                        // Show Root Categories
                                        rootCategories.map(c => (
                                            <div key={c.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleRootClick(c.id)}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-200 group-hover:bg-primary-600 transition-colors" />
                                                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 group-hover:text-primary-600 cursor-pointer transition-colors">
                                                    {language === 'BN' ? c.name_bn || c.name : c.name}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        // Show Sub Categories
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setSelectedRootId(null)}
                                                className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 hover:text-neutral-600 mb-4"
                                            >
                                                <ArrowRight className="w-3 h-3 rotate-180" />
                                                {language === 'BN' ? 'পেছনে ফিরুন' : 'Go Back'}
                                            </button>
                                            {subCategories.map(c => (
                                                <div key={c.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleSubClick(c.id)}>
                                                    <Checkbox
                                                        id={c.id}
                                                        checked={selectedSubId === c.id}
                                                        onCheckedChange={() => handleSubClick(c.id)}
                                                    />
                                                    <label htmlFor={c.id} className="text-xs font-black uppercase tracking-widest text-neutral-500 group-hover:text-primary-600 cursor-pointer transition-colors">
                                                        {language === 'BN' ? c.name_bn || c.name : c.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-neutral-50"></div>

                            <div>
                                <h3 className="font-bold mb-6 text-neutral-900 uppercase tracking-tighter text-sm italic">
                                    {t.services_budget_range}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <Input
                                        placeholder="Min"
                                        className="h-10 text-[10px] font-black tracking-widest uppercase bg-neutral-50 border-none rounded-xl"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                    <span className="text-neutral-300">-</span>
                                    <Input
                                        placeholder="Max"
                                        className="h-10 text-[10px] font-black tracking-widest uppercase bg-neutral-50 border-none rounded-xl"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Service Grid */}
                    <div className="flex-1">
                        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                            <div className="text-xs text-neutral-400 font-black uppercase tracking-widest">
                                {t.services_found.replace('{count}', filteredServices.length.toString())}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                                    {t.services_sort_by}
                                </span>
                                <select className="text-[10px] border-none bg-neutral-50 rounded-xl px-4 py-2 font-black uppercase tracking-widest text-neutral-800 focus:ring-0 cursor-pointer">
                                    <option>{t.services_newest}</option>
                                    <option>{t.services_price_low}</option>
                                    <option>{t.services_price_high}</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
                                <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                                <p className="text-neutral-500 font-bold">{t.products_loading}</p>
                            </div>
                        ) : filteredServices.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                        sellerId={service.provider_id}
                                        sellerName={service.provider?.business_name}
                                        sellerNameBn={service.provider?.business_name_bn}
                                        tag={service.unit}
                                        href={`/services/${service.id}`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-dashed border-neutral-100">
                                <p className="text-neutral-300 font-black uppercase tracking-[0.3em] text-xs underline decoration-primary-600 decoration-4 underline-offset-8 italic">
                                    {t.services_no_found_title}
                                </p>
                                <p className="mt-6 text-neutral-400 text-[10px] font-bold uppercase tracking-widest leading-loose" dangerouslySetInnerHTML={{ __html: t.services_no_found_desc }}>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
