-- Seed Bengali data for existing designers and design packages to ensure reflection on localhost
UPDATE public.designers SET company_name_bn = 'এস্থেটিক আর্কিটেক্টস' WHERE company_name = 'Aesthetic Architects';
UPDATE public.designers SET company_name_bn = 'সলিডস্ট্রাক্ট ইঞ্জিনিয়ারিং' WHERE company_name = 'SolidStruct Engineering';

UPDATE public.design_packages SET title_bn = 'সম্পূর্ণ স্থাপত্য পরিকল্পনা', description_bn = 'আপনার স্বপ্নের বাড়ির জন্য বিস্তারিত স্থাপত্য নকশা এবং ম্যাপ।' WHERE title = 'Complete Architectural Blueprint';
UPDATE public.design_packages SET title_bn = 'রাজউক বিল্ডিং অনুমোদন সেবা', description_bn = 'রাজউক থেকে আপনার বিল্ডিং নকশা অনুমোদনের দ্রুত এবং সহজ সমাধান।' WHERE title = 'Rajuk Building Approval Service';
UPDATE public.design_packages SET title_bn = 'প্রিমিয়াম ফুল অ্যাপার্টমেন্ট ইন্টেরিয়র', description_bn = 'আপনার অ্যাপার্টমেন্টের জন্য বিলাসবহুল এবং প্রিমিয়াম ইন্টেরিয়র ডিজাইন সার্ভিস।' WHERE title = 'Premium Full Apartment Interior';
UPDATE public.design_packages SET title_bn = 'মাস্টার বেডরুম এস্থেটিক লেআউট', description_bn = 'আপনার শোবার ঘরটিকে নান্দনিকভাবে সাজিয়ে তোলার জন্য বিশেষজ্ঞ সমাধান।' WHERE title = 'Master Bedroom Aesthetic Layout';

-- Also add some dummy service package data to test the Service Marketplace
-- First ensure there is at least one seller for services or use an existing one
DO $$
DECLARE
    v_seller_id UUID;
    v_cat_id UUID;
BEGIN
    SELECT id INTO v_seller_id FROM public.sellers LIMIT 1;
    SELECT id INTO v_cat_id FROM public.product_categories WHERE type = 'service' LIMIT 1;

    IF v_seller_id IS NOT NULL AND v_cat_id IS NOT NULL THEN
        INSERT INTO public.service_packages (id, provider_id, category_id, title, title_bn, description, description_bn, price, unit, is_active)
        VALUES (
            gen_random_uuid(),
            v_seller_id,
            v_cat_id,
            'Full House Maintenance',
            'পুরো বাড়ি রক্ষণাবেক্ষণ',
            'Comprehensive maintenance service for your home including plumbing and electrical checkups.',
            'প্লাম্বিং এবং ইলেকট্রিক্যাল চেকআপ সহ আপনার বাড়ির জন্য ব্যাপক রক্ষণাবেক্ষণ সেবা।',
            5000,
            'Visit',
            true
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;
