import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, ArrowRight, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { useEffect, useState } from "react";
import { getProducts, getCategories } from "@/services/productService";
import { createClient } from "@/utils/supabase/client";
import { PromoBannerSection } from "@/components/sections/PromoBannerSection";
import { BrandBar } from "@/components/sections/BrandBar";

import { useLanguage } from "@/context/LanguageContext";
import { getL } from "@/utils/localization";

export default function ProductsPage() {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const supabase = createClient();

    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            // Fetch all products and derive distinct subcategories from them
            const prodData = await getProducts();
            setProducts(prodData);

            // Collect distinct sub_category values from products
            const subs = Array.from(
                new Set(
                    prodData
                        .map((p: any) => p.sub_category)
                        .filter(Boolean)
                )
            ) as string[];
            setSubcategories(subs.sort());
            setLoading(false);
        }
        fetchInitialData();
    }, []);


    const handleFilterPrice = async () => {
        setLoading(true);
        const all = await getProducts({
            minPrice: minPrice ? parseInt(minPrice) : undefined,
            maxPrice: maxPrice ? parseInt(maxPrice) : undefined
        });
        const filtered = selectedSubcategory
            ? all.filter((p: any) => p.sub_category === selectedSubcategory)
            : all;
        setProducts(filtered);
        setLoading(false);
    };

    const handleSubcategoryToggle = async (sub: string) => {
        const newSub = selectedSubcategory === sub ? null : sub;
        setSelectedSubcategory(newSub);
        setLoading(true);
        const all = await getProducts({
            minPrice: minPrice ? parseInt(minPrice) : undefined,
            maxPrice: maxPrice ? parseInt(maxPrice) : undefined
        });
        const filtered = newSub
            ? all.filter((p: any) => p.sub_category === newSub)
            : all;
        setProducts(filtered);
        setLoading(false);
    };

    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50/50">
            <Navbar />

            {/* 1. Offers Section */}
            <PromoBannerSection />

            {/* 2. Brand Section */}
            <BrandBar />

            <div className="container mx-auto px-8 pt-12">
                {/* Header Label - Styled like home page sections */}
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
                                <h3 className="font-bold mb-6 text-neutral-900 uppercase tracking-tighter text-sm italic">
                                    {t.products_supply_categories}
                                </h3>
                                <div className="space-y-3">
                                    {subcategories.length > 0 ? (
                                        subcategories.map(sub => (
                                            <div key={sub} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleSubcategoryToggle(sub)}>
                                                <Checkbox
                                                    id={sub}
                                                    checked={selectedSubcategory === sub}
                                                    onCheckedChange={() => handleSubcategoryToggle(sub)}
                                                />
                                                <label htmlFor={sub} className="text-xs font-black uppercase tracking-widest text-neutral-500 group-hover:text-primary-600 cursor-pointer transition-colors">
                                                    {sub}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
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
                                {t.products_found.replace('{count}', products.length.toString())}
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
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
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
