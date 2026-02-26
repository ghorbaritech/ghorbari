"use client"

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface BaseCardProps {
    image: string;
    title: string;
    href?: string;
    rating?: number;
    category?: string;
    tags?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    imageClassName?: string;
    bodyClassName?: string;
    onClick?: (e: React.MouseEvent) => void;
    children?: React.ReactNode;
}

/**
 * BaseCard provides a consistent visual container for various entity cards (Products, Services, Designers).
 * It handles the image aspect ratio, hover transitions, and basic layout slots.
 */
export function BaseCard({
    image,
    title,
    href,
    rating,
    category,
    tags,
    footer,
    className = "",
    imageClassName = "",
    bodyClassName = "",
    onClick,
    children
}: BaseCardProps) {
    const CardWrapper = href ? Link : "div";
    const wrapperProps = href ? { href, className: "block relative aspect-[4/3] overflow-hidden bg-neutral-50" } : { className: "block relative aspect-[4/3] overflow-hidden bg-neutral-50", onClick };

    return (
        <div className={`group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full ${className}`}>
            {/* Image Section */}
            <CardWrapper {...(wrapperProps as any)}>
                <Image
                    src={image}
                    alt={title}
                    fill
                    className={`object-cover group-hover:scale-105 transition-transform duration-500 ${imageClassName}`}
                />

                {/* Top Tags Slot */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {tags}
                </div>
            </CardWrapper>

            {/* Info Section */}
            <div className={`flex flex-col flex-1 p-4 gap-2 ${bodyClassName}`}>
                {/* Header Slot: Category + Rating */}
                {(category || rating !== undefined) && (
                    <div className="flex items-center justify-between">
                        {category && (
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[70%]">
                                {category}
                            </span>
                        )}
                        {rating !== undefined && (
                            <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                                <Star className="w-3 h-3 fill-amber-500" />
                                {rating}
                            </div>
                        )}
                    </div>
                )}

                {/* Title Slot */}
                <h4 className="font-bold text-neutral-900 leading-tight text-sm group-hover:text-primary-600 transition-colors line-clamp-2">
                    {title}
                </h4>

                {/* Body Content Slot */}
                {children}

                {/* Footer Slot: Price/Action */}
                {footer && (
                    <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-neutral-50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
