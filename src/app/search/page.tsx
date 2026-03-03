"use client"

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getProducts } from "@/services/productService";
import { searchUnified, UnifiedSearchResult } from "@/services/unifiedSearchService";
import { ProductCard } from "@/components/ui/ProductCard";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sliders, ListFilter, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");
    const [results, setResults] = useState<UnifiedSearchResult[]>([]);
    const [filteredResults, setFilteredResults] = useState<UnifiedSearchResult[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchType, setSearchType] = useState<string>("all");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("relevance");
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        async function fetchResults() {
            setLoading(true);
            const data = await searchUnified(query || "");
            setResults(data);
            setFilteredResults(data);

            // Set max price based on results
            if (data.length > 0) {
                const prices = data.map(p => p.price).filter((p): p is number => p !== undefined);
                if (prices.length > 0) {
                    const max = Math.max(...prices);
                    setPriceRange([0, max]);
                }
            }
            setLoading(false);
        }
        fetchResults();
    }, [query]);

    useEffect(() => {
        let updated = [...results];

        // Apply Type Filter
        if (searchType !== "all") {
            updated = updated.filter(item => {
                const section = (item as any).metadata?.section;
                if (searchType === "products") return section === 'product' || item.type === 'product';
                if (searchType === "services") return section === 'service' || item.type === 'service_item' || item.type === 'service_category';
                if (searchType === "designs") return section === 'design' || item.type === 'design_category';
                return true;
            });
        }

        // Apply Price Filter
        updated = updated.filter(p => !p.price || (p.price >= priceRange[0] && p.price <= priceRange[1]));

        // Apply Category Filter
        if (selectedCategories.length > 0) {
            updated = updated.filter(p => p.category_name && selectedCategories.includes(p.category_name));
        }

        // Apply Sorting
        if (sortBy === "price-low") updated.sort((a, b) => (a.price || 0) - (b.price || 0));
        if (sortBy === "price-high") updated.sort((a, b) => (b.price || 0) - (a.price || 0));

        setFilteredResults(updated);
    }, [priceRange, selectedCategories, sortBy, results, searchType]);

    const categories = Array.from(new Set(results.map(p => p.category_name))).filter((c): c is string => !!c);

    const FilterSidebar = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900 mb-6">Type</h3>
                <div className="flex flex-col gap-2">
                    {["all", "products", "services", "designs"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setSearchType(t)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left ${searchType === t
                                ? "bg-primary-950 text-white shadow-lg"
                                : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900 mb-6">Price Range</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Min</label>
                            <input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="w-full bg-neutral-50 border-none rounded-lg p-2 text-sm font-bold"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Max</label>
                            <input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="w-full bg-neutral-50 border-none rounded-lg p-2 text-sm font-bold"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900 mb-6">Categories</h3>
                <div className="space-y-3">
                    {categories.map((cat: any) => (
                        <div key={cat} className="flex items-center space-x-3">
                            <Checkbox
                                id={cat}
                                checked={selectedCategories.includes(cat)}
                                onCheckedChange={(checked) => {
                                    setSelectedCategories(prev =>
                                        checked ? [...prev, cat] : prev.filter(c => c !== cat)
                                    );
                                }}
                            />
                            <label htmlFor={cat} className="text-sm font-medium text-neutral-600 cursor-pointer select-none group-hover:text-primary-600 transition-colors">
                                {cat}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 bg-neutral-50/50">
            <div className="section-container py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="sticky top-32">
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Header & Controls */}
                        <div className="bg-white rounded-[2rem] p-6 border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600">Search Results</p>
                                <h1 className="text-2xl font-black text-neutral-900">
                                    {query ? `"${query}"` : "All Products"}
                                    <span className="ml-3 text-sm font-medium text-neutral-400">({filteredResults.length} items)</span>
                                </h1>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Mobile Filter Trigger */}
                                <div className="lg:hidden">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl border-neutral-200"
                                        onClick={() => setIsMobileFilterOpen(true)}
                                    >
                                        <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                                    </Button>

                                    <AnimatePresence>
                                        {isMobileFilterOpen && (
                                            <>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => setIsMobileFilterOpen(false)}
                                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                                                />
                                                <motion.div
                                                    initial={{ x: "-100%" }}
                                                    animate={{ x: 0 }}
                                                    exit={{ x: "-100%" }}
                                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                                    className="fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-white z-[101] shadow-2xl p-6 flex flex-col"
                                                >
                                                    <div className="flex items-center justify-between mb-8">
                                                        <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900">Filters</h2>
                                                        <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                                            <X className="w-5 h-5 text-neutral-400" />
                                                        </button>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                                                        <FilterSidebar />
                                                    </div>
                                                    <Button
                                                        className="mt-6 w-full h-12 rounded-xl bg-primary-950 text-white font-bold uppercase tracking-widest"
                                                        onClick={() => setIsMobileFilterOpen(false)}
                                                    >
                                                        Apply Filters
                                                    </Button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px] rounded-xl border-neutral-200 bg-white">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="relevance">Best Match</SelectItem>
                                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                                        <SelectItem value="newest">Newest Arrivals</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="aspect-[3/4] bg-neutral-200/50 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredResults.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredResults.map((item) => {
                                    if (item.type === 'product') {
                                        return (
                                            <ProductCard
                                                key={item.id}
                                                id={item.id}
                                                name={item.name}
                                                price={item.price || 0}
                                                image={item.image && typeof item.image === 'string' ? item.image : ""}
                                                rating={4.5}
                                                category={item.category_name}
                                            />
                                        );
                                    }
                                    return (
                                        <ServiceCard
                                            key={item.id}
                                            id={item.id}
                                            name={item.name}
                                            price={item.price || 0}
                                            image={item.image || ""}
                                            rating={4.8}
                                            category={item.category_name || item.type.replace('_', ' ')}
                                            onToggle={() => { }} // Booking handled in details
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-neutral-100">
                                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ListFilter className="w-8 h-8 text-neutral-300" />
                                </div>
                                <h3 className="text-xl font-black text-neutral-900 mb-2 uppercase tracking-widest">No Matches</h3>
                                <p className="text-neutral-500 text-sm max-w-xs mx-auto">We couldn't find anything matching your current filters. Try relaxing them!</p>
                                <Button
                                    variant="ghost"
                                    className="mt-6 text-primary-600 font-bold hover:bg-primary-50"
                                    onClick={() => {
                                        setPriceRange([0, 100000]);
                                        setSelectedCategories([]);
                                    }}
                                >
                                    Reset all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
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
