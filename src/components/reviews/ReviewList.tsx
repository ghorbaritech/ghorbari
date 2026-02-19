"use client"

import { Star, User } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

type Review = {
    id: string
    rating: number
    comment: string
    created_at: string
    images?: string[]
    reviewer: {
        full_name: string
        avatar_url: string | null
    }
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-neutral-50 rounded-[32px] border border-dashed border-neutral-200">
                <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No reviews yet</p>
                <p className="text-neutral-300 text-[10px] mt-2 uppercase tracking-tight">Be the first to review this product</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-neutral-100 pb-8 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden">
                                {review.reviewer.avatar_url ? (
                                    <Image src={review.reviewer.avatar_url} alt={review.reviewer.full_name} width={40} height={40} className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-neutral-900 text-sm">{review.reviewer.full_name}</h4>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </span>
                    </div>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-4">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                        <div className="flex gap-2">
                            {review.images.map((img, i) => (
                                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100">
                                    <Image src={img} alt="Review image" fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
