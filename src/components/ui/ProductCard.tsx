"use client"

import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
    id: string;
    name: string;
    price: string;
    oldPrice?: string | null;
    image: string;
    rating: number;
    category?: string;
    categoryId?: string;
    tag?: string;
    discount?: string;
    compact?: boolean;
    sellerId?: string;
    sellerName?: string;
}

export function ProductCard({
    id,
    name,
    price,
    oldPrice,
    image,
    rating,
    category,
    categoryId,
    tag,
    discount,
    sellerId,
    sellerName
}: ProductCardProps) {
    const { addItem } = useCart();

    const handleAddToCart = () => {
        addItem({
            id,
            name,
            price: parseFloat(price.replace(/,/g, '')),
            image,
            sellerId,
            sellerName,
            category,
            categoryId
        });
    };

    return (
        <div className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50">
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
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col flex-1 gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[70%]">
                        {category || "Uncategorized"}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {rating}
                    </div>
                </div>

                <h4 className="font-bold text-neutral-900 leading-tight text-sm group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                    {name}
                </h4>

                <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        {oldPrice && (
                            <span className="text-[10px] text-neutral-400 line-through font-medium">৳{oldPrice}</span>
                        )}
                        <span className="text-lg font-bold text-neutral-900">৳{price}</span>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleAddToCart}
                        className="bg-neutral-900 hover:bg-primary-600 text-white rounded-lg px-4 text-xs font-bold"
                    >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Add
                    </Button>
                </div>
                <div className="mt-1 text-[10px] text-neutral-400 font-medium">
                    Seller: <span className="text-neutral-600">{sellerName}</span>
                </div>
            </div>
        </div>
    );
}

