"use client"

import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getProducts } from "@/services/productService";

import { useLanguage } from "@/context/LanguageContext";

interface CategoryShowcaseProps {
    title: string;
    category: string;
    bgClass?: string;
    link?: string;
}

// Product data is now strictly fetched from the database

export function CategoryShowcase({ title, category, bgClass = "bg-white", link = "/products" }: CategoryShowcaseProps) {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                // Determine if category is UUID or Name
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);

                let data;
                if (isUUID) {
                    data = await getProducts({ recursiveCategoryId: category });
                } else {
                    data = await getProducts({ categoryName: category });
                }

                if (data && data.length > 0) {
                    // Filter out dummy sellers (e.g., Dalankotha Demo Store)
                    // Based on investigation, demo store IDs contain 'f1f1' or '886d'
                    const realProducts = data.filter(p =>
                        p.seller_id !== 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1' &&
                        p.seller_id !== '886df843-ec20-4413-9654-9352bbc9ee41'
                    );
                    setProducts(realProducts);
                } else {
                    setProducts([]);
                }

            } catch (error) {
                console.error("Failed to fetch category products", error);
                setProducts([]);
            }
            setLoading(false);
        }
        fetchProducts();
    }, [category]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className={`py-10 ${bgClass}`}>
            <div className="section-container">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                    <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-semibold text-primary-950">
                            {title}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="w-12 h-12 rounded-full border border-neutral-100 bg-white shadow-sm flex items-center justify-center text-neutral-400 hover:text-primary-950 hover:border-primary-950 hover:shadow-xl transition-all"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="w-12 h-12 rounded-full border border-neutral-100 bg-white shadow-sm flex items-center justify-center text-neutral-400 hover:text-primary-950 hover:border-primary-950 hover:shadow-xl transition-all"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </div>

                        <Link href={link} className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-950 transition-colors group">
                            <span className="text-[10px] font-black uppercase tracking-widest">{t.market_view_all}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[380px] bg-neutral-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div
                        ref={scrollContainerRef}
                        className="flex lg:grid lg:grid-cols-5 gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar"
                    >
                        {products.map((product) => (
                            <div key={product.id} className="min-w-[240px] lg:min-w-0 snap-center h-full">
                                <ProductCard
                                    id={product.id}
                                    name={product.title}
                                    price={product.base_price}
                                    image={product.images?.[0] || ""}
                                    rating={product.rating || 4.5}
                                    category={product.category?.name || category}
                                    categoryBn={product.category?.name_bn}
                                    categoryId={product.category?.id || product.cat_id}
                                    subcategory={product.sub_category || undefined}
                                    sellerId={product.seller_id}
                                    sellerName={product.seller?.business_name}
                                    compact={false}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 md:hidden text-center">
                    <Link href={link}>
                        <Button variant="outline" className="w-full rounded-full h-12 font-black uppercase tracking-widest text-[10px] border-neutral-200">
                            {t.market_view_all}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
