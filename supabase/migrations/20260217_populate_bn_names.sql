-- Migration: Populate Bangla Names for Categories
-- Description: Updates existing categories with their Bangla translations.

-- Common Building Materials
UPDATE public.product_categories SET name_bn = 'নির্মাণ সামগ্রী' WHERE name = 'Building Materials';
UPDATE public.product_categories SET name_bn = 'সিমেন্ট' WHERE name = 'Cement';
UPDATE public.product_categories SET name_bn = 'ইট' WHERE name = 'Bricks';
UPDATE public.product_categories SET name_bn = 'বালি' WHERE name = 'Sand';
UPDATE public.product_categories SET name_bn = 'পাথর' WHERE name = 'Stone';

-- Steel & Rods
UPDATE public.product_categories SET name_bn = 'স্টিল ও রড' WHERE name = 'Steel & Rods';
UPDATE public.product_categories SET name_bn = 'স্টিল' WHERE name = 'Steel';

-- Plumbing
UPDATE public.product_categories SET name_bn = 'প্লাম্বিং' WHERE name = 'Plumbing';
UPDATE public.product_categories SET name_bn = 'পাইপ' WHERE name = 'Pipes';
UPDATE public.product_categories SET name_bn = 'ফিটিংস' WHERE name = 'Fittings';

-- Electrical
UPDATE public.product_categories SET name_bn = 'ইলেকট্রিক্যাল' WHERE name = 'Electrical';
UPDATE public.product_categories SET name_bn = 'লাইট' WHERE name = 'Lights';
UPDATE public.product_categories SET name_bn = 'ফ্যান' WHERE name = 'Fans';
UPDATE public.product_categories SET name_bn = 'সুইচ' WHERE name = 'Switches';

-- Finishing
UPDATE public.product_categories SET name_bn = 'ফিনিশিং' WHERE name = 'Finishing';
UPDATE public.product_categories SET name_bn = 'রং' WHERE name = 'Paints & Finishes';
UPDATE public.product_categories SET name_bn = 'টাইলস' WHERE name = 'Tiles';
UPDATE public.product_categories SET name_bn = 'স্যানিটারি' WHERE name = 'Sanitary';

-- Tools
UPDATE public.product_categories SET name_bn = 'টুলস ও হার্ডওয়্যার' WHERE name = 'Tools & Hardware';

-- Safety
UPDATE public.product_categories SET name_bn = 'নিরাপত্তা সরঞ্জাম' WHERE name = 'Safety Gear';

-- Design & Services
UPDATE public.product_categories SET name_bn = 'ইন্টেরিয়র ডিজাইন' WHERE name = 'Interior Design';
UPDATE public.product_categories SET name_bn = 'কনস্ট্রাকশন সার্ভিস' WHERE name = 'Construction Services';
UPDATE public.product_categories SET name_bn = 'আর্কিটেকচারাল ডিজাইন' WHERE name = 'Architectural Design';

-- Dummy/Fallback Logic for partial matches (optional, running safe updates only)
