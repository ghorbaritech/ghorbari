-- Migration: Reviews and Ratings

-- 1. Create Unified Reviews Table
CREATE TYPE review_target_type AS ENUM ('product', 'service_package', 'design_package', 'seller', 'service_provider', 'designer');

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
    target_type review_target_type NOT NULL,
    target_id UUID NOT NULL, -- The ID of the product, package, or partner
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can updated own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can delete reviews" ON public.reviews
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 3. Trigger for updated_at
CREATE TRIGGER update_reviews_modtime 
BEFORE UPDATE ON public.reviews 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
