"use client"

import { ArrowRight, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export function OfferSection() {
    const { t } = useLanguage();

    return (
        <section className="pt-4 pb-8 bg-white">
            <div className="container mx-auto px-8">
                <div className="flex items-center gap-2 mb-8">
                    <Timer className="w-5 h-5 text-red-600 animate-pulse" />
                    <h2 className="text-2xl font-bold capitalize tracking-tight text-neutral-900">
                        {t.offer_title}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Offer Card 1 */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-neutral-900 aspect-[2/1] group">
                        <div className="absolute inset-0 opacity-40">
                            <Image
                                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2000&auto=format&fit=crop"
                                alt="Construction"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 to-transparent" />
                        <div className="relative h-full p-8 md:p-12 flex flex-col justify-center items-start">
                            <span className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                                {t.offer_flash_sale}
                            </span>
                            <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                                {t.offer_steel_title}
                            </h3>
                            <p className="text-neutral-300 font-medium mb-8 max-w-xs">
                                {t.offer_steel_desc}
                            </p>
                            <Button className="bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl px-6 font-bold uppercase tracking-wider text-xs">
                                {t.offer_shop_now} <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Offer Card 2 */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-indigo-900 aspect-[2/1] group">
                        <div className="absolute inset-0 opacity-40">
                            <Image
                                src="https://images.unsplash.com/photo-1581244277943-fe0ef9d47949?q=80&w=2000&auto=format&fit=crop"
                                alt="Paint"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-transparent" />
                        <div className="relative h-full p-8 md:p-12 flex flex-col justify-center items-start">
                            <span className="inline-block px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                                {t.offer_bundle_deal}
                            </span>
                            <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                                {t.offer_paint_title}
                            </h3>
                            <p className="text-indigo-200 font-medium mb-8 max-w-xs">
                                {t.offer_paint_desc}
                            </p>
                            <Button className="bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl px-6 font-bold uppercase tracking-wider text-xs">
                                {t.offer_view_bundle} <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
