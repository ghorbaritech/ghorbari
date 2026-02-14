-- Add assignment columns
ALTER TABLE design_bookings
ADD COLUMN IF NOT EXISTS assigned_seller_id uuid REFERENCES public.sellers(id),
ADD COLUMN IF NOT EXISTS assigned_designer_id uuid REFERENCES public.designers(id);

-- Update Policies to allow Appointed Partners to view their bookings
-- Creating a new policy for Sellers
CREATE POLICY "Sellers can view assigned bookings"
ON design_bookings FOR SELECT
USING (
    assigned_seller_id IN (
        SELECT id FROM sellers WHERE user_id = auth.uid()
    )
);

-- Creating a new policy for Designers
CREATE POLICY "Designers can view assigned bookings"
ON design_bookings FOR SELECT
USING (
    assigned_designer_id IN (
        SELECT id FROM designers WHERE user_id = auth.uid()
    )
);

-- Allow Partners to Update Milestones (and only milestones/status, logically enforced by app, but RLS allows update)
-- For strict security, we could use a function or check() on specific columns, but for now simple RLS:
CREATE POLICY "Sellers can update assigned bookings"
ON design_bookings FOR UPDATE
USING (
    assigned_seller_id IN (
        SELECT id FROM sellers WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Designers can update assigned bookings"
ON design_bookings FOR UPDATE
USING (
    assigned_designer_id IN (
        SELECT id FROM designers WHERE user_id = auth.uid()
    )
);
