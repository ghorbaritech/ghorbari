-- Seed Bengali data for product categories (Partial complement to existing 20260217_populate_bn_names.sql)
UPDATE public.product_categories SET name_bn = 'নির্মাণ সামগ্রী' WHERE name = 'Building Materials' AND name_bn IS NULL;
UPDATE public.product_categories SET name_bn = 'সিমেন্ট' WHERE name = 'Cement' AND name_bn IS NULL;
UPDATE public.product_categories SET name_bn = 'বালু ও পাথর' WHERE name = 'Sand & Stone' AND name_bn IS NULL;
UPDATE public.product_categories SET name_bn = 'ইট' WHERE name = 'Bricks' AND name_bn IS NULL;
UPDATE public.product_categories SET name_bn = 'স্টিল ও রড' WHERE name = 'Steel & Rods' AND name_bn IS NULL;
UPDATE public.product_categories SET name_bn = 'পেইন্ট ও ফিনিশ' WHERE name = 'Paint & Finish' AND name_bn IS NULL;
UPDATE public.product_categories SET name_bn = 'ইলেকট্রিক' WHERE name = 'Electric' AND name_bn IS NULL;
UPDATE public.product_categories SET name_bn = 'প্লাম্বিং' WHERE name = 'Plumbing' AND name_bn IS NULL;
UPDATE public.product_categories SET name_bn = 'টাইলস ও স্যানিটারি' WHERE name = 'Tiles & Sanitary' AND name_bn IS NULL;
UPDATE public.product_categories SET name_bn = 'ডিজাইন স্টুডিও' WHERE name = 'Design Studio' AND name_bn IS NULL;
UPDATE public.product_categories SET name_bn = 'রেনোভেশন' WHERE name = 'Renovations' AND name_bn IS NULL;

-- Seed Bengali data for sellers
UPDATE public.sellers SET business_name_bn = 'বিএসআরএম অফিশিয়াল' WHERE business_name = 'BSRM Official';
UPDATE public.sellers SET business_name_bn = 'সেভেন রিংস লিমিটেড' WHERE business_name = 'Seven Rings Ltd';
UPDATE public.sellers SET business_name_bn = 'স্ট্যান্ডার্ড ব্রিকস' WHERE business_name = 'Standard Bricks';
UPDATE public.sellers SET business_name_bn = 'বার্জার পেইন্টস' WHERE business_name = 'Berger Paints';

-- Seed Bengali data for products
UPDATE public.products SET title_bn = 'পোর্টল্যান্ড সিমেন্ট', description_bn = 'উন্নত মানের পোর্টল্যান্ড কম্পোজিট সিমেন্ট।' WHERE title = 'Portland Cement';
UPDATE public.products SET title_bn = 'বিএসআরএম ৫০০ডাব্লিউ রড', description_bn = 'নির্মাণের জন্য সেরা মানের স্টিল রড।' WHERE title = 'BSRM 500W';
UPDATE public.products SET title_bn = 'অটো ব্রিকস', description_bn = 'উন্নত মানের অটোমেটিক মেশিন-মেড ইট।' WHERE title = 'Auto Bricks';
UPDATE public.products SET title_bn = 'সিলেট বালু', description_bn = 'নির্মাণ কাজের জন্য পরিষ্কার সিলেট বালু।' WHERE title = 'Sylhet Sand';

-- Seed Bengali data for designers
UPDATE public.designers SET company_name_bn = 'আর্কিটেকচারাল সলিউশন' WHERE company_name = 'Architectural Solutions';

-- Seed Bengali data for design packages
UPDATE public.design_packages SET title_bn = 'আধুনিক ডুপ্লেক্স হোম ডিজাইন', description_bn = 'বিলাসবহুল ডুপ্লেক্স বাড়ির সম্পূর্ণ ডিজাইন সমাধান।' WHERE title = 'Modern Duplex Home Design';

-- Seed Bengali data for service packages
UPDATE public.service_packages SET title_bn = 'বাড়ি পেইন্টিং সার্ভিস', description_bn = 'আপনার বাড়ির জন্য পেশাদার পেইন্টিং এবং ফিনিশিং সেবা।' WHERE title = 'Home Painting Service';
