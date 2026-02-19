"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface RateOrderModalProps {
    orderId: string
    sellerId: string
    items: Array<{
        name: string
        id?: string // Assuming we might want to link to product ID effectively if we had it, but for now we might just rate seller?
        // Actually, the review schema targets target_id.
        // If we want to rate products, we need product IDs.
        // The order item schema in jsonb might not have product ID if not saved.
        // Let's check order.items structure.
    }>
    onSuccess?: () => void
    children: React.ReactNode
}

// Simplified for now: allow rating the SELLER.
// Rating individual products from a modal might be complex if there are many.
// Let's start with Seller Rating.

export function RateOrderModal({ orderId, sellerId, onSuccess, children }: RateOrderModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [hoverRating, setHoverRating] = useState(0)
    const { toast } = useToast()
    const supabase = createClient()

    const handleSubmit = async () => {
        if (rating === 0) return
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Submit Seller Review
        const { error } = await supabase.from('reviews').insert({
            reviewer_id: user.id,
            target_type: 'seller',
            target_id: sellerId,
            rating,
            comment,
            // We could link to order if we added a column, but for now just seller rating
        })

        setLoading(false)

        if (error) {
            console.error(error)
            toast({
                title: "Error submitting review",
                variant: "destructive"
            })
        } else {
            toast({
                title: "Review Submitted",
                description: "Thank you for your feedback!"
            })
            setIsOpen(false)
            if (onSuccess) onSuccess()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-[32px] p-8 border-none shadow-2xl">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black text-neutral-900 uppercase tracking-tight italic">Rate your Experience</DialogTitle>
                    <DialogDescription className="text-neutral-500 font-medium">
                        How was your experience with this seller?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex justify-center gap-2">
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
                                    className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-neutral-200"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share any feedback for the seller..."
                        className="min-h-[100px] bg-neutral-50 border-none rounded-2xl resize-none p-4 font-medium"
                    />

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || rating === 0}
                        className="w-full bg-neutral-900 text-white hover:bg-black font-black uppercase tracking-widest rounded-2xl h-12 shadow-lg"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Feedback"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
