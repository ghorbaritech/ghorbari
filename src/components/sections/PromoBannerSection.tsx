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
        subtitle_bn: "কালিটি গ্যারান্টি",
        image_url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=400&fit=crop", // Modern sofa/living room
        link_url: "#"
    },
    {
        title: "The one app for everything",
        title_bn: "সবকিছুর জন্য একটি অ্যাপ",
        subtitle: "Price alerts and exclusive offers",
        subtitle_bn: "প্রাইস অ্যালার্ট এবং এক্সক্লুসিভ অফার",
        image_url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop", // Nice modern interior
        link_url: "#"
    },
    {
        title: "The ones you love",
        title_bn: "আপনার পছন্দের জিনিস",
        subtitle: "Trusted, durable and loved",
        subtitle_bn: "নির্ভরযোগ্য, টেকসই এবং প্রিয়",
        image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop", // Cozy room
        link_url: "#"
    }
]

export function PromoBannerSection({ title, banners = [] }: PromoBannerSectionProps) {
    const { language, t } = useLanguage()
    const displayBanners = banners.length > 0 ? banners : DEFAULT_BANNERS

    // Ensure we have 3 items for the layout
    const filledBanners = [
        displayBanners[0] || DEFAULT_BANNERS[0],
        displayBanners[1] || DEFAULT_BANNERS[1],
        displayBanners[2] || DEFAULT_BANNERS[2],
    ]

    return (
        <section className="py-12 container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-black tracking-tight text-neutral-900 mb-6">
                {title || t.offer_title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filledBanners.map((banner, index) => (
                    <Link
                        href={banner.link_url || '#'}
                        key={index}
                        className="group relative overflow-hidden rounded-[24px] bg-[#1e2746] h-[180px] flex transition-all hover:translate-y-[-4px] hover:shadow-xl"
                    >
                        {/* Left Side: Content */}
                        <div className="relative z-10 p-6 w-[55%] flex flex-col justify-between h-full bg-[#1e2746]">
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-white leading-tight mb-1">
                                    {getL(banner.title, banner.title_bn, language)}
                                </h3>
                                <p className="text-blue-100/90 text-[10px] font-bold leading-normal uppercase tracking-wide">
                                    {getL(banner.subtitle, banner.subtitle_bn, language)}
                                </p>
                            </div>

                            {/* Optional Badge for first item or specific condition */}
                            {index === 0 && (
                                <div className="inline-block mt-4 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                        {language === 'BN' ? "গুরবাড়ী পছন্দ" : "Ghorbari Choice"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Image */}
                        <div className="absolute right-0 top-0 bottom-0 w-[45%] bg-neutral-100 overflow-hidden">
                            {banner.image_url ? (
                                <img
                                    src={banner.image_url}
                                    alt={banner.title || "Promo"}
                                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-200" />
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
