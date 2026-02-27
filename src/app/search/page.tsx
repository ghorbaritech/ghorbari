"use client"

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getProducts } from "@/services/productService";
import { ProductCard } from "@/components/ui/ProductCard";

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchResults() {
            setLoading(true);
            const data = await getProducts({ query: query || undefined });
            setResults(data);
            setLoading(false);
        }
        fetchResults();
    }, [query]);

    return (
        <div className="flex-1 container mx-auto px-4 py-12">
            <div className="flex flex-col gap-1 mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
                    Results for: <span className="text-primary-600">&ldquo;{query || "All Products"}&rdquo;</span>
                </h1>
                <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">{results.length} results found</p>
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-dashed border-neutral-200 transition-all">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">Scanning Database...</p>
                    </div>
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {results.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.title}
                            price={product.base_price.toLocaleString()}
                            oldPrice={product.discount_price ? product.base_price.toLocaleString() : null}
                            image={product.images?.[0] || ""}
                            rating={product.rating || 0}
                            category={product.category?.name || "Materials"}
                        />
                    ))}
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center bg-neutral-50 rounded-xl border border-neutral-200">
                    <p className="text-neutral-400 font-black uppercase tracking-[0.3em] text-xs">No matches found for your query</p>
                    <p className="mt-4 text-neutral-300 text-[10px] font-bold uppercase tracking-widest">Try adjusting your filters or checking your spelling</p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <main className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <Suspense fallback={
                <div className="flex-1 container mx-auto px-4 py-12">
                    <div className="h-96 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            }>
                <SearchContent />
            </Suspense>
            <Footer />
        </main>
    );
}
