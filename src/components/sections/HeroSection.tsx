"use client"

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface HeroSectionProps {
    heroData?: any;
}

export function HeroSection({ heroData }: HeroSectionProps) {
    const { t } = useLanguage();

    return (
        <section className="bg-white pt-4 pb-2">
            <div className="section-container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:h-[400px]">

                    {/* ── Main card: Construction Marketplace (Orange) ── */}
                    <Link
                        href="/products"
                        className="group relative lg:col-span-8 rounded-2xl overflow-hidden flex items-center bg-[#EB6841] transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        {/* Text content — left side */}
                        <div className="relative z-10 flex flex-col justify-center h-full px-8 py-8 max-w-[55%] space-y-4">
                            <span className="inline-flex items-center self-start bg-black/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-sm">
                                {t.hero_badge_marketplace}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black text-white leading-[1.1] tracking-tight whitespace-pre-line">
                                {t.hero_title_marketplace}
                            </h1>
                            <p className="text-white/80 text-sm font-medium leading-relaxed">
                                {t.hero_desc_marketplace}
                            </p>
                            <div className="flex items-center gap-4 pt-1">
                                <span className="bg-white text-[#EB6841] font-black text-xs uppercase tracking-widest px-5 h-10 rounded-full flex items-center justify-center group-hover:bg-black/10 group-hover:text-white transition-all">
                                    {t.hero_btn_shop_now}
                                </span>
                                <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.hero_btn_explore}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Product image — right side, floating effect */}
                        <div className="absolute right-0 top-0 bottom-0 w-[50%] flex items-end justify-center overflow-hidden">
                            <img
                                src="/hero-materials.png"
                                alt="Construction Materials"
                                className="h-[115%] object-contain object-bottom drop-shadow-2xl group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </Link>

                    {/* ── Right column: 2 stacked cards ── */}
                    <div className="lg:col-span-4 flex flex-col gap-3 h-full">

                        {/* Design & Planning (Green) */}
                        <Link
                            href="/services/design"
                            className="group relative flex-1 rounded-2xl overflow-hidden flex items-center bg-[#15803d] transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            <div className="relative z-10 flex flex-col justify-center h-full px-5 py-5 max-w-[60%] space-y-2">
                                <span className="inline-flex items-center self-start bg-black/20 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                                    {t.hero_badge_design}
                                </span>
                                <h3 className="text-lg font-black text-white leading-tight tracking-tight">
                                    {t.hero_title_design}
                                </h3>
                                <div className="flex items-center gap-1.5 text-white/70 group-hover:text-white transition-colors pt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.hero_btn_learn_more}</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-[45%] flex items-end justify-center overflow-hidden">
                                <img
                                    src="/hero-design.png"
                                    alt="Design Services"
                                    className="h-[120%] object-contain object-bottom drop-shadow-xl group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </Link>

                        {/* Services (Blue) */}
                        <Link
                            href="/services"
                            className="group relative flex-1 rounded-2xl overflow-hidden flex items-center bg-[#00356B] transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            <div className="relative z-10 flex flex-col justify-center h-full px-5 py-5 max-w-[60%] space-y-2">
                                <span className="inline-flex items-center self-start bg-black/20 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                                    {t.hero_badge_services}
                                </span>
                                <h3 className="text-lg font-black text-white leading-tight tracking-tight">
                                    {t.hero_title_services}
                                </h3>
                                <div className="flex items-center gap-1.5 text-white/70 group-hover:text-white transition-colors pt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.hero_btn_learn_more}</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-[45%] flex items-end justify-center overflow-hidden">
                                <img
                                    src="/hero-services.png"
                                    alt="Construction Services"
                                    className="h-[120%] object-contain object-bottom drop-shadow-xl group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
