"use client"

import Link from "next/link";

interface SingleSliderProps {
    title?: string;
    items?: any[];
}

export function SingleSlider({ title, items = [] }: SingleSliderProps) {
    if (!items || items.length === 0) return null;
    const banner = items[0];

    return (
        <section className="py-10 bg-neutral-50 mb-2">
            <div className="section-container flex justify-center">
                <Link href={banner.link || '#'} className="block relative w-full aspect-[4/1] lg:aspect-[1200/180] rounded-[2rem] overflow-hidden group shadow-2xl mx-auto bg-[#000000]">
                    {banner.image ? (
                        <img
                            src={banner.image}
                            alt={title || banner.title || "Promotional Banner"}
                            className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-700"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center text-neutral-400 font-bold uppercase tracking-widest text-sm">
                            Wide Banner (1200x400)
                        </div>
                    )}

                </Link>
            </div>
        </section>
    );
}
