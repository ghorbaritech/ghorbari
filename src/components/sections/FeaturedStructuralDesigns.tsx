"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ArrowLeft, ArrowRight, User, PencilRuler, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from 'next/link';
import { useEffect, useState } from "react";
import { getFeaturedDesigners } from "@/services/designerService";

export function FeaturedStructuralDesigns() {
    const [designers, setDesigners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' })

    useEffect(() => {
        async function fetchDesigners() {
            const data = await getFeaturedDesigners();
            setDesigners(data);
            setLoading(false);
        }
        fetchDesigners();
    }, []);

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    if (loading) return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Loading Portfolios...</p>
            </div>
        </section>
    );

    if (designers.length === 0) return null;

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-end mb-16 gap-12">
                    <div className="max-w-3xl space-y-6">
                        <div className="flex items-center gap-3 text-primary-600 font-bold uppercase tracking-widest text-xs">
                            <PencilRuler className="w-4 h-4" />
                            Portfolio Showcase
                        </div>
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight uppercase italic">
                            Award-Winning Structural Designs
                        </h2>
                        <p className="text-neutral-500 text-base font-medium leading-relaxed">
                            Browse through our curated collection of architectural excellence delivered by top professionals.
                        </p>
                    </div>

                    <div className="hidden md:flex gap-4">
                        <Button variant="outline" size="icon" onClick={scrollPrev} className="rounded-xl border-neutral-200">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={scrollNext} className="rounded-xl border-neutral-200">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-6 -ml-4">
                        {designers.map((designer, index) => (
                            <div key={index} className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_30%] pl-4 min-w-0">
                                <Link href={`/designers/${designer.id}`} className="block h-full">
                                    <Card className="border-none shadow-lg overflow-hidden h-full group hover:-translate-y-2 transition-transform duration-300">
                                        <div className="relative h-[250px] w-full overflow-hidden">
                                            <Image
                                                src={designer.portfolio_url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"}
                                                alt={designer.company_name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                {designer.specializations.slice(0, 2).map((tag: string) => (
                                                    <span key={tag} className="bg-white/90 backdrop-blur-md text-neutral-900 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-tight">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-xl font-bold text-neutral-900 mb-1 uppercase tracking-tighter truncate">{designer.company_name}</h3>
                                                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">{designer.experience_years} Years Experience</p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-md">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-bold text-sm">{designer.rating}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden relative">
                                                        {designer.profile?.avatar_url ? (
                                                            <Image src={designer.profile.avatar_url} alt={designer.profile.full_name} fill className="object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-neutral-400 absolute inset-0 m-auto" />
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-700">{designer.profile?.full_name}</span>
                                                </div>
                                                <span className="text-primary-600 text-[10px] font-black uppercase tracking-widest group-hover:underline">View Portfolio</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/designers">
                        <Button size="lg" variant="outline" className="border-neutral-300 font-bold uppercase tracking-widest text-xs">View All Professionals</Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

