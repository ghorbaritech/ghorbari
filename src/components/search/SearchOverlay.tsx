"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, Tag, ArrowRight, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
    id: string;
    name: string;
    price?: number;
    image?: string;
    resultType: 'product' | 'category';
    type: string;
    category?: string;
}

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    query: string;
    results: SearchResult[];
    isLoading: boolean;
}

export function SearchOverlay({ isOpen, onClose, query, results, isLoading }: SearchOverlayProps) {
    const products = results.filter(r => r.resultType === 'product');
    const categories = results.filter(r => r.resultType === 'category');

    const hotKeywords = ["Cement", "Paint", "Steel Bars", "Floor Tiles", "Interior Design"];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-neutral-100 overflow-hidden z-[100] min-h-[400px]"
            >
                <div className="flex flex-col md:flex-row min-h-[400px]">
                    {/* Left Pane: Suggestions & Categories */}
                    <div className="w-full md:w-[35%] border-r border-neutral-50 p-6 flex flex-col gap-8">
                        {query.length < 2 ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3" /> Popular Searches
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {hotKeywords.map(kw => (
                                            <Link
                                                key={kw}
                                                href={`/search?q=${kw}`}
                                                className="px-4 py-2 bg-neutral-50 hover:bg-primary-50 text-neutral-600 hover:text-primary-700 rounded-full text-xs font-bold transition-all"
                                                onClick={onClose}
                                            >
                                                {kw}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Suggestions</h3>
                                    <ul className="space-y-1">
                                        <li className="group">
                                            <Link
                                                href={`/search?q=${query}`}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-all font-bold text-neutral-700 hover:text-primary-700"
                                                onClick={onClose}
                                            >
                                                <Search className="w-4 h-4 opacity-50" />
                                                <span>Search for <span className="text-primary-600">"{query}"</span></span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                {categories.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Categories & Services</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {categories.map(cat => {
                                                let href = `/search?q=${cat.name}`;
                                                if (cat.type === 'service_category') href = `/services`;
                                                if (cat.type === 'design_category') href = `/services?tab=design`;

                                                return (
                                                    <Link
                                                        key={cat.id}
                                                        href={href}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-all group"
                                                        onClick={onClose}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-white transition-colors">
                                                            <Tag className={`w-4 h-4 ${cat.type.includes('design') ? 'text-purple-500' : 'text-neutral-500'}`} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-neutral-800">{cat.name}</span>
                                                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">{cat.type.replace('_', ' ')}</span>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Right Pane: Product Grid */}
                    <div className="flex-1 p-8 bg-neutral-50/30">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Featured Results</h3>
                            <Link href={`/search?q=${query}`} onClick={onClose} className="text-[10px] font-bold text-primary-600 hover:underline flex items-center gap-1 uppercase tracking-widest">
                                View Full Results <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-[4/5] bg-neutral-100 rounded-2xl" />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.map(item => {
                                    const isProduct = item.type === 'product';
                                    const href = isProduct ? `/products/${item.id}` : `/services/${item.id}`;

                                    return (
                                        <Link
                                            key={item.id}
                                            href={href}
                                            className="group bg-white rounded-2xl p-3 border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                            onClick={onClose}
                                        >
                                            <div className="aspect-square relative rounded-xl overflow-hidden mb-3 bg-neutral-50">
                                                {item.image && typeof item.image === 'string' && item.image.trim() !== "" ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-neutral-200" />
                                                    </div>
                                                )}
                                                {!isProduct && (
                                                    <div className="absolute top-2 right-2">
                                                        <Badge variant="secondary" className="bg-white/80 backdrop-blur text-[8px] uppercase font-black tracking-widest px-2 py-0.5 border-none">Service</Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="text-xs font-bold text-neutral-800 line-clamp-2 min-h-[32px]">{item.name}</h4>
                                            <p className="text-sm font-black text-primary-600 mt-2">৳{item.price?.toLocaleString()}</p>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center pb-12">
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                                        <Search className="w-8 h-8 text-neutral-300" />
                                    </div>
                                    <p className="text-sm font-bold text-neutral-400">Type at least 2 characters to see products</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section: Top Brands placeholder */}
                <div className="border-t border-neutral-50 px-8 py-4 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">Top Brands:</span>
                        <div className="flex gap-2">
                            {["BSRM", "Akij", "Berger", "Shah Cement"].map(brand => (
                                <button key={brand} className="px-3 py-1 rounded-full border border-neutral-100 text-[10px] font-bold text-neutral-500 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 transition-all uppercase tracking-widest">
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
