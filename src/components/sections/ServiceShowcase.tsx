"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SERVICES = [
    {
        id: "s1",
        title: "Electrical Services",
        description: "Wiring, switch installation, and circuit repairs by certified electricians",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop",
        rating: 4.8,
        projects: 312,
        priceFrom: "৳800",
        link: "/services/electric"
    },
    {
        id: "s2",
        title: "Plumbing Solutions",
        description: "Leak repairs, pipe fitting, and bathroom sanitary installation",
        image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=400&fit=crop",
        rating: 4.7,
        projects: 268,
        priceFrom: "৳600",
        link: "/services/plumbing"
    },
    {
        id: "s3",
        title: "Wood & Carpentry",
        description: "Custom furniture, door installation, and wooden flooring",
        image: "https://images.unsplash.com/photo-1590872256464-0b70d0f1f6b7?w=600&h=400&fit=crop",
        rating: 4.9,
        projects: 198,
        priceFrom: "৳1200",
        link: "/services/woodwork"
    },
    {
        id: "s4",
        title: "Construction & Masonry",
        description: "Wall plastering, brick laying, and renovation services",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
        rating: 4.6,
        projects: 156,
        priceFrom: "৳1500",
        link: "/services/construction"
    }
];

export function ServiceShowcase() {
    return (
        <section className="py-6 bg-neutral-50">
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 capitalize tracking-tight">
                            Professional Help?
                        </h2>
                        <p className="text-neutral-500 text-sm mt-1">
                            Don't just buy materials—hire the best experts
                        </p>
                    </div>
                    <Link href="/services">
                        <Button variant="ghost" className="text-neutral-500 hover:text-primary-600 font-bold uppercase tracking-widest text-xs">
                            View All <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SERVICES.map((service) => (
                        <div
                            key={service.id}
                            className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-sm text-neutral-500 mb-4">
                                    {service.description}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center gap-4 mb-4 text-xs text-neutral-600">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        <span className="font-bold">{service.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold">{service.projects}</span>
                                        <span>projects</span>
                                    </div>
                                </div>

                                {/* Price and CTA */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-neutral-500">From</p>
                                        <p className="text-lg font-bold text-neutral-900">{service.priceFrom}</p>
                                    </div>
                                    <Link href={service.link}>
                                        <Button
                                            size="sm"
                                            className="bg-neutral-900 hover:bg-primary-600 text-white rounded-lg px-4 text-xs font-bold"
                                        >
                                            Book Now <ArrowRight className="ml-1 w-3 h-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
