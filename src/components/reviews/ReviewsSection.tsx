"use client"

import { useState } from "react"
import { ReviewList } from "./ReviewList"
import { ReviewForm } from "./ReviewForm"
import { useRouter } from "next/navigation"

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

export function ReviewsSection({ productId, initialReviews }: { productId: string, initialReviews: Review[] }) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews)
    const router = useRouter()

    const handleReviewSubmitted = () => {
        // Refresh the page data from server to get the latest review (safest)
        // or we could optimistically append if we returned the Review object from Form
        router.refresh()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest">Reviews ({reviews.length})</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                    <ReviewList reviews={reviews} />
                </div>
                <div>
                    <div className="sticky top-24">
                        <ReviewForm
                            targetId={productId}
                            targetType="product"
                            onReviewSubmitted={handleReviewSubmitted}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
