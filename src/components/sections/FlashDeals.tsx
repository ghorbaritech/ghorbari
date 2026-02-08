"use client"

import { Zap, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { useEffect, useState } from "react";
import { getFlashDeals } from "@/services/productService";

export function FlashDeals() {
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDeals() {
            const data = await getFlashDeals(5);
            setDeals(data);
            setLoading(false);
        }
        fetchDeals();
    }, []);

    if (loading) return null; // Hide section while loading
    if (deals.length === 0) return null; // Hide if no deals

    return (
        <section className="py-20 bg-neutral-50/50">
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-end mb-12">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2.5 bg-error text-white px-5 py-2.5 rounded-full font-black uppercase tracking-tighter text-xs italic shadow-xl shadow-error/20">
                            <Zap className="w-4 h-4 fill-white" />
                            Flash Deals
                        </div>
                        <p className="text-xs font-bold text-neutral-400 hidden sm:block uppercase tracking-widest">
                            Limited time offers
                        </p>
                    </div>
                    <Link href="/products?filter=deals">
                        <button className="text-xs font-black text-primary-600 hover:text-primary-700 flex items-center gap-2 group uppercase tracking-tight p-2">
                            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {deals.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.title}
                            price={product.base_price.toLocaleString()}
                            oldPrice={product.discount_price ? product.base_price.toLocaleString() : null}
                            discount={product.discount_price ? `-${Math.round((1 - product.discount_price / product.base_price) * 100)}%` : undefined}
                            image={product.images?.[0] || ""}
                            rating={product.rating || 0}
                            category={product.category?.name || "Materials"}
                            categoryId={product.category_id}
                            sellerId={product.seller_id}
                            sellerName={product.seller?.business_name}
                            tag={product.brand}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

