'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { getL } from '@/utils/localization'

interface PromoBannerSectionProps {
    title?: string
    banners?: any[]
}

const DEFAULT_BANNERS = [
    {
        title: "Expert-Selected, fast delivered",
        title_bn: "বিশেষজ্ঞ দ্বারা নির্বাচিত, দ্রুত ডেলিভারি",
        subtitle: "Quality Guarantee",
        subtitle_bn: "মানের নিশ্চয়তা",
        badge: "Top Picks",
        image_url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=400&fit=crop",
        link_url: "/products",
        // deep navy blue
        bg: "bg-[#0f172a]",
        accent: "bg-white/10",
    },
    {
        title: "The one app for everything",
        title_bn: "সবকিছুর জন্য একটি অ্যাপ",
        subtitle: "Price alerts and exclusive offers",
        subtitle_bn: "প্রাইস অ্যালার্ট ও বিশেষ অফার",
        badge: "New",
        image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop",
        link_url: "/services",
        // deep burnt orange
        bg: "bg-[#c2410c]",
        accent: "bg-white/10",
    },
    {
        title: "The ones you love",
        title_bn: "আপনার পছন্দের জিনিস",
        subtitle: "Trusted, durable and loved",
        subtitle_bn: "নির্ভরযোগ্য, টেকসই ও প্রিয়",
        badge: "Best Value",
        image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop",
        link_url: "/products",
        // dark forest green
        bg: "bg-[#14532d]",
        accent: "bg-white/10",
    }
]

export function PromoBannerSection({ title, banners = [] }: PromoBannerSectionProps) {
    const { language, t } = useLanguage()
    const displayBanners = banners.length > 0 ? banners : DEFAULT_BANNERS

    const filledBanners = [
        { ...DEFAULT_BANNERS[0], ...displayBanners[0] },
        { ...DEFAULT_BANNERS[1], ...displayBanners[1] },
        { ...DEFAULT_BANNERS[2], ...displayBanners[2] },
    ]

    return (
        <section className="py-5 bg-white">
            <div className="section-container">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                        {title || t.offer_title || "Our current deals"}
                    </p>
                    <Link href="/offers" className="hidden md:flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors text-xs font-bold">
                        View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Banner Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filledBanners.map((banner, index) => (
                        <Link
                            href={banner.link_url || '#'}
                            key={index}
                            className={`group relative h-[200px] rounded-2xl overflow-hidden flex transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${banner.bg || 'bg-[#0f172a]'}`}
                        >
                            {/* Background image (right side, faded) */}
                            {banner.image_url && (
                                <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-10" />
                                    <img
                                        src={banner.image_url}
                                        alt={banner.title || "Promo"}
                                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="relative z-20 p-6 flex flex-col justify-between h-full w-[65%]">
                                <div className="space-y-2">
                                    {/* Badge */}
                                    <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                                        {banner.badge || "Offer"}
                                    </div>
                                    {/* Title */}
                                    <h3 className="text-xl font-black text-white leading-tight">
                                        {getL(banner.title, banner.title_bn, language)}
                                    </h3>
                                    {/* Subtitle */}
                                    <p className="text-white/70 text-[11px] font-medium leading-snug">
                                        {getL(banner.subtitle, banner.subtitle_bn, language)}
                                    </p>
                                </div>

                                {/* CTA */}
                                <div className="flex items-center gap-1.5 text-white group-hover:gap-3 transition-all duration-300">
                                    <span className="text-[11px] font-black uppercase tracking-wider">
                                        {language === 'BN' ? 'দেখুন' : 'Explore'}
                                    </span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
