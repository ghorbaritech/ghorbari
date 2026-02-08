"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const banners = [
    {
        title: "Expert-Selected,\nfast delivered",
        subtitle: "Quality Guarantee",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
        link: "#",
        badge: "Mano Choice"
    },
    {
        title: "The one app\nfor everything",
        subtitle: "Price alerts and\nexclusive offers",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
        link: "#",
        badge: null
    },
    {
        title: "The ones\nyou love",
        subtitle: "Trusted, durable\nand loved",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
        link: "#",
        badge: null
    }
];

export function PromoBannerSection() {
    return (
        <section className="py-6 bg-neutral-50">
            <div className="container mx-auto px-8">
                <h2 className="text-2xl font-bold text-neutral-900 capitalize tracking-tight mb-6">
                    Current Deals
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {banners.map((banner, idx) => (
                        <Link
                            key={idx}
                            href={banner.link}
                            className="relative group overflow-hidden rounded-2xl bg-primary-600 hover:bg-primary-700 transition-colors aspect-[5/2] block"
                        >
                            <div className="absolute inset-0 flex">
                                {/* Left side - Text content */}
                                <div className="flex-1 p-6 flex flex-col justify-between z-10">
                                    <div>
                                        <h3 className="text-white text-xl font-bold leading-tight mb-2 whitespace-pre-line">
                                            {banner.title}
                                        </h3>
                                        <p className="text-white/80 text-sm whitespace-pre-line">
                                            {banner.subtitle}
                                        </p>
                                    </div>
                                    {banner.badge && (
                                        <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full self-start">
                                            <span className="text-white text-xs font-bold">{banner.badge}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Right side - Image */}
                                <div className="flex-1 relative">
                                    <Image
                                        src={banner.image}
                                        alt={banner.title}
                                        fill
                                        className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
