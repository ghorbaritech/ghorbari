-- Migration: Service Booking Schema & Items
-- This schema supports generic service items with prices and booking requests.

-- 1. Service Items Table (Generic offerings)
CREATE TABLE IF NOT EXISTS public.service_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    name_bn TEXT,
    description TEXT,
    description_bn TEXT,
    unit_price DECIMAL(10,2) NOT NULL,
    unit_type TEXT DEFAULT 'sqft', -- 'sqft', 'unit', 'per_point'
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Service Request Items (Mapping multiple services to one request)
CREATE TABLE IF NOT EXISTS public.service_request_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
    service_item_id UUID REFERENCES public.service_items(id) ON DELETE SET NULL,
    quantity DECIMAL(10,2) DEFAULT 1.0,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Modify service_requests to support assignment choice and scheduling
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS assignment_type TEXT DEFAULT 'ghorbari_assign', -- 'ghorbari_assign' or 'user_choose'
ADD COLUMN IF NOT EXISTS preferred_schedule JSONB, -- { date: '...', time_slot: '...' }
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;

-- 4. Seed some demo service items based on the taxonomy
-- Using IDs from 20260224_create_service_taxonomy.sql if possible, 
-- but since I don't have the UUIDs, I'll lookup by slug.

DO $$
DECLARE
    v_cat_plastic UUID;
    v_cat_distemper UUID;
    v_cat_tiles UUID;
    v_cat_plaster UUID;
BEGIN
    SELECT id INTO v_cat_plastic FROM public.product_categories WHERE slug = 'plastic-paint';
    SELECT id INTO v_cat_distemper FROM public.product_categories WHERE slug = 'distemper-paint';
    SELECT id INTO v_cat_tiles FROM public.product_categories WHERE slug = 'tiles-fitting-item';
    SELECT id INTO v_cat_plaster FROM public.product_categories WHERE slug = 'plaster-work-item';

    -- Plastic Paint
    IF v_cat_plastic IS NOT NULL THEN
        INSERT INTO public.service_items (category_id, name, name_bn, description, unit_price, unit_type, image_url)
        VALUES (v_cat_plastic, 'Premium Plastic Paint', 'প্রিমিয়াম প্লাস্টিক পেইন্ট', 'High quality smooth finish for interior walls.', 15.50, 'sqft', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400');
    END IF;

    -- Distemper
    IF v_cat_distemper IS NOT NULL THEN
        INSERT INTO public.service_items (category_id, name, name_bn, description, unit_price, unit_type, image_url)
        VALUES (v_cat_distemper, 'Economy Distemper', 'ইকোনমি ডিস্টেম্পার', 'Affordable interior wall paint.', 8.00, 'sqft', 'https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=400');
    END IF;

    -- Tiles Fitting
    IF v_cat_tiles IS NOT NULL THEN
        INSERT INTO public.service_items (category_id, name, name_bn, description, unit_price, unit_type, image_url)
        VALUES (v_cat_tiles, 'Standard Tiles Fitting', 'স্ট্যান্ডার্ড টাইলস ফিটিং', 'Professional tiles installation with leveling.', 45.00, 'sqft', 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=400');
    END IF;

    -- Plaster Work
    IF v_cat_plaster IS NOT NULL THEN
        INSERT INTO public.service_items (category_id, name, name_bn, description, unit_price, unit_type, image_url)
        VALUES (v_cat_plaster, 'Wall Plastering', 'ওয়াল প্লাস্টারিং', 'Perfectly smooth cement plastering.', 25.00, 'sqft', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400');
    END IF;

END $$;

-- 5. Enable RLS
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service items" ON public.service_items FOR SELECT USING (true);
CREATE POLICY "Admins manage service items" ON public.service_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users view own request items" ON public.service_request_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.service_requests WHERE id = request_id AND customer_id = auth.uid())
);
