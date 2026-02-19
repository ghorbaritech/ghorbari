-- Migration: Milestone CMS

-- 1. Create Milestone Templates Table (Admin CMS)
CREATE TABLE IF NOT EXISTS public.milestone_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g. "Standard Delivery", "Interior Design Flow", "Service Execution"
    type TEXT NOT NULL, -- 'product', 'service', 'design'
    stages JSONB NOT NULL, -- Array of stage names: ["Order Placed", "Processing", "Shipped"]
    category_id UUID REFERENCES public.product_categories(id), -- Optional: Link to specific category
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add milestones column to Orders and Service Requests (Design already has it)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb; -- [{ name: "Placed", status: "completed", date: "..." }]

ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb;

-- 3. Enable RLS
ALTER TABLE public.milestone_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage milestone templates" ON public.milestone_templates
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Everyone view milestone templates" ON public.milestone_templates
    FOR SELECT USING (true); -- Publicly viewable for logic if needed, or restrict to auth

-- 4. Trigger for updated_at
CREATE TRIGGER update_milestone_templates_modtime 
BEFORE UPDATE ON public.milestone_templates 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
