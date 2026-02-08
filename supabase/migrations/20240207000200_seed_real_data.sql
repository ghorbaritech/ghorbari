-- 1. Relax constraints on sellers table to allow "System Sellers" without real auth users
ALTER TABLE public.sellers ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.sellers DROP CONSTRAINT IF EXISTS sellers_user_id_fkey;

-- 2. Create Real Seller Records with valid UUIDs
INSERT INTO public.sellers (id, business_name, verification_status, is_active)
VALUES 
    ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Seven Rings Cement Official', 'verified', true),
    ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'BSRM Steels Official', 'verified', true),
    ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'Standard Bricks Official', 'verified', true)
ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name;

-- 3. Create Categories
INSERT INTO public.product_categories (id, name, slug)
VALUES 
    ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Building Materials', 'building-materials'),
    ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Steel', 'steel'),
    ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Bricks', 'bricks')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Platform Configs
INSERT INTO public.platform_configs (category_id, vat_rate, platform_fee_rate, advance_payment_rate, is_active)
VALUES 
    ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 7.5, 2.0, 10.0, true),
    ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 5.0, 1.5, 10.0, true),
    ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 7.0, 2.0, 10.0, true)
ON CONFLICT (category_id) DO NOTHING;

-- 5. Seed Real Products
INSERT INTO public.products (id, seller_id, category_id, sku, title, base_price, images, stock_quantity, status)
VALUES 
    ('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'CEM-001', 'Portland Composite Cement', 520, ARRAY['https://images.unsplash.com/photo-1574949955572-37e58c18bafb?w=600'], 1000, 'active'),
    ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'STL-001', 'BSRM Xtreme 500W', 92000, ARRAY['https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=600'], 50, 'active'),
    ('b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3', 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'BRK-001', 'Auto Bricks (1st Class)', 12, ARRAY['https://images.unsplash.com/photo-1582564286939-400a311013a2?w=600'], 5000, 'active')
ON CONFLICT (id) DO NOTHING;
