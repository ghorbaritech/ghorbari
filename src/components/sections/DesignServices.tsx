"use client"

import { Calendar, Users, Star, ArrowRight, Video, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const designers = [
    {
        name: "Eco-Arc Studio",
        type: "Architecture Agency",
        rating: 4.9,
        reviews: 124,
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=400&h=300&auto=format&fit=crop",
        specialty: "Sustainable Housing"
    },
    {
        name: "Mahmudul Haque",
        type: "Interior Designer",
        rating: 4.8,
        reviews: 89,
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=300&auto=format&fit=crop",
        specialty: "Modern Luxury"
    },
    {
        name: "Urban Plan Co.",
        type: "Design & Planning",
        rating: 5.0,
        reviews: 56,
        image: "https://images.unsplash.com/photo-1554232456-8727aae0cfa4?q=80&w=400&h=300&auto=format&fit=crop",
        specialty: "Urban Landscapes"
    }
];

export function DesignServices() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-8">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    {/* Left Side: Content */}
                    <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-sm font-bold rounded-full uppercase tracking-wider">
                                Design & Planning
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                                Book a session with our <span className="text-primary-600">Expert Designers</span>
                            </h2>
                            <p className="text-lg text-neutral-600 max-w-xl">
                                Get personalized advice, floor plans, and modern design templates from top-rated architects and designers in Bangladesh.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 flex-shrink-0">
                                    <Video className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900">Live Video Call</h4>
                                    <p className="text-sm text-neutral-500">1-on-1 consultation session</p>
                                </div>
                            </div>
                            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 flex-shrink-0">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900">Expert Chat</h4>
                                    <p className="text-sm text-neutral-500">Instant design support</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Button size="lg" className="rounded-full px-8 h-14 font-bold text-base gap-2 group">
                                BOOK A SESSION <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 font-bold text-base gap-2 group">
                                EXPLORE DESIGNERS <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    {/* Right Side: Designer Cards Grid */}
                    <div className="flex-1 w-full">
                        <div className="grid gap-6">
                            {designers.map((designer, idx) => (
                                <div key={idx} className="group p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all flex items-center gap-6">
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                        <Image
                                            src={designer.image}
                                            alt={designer.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{designer.name}</h4>
                                            <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                                                <Star className="w-4 h-4 fill-amber-500" />
                                                {designer.rating}
                                            </div>
                                        </div>
                                        <p className="text-sm text-primary-600 font-semibold mb-2">{designer.type}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded">Specialty: {designer.specialty}</span>
                                            <span className="text-xs font-bold text-neutral-400">{designer.reviews} Reviews</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust Badge */}
                        <div className="mt-8 flex items-center justify-center gap-6 py-4 px-6 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                            <div className="flex items-center gap-2 text-sm font-bold text-neutral-600">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                                100% Verified Experts
                            </div>
                            <div className="w-px h-6 bg-neutral-300"></div>
                            <div className="flex items-center gap-2 text-sm font-bold text-neutral-600">
                                <Users className="w-5 h-5 text-primary-600" />
                                5000+ Consultations
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

