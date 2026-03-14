"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Sofa } from "lucide-react";
import Link from "next/link";
import { getL } from "@/utils/localization";
import { useLanguage } from "@/context/LanguageContext";

interface HeroItem {
    id: string;
    title: string;
    titleBn?: string;
    image: string;
    href: string;
    overlay_color?: string;
    overlay_opacity?: number;
}

interface DesignHeroProps {
    data: {
        title: string;
        titleBn?: string;
        subtitle: string;
        subtitleBn?: string;
        items: HeroItem[];
    };
}

export function DesignHero({ data }: DesignHeroProps) {
    const { language, t } = useLanguage();

    if (!data) return null;

    const iconMap: Record<string, any> = {
        structural: Building2,
        interior: Sofa
    };

    return (
        <section className="pt-8 pb-12 px-6 container mx-auto">
            <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
                <h1 className="text-2xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3 line-clamp-1">
                    {getL(data.title, data.titleBn, language)}
                </h1>
                <p className="text-neutral-500 max-w-2xl mx-auto font-medium text-xs md:text-sm leading-relaxed opacity-80 line-clamp-1">
                    {getL(data.subtitle, data.subtitleBn || "ভাবনা থেকে বাড়ি", language)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-5 px-4">
                {(data.items || []).map((item, idx) => {
                    const IconComp = iconMap[item.id] || Building2;
                    return (
                        <div
                            key={item.id}
                            className="group relative h-56 md:h-64 rounded-[24px] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-700 border border-neutral-100/50"
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                style={{ backgroundImage: `url(${item.image})` }}
                            />

                            {/* Overlay */}
                            <div
                                className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-90"
                                style={{
                                    backgroundColor: item.overlay_color || '#000000',
                                    opacity: (item.overlay_opacity || 85) / 100
                                }}
                            />

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col items-center justify-center p-5 text-center text-white">
                                <div className="mb-3 p-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    <IconComp className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold mb-3 tracking-tight text-white">
                                    {getL(item.title, item.titleBn, language)}
                                </h3>
                                <Link href={item.href}>
                                    <Button className="bg-white/20 hover:bg-white hover:text-neutral-900 text-white border border-white/40 backdrop-blur-md rounded-full px-5 py-1.5 h-auto font-bold text-[10px] tracking-wide transition-all active:scale-95">
                                        {t.design_book_service} <ArrowRight className="w-3 h-3 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
