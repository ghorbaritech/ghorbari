-- Add 'partner' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';

-- Create service_providers table
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  service_types TEXT[] NOT NULL, -- e.g. ['Construction', 'Interior', 'Maintenance']
  experience_years INTEGER,
  portfolio JSONB DEFAULT '[]'::jsonb, -- Array of { title, image_url, description }
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  verification_status verification_status DEFAULT 'pending',
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view verified service providers" 
  ON public.service_providers FOR SELECT 
  USING (verification_status = 'verified');

CREATE POLICY "Service providers can update own data" 
  ON public.service_providers FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Service providers can view own data" 
  ON public.service_providers FOR SELECT 
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_service_providers_modtime 
  BEFORE UPDATE ON public.service_providers 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
