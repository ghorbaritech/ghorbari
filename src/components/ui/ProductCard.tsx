"use client"

import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
    id: string;
    name: string;
    price: string;
    oldPrice?: string | null;
    image: string;
    rating: number;
    category?: string;
    categoryBn?: string | null;
    categoryId?: string;
    tag?: string;
    discount?: string;
    compact?: boolean;
    sellerId?: string;
    sellerName?: string;
    href?: string;
}

import { useLanguage } from "@/context/LanguageContext";
import { useCompare } from "@/context/CompareContext";
import { GitCompare } from "lucide-react";

export function ProductCard({
    id,
    name,
    price,
    oldPrice,
    image,
    rating,
    category,
    categoryBn,
    categoryId,
    tag,
    discount,
    sellerId,
    sellerName,
    href,
    compact
}: ProductCardProps) {
    const { addItem } = useCart();
    const { language } = useLanguage();
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();
    const productLink = href || `/products/${id}`;

    const handleAddToCart = () => {
        addItem({
            id,
            name,
            price: parseFloat(price.replace(/,/g, '')),
            image,
            sellerId: sellerId || "",
            sellerName: sellerName || "",
            category,
            categoryId
        });
    };

    const displayCategory = (language === 'BN' && categoryBn) ? categoryBn : (category || "Uncategorized");

    return (

        <div className={`group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 flex flex-col h-full ${compact ? '' : ''}`}>
            <Link href={productLink} className="block relative aspect-[4/3] overflow-hidden bg-neutral-50 cursor-pointer">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay Tags */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {discount && (
                        <span className="bg-error text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                            {discount}
                        </span>
                    )}
                    {tag && (
                        <span className="bg-white/90 backdrop-blur-sm text-neutral-900 text-[9px] font-bold px-2.5 py-1 rounded-full border border-neutral-100 shadow-sm uppercase tracking-tighter">
                            {tag}
                        </span>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className={`flex flex-col flex-1 gap-2 ${compact ? 'p-3' : 'p-5'}`}>
                {/* Header: Seller Name (top tag) + Rating */}
                <div className="flex items-center justify-between">
                    {/* Top tag = Seller name, clickable */}
                    {sellerName && sellerId ? (
                        <Link
                            href={`/partner/${sellerId}`}
                            className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[70%] hover:text-primary-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {sellerName}
                        </Link>
                    ) : (
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[70%]">
                            {sellerName || displayCategory}
                        </span>
                    )}
                    <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {rating}
                    </div>
                </div>

                {/* Title */}
                <Link href={productLink} className="block">
                    <h4 className="font-bold text-neutral-900 leading-tight text-sm group-hover:text-primary-600 transition-colors line-clamp-2 mb-1 cursor-pointer">
                        {name}
                    </h4>
                </Link>

                {/* Below title = actual category (Cement, Sand, etc.) */}
                {displayCategory && (
                    <div className="text-[10px] text-neutral-500 font-medium mb-1 uppercase tracking-wide">
                        {displayCategory}
                    </div>
                )}

                {/* Price & Action */}
                <div className={`mt-auto pt-2 flex items-center justify-between gap-2 ${compact ? 'border-t border-neutral-50' : ''}`}>
                    <div className="flex flex-col">
                        {oldPrice && (
                            <span className="text-[10px] text-neutral-400 line-through font-medium">৳{oldPrice}</span>
                        )}
                        {/* "Starting from" text for compact mode similar to design card? User didn't ask explicitly but it's in screenshot. Keeping simple price for products. */}
                        {compact && <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wide">Price</span>}
                        <span className={`${compact ? 'text-base' : 'text-lg'} font-bold text-neutral-900`}>৳{price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {!compact && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isInCompare(id)) {
                                        removeFromCompare(id);
                                    } else {
                                        addToCompare({ id, name, price: parseFloat(price.replace(/,/g, '')), image });
                                    }
                                }}
                                className={`h-8 w-8 p-0 rounded-lg border-neutral-200 hover:border-primary-600 hover:text-primary-600 ${isInCompare(id) ? 'bg-primary-50 border-primary-600 text-primary-600' : ''}`}
                            >
                                <GitCompare className="w-4 h-4" />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={handleAddToCart}
                            className={`bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold shadow-sm ${compact ? 'h-8 px-4 text-[10px] uppercase' : 'px-4 text-xs'}`}
                        >
                            {!compact && <ShoppingCart className="w-3 h-3 mr-1" />}
                            Buy Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

