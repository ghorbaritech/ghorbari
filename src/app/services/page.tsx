"use client"

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { useEffect, useState } from "react";
import { getProducts, getCategories } from "@/services/productService";
import { PromoBannerSection } from "@/components/sections/PromoBannerSection";
import { BrandBar } from "@/components/sections/BrandBar";

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");

    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            try {
                const [servData, catData1, catData2] = await Promise.all([
                    getProducts({ categoryId: undefined }),
                    getCategories('service'),
                    getCategories('design')
                ]);
                setServices(servData);
                setCategories([...catData1, ...catData2]);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, []);

    const handleFilterPrice = async () => {
        setLoading(true);
        try {
            const data = await getProducts({
                categoryId: selectedCategory || undefined,
                minPrice: minPrice ? parseInt(minPrice) : undefined,
                maxPrice: maxPrice ? parseInt(maxPrice) : undefined
            });
            setServices(data);
        } catch (error) {
            console.error('Error filtering price:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryToggle = async (id: string) => {
        const newCat = selectedCategory === id ? null : id;
        setSelectedCategory(newCat);
        setLoading(true);
        try {
            const data = await getProducts({
                categoryId: newCat || undefined,
                minPrice: minPrice ? parseInt(minPrice) : undefined,
                maxPrice: maxPrice ? parseInt(maxPrice) : undefined
            });
            setServices(data);
        } catch (error) {
            console.error('Error toggling category:', error);
        } finally {
            setLoading(false);
        }
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
                        Professional Service Marketplace
                    </h1>
                    <p className="text-neutral-500 font-medium mt-1">Hire top-rated experts for your dream home</p>
                    <div className="h-1 w-20 bg-primary-600 mt-3 rounded-full" />
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="hidden lg:block space-y-8 bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm sticky top-24">
                            <div>
                                <h3 className="font-bold mb-6 text-neutral-900 uppercase tracking-tighter text-sm italic">Service Categories</h3>
                                <div className="space-y-4">
                                    {(categories || []).map(c => (
                                        <div key={c.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleCategoryToggle(c.id)}>
                                            <Checkbox
                                                id={c.id}
                                                checked={selectedCategory === c.id}
                                                onCheckedChange={() => handleCategoryToggle(c.id)}
                                            />
                                            <label htmlFor={c.id} className="text-xs font-black uppercase tracking-widest text-neutral-500 group-hover:text-primary-600 cursor-pointer transition-colors">
                                                {c.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-neutral-50"></div>

                            <div>
                                <h3 className="font-bold mb-6 text-neutral-900 uppercase tracking-tighter text-sm italic">Budget Range (৳)</h3>
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

                    {/* Service Grid */}
                    <div className="flex-1">
                        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                            <div className="text-xs text-neutral-400 font-black uppercase tracking-widest">
                                Found <span className="text-neutral-900">{(services || []).length}</span> professional services
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Sort By:</span>
                                <select className="text-[10px] border-none bg-neutral-50 rounded-xl px-4 py-2 font-black uppercase tracking-widest text-neutral-800 focus:ring-0 cursor-pointer">
                                    <option>Newest First</option>
                                    <option>Price: Low-High</option>
                                    <option>Price: High-Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-96 flex items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-neutral-100">
                                <div className="flex flex-col items-center gap-6 text-neutral-300">
                                    <Loader2 className="w-10 h-10 animate-spin" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Querying Service Index...</p>
                                </div>
                            </div>
                        ) : (services || []).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {(services || []).map((service) => (
                                    <ProductCard
                                        key={service.id}
                                        id={service.id}
                                        name={service.title}
                                        price={service.base_price?.toLocaleString() || "0"}
                                        image={service.images?.[0] || ""}
                                        rating={service.rating || 0}
                                        category={service.category?.name || "Services"}
                                        categoryId={service.category_id}
                                        sellerId={service.seller_id}
                                        sellerName={service.seller?.business_name}
                                        tag={service.brand || "Verified"}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-dashed border-neutral-100">
                                <p className="text-neutral-300 font-black uppercase tracking-[0.3em] text-xs underline decoration-primary-600 decoration-4 underline-offset-8 italic">No Services Found</p>
                                <p className="mt-6 text-neutral-400 text-[10px] font-bold uppercase tracking-widest leading-loose">We couldn't find any services matching your criteria.<br />Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
