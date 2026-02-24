'use client'

import { useRef } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
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
            const scrollAmount = 300
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <section className="pt-4 pb-12 bg-white text-neutral-900 relative">
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-end mb-8">
                    <div className="space-y-1">
                        <span className="text-primary-600 font-bold tracking-widest text-xs uppercase">{language === 'BN' ? 'বিশেষজ্ঞ পরামর্শ' : 'Expert Consultation'}</span>
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                            {title}
                        </h2>
                    </div>

                    <div className="flex gap-2 lg:hidden">
                        <Button onClick={() => scroll('left')} variant="outline" size="icon" className="rounded-full border-neutral-200 hover:bg-neutral-100 hover:text-black">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button onClick={() => scroll('right')} variant="outline" size="icon" className="rounded-full border-neutral-200 hover:bg-neutral-100 hover:text-black">
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {displayItems.map((item) => (
                        <div key={item.id} className="min-w-[260px] lg:min-w-0 snap-center h-full">
                            <Card className="border border-neutral-100 bg-white rounded-xl overflow-hidden h-full hover:shadow-lg transition-all duration-300 group flex flex-col">
                                <div className="aspect-[4/3] relative overflow-hidden bg-neutral-100">
                                    <img
                                        src={item.image}
                                        alt={getL(item.title, item.titleBn || item.title_bn, language)}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded px-2 py-1 flex items-center gap-1 text-[10px] font-bold shadow-sm">
                                        <svg className="w-3 h-3 text-orange-500 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {item.rating || 4.9}
                                    </div>
                                </div>
                                <div className="p-3 flex flex-col flex-grow">
                                    <h3 className="text-sm font-bold text-neutral-900 leading-tight mb-1 line-clamp-1">
                                        {getL(item.title, item.titleBn || item.title_bn, language)}
                                    </h3>
                                    <p className="text-neutral-500 text-[10px] font-medium mb-2 line-clamp-2 min-h-[2.5em]">
                                        {getL(item.description, item.descriptionBn || item.description_bn, language)}
                                    </p>

                                    <div className="mt-auto pt-3 border-t border-neutral-50 flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-neutral-400 text-[9px] font-bold uppercase tracking-wide">{t.lbl_starting_from}</span>
                                            <span className="text-base font-black text-neutral-900">৳{item.price || 5000}</span>
                                        </div>
                                        <Link href={`/services/design/book?service=${item.title.toLowerCase().split(' ')[0]}`}>
                                            <Button size="sm" className="rounded-lg font-bold text-[10px] uppercase bg-neutral-900 hover:bg-neutral-800 text-white h-8 px-4 shadow-sm">
                                                {t.service_book_now}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
