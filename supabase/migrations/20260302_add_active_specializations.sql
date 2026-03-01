-- Add active_specializations to designers table
ALTER TABLE public.designers
ADD COLUMN active_specializations text[] DEFAULT '{}'::text[];

-- Update existing designers to have active_specializations equal to their assigned specializations
UPDATE public.designers
SET active_specializations = COALESCE(specializations, '{}'::text[]);

-- Add active_service_types to service_providers table
ALTER TABLE public.service_providers
ADD COLUMN active_service_types text[] DEFAULT '{}'::text[];

-- Update existing service_providers to have active_service_types equal to their assigned service_types
UPDATE public.service_providers
SET active_service_types = COALESCE(service_types, '{}'::text[]);
