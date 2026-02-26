'use client'

import { useRef, useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wrench, ShieldCheck, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { getL } from "@/utils/localization"
import { getServiceItems, ServiceItem } from "@/services/serviceItemService"
import Link from 'next/link'

interface ServiceShowcaseProps {
    title?: string
    items?: any[]
    category?: string
    bgClass?: string
}

const DEFAULT_SERVICES = [
    { title: 'Electrical Wiring', titleBn: 'ইলেকট্রিক্যাল ওয়্যারিং', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop', price: 1500 },
    { title: 'Plumbing Solutions', titleBn: 'প্লাম্বিং সমাধান', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop', price: 1200 },
    { title: 'Paint & Polishing', titleBn: 'রঙ এবং পলিশিং', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop', price: 2500 },
    { title: 'Sanitary Installation', titleBn: 'স্যানিটারি ইন্সটলেশন', image: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=600&h=400&fit=crop', price: 1800 },
]

export function ServiceShowcase({ title, items = [], category, bgClass = "bg-blue-50" }: ServiceShowcaseProps) {
    const { t, language } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [fetchedItems, setFetchedItems] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const processedCategory = useRef<string | symbol>(Symbol('init'))

    useEffect(() => {
        // Guard: If we already have items from props, stop.
        if (items && items.length > 0) {
            setLoading(false);
            return;
        }

        // Use a ref to ensure this only runs once per category
        if (processedCategory.current === (category ?? 'NULL_CAT')) {
            return;
        }

        console.log(`[ServiceShowcase] FETCH START for: ${category}`);
        setLoading(true);
        processedCategory.current = category ?? 'NULL_CAT';

        // Unconditional safety timeout
        const timer = setTimeout(() => {
            console.warn(`[ServiceShowcase] TIMEOUT for: ${category}`);
            setLoading(false);
        }, 12000);

        const isUUID = category ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category) : false;

        async function doFetch() {
            try {
                const data = await getServiceItems(isUUID ? category : undefined);
                console.log(`[ServiceShowcase] SUCCESS for: ${category} (Found ${data.length})`);

                let results = data;
                if (category && !isUUID) {
                    results = data.filter(item =>
                        item.category?.name === category ||
                        item.category?.name_bn === category
                    );
                    console.log(`[ServiceShowcase] FILTER result for ${category}: ${results.length}`);
                }

                setFetchedItems(results);
            } catch (err) {
                console.error(`[ServiceShowcase] ERROR for: ${category}`, err);
            } finally {
                clearTimeout(timer);
                setLoading(false);
                console.log(`[ServiceShowcase] LOADING SET TO FALSE for: ${category}`);
            }
        }

        doFetch();
    }, [category, items])

    const displayItems = items.length > 0 ? items : (fetchedItems.length > 0 ? fetchedItems : DEFAULT_SERVICES)
    const visibleItems = displayItems.slice(0, 10) // Show up to 10 in slider

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    const displayTitle = title || t.service_booking_title;

    return (
        <section className={`py-12 ${bgClass} relative`}>
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-end mb-8">
                    <div className="space-y-1">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                            <Wrench className="w-3 h-3" />
                            {t.service_verified_pros}
                        </span>
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">
                            {displayTitle}
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
                    {loading ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/50 rounded-3xl">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                            <p className="text-blue-900/60 font-bold uppercase tracking-widest text-[10px]">{t.services_loading}</p>
                        </div>
                    ) : visibleItems.map((item, idx) => {
                        const itemName = item.name_bn && language === 'BN' ? item.name_bn : (item.name || item.title);
                        const itemDescription = item.description_bn && language === 'BN' ? item.description_bn : (item.description || t.service_expert_desc.replace('{service}', itemName.toLowerCase()));
                        const itemImage = item.image_url || item.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop';
                        const itemPrice = item.unit_price || item.price || 2500;
                        const itemUnit = item.unit_type || item.unit || 'sqft';

                        return (
                            <div key={idx} className="min-w-[260px] lg:min-w-0 snap-center h-full">
                                <Card className="border border-neutral-100 bg-white rounded-xl overflow-hidden h-full hover:shadow-lg transition-all duration-300 group flex flex-col">
                                    <div className="aspect-[4/3] relative overflow-hidden bg-neutral-100">
                                        <img
                                            src={itemImage}
                                            alt={itemName}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded px-2 py-1 flex items-center gap-1 text-[10px] font-bold shadow-sm">
                                            <ShieldCheck className="w-3 h-3 text-blue-600 fill-current" />
                                            {t.service_verified_label}
                                        </div>
                                    </div>
                                    <div className="p-3 flex flex-col flex-grow">
                                        <h3 className="text-sm font-bold text-neutral-900 leading-tight mb-1 line-clamp-1">
                                            {itemName}
                                        </h3>
                                        <p className="text-neutral-500 text-[10px] font-medium mb-2 line-clamp-2 min-h-[2.5em]">
                                            {itemDescription}
                                        </p>

                                        <div className="mt-auto pt-3 border-t border-neutral-50 flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-neutral-400 text-[9px] font-bold uppercase tracking-wide">{t.lbl_starting_from}</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-sm font-black text-neutral-900">৳{itemPrice.toLocaleString()}</span>
                                                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">/ {itemUnit}</span>
                                                </div>
                                            </div>
                                            <Link href="/services">
                                                <Button size="sm" className="rounded-lg font-bold text-[10px] uppercase bg-neutral-900 hover:bg-neutral-800 text-white h-8 px-4 shadow-sm">
                                                    {t.service_book_now}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}
