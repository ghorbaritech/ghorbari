"use client"

import {
    Hammer,
    Droplets,
    Zap,
    Paintbrush,
    Grid3X3,
    Drill,
    Trees,
    PencilRuler,
    Home,
    Construction,
    LayoutGrid
} from "lucide-react";

const categories = [
    { name: "Tools", count: "8,320+", icon: Hammer },
    { name: "Plumbing", count: "5,210+", icon: Droplets },
    { name: "Electrical", count: "8,780+", icon: Zap },
    { name: "Paint", count: "3,450+", icon: Paintbrush },
    { name: "Flooring", count: "4,120+", icon: Grid3X3 },
    { name: "Power Tools", count: "2,890+", icon: Drill },
    { name: "Outdoor", count: "5,870+", icon: Trees },
    { name: "Design Services", count: "500+", icon: PencilRuler },
    { name: "Interior", count: "3,200+", icon: Home },
    { name: "All", count: "50,000+", icon: LayoutGrid },
];

export function IconCategories() {
    return (
        <section className="pt-2 pb-4 bg-white overflow-x-auto no-scrollbar">
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-start gap-6 min-w-max lg:min-w-0 px-24">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-4 group cursor-pointer">
                            <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all border border-neutral-50 shadow-sm">
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-center space-y-1">
                                <h4 className="text-[11px] font-bold text-neutral-800 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                    {cat.name}
                                </h4>
                                <p className="text-[10px] font-bold text-neutral-400">{cat.count}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

