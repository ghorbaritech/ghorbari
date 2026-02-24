"use client"

import { Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
        <div className={`group bg-white rounded-[24px] border transition-all duration-300 flex flex-col h-full overflow-hidden ${isSelected ? 'border-primary-600 ring-4 ring-primary-50 shadow-xl' : 'border-neutral-100 hover:border-primary-200 hover:shadow-lg'}`}>
            <div className="relative aspect-square overflow-hidden bg-neutral-50">
                <Image
                    src={image}
                    alt={displayName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-sm text-neutral-900 text-[8px] font-black px-2 py-1 rounded-full border border-neutral-100 shadow-sm uppercase tracking-widest">
                        {unitType || 'Service'}
                    </span>
                </div>
                {isSelected && (
                    <div className="absolute top-3 right-3 animate-in zoom-in duration-300">
                        <div className="bg-primary-600 p-1 rounded-full text-white shadow-lg">
                            <CheckCircle2 className="w-3 h-3" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1 gap-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest truncate max-w-[70%]">
                        {category}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-[9px] font-black">
                        <Star className="w-2.5 h-2.5 fill-amber-500" />
                        {rating}
                    </div>
                </div>

                <h4 className="font-black text-neutral-900 leading-tight text-sm mb-1 line-clamp-2">
                    {displayName}
                </h4>

                <div className="mt-auto pt-3 flex items-center justify-between gap-3 border-t border-neutral-50">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-neutral-400 font-black uppercase tracking-widest">Estimate</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-neutral-900">৳{price}</span>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        onClick={onToggle}
                        className={`rounded-xl h-8 px-4 font-black uppercase tracking-widest text-[8px] shadow-md transition-all ${isSelected ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-600 hover:bg-primary-700'}`}
                    >
                        {isSelected ? 'Remove' : 'Book Now'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
