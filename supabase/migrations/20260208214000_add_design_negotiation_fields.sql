-- Add new statuses to the enum
-- Note: 'ALTER TYPE ... ADD VALUE' cannot be executed inside a transaction block in some Postgres versions.
-- If this script fails, run the ALTER TYPE commands separately.

ALTER TYPE design_booking_status ADD VALUE IF NOT EXISTS 'quotation';
ALTER TYPE design_booking_status ADD VALUE IF NOT EXISTS 'in_progress';

-- Add new columns to design_bookings
ALTER TABLE design_bookings
ADD COLUMN IF NOT EXISTS quotation_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS agreed_amount decimal,
ADD COLUMN IF NOT EXISTS milestones jsonb DEFAULT '[]'::jsonb;

-- Comment on columns
COMMENT ON COLUMN design_bookings.quotation_history IS 'List of offers and counter-offers: [{ role: "admin" | "customer", amount: 1000, notes: "...", date: "..." }]';
COMMENT ON COLUMN design_bookings.milestones IS 'List of project milestones: [{ name: "Requirement Analysis", status: "pending" | "completed", due_date: "..." }]';
