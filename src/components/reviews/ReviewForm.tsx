"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Star, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export function ReviewForm({ targetId, targetType, onReviewSubmitted }: { targetId: string, targetType: string, onReviewSubmitted: () => void }) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) return

        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            toast({
                title: "Authentication Required",
                description: "Please sign in to leave a review.",
                variant: "destructive"
            })
            setLoading(false)
            return
        }

        const { error } = await supabase
            .from('reviews')
            .insert({
                reviewer_id: user.id,
                target_type: targetType,
                target_id: targetId,
                rating,
                comment,
                created_at: new Date().toISOString()
            })

        setLoading(false)

        if (error) {
            console.error(error)
            toast({
                title: "Error submitting review",
                description: "Please try again later.",
                variant: "destructive"
            })
        } else {
            toast({
                title: "Review Submitted",
                description: "Thank you for your feedback!",
            })
            setRating(0)
            setComment("")
            onReviewSubmitted()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm space-y-6">
            <h3 className="font-black text-lg text-neutral-900 uppercase tracking-tight italic">Write a Review</h3>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110 active:scale-90"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-neutral-200"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Your Experience</label>
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked or didn't like..."
                    className="min-h-[120px] bg-neutral-50 border-none rounded-2xl resize-none p-4 font-medium"
                />
            </div>

            <Button
                type="submit"
                disabled={loading || rating === 0}
                className="w-full bg-neutral-900 text-white hover:bg-black font-black uppercase tracking-widest rounded-2xl h-12 shadow-lg"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
            </Button>
        </form>
    )
}
