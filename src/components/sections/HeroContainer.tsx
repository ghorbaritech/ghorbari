"use client"

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface HeroContainerProps {
    title?: string;
    items?: any[];
}

export function HeroContainer({ title, items = [] }: HeroContainerProps) {
    const { t } = useLanguage();

    // We expect exactly 3 items. If less, we can't fully render the layout, but we'll try to degrade gracefully
    if (!items || items.length === 0) return null;

    const mainItem = items[0];
    const topCard = items[1];
    const bottomCard = items[2];

    return (
        <section className="bg-white pt-4 pb-2">
            <div className="section-container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:h-[400px]">

                    {/* ── Main card (Left) ── */}
                    {mainItem && (
                        <Link
                            href={mainItem.link || '#'}
                            className="group relative lg:col-span-8 rounded-2xl overflow-hidden flex items-center bg-[#EB6841] transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            {/* Text content — left side */}
                            <div className="relative z-10 flex flex-col justify-center h-full px-8 py-8 max-w-[55%] space-y-4">
                                {mainItem.subtitle && (
                                    <span className="inline-flex items-center self-start bg-black/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-sm">
                                        {mainItem.subtitle}
                                    </span>
                                )}
                                <h1 className="text-3xl md:text-4xl font-black text-white leading-[1.1] tracking-tight whitespace-pre-line">
                                    {mainItem.title}
                                </h1>
                                <p className="text-white/80 text-sm font-medium leading-relaxed">
                                    {mainItem.description}
                                </p>
                                <div className="flex items-center gap-4 pt-1">
                                    <span className="bg-white text-[#EB6841] font-black text-xs uppercase tracking-widest px-5 h-10 rounded-full flex items-center justify-center group-hover:bg-black/10 group-hover:text-white transition-all">
                                        Shop Now
                                    </span>
                                    <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Explore</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>

                            {/* Product image — right side, floating effect */}
                            <div className="absolute right-0 top-0 bottom-0 w-[50%] flex items-end justify-center overflow-hidden">
                                {mainItem.image && (
                                    <img
                                        src={mainItem.image}
                                        alt={mainItem.title}
                                        className="h-[115%] object-contain object-bottom drop-shadow-2xl group-hover:scale-105 transition-transform duration-700"
                                    />
                                )}
                            </div>
                        </Link>
                    )}

                    {/* ── Right column: 2 stacked cards ── */}
                    <div className="lg:col-span-4 flex flex-col gap-3 h-full">

                        {/* Top Card */}
                        {topCard && (
                            <Link
                                href={topCard.link || '#'}
                                className="group relative flex-1 rounded-2xl overflow-hidden flex items-center bg-[#15803d] transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-xl"
                            >
                                <div className="relative z-10 flex flex-col justify-center h-full px-5 py-5 max-w-[60%] space-y-2">
                                    {topCard.subtitle && (
                                        <span className="inline-flex items-center self-start bg-black/20 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                                            {topCard.subtitle}
                                        </span>
                                    )}
                                    <h3 className="text-lg font-black text-white leading-tight tracking-tight">
                                        {topCard.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-white/70 group-hover:text-white transition-colors pt-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Learn More</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                                <div className="absolute right-0 top-0 bottom-0 w-[45%] flex items-end justify-center overflow-hidden">
                                    {topCard.image && (
                                        <img
                                            src={topCard.image}
                                            alt={topCard.title}
                                            className="h-[120%] object-contain object-bottom drop-shadow-xl group-hover:scale-105 transition-transform duration-700"
                                        />
                                    )}
                                </div>
                            </Link>
                        )}

                        {/* Bottom Card */}
                        {bottomCard && (
                            <Link
                                href={bottomCard.link || '#'}
                                className="group relative flex-1 rounded-2xl overflow-hidden flex items-center bg-[#00356B] transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-xl"
                            >
                                <div className="relative z-10 flex flex-col justify-center h-full px-5 py-5 max-w-[60%] space-y-2">
                                    {bottomCard.subtitle && (
                                        <span className="inline-flex items-center self-start bg-black/20 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                                            {bottomCard.subtitle}
                                        </span>
                                    )}
                                    <h3 className="text-lg font-black text-white leading-tight tracking-tight">
                                        {bottomCard.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-white/70 group-hover:text-white transition-colors pt-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Learn More</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                                <div className="absolute right-0 top-0 bottom-0 w-[45%] flex items-end justify-center overflow-hidden">
                                    {bottomCard.image && (
                                        <img
                                            src={bottomCard.image}
                                            alt={bottomCard.title}
                                            className="h-[120%] object-contain object-bottom drop-shadow-xl group-hover:scale-105 transition-transform duration-700"
                                        />
                                    )}
                                </div>
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
}
