"use client"

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getL } from "@/utils/localization";

interface ServiceCardProps {
    id: string;
    name: string;
    nameBn?: string | null;
    price: number | string;
    image: string;
    rating: number;
    category?: string;
    unitType?: string;
    isSelected?: boolean;
    onToggle: () => void;
}

export function ServiceCard({
    id,
    name,
    nameBn,
    price,
    image,
    rating,
    category,
    unitType,
    isSelected,
    onToggle
}: ServiceCardProps) {
    const { language, t } = useLanguage();
    const displayName = getL(name, nameBn, language);

    return (
        <div className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col h-full overflow-hidden ${isSelected ? 'border-primary-600 ring-2 ring-primary-100 shadow-lg' : 'border-neutral-200 shadow-sm hover:shadow-md'}`}>

            {/* Image — plain, no link */}
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <Image
                    src={image}
                    alt={displayName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                {/* Rating badge */}
                <div className="absolute top-3 right-3">
                    <span className="bg-white text-neutral-800 text-[11px] font-bold px-2 py-1 rounded-lg shadow flex items-center gap-1">
                        <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                        {rating}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title — links to service detail page */}
                <Link href={`/services/${id}`} className="font-bold text-neutral-900 leading-snug text-[15px] mb-1 line-clamp-1 hover:text-primary-600 transition-colors">
                    {displayName}
                </Link>

                {/* Category */}
                <p className="text-neutral-500 text-[12px] mb-4 line-clamp-2 leading-snug">
                    {category || unitType || 'Professional service'}
                </p>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">{t.lbl_starting_from}</span>
                        <span className="text-xl font-black text-neutral-900 tracking-tight">৳{(Number(String(price).replace(/,/g, '')) || 0).toLocaleString(language === 'BN' ? 'bn-BD' : 'en-BD')}</span>
                    </div>

                    {/* Book Now → toggles selection */}
                    <Button
                        size="sm"
                        className={`rounded-lg h-9 px-4 font-bold uppercase text-[10px] tracking-widest transition-all duration-300 ${isSelected
                                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-200'
                                : 'bg-neutral-900 hover:bg-black text-white'
                            }`}
                        onClick={onToggle}
                    >
                        {isSelected ? (t.service_remove || 'Remove') : (t.service_book_now || 'Book Now')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
