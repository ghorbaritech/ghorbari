'use client'

import { useRef, useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wrench, ShieldCheck, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { getL } from "@/utils/localization"
import { getSubcategoriesByParentId, Category } from "@/services/categoryService"
import Link from 'next/link'
import { ServiceCard } from '@/components/ui/ServiceCard'
import { useServiceCart } from '@/context/ServiceCartContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
    const { addService, clearCart, items: selectedItems, removeService } = useServiceCart()
    const router = useRouter()
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
                if (!category) return;
                let results: any[] = [];
                // Support both UUIDs and category names
                results = await getSubcategoriesByParentId(category);
                console.log(`[ServiceShowcase] SUCCESS for: ${category} (Found ${results.length} subcategories)`);
                setFetchedItems(results);
            } catch (err: any) {
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
        <section className={`py-8 ${bgClass}`}>
            <div className="section-container">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-primary-950">
                            {displayTitle}
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
                    className="flex lg:grid lg:grid-cols-5 gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar"
                >
                    {loading ? (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-neutral-200">
                            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-6" />
                            <p className="text-primary-950/60 font-black uppercase tracking-[0.2em] text-xs">{t.services_loading}</p>
                        </div>
                    ) : visibleItems.map((item, idx) => {
                        const itemName = item.name_bn && language === 'BN' ? item.name_bn : (item.name || item.title);
                        // Map image from category icon/icon_url, with fallback
                        const itemImage = item.icon_url || item.icon || item.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop';
                        // Extract price from metadata block or fallback based on parent naming
                        const itemPrice = item.metadata?.price || item.unit_price || item.price || 500;
                        const itemUnit = item.metadata?.unit || item.unit_type || item.unit || 'sqft';

                        // Check if it's actually a category vs old legacy item
                        const isCategory = item.type === 'service';
                        const linkId = isCategory ? `category/${item.id}` : item.id;

                        return (
                            <div key={idx} className="min-w-[240px] lg:min-w-0 snap-center h-full">
                                <ServiceCard
                                    id={linkId}
                                    name={item.name || item.title}
                                    nameBn={item.name_bn}
                                    price={itemPrice}
                                    image={itemImage}
                                    rating={item.rating || 4.8}
                                    category={item.parent?.name || "Subcategory"}
                                    unitType={itemUnit}
                                    onToggle={() => {
                                        const isSelected = selectedItems.some(i => i.id === item.id);
                                        if (isSelected) {
                                            removeService(item.id);
                                            toast.info(`${itemName} removed from booking`);
                                        } else {
                                            const pseudoService = {
                                                id: item.id,
                                                category_id: category || 'service_category',
                                                name: item.name,
                                                name_bn: item.name_bn,
                                                description: '',
                                                description_bn: '',
                                                unit_price: itemPrice,
                                                unit_type: itemUnit,
                                                image_url: itemImage,
                                                is_active: true,
                                                category: {
                                                    name: item.parent?.name || "Subcategory",
                                                    name_bn: item.parent?.name_bn || "",
                                                }
                                            };
                                            addService(pseudoService as any);
                                            toast.success(`${itemName} ready for booking`);
                                            router.push('/services/booking');
                                        }
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}
