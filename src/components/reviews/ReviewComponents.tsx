"use client"

import { useState } from "react";
import { Star, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createReview, ReviewTargetType } from "@/services/reviewService";

interface ReviewDialogProps {
    targetType: ReviewTargetType;
    targetId: string;
    trigger?: React.ReactNode;
    onReviewSubmitted?: () => void;
}

export function ReviewDialog({ targetType, targetId, trigger, onReviewSubmitted }: ReviewDialogProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setSubmitting(true);
        try {
            await createReview({
                target_type: targetType,
                target_id: targetId,
                rating,
                comment
            });
            setOpen(false);
            setRating(0);
            setComment("");
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (error) {
            alert("Failed to create review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Write a Review</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rate & Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-neutral-200'}`}
                            >
                                <Star className="w-8 h-8 fill-current" />
                            </button>
                        ))}
                    </div>
                    <Textarea
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <Button onClick={handleSubmit} disabled={rating === 0 || submitting} className="w-full">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/services/reviewService";

export function ReviewList({ reviews }: { reviews: Review[] }) {
    if (reviews.length === 0) {
        return <div className="text-center py-8 text-neutral-500">No reviews yet. Be the first to review!</div>;
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="flex gap-4 border-b pb-6 last:border-0">
                    <Avatar>
                        <AvatarImage src={review.reviewer?.avatar_url} />
                        <AvatarFallback>{review.reviewer?.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                            <span className="font-bold">{review.reviewer?.full_name}</span>
                            <span className="text-xs text-neutral-500">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                        </div>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-neutral-200 fill-none'}`} />
                            ))}
                        </div>
                        <p className="text-sm text-neutral-700 mt-2">{review.comment}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
