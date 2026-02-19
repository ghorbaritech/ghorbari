'use client'

import { useRef } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wrench, ShieldCheck, Clock, ChevronLeft, ChevronRight } from "lucide-react"

interface ServiceShowcaseProps {
    title?: string
    items?: any[]
}

const DEFAULT_SERVICES = [
    { title: 'Electrical Wiring', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop' },
    { title: 'Plumbing Solutions', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop' },
    { title: 'Paint & Polishing', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop' },
    { title: 'Sanitary Installation', image: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=600&h=400&fit=crop' },
]

export function ServiceShowcase({ title = 'Professional Services', items = [] }: ServiceShowcaseProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const displayItems = items.length > 0 ? items : DEFAULT_SERVICES
    // Show 5 items by default to match the design grid
    const visibleItems = displayItems.slice(0, 5)

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
        <section className="py-12 bg-blue-50 relative">
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-end mb-8">
                    <div className="space-y-1">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                            <Wrench className="w-3 h-3" />
                            Verified Pros
                        </span>
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">
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
                    {visibleItems.map((item, idx) => (
                        <div key={idx} className="min-w-[260px] lg:min-w-0 snap-center h-full">
                            <Card className="border border-neutral-100 bg-white rounded-xl overflow-hidden h-full hover:shadow-lg transition-all duration-300 group flex flex-col">
                                <div className="aspect-[4/3] relative overflow-hidden bg-neutral-100">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded px-2 py-1 flex items-center gap-1 text-[10px] font-bold shadow-sm">
                                        <ShieldCheck className="w-3 h-3 text-blue-600 fill-current" />
                                        Verified
                                    </div>
                                </div>
                                <div className="p-3 flex flex-col flex-grow">
                                    <h3 className="text-sm font-bold text-neutral-900 leading-tight mb-1 line-clamp-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-neutral-500 text-[10px] font-medium mb-2 line-clamp-2 min-h-[2.5em]">
                                        Expert professionals ready to help with your {item.title.toLowerCase()} needs.
                                    </p>

                                    <div className="mt-auto pt-3 border-t border-neutral-50 flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-neutral-400 text-[9px] font-bold uppercase tracking-wide">Starting from</span>
                                            <span className="text-sm font-black text-neutral-900">৳{item.price || 2500}</span>
                                        </div>
                                        <Button size="sm" className="rounded-lg font-bold text-[10px] uppercase bg-neutral-900 hover:bg-neutral-800 text-white h-8 px-4 shadow-sm">
                                            Book Now
                                        </Button>
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
