"use client"

import { useState } from "react";
import Link from "next/link";
import { Loader2, ChevronRight, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getL } from "@/utils/localization";

interface DesignL3DisplayProps {
    packages: any[];
    categories: any[];
    loading: boolean;
    config?: {
        selected_ids?: string[];
    };
}

export function DesignL3Display({ packages, categories, loading, config }: DesignL3DisplayProps) {
    const { t, language } = useLanguage();
    const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
    const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

    const selectedIds = config?.selected_ids || [];

    // Helper to determine root service type
    const getServiceType = (item: any): 'interior' | 'structural' => {
        let current = item;
        while (current) {
            if (current.level === 0 || !current.parent_id) {
                const name = (current.name || '').toLowerCase();
                if (name.includes('interior')) return 'interior';
                return 'structural';
            }
            // Support both objects and IDs if needed, but here categories is the full list
            current = categories.find(c => c.id === current.parent_id);
        }
        return 'structural';
    };

    // Helper to check if a category or any of its descendants are in the selected list
    const hasSelection = (catId: string): boolean => {
        if (selectedIds.length === 0) return true;
        if (selectedIds.includes(catId)) return true;

        // Check recursively for children
        const children = categories.filter(c => c.parent_id === catId);
        return children.some(child => hasSelection(child.id));
    };

    // Filter categories based on level and name, and CMS selection
    const rootCategories = categories.filter(c =>
        (c.level === 0 || !c.parent_id) &&
        c.name !== 'Others' &&
        hasSelection(c.id)
    );

    // Determine what to show in the grid
    let displayItems: any[] = [];
    let sectionTitle = "";

    if (selectedSubId) {
        // Show L3 items for the selected subcategory
        displayItems = categories.filter(c => c.parent_id === selectedSubId && (selectedIds.length === 0 || selectedIds.includes(c.id)));
        const sub = categories.find(c => c.id === selectedSubId);
        sectionTitle = getL(sub?.name, sub?.name_bn, language);
    } else if (selectedRootId) {
        // Show subcategories for the selected root
        displayItems = categories.filter(c => c.parent_id === selectedRootId && hasSelection(c.id));
        const root = categories.find(c => c.id === selectedRootId);
        sectionTitle = getL(root?.name, root?.name_bn, language);
    } else {
        // Show all sub-items (Level 2/3) when "All Design" is selected
        displayItems = categories.filter(c =>
            c.level >= 1 &&
            c.name !== 'Others' &&
            (selectedIds.length === 0 || selectedIds.includes(c.id))
        );
        sectionTitle = language === 'BN' ? 'সব ডিজাইন কালেকশন' : 'All Design Collections';
    }

    const resetFilters = () => {
        setSelectedRootId(null);
        setSelectedSubId(null);
    };

    const handleCategoryClick = (cat: any) => {
        if (cat.level === 0) {
            setSelectedRootId(cat.id);
            setSelectedSubId(null);
        } else if (cat.level === 1) {
            setSelectedSubId(cat.id);
        }
    };

    const subCategories = selectedRootId ? categories.filter(c => c.parent_id === selectedRootId) : [];

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar - Simplified */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="bg-neutral-50/50 rounded-3xl p-6 border border-neutral-100">
                                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 px-2">
                                    {language === 'BN' ? 'ঘরবাড়ি ডিজাইন' : 'Dalankotha Design'}
                                </h3>

                                <div className="space-y-1">
                                    <button
                                        onClick={resetFilters}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${!selectedRootId ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/10' : 'text-neutral-600 hover:bg-neutral-100'
                                            }`}
                                    >
                                        {language === 'BN' ? 'সব ডিজাইন' : 'All Design'}
                                    </button>

                                    <div className="py-2" />

                                    {rootCategories.map(root => (
                                        <div key={root.id} className="mb-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedRootId(root.id);
                                                    setSelectedSubId(null);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${selectedRootId === root.id && !selectedSubId
                                                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                                                    : selectedRootId === root.id ? 'bg-neutral-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                                                    }`}
                                            >
                                                <span className="text-sm font-semibold">
                                                    {getL(root.name, root.name_bn, language)}
                                                </span>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedRootId === root.id ? 'rotate-90' : ''}`} />
                                            </button>

                                            {/* Subcategories appearing under root when root is active */}
                                            {selectedRootId === root.id && (
                                                <div className="ml-4 mt-1 space-y-1 border-l border-neutral-200">
                                                    {subCategories.map(sub => (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => setSelectedSubId(sub.id)}
                                                            className={`w-full text-left px-4 py-2 text-xs font-medium rounded-lg transition-all ${selectedSubId === sub.id
                                                                ? 'text-red-600 bg-red-50'
                                                                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                                                                }`}
                                                        >
                                                            {getL(sub.name, sub.name_bn, language)}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                                {sectionTitle}
                            </h2>
                            <div className="h-1 w-10 bg-red-600 mt-2 rounded-full" />
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
                                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-widest">{t.products_loading}</p>
                            </div>
                        ) : displayItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayItems.map((item: any) => {
                                    const serviceType = getServiceType(item);
                                    const bookingUrl = `/services/design/book?service=${serviceType}`;

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleCategoryClick(item)}
                                            className="group cursor-pointer bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full"
                                        >
                                            {/* Image wrapper */}
                                            <div className="aspect-square relative overflow-hidden bg-neutral-50">
                                                <img
                                                    src={item.icon_url || item.image || `https://source.unsplash.com/featured/?${encodeURIComponent(item.name)},design`}
                                                    alt={getL(item.name, item.name_bn, language)}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                {/* Rating Badge */}
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-white/90 backdrop-blur-md text-neutral-900 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        4.9
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 flex flex-col flex-1">
                                                <h3 className="font-bold text-neutral-900 text-base mb-1 group-hover:text-red-600 transition-colors">
                                                    {getL(item.name, item.name_bn, language)}
                                                </h3>
                                                <p className="text-neutral-500 text-[11px] mb-4 line-clamp-1">
                                                    {item.level === 0 ? 'Root Category' : item.level === 1 ? 'Sub-Category' : 'Design Collection'}
                                                </p>

                                                <div className="mt-auto flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest">{t.lbl_starting_from}</span>
                                                        <span className="text-lg font-black text-neutral-900">
                                                            ৳{(item.metadata?.price || 5000).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <Link href={bookingUrl} onClick={(e) => e.stopPropagation()}>
                                                        <button className="bg-neutral-900 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-black transition-colors">
                                                            {t.service_book_now}
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                                <p className="text-neutral-400 font-medium">{language === 'BN' ? 'কোন তথ্য পাওয়া যায়নি' : 'No items found in this category'}</p>
                                <button onClick={resetFilters} className="mt-4 text-red-600 font-bold text-sm hover:underline">
                                    {language === 'BN' ? 'রিসেট করুন' : 'Reset exploration'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
