"use client"

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface HeroSectionProps {
    heroData?: any;
}

export function HeroSection({ heroData }: HeroSectionProps) {
    const { t, language } = useLanguage();
    const isBn = language === 'BN';

    const items = heroData?.items || [];
    const mainItem = items.find((i: any) => i.id === 'main') || {};
    const topCard = items.find((i: any) => i.id === 'top_right') || {};
    const bottomCard = items.find((i: any) => i.id === 'bottom_right') || {};

    // Helper to get text based on language
    const getText = (item: any, key: string, fallback: string) => {
        if (isBn) {
            return item[key + 'Bn'] || item[key] || fallback;
        }
        return item[key] || fallback;
    };

    return (
        <section className="bg-white pt-4 pb-2">
            <div className="section-container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:h-[400px]">

                    {/* ── Main card: Construction Marketplace (Orange) ── */}
                    <Link
                        href={mainItem.link || "/products"}
                        className="group relative lg:col-span-8 rounded-2xl overflow-hidden flex items-center transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-xl"
                        style={{ backgroundColor: mainItem.overlay_color || '#EB6841' }}
                    >
                        {/* Text content — left side */}
                        <div className="relative z-10 flex flex-col justify-center h-full px-8 py-8 md:max-w-[60%] space-y-4">
                            <span className="inline-flex items-center self-start bg-black/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-sm">
                                {getText(mainItem, 'subtitle', t.hero_badge_marketplace)}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black text-white leading-[1.0] tracking-tight whitespace-pre-line">
                                {getText(mainItem, 'title', t.hero_title_marketplace)}
                            </h1>
                            <p className="text-white/80 text-sm font-medium leading-relaxed max-w-[90%]">
                                {getText(mainItem, 'description', t.hero_desc_marketplace)}
                            </p>
                            <div className="flex items-center gap-4 pt-1">
                                <span className="bg-white text-[#EB6841] font-black text-xs uppercase tracking-widest px-6 h-11 rounded-full flex items-center justify-center group-hover:bg-slate-50 transition-all shadow-lg active:scale-95">
                                    {t.hero_btn_shop_now}
                                </span>
                                <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-all cursor-pointer">
                                    <span className="text-[11px] font-black uppercase tracking-widest">{t.hero_btn_explore}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Product image — right side, floating effect */}
                        <div className="absolute right-0 top-0 bottom-0 w-[45%] md:w-[50%] flex items-end justify-center pointer-events-none">
                            <img
                                src={mainItem.image || "/hero-materials.png"}
                                alt={mainItem.title || "Construction Materials"}
                                className="h-[110%] w-full object-contain object-bottom drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 select-none pb-4"
                                onError={(e) => { e.currentTarget.src = "/hero-materials.png"; }}
                            />
                        </div>
                    </Link>

                    {/* ── Right column: 2 stacked cards ── */}
                    <div className="lg:col-span-4 flex flex-col gap-3 h-full">

                        {/* Design & Planning (Green) */}
                        <Link
                            href={topCard.link || "/services/design"}
                            className="group relative flex-1 rounded-2xl overflow-hidden flex items-center transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-xl"
                            style={{ backgroundColor: topCard.overlay_color || '#15803d' }}
                        >
                            <div className="relative z-10 flex flex-col justify-center h-full px-6 py-5 max-w-[65%] space-y-2">
                                <span className="inline-flex items-center self-start bg-black/20 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                                    {getText(topCard, 'subtitle', t.hero_badge_design)}
                                </span>
                                <h3 className="text-xl font-black text-white leading-tight tracking-tight">
                                    {getText(topCard, 'title', t.hero_title_design)}
                                </h3>
                                <div className="flex items-center gap-1.5 text-white/70 group-hover:text-white transition-colors pt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.hero_btn_learn_more}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-[40%] flex items-end justify-center pointer-events-none">
                                <img
                                    src={topCard.image || "/hero-design.png"}
                                    alt={topCard.title || "Design Services"}
                                    className="h-[115%] w-full object-contain object-bottom drop-shadow-xl group-hover:scale-110 transition-transform duration-700 select-none pb-2"
                                    onError={(e) => { e.currentTarget.src = "/hero-design.png"; }}
                                />
                            </div>
                        </Link>

                        {/* Services (Blue) */}
                        <Link
                            href={bottomCard.link || "/services"}
                            className="group relative flex-1 rounded-2xl overflow-hidden flex items-center transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-xl"
                            style={{ backgroundColor: bottomCard.overlay_color || '#00356B' }}
                        >
                            <div className="relative z-10 flex flex-col justify-center h-full px-6 py-5 max-w-[65%] space-y-2">
                                <span className="inline-flex items-center self-start bg-black/20 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                                    {getText(bottomCard, 'subtitle', t.hero_badge_services)}
                                </span>
                                <h3 className="text-xl font-black text-white leading-tight tracking-tight">
                                    {getText(bottomCard, 'title', t.hero_title_services)}
                                </h3>
                                <div className="flex items-center gap-1.5 text-white/70 group-hover:text-white transition-colors pt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.hero_btn_learn_more}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-[40%] flex items-end justify-center pointer-events-none">
                                <img
                                    src={bottomCard.image || "/hero-services.png"}
                                    alt={bottomCard.title || "Construction Services"}
                                    className="h-[115%] w-full object-contain object-bottom drop-shadow-xl group-hover:scale-110 transition-transform duration-700 select-none pb-2"
                                    onError={(e) => { e.currentTarget.src = "/hero-services.png"; }}
                                />
                            </div>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
