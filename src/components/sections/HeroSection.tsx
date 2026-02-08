"use client"

import { ArrowRight, ShoppingBag, PencilRuler, Wrench } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export function HeroSection() {
    const { t } = useLanguage();

    const mainBanner = {
        title: t.hero_banner_main_title,
        subtitle: t.hero_banner_main_subtitle,
        tag: "WHOLSALE",
        desc: t.hero_banner_main_desc,
        icon: ShoppingBag,
        overlay: "bg-[#8b3012]/75",
        tagColor: "bg-white/20 backdrop-blur-sm",
        href: "/products",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop"
    };

    const sideBanners = [
        {
            title: t.hero_banner_design_title,
            subtitle: t.hero_banner_design_subtitle,
            desc: t.hero_banner_design_desc,
            icon: PencilRuler,
            overlay: "bg-[#166534]/75", // Green-800 overlay
            href: "/services/design",
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: t.hero_banner_service_title,
            subtitle: t.hero_banner_service_subtitle,
            desc: t.hero_banner_service_desc,
            icon: Wrench,
            overlay: "bg-[#1d2d5c]/75",
            href: "/services",
            image: "https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=800&auto=format&fit=crop"
        }
    ];

    return (
        <section className="bg-white pt-8 pb-2">
            <div className="container mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Large Featured Card - Left Side */}
                    <Link
                        href={mainBanner.href}
                        className="group relative flex flex-col justify-between lg:col-span-2 h-72 lg:h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    >
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                            style={{ backgroundImage: `url(${mainBanner.image})` }}
                        />

                        {/* Color Overlay */}
                        <div className={`absolute inset-0 ${mainBanner.overlay} transition-opacity duration-300 group-hover:opacity-95`} />

                        {/* Content */}
                        <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                        {mainBanner.subtitle}
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight whitespace-pre-line">
                                        {mainBanner.title}
                                    </h2>
                                </div>
                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-full">
                                    <mainBanner.icon className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-bold text-white/90">{mainBanner.desc}</p>
                                <div className="flex items-center gap-2 text-white">
                                    <span className="text-xs font-bold uppercase tracking-widest">{t.offer_shop_now}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Smaller Cards - Right Side Stacked */}
                    <div className="flex flex-col gap-6">
                        {sideBanners.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className="group relative flex flex-col justify-between h-32 lg:h-[calc(50%-0.75rem)] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                />

                                {/* Color Overlay */}
                                <div className={`absolute inset-0 ${item.overlay} transition-opacity duration-300 group-hover:opacity-90`} />

                                {/* Content */}
                                <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <span className="inline-block text-white/70 text-[9px] font-bold uppercase tracking-widest">
                                                {item.subtitle}
                                            </span>
                                            <h3 className="text-lg font-black text-white leading-tight tracking-tight">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-full">
                                            <item.icon className="w-4 h-4 text-white" />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs font-bold text-white/90">
                                        <span className="text-[10px]">{item.desc}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
