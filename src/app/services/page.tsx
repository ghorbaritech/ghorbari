"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Filter, Search, CheckCircle2, ShoppingBag, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { PromoBannerSection } from "@/components/sections/PromoBannerSection";
import { useLanguage } from "@/context/LanguageContext";
import { getL } from "@/utils/localization";
import { getServiceItems, ServiceItem } from "@/services/serviceItemService";
import { ServiceCartSidebar } from "@/components/sections/ServiceCartSidebar";
import { getCategories } from "@/services/categoryService";
import { useServiceCart } from "@/context/ServiceCartContext";
import { toast } from "sonner";
import Link from "next/link";

export default function ServicesPage() {
    const { t, language } = useLanguage();
    const { addService, items: selectedItems, itemCount, removeService } = useServiceCart();

    const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
    const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [itemData, catData] = await Promise.all([
                    getServiceItems(),
                    getCategories('service')
                ]);
                setServiceItems(itemData);
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
    const filteredServices = serviceItems.filter(service => {
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

        // Price Filter
        const price = service.unit_price;
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

            {/* 1. Offers Section (Restored) */}
            <PromoBannerSection />

            <div className="container mx-auto px-8 py-12">
                {/* Header Label (Restored style) */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tighter italic uppercase">
                        {t.services_marketplace_title}
                    </h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mt-2">
                        {t.services_marketplace_subtitle}
                    </p>
                    <div className="h-1.5 w-24 bg-primary-600 mt-4 rounded-full" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">

                    {/* Filters Sidebar (Left) */}
                    <aside className="w-full xl:col-span-3 lg:col-span-4">
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
                                    {rootCategories.map(root => (
                                        <div key={root.id} className="space-y-3">
                                            {/* Root Category Label */}
                                            <div
                                                className={`flex items-center space-x-3 group cursor-pointer p-2 rounded-xl transition-all ${selectedRootId === root.id ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                                                onClick={() => handleRootClick(root.id)}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${selectedRootId === root.id ? 'bg-primary-600' : 'bg-neutral-200 group-hover:bg-primary-600'}`} />
                                                <label className={`text-xs font-black uppercase tracking-widest cursor-pointer transition-colors ${selectedRootId === root.id ? 'text-primary-600' : 'text-neutral-500 group-hover:text-primary-600'}`}>
                                                    {language === 'BN' ? root.name_bn || root.name : root.name}
                                                </label>
                                            </div>

                                            {/* Nested Subcategories (Accordion Content) */}
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
                                                            <label htmlFor={sub.id} className={`text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors ${selectedSubId === sub.id ? 'text-primary-600' : 'text-neutral-400 group-hover:text-primary-500'}`}>
                                                                {language === 'BN' ? sub.name_bn || sub.name : sub.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
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

                    {/* Main Content (Center) */}
                    <div className="xl:col-span-6 lg:col-span-8 space-y-8">
                        {/* Filters & Search Row */}
                        <div className="bg-white rounded-[32px] p-4 border border-neutral-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-grow w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search services (e.g. Painting, Tiles...)"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 border-none focus:ring-2 focus:ring-primary-500/20 font-bold text-sm"
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                <button className="px-6 py-4 rounded-2xl bg-neutral-900 text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
                                    <Filter className="w-3.5 h-3.5" />
                                    Filter
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                                        className={`px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-white border border-neutral-100 text-neutral-400 hover:border-neutral-200'}`}
                                    >
                                        {language === 'BN' ? cat.name_bn : cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Services Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="h-[300px] rounded-[24px] bg-neutral-100 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredServices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredServices.map((service) => {
                                    const isSelected = selectedItems.some(i => i.id === service.id);
                                    return (
                                        <ServiceCard
                                            key={service.id}
                                            id={service.id}
                                            name={service.name}
                                            nameBn={service.name_bn}
                                            price={service.unit_price?.toLocaleString() || "0"}
                                            image={service.image_url || ""}
                                            rating={4.8}
                                            category={service.category?.name}
                                            unitType={service.unit_type}
                                            isSelected={isSelected}
                                            onToggle={() => {
                                                if (isSelected) {
                                                    removeService(service.id);
                                                    toast.info(`${service.name} removed from booking`);
                                                } else {
                                                    addService(service);
                                                    toast.success(`${service.name} added to booking`);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white border border-neutral-100 rounded-[32px] p-20 text-center">
                                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShoppingBag className="w-10 h-10 text-neutral-200" />
                                </div>
                                <h3 className="text-2xl font-black text-neutral-900 mb-2">No Services Found</h3>
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Try selecting a different category or search term</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Cart (Right) */}
                    <div className="xl:col-span-3 space-y-4">
                        <ServiceCartSidebar />
                    </div>
                </div>
            </div>

            {/* Float Floating Checkout Bar */}
            {/* Mobile Floating Cart Trigger */}
            {itemCount > 0 && (
                <div className="xl:hidden fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => {
                            const cartEl = document.getElementById('sidebar-cart');
                            cartEl?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-neutral-900 text-white p-5 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-500 group active:scale-95 transition-transform"
                    >
                        <div className="relative">
                            <ShoppingBag className="w-6 h-6" />
                            <span className="absolute -top-2 -right-2 bg-primary-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-neutral-900">
                                {itemCount}
                            </span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest pr-2 border-l border-white/20 pl-3">
                            View Cart
                        </span>
                    </button>
                </div>
            )}

            <Footer />
        </main>
    );
}
