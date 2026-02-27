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
    { name: "Building Materials", nameBn: "নির্মাণ সামগ্রী", icon: "BrickWall" },
    { name: "Steel & Rods", nameBn: "স্টিল ও রড", icon: "Hammer" },
    { name: "Paints & Finishes", nameBn: "পেইন্ট ও ফিনিশ", icon: "PaintBucket" },
    { name: "Tools & Hardware", nameBn: "সরঞ্জাম ও হার্ডওয়্যার", icon: "Wrench" },
    { name: "Electrical", nameBn: "বৈদ্যুতিক", icon: "Lightbulb" },
    { name: "Plumbing", nameBn: "প্লাম্বিং", icon: "Droplets" },
    { name: "Safety Gear", nameBn: "নিরাপত্তা সরঞ্জাম", icon: "HardHat" },
    { name: "View All", nameBn: "সব দেখুন", icon: "LayoutGrid" },
];

import { useLanguage } from '@/context/LanguageContext';

export function IconCategories({ items = [], title = "Explore Categories" }: IconCategoriesProps) {
    const { language, t } = useLanguage();
    const displayItems = items.length > 0 ? items : DEFAULT_CATEGORIES;

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: false,
        skipSnaps: false,
        dragFree: true
    });

    return (
        <section className="pt-3 pb-6 bg-white border-t border-neutral-100">
            <div className="section-container">
                <h2 className="text-lg font-semibold text-primary-950 mb-5 px-2">
                    {title}
                </h2>

                {/* Carousel with flanking arrows */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => emblaApi?.scrollPrev()}
                        className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-primary-950 hover:border-primary-950 transition-all shadow-sm"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="overflow-hidden flex-1" ref={emblaRef}>
                        <div className="flex -ml-3 touch-pan-y py-2">
                            {displayItems.map((cat: any, idx: number) => (
                                <div key={idx} className="flex-[0_0_40%] sm:flex-[0_0_25%] md:flex-[0_0_18%] lg:flex-[0_0_14.28%] pl-3">
                                    <Link
                                        href={`/products?category=${cat.name}`}
                                        className="flex flex-col items-center gap-3 group cursor-pointer"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary-100">
                                            {cat.icon && (typeof cat.icon === 'string' && (cat.icon.startsWith('http') || cat.icon.startsWith('/'))) ? (
                                                <img src={cat.icon} alt={cat.name} className="w-9 h-9 object-contain" />
                                            ) : (
                                                <DynamicIcon name={cat.icon || "LayoutGrid"} className="w-9 h-9 text-primary-950" />
                                            )}
                                        </div>
                                        <span className="text-[12px] font-semibold text-neutral-600 group-hover:text-primary-950 text-center transition-colors max-w-full leading-tight">
                                            {(language === 'BN' && (cat.nameBn || cat.name_bn)) ? (cat.nameBn || cat.name_bn) : cat.name}
                                        </span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => emblaApi?.scrollNext()}
                        className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-primary-950 hover:border-primary-950 transition-all shadow-sm"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
