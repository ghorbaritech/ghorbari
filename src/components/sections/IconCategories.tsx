'use client'


import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
interface IconCategoriesProps {
    items?: any[];
    title?: string;
}

const DEFAULT_CATEGORIES = [
    { name: "Building Materials", icon: "BrickWall" },
    { name: "Steel & Rods", icon: "Hammer" },
    { name: "Paints & Finishes", icon: "PaintBucket" },
    { name: "Tools & Hardware", icon: "Wrench" },
    { name: "Electrical", icon: "Lightbulb" },
    { name: "Plumbing", icon: "Droplets" },
    { name: "Safety Gear", icon: "HardHat" },
    { name: "View All", icon: "LayoutGrid" },
];

import { useLanguage } from '@/context/LanguageContext';

export function IconCategories({ items = [], title = "Explore Categories" }: IconCategoriesProps) {
    const { language } = useLanguage();
    const displayItems = items.length > 0 ? items : DEFAULT_CATEGORIES;

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: false,
        skipSnaps: false,
        dragFree: true
    });

    return (
        <section className="pt-8 pb-2 bg-white border-b border-neutral-100">
            <div className="container mx-auto px-8">
                <div className="relative group/carousel">
                    {/* Left Navigation */}
                    <button
                        onClick={() => emblaApi?.scrollPrev()}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 hover:text-black hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="overflow-hidden cursor-grab active:cursor-grabbing mx-4" ref={emblaRef}>
                        <div className="flex -ml-4 touch-pan-y py-4">
                            {displayItems.map((cat: any, idx: number) => (
                                <div key={idx} className="flex-[0_0_22%] min-w-0 pl-4 sm:flex-[0_0_16%] md:flex-[0_0_12.5%] lg:flex-[0_0_10%]">
                                    <Link href={`/products?category=${cat.name}`} className="flex flex-col items-center gap-3 group">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400
                                            transition-all duration-300 ease-out
                                            group-hover:bg-white group-hover:text-primary-600 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] group-hover:-translate-y-1
                                            border border-neutral-100 relative z-0">

                                            {cat.icon && (typeof cat.icon === 'string' && (cat.icon.startsWith('http') || cat.icon.startsWith('/'))) ? (
                                                <img src={cat.icon} alt={cat.name} className="w-8 h-8 sm:w-9 sm:h-9 object-contain opacity-60 group-hover:opacity-100 transition-all" />
                                            ) : (
                                                <DynamicIcon name={cat.icon || "LayoutGrid"} className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" />
                                            )}

                                        </div>
                                        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 group-hover:text-primary-700 text-center transition-colors line-clamp-2 max-w-[100px] leading-tight">
                                            {(language === 'BN' && cat.name_bn) ? cat.name_bn : cat.name}
                                        </span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Navigation */}
                    <button
                        onClick={() => emblaApi?.scrollNext()}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 hover:text-black hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
