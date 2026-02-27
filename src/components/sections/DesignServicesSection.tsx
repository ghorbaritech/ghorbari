'use client'

import { useRef } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { getL } from "@/utils/localization"
import Link from "next/link"

interface DesignServicesSectionProps {
    title?: string
    items?: any[]
    sliderCount?: number
}

const DEFAULT_ITEMS = [
    {
        id: 1,
        title: 'Architectural Design',
        titleBn: 'আর্কিটেকচারাল ডিজাইন',
        description: 'Complete building blueprints & permits',
        descriptionBn: 'বিল্ডিং ব্লুপ্রিন্ট এবং পারমিট সলিউশন',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
        rating: 4.9,
        projects: 234,
        price: 5000
    },
    {
        id: 2,
        title: 'Interior Design',
        titleBn: 'ইন্টেরিয়র ডিজাইন',
        description: 'Modern & functional space planning',
        descriptionBn: 'আধুনিক এবং কার্যকরী স্পেস প্ল্যানিং',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop',
        rating: 4.8,
        projects: 156,
        price: 25000
    },
    {
        id: 3,
        title: 'Structural Engineering',
        titleBn: 'স্ট্রাকচারাল ইঞ্জিনিয়ারিং',
        description: 'Safety analysis & load calculations',
        descriptionBn: 'নিরাপত্তা বিশ্লেষণ এবং লোড ক্যালকুলেশন',
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop',
        rating: 5.0,
        projects: 89,
        price: 12000
    },
    {
        id: 4,
        title: 'Landscape Design',
        titleBn: 'ল্যান্ডস্কেপ ডিজাইন',
        description: 'Outdoor gardens & patio planning',
        descriptionBn: 'আউটডোর গার্ডেন এবং প্যাটিও প্ল্যানিং',
        image: 'https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=600&h=400&fit=crop',
        rating: 4.7,
        projects: 112,
        price: 8000
    },
]

export function DesignServicesSection({ title = 'Design & Planning', items = [], sliderCount = 5 }: DesignServicesSectionProps) {
    const { t, language } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const rawItems = items.length > 0 ? items : DEFAULT_ITEMS
    const displayItems = rawItems.slice(0, Math.max(sliderCount, 5))

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <section className="pt-3 pb-10 bg-white">
            <div className="section-container">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-primary-950">
                            {title}
                        </h2>
                    </div>

                    <div className="flex gap-4">
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

                <div
                    ref={scrollContainerRef}
                    className="flex lg:grid lg:grid-cols-5 gap-6 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
                >
                    {displayItems.map((item) => (
                        <div key={item.id} className="min-w-[260px] lg:min-w-0 snap-center h-full">
                            <div className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden">
                                {/* Image */}
                                <div className="aspect-[4/3] relative overflow-hidden bg-neutral-100">
                                    <img
                                        src={item.image}
                                        alt={getL(item.title, item.titleBn || item.title_bn, language)}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Rating badge – top right */}
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white text-neutral-800 text-[11px] font-bold px-2 py-1 rounded-lg shadow flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                                            {item.rating || 4.9}
                                        </span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-bold text-neutral-900 text-[15px] leading-snug mb-1 line-clamp-1">
                                        {getL(item.title, item.titleBn || item.title_bn, language)}
                                    </h3>
                                    <p className="text-neutral-500 text-[12px] mb-4 line-clamp-2 leading-snug">
                                        {getL(item.description, item.descriptionBn || item.description_bn, language)}
                                    </p>

                                    {/* Footer */}
                                    <div className="mt-auto flex items-center justify-between gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">{t.lbl_starting_from}</span>
                                            <span className="text-xl font-black text-neutral-900 tracking-tight">৳{(Number(item.price) || 5000).toLocaleString(language === 'BN' ? 'bn-BD' : 'en-BD')}</span>
                                        </div>
                                        <Link href={`/services/design/book?service=${item.title.toLowerCase().split(' ')[0]}`}>
                                            <button className="bg-neutral-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-widest px-4 h-9 rounded-lg transition-colors">
                                                {t.service_book_now}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
