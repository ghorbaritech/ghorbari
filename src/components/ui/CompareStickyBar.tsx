"use client";

import { useCompare } from "@/context/CompareContext";
import { X, ArrowRight, GitCompare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function CompareStickyBar() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (compareList.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom duration-300">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    <div className="flex items-center gap-2 text-neutral-900 font-black uppercase tracking-widest text-xs min-w-max">
                        <GitCompare className="w-4 h-4" />
                        Compare ({compareList.length}/4)
                    </div>

                    <div className="flex items-center gap-3">
                        {compareList.map((product) => (
                            <div key={product.id} className="relative group w-12 h-12 bg-neutral-50 rounded-lg border border-neutral-200 flex-shrink-0">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => removeFromCompare(product.id)}
                                    className="absolute -top-2 -right-2 bg-neutral-900 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCompare}
                        className="text-neutral-500 hover:text-rose-600 font-bold uppercase text-[10px] tracking-widest"
                    >
                        Clear All
                    </Button>
                    <Link href="/compare">
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 shadow-lg shadow-primary-200">
                            Compare Now <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
