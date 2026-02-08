"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const offers = [
    {
        title: "20% OFF Interior Design",
        description: "Get premium interior design packages at a special discounted rate this month.",
        cta: "Explore Packages",
        color: "bg-blue-600",
        pattern: "bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-blend-multiply"
    },
    {
        title: "Free Strategic Health Check",
        description: "Book a full home structural design service and get a free health check consultation.",
        cta: "Book Now",
        color: "bg-emerald-600",
        pattern: "bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-blend-multiply"
    },
    {
        title: "Bulk Material Discounts",
        description: "Contractors get up to 15% off on bulk cement and steel orders.",
        cta: "Shop Materials",
        color: "bg-orange-500",
        pattern: "bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1968&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-blend-multiply"
    }
]

export function PromotionalBanner() {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })])

    return (
        <section className="py-8 container mx-auto px-8">
            <div className="overflow-hidden rounded-2xl shadow-xl" ref={emblaRef}>
                <div className="flex">
                    {offers.map((offer, index) => (
                        <div key={index} className={`flex-[0_0_100%] min-w-0 relative h-[300px] md:h-[400px] flex items-center ${offer.color} ${offer.pattern}`}>
                            <div className="absolute inset-0 bg-black/40"></div>
                            <div className="relative z-10 p-8 md:p-16 max-w-3xl text-white">
                                <span className="inline-block py-1 px-3 rounded-md bg-white/20 backdrop-blur-sm text-sm font-semibold mb-4 border border-white/30">
                                    Limited Time Offer
                                </span>
                                <h2 className="heading-2 mb-4 font-bold">{offer.title}</h2>
                                <p className="text-lg md:text-xl text-neutral-100 mb-8 max-w-xl">
                                    {offer.description}
                                </p>
                                <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100 border-none font-semibold">
                                    {offer.cta} <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

