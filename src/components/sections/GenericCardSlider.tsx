"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Card } from "@/components/ui/card";

interface GenericCardSliderProps {
    title: string;
    items?: any[];
    bgClass?: string;
}

export function GenericCardSlider({ title, items = [], bgClass = "bg-white" }: GenericCardSliderProps) {
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

    if (!items || items.length === 0) return null;

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
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex lg:grid lg:grid-cols-5 gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar"
                >
                    {items.map((item, idx) => (
                        <Link key={item.id || idx} href={item.link || '#'} className="min-w-[240px] lg:min-w-0 snap-center h-full group block">
                            <Card className="h-full border border-neutral-100 shadow-sm hover:shadow-xl transition-all rounded-[1.5rem] overflow-hidden flex flex-col bg-white">
                                <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                                    <img
                                        src={item.image || '/images/placeholders/product.jpg'}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/placeholders/product.jpg';
                                        }}
                                    />
                                </div>
                                <div className="p-4 flex flex-col items-center text-center space-y-2 mt-auto">
                                    <h3 className="font-bold text-neutral-900 line-clamp-2 text-sm">
                                        {item.title}
                                    </h3>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
