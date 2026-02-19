"use client"

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

interface CategoryBadgeProps {
    categoryId?: string;
    name: string;
    nameBn?: string | null;
}

export function CategoryBadge({ categoryId, name, nameBn }: CategoryBadgeProps) {
    const { language } = useLanguage();

    return (
        <Link
            href={`/products?category=${categoryId || ''}`}
            className="text-xs font-black text-primary-600 mb-3 uppercase tracking-widest bg-primary-50 inline-block px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
        >
            {(language === 'BN' && nameBn) ? nameBn : name}
        </Link>
    );
}
