-- GHORBARI PLATFORM - INITIAL CONSOLIDATED SCHEMA
-- This schema covers: User Profiles, Designer/Seller Management, Marketplace, 
-- Service Workflows, Messaging, Cart Persistence, and Transaction Auditing.

-- 1. UTILITIES & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'designer', 'seller', 'admin');
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
    CREATE TYPE request_status AS ENUM (
        'pending_assignment', 'assigned', 'consultation_scheduled', 
        'in_progress', 'draft_submitted', 'revision_requested', 
        'final_submitted', 'completed', 'cancelled', 'disputed'
    );
    CREATE TYPE order_status AS ENUM (
        'pending', 'confirmed', 'processing', 'ready_to_ship', 
        'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are clickable" ON public.profiles FOR SELECT USING (true);

-- 4. PARTNER MANAGEMENT (Designers & Sellers)
CREATE TABLE public.designers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  specializations TEXT[] NOT NULL,
  bio TEXT,
  experience_years INTEGER,
  portfolio_url TEXT,
  verification_status verification_status DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT,
  primary_categories TEXT[],
  verification_status verification_status DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified designers" ON public.designers FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "Anyone can view verified sellers" ON public.sellers FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "Designers can update own data" ON public.designers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Sellers can update own data" ON public.sellers FOR UPDATE USING (user_id = auth.uid());

-- 5. MARKETPLACE (Categories & Products)
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.product_categories(id),
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  sku TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'piece',
  images TEXT[] NOT NULL,
  specifications JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers manage own products" ON public.products FOR ALL USING (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);

-- Search Index for Search Bar
CREATE INDEX idx_products_search ON public.products USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- 6. SERVICE WORKFLOWS
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_designer_id UUID REFERENCES public.designers(id),
  service_type TEXT NOT NULL,
  requirements JSONB NOT NULL,
  status request_status DEFAULT 'pending_assignment',
  consultation_scheduled_at TIMESTAMPTZ,
  consultation_link TEXT,
  quotation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own requests" ON public.service_requests FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Designers view assigned requests" ON public.service_requests FOR SELECT USING (
    assigned_designer_id IN (SELECT id FROM public.designers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins manage everything" ON public.service_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. COMMERCE (Cart, Orders, Transactions)
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  seller_id UUID REFERENCES public.sellers(id) NOT NULL,
  items JSONB NOT NULL, -- Snapshot of products at purchase
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  provider TEXT, -- SSLCommerz, Bkash, etc.
  provider_ref TEXT,
  status TEXT,
  related_order_id UUID REFERENCES public.orders(id),
  related_service_id UUID REFERENCES public.service_requests(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cart persistence" ON public.cart_items FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Order visibility" ON public.orders FOR SELECT USING (customer_id = auth.uid() OR seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- 8. COMMUNICATIONS
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1_id UUID REFERENCES public.profiles(id),
  participant_2_id UUID REFERENCES public.profiles(id),
  related_service_id UUID REFERENCES public.service_requests(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1_id, participant_2_id, related_service_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation access" ON public.conversations FOR SELECT USING (auth.uid() IN (participant_1_id, participant_2_id));
CREATE POLICY "Message access" ON public.messages FOR ALL USING (
    conversation_id IN (SELECT id FROM public.conversations WHERE auth.uid() IN (participant_1_id, participant_2_id))
);

-- 9. NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notify self" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- 10. TRIGGERS & AUTOMATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Valued Member'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_service_requests_modtime BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
