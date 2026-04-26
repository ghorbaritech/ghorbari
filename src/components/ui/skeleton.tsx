import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
    lines?: number;
}

/**
 * Skeleton loading shimmer component — Dalankotha design system
 * Use this anywhere data is being fetched to prevent layout shift and blank screens.
 * Usage: <Skeleton className="h-10 w-full" />
 */
export function Skeleton({ className, lines }: SkeletonProps) {
    if (lines && lines > 1) {
        return (
            <div className="space-y-2 w-full">
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "skeleton",
                            i === lines - 1 ? "w-3/4" : "w-full",
                            "h-4",
                            className
                        )}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn("skeleton", className)}
            aria-hidden="true"
            role="presentation"
        />
    );
}

/** Product card skeleton — use in CategoryShowcase and ServiceShowcase */
export function ProductCardSkeleton() {
    return (
        <div className="rounded-2xl border border-neutral-100 overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                </div>
            </div>
        </div>
    );
}

/** Section header skeleton — use in homepage section titles */
export function SectionHeaderSkeleton() {
    return (
        <div className="space-y-2 mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
        </div>
    );
}

/** Hero section skeleton — use while hero CMS data loads */
export function HeroSkeleton() {
    return (
        <section className="bg-white pt-4 pb-2">
            <div className="section-container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:h-[400px]">
                    <div className="lg:col-span-8 rounded-2xl overflow-hidden">
                        <Skeleton className="h-full w-full min-h-[250px]" />
                    </div>
                    <div className="lg:col-span-4 flex flex-col gap-3 h-full">
                        <div className="flex-1 rounded-2xl overflow-hidden">
                            <Skeleton className="h-full w-full min-h-[120px]" />
                        </div>
                        <div className="flex-1 rounded-2xl overflow-hidden">
                            <Skeleton className="h-full w-full min-h-[120px]" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/** Slider row skeleton — use for product/service card sliders */
export function CardSliderSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="section-container py-8">
            <SectionHeaderSkeleton />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

/** Testimonial skeleton */
export function TestimonialSkeleton() {
    return (
        <div className="p-6 rounded-2xl border border-neutral-100 space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <Skeleton lines={3} />
        </div>
    );
}
