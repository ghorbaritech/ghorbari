import { createClient } from '@/utils/supabase/client';

export type ReviewTargetType = 'product' | 'service_package' | 'design_package' | 'seller' | 'service_provider' | 'designer';

export interface Review {
    id: string;
    reviewer_id: string;
    target_type: ReviewTargetType;
    target_id: string;
    rating: number;
    comment: string;
    images: string[];
    is_verified_purchase: boolean;
    created_at: string;
    reviewer?: { full_name: string; avatar_url: string };
}

export async function getReviews(targetType: ReviewTargetType, targetId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles(full_name, avatar_url)')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Review[];
}

export async function createReview(review: Partial<Review>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from('reviews')
        .insert([{ ...review, reviewer_id: user.id }])
        .select('*, reviewer:profiles(full_name, avatar_url)')
        .single();

    if (error) throw error;
    return data;
}

export async function getReviewStats(targetType: ReviewTargetType, targetId: string) {
    const reviews = await getReviews(targetType, targetId);
    if (!reviews.length) return { average: 0, count: 0 };

    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
        average: Number((total / reviews.length).toFixed(1)),
        count: reviews.length
    };
}
