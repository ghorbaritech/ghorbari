"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, ArrowRight, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { createClient } from "@/utils/supabase/client";
import { PromoBannerSection } from "@/components/sections/PromoBannerSection";
import { BrandBar } from "@/components/sections/BrandBar";

import { useLanguage } from "@/context/LanguageContext";
import { getL } from "@/utils/localization";

export default function ProductsPage() {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
    const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [prodData, catData] = await Promise.all([
                    getProducts(),
                    getCategories('product')
                ]);
                setProducts(prodData);
                setCategories(catData);
            } catch (error) {
                console.error("Error fetching product data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filter products based on state
    const filteredProducts = products.filter(product => {
        const pkgCat = product.category;

        // Category Hierarchy Filter
        if (selectedSubId) {
            // Show products in this subcategory (L1) or its items (L2)
            const isDirectMatch = product.category_id === selectedSubId;
            const isChildMatch = pkgCat?.parent_id === selectedSubId;
            if (!isDirectMatch && !isChildMatch) return false;
        } else if (selectedRootId) {
            // Show products under this root (L0)
            const isDirectMatch = product.category_id === selectedRootId;
            const isChildMatch = pkgCat?.parent_id === selectedRootId;
            // Or grandchild match (L2 item -> L1 sub -> L0 root)
            const subCat = categories.find(c => c.id === pkgCat?.parent_id);
            const isGrandchildMatch = subCat?.parent_id === selectedRootId;

            if (!isDirectMatch && !isChildMatch && !isGrandchildMatch) return false;
        }

        // Price Filter
        const price = product.base_price;
        if (minPrice && price < parseInt(minPrice)) return false;
        if (maxPrice && price > parseInt(maxPrice)) return false;

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

    const handleFilterPrice = () => {
        // Local filtering is handled by filteredProducts. 
        // We could manually trigger a refresh or leave as is if reactive.
    };

    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50/50">
            <Navbar />

            {/* 1. Offers Section */}
            <PromoBannerSection />

            {/* 2. Brand Section */}
            <BrandBar />

            <div className="container mx-auto px-8 pt-12">
                {/* Header Label */}
                <div className="mb-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
                        {t.products_marketplace_title}
                    </h1>
                    <p className="text-neutral-500 font-medium mt-1">
                        {t.products_marketplace_subtitle}
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
                                        {t.products_supply_categories}
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
                                    {rootCategories.length === 0 && !loading && (
                                        <p className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest italic">
                                            {t.products_no_subs}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-neutral-50"></div>

                            <div>
                                <h3 className="font-bold mb-6 text-neutral-900 uppercase tracking-tighter text-sm italic">
                                    {t.products_price_thresholds}
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
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-10 w-10 p-0 bg-neutral-900 text-white hover:bg-primary-600 rounded-xl transition-all"
                                        onClick={handleFilterPrice}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                            <div className="text-xs text-neutral-400 font-black uppercase tracking-widest">
                                {t.products_found.replace('{count}', filteredProducts.length.toString())}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                                    {t.products_optimized_by}
                                </span>
                                <select className="text-[10px] border-none bg-neutral-50 rounded-xl px-4 py-2 font-black uppercase tracking-widest text-neutral-800 focus:ring-0 cursor-pointer">
                                    <option>{t.services_newest}</option>
                                    <option>{t.services_price_low}</option>
                                    <option>{t.services_price_high}</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-96 flex items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-neutral-100">
                                <div className="flex flex-col items-center gap-6 text-neutral-300">
                                    <Loader2 className="w-10 h-10 animate-spin" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                                        {t.products_loading}
                                    </p>
                                </div>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        name={getL(product.title, product.title_bn, language)}
                                        price={product.base_price.toLocaleString()}
                                        image={product.images?.[0] || ""}
                                        rating={product.rating || 0}
                                        category={getL(product.category?.name, product.category?.name_bn, language)}
                                        categoryBn={product.category?.name_bn}
                                        categoryId={product.category_id}
                                        subcategory={product.sub_category || undefined}
                                        sellerId={product.seller_id}
                                        sellerName={getL(product.seller?.business_name, product.seller?.business_name_bn, language)}
                                        tag={getL(product.brand, product.brand_bn, language)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-dashed border-neutral-100">
                                <p className="text-neutral-300 font-black uppercase tracking-[0.3em] text-xs underline decoration-primary-600 decoration-4 underline-offset-8 italic">
                                    {t.products_no_found_title}
                                </p>
                                <p className="mt-6 text-neutral-400 text-[10px] font-bold uppercase tracking-widest leading-loose" dangerouslySetInnerHTML={{ __html: t.products_no_found_desc }}>
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
