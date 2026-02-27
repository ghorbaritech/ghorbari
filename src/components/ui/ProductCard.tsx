"use client"

import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { getL } from "@/utils/localization";

interface ProductCardProps {
    id: string;
    name: string;
    nameBn?: string | null;
    price: string | number;
    oldPrice?: string | number | null;
    image: string;
    rating: number;
    category?: string;
    categoryBn?: string | null;
    categoryId?: string;
    subcategory?: string;
    tag?: string;
    tagBn?: string | null;
    discount?: string;
    compact?: boolean;
    sellerId?: string;
    sellerName?: string;
    sellerNameBn?: string | null;
    href?: string;
}

export function ProductCard({
    id,
    name,
    nameBn,
    price,
    oldPrice,
    image,
    rating,
    category,
    categoryBn,
    categoryId,
    subcategory,
    tag,
    tagBn,
    discount,
    sellerId,
    sellerName,
    sellerNameBn,
    href,
    compact
}: ProductCardProps) {
    const { addItem } = useCart();
    const { language, t } = useLanguage();
    const productLink = href || `/products/${id}`;

    const displayName = getL(name, nameBn, language);
    const displaySeller = getL(sellerName, sellerNameBn, language);
    const displayCategory = getL(category, categoryBn, language) || t.nav_all_categories;

    const handleAddToCart = () => {
        addItem({
            id,
            name: displayName,
            price: typeof price === 'number' ? price : parseFloat(String(price).replace(/,/g, '')),
            image,
            sellerId: sellerId || "",
            sellerName: displaySeller || "",
            category: displayCategory,
            categoryId
        });
    };

    return (
        <div className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden">
            {/* Image */}
            <Link href={productLink} className="block relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <Image
                    src={image}
                    alt={displayName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Discount badge – top left */}
                {discount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow">
                        {discount}
                    </span>
                )}

                {/* Rating badge – top right */}
                <div className="absolute top-3 right-3">
                    <span className="bg-white text-neutral-800 text-[11px] font-bold px-2 py-1 rounded-lg shadow flex items-center gap-1">
                        <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                        {rating}
                    </span>
                </div>
            </Link>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title */}
                <Link href={productLink}>
                    <h4 className="font-bold text-neutral-900 leading-snug text-[15px] mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {displayName}
                    </h4>
                </Link>

                {/* Seller or category as subtitle */}
                <p className="text-neutral-500 text-[12px] mb-4 line-clamp-1 leading-snug">
                    {displaySeller && sellerId ? (
                        <Link href={`/partner/${sellerId}`} className="hover:text-primary-600 transition-colors">
                            {displaySeller}
                        </Link>
                    ) : (
                        displayCategory
                    )}
                </p>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                        {oldPrice && (
                            <span className="text-[10px] text-neutral-400 line-through font-medium">৳{(Number(String(oldPrice).replace(/,/g, '')) || 0).toLocaleString(language === 'BN' ? 'bn-BD' : 'en-BD')}</span>
                        )}
                        <span className="text-xl font-black text-neutral-900 tracking-tight">৳{(Number(String(price).replace(/,/g, '')) || 0).toLocaleString(language === 'BN' ? 'bn-BD' : 'en-BD')}</span>
                    </div>

                    <button
                        onClick={(e) => { e.preventDefault(); handleAddToCart(); }}
                        className="bg-neutral-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-widest px-4 h-9 rounded-lg transition-colors"
                    >
                        {t.btn_buy_now}
                    </button>
                </div>
            </div>
        </div>
    );
}
