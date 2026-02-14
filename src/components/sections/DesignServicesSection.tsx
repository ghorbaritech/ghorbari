"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const designServices = [
    {
        id: "arch",
        title: "Architectural Design",
        description: "Complete building blueprints & permits",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop",
        rating: 4.9,
        projects: 234,
        priceFrom: "৳5000",
        link: "/services/design/book?service=architectural"
    },
    {
        id: "interior",
        title: "Interior Design",
        description: "Transform your living spaces",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop",
        rating: 4.8,
        projects: 567,
        priceFrom: "৳2500",
        link: "/services/design/book?service=interior"
    },
    {
        id: "3d",
        title: "3D Visualization",
        description: "See your project before building",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
        rating: 4.7,
        projects: 189,
        priceFrom: "৳1500",
        link: "/services/design/book?service=architectural"
    },
    {
        id: "landscape",
        title: "Landscape Design",
        description: "Outdoor spaces & garden planning",
        image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&h=400&fit=crop",
        rating: 4.8,
        projects: 98,
        priceFrom: "৳3000",
        link: "/services/design/book?service=architectural"
    }
];

export function DesignServicesSection() {
    return (
        <section className="py-6 bg-white">
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 capitalize tracking-tight">
                            Design & Planning Services
                        </h2>
                        <div className="h-1 w-20 bg-primary-600 mt-2 rounded-full" />
                    </div>
                    <Link href="/services/design">
                        <Button variant="ghost" className="text-neutral-500 hover:text-primary-600 font-bold uppercase tracking-widest text-xs">
                            View All <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {designServices.map((service) => (
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
                                            Book Service <ArrowRight className="ml-1 w-3 h-3" />
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
