-- Create a versatile table for all design booking types
create type design_service_type as enum ('architectural', 'structural', 'interior');
create type design_booking_status as enum ('pending', 'verified', 'assigned', 'completed', 'cancelled');

create table design_bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  service_type design_service_type not null,
  status design_booking_status default 'pending' not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table design_bookings enable row level security;

-- Policies for Users (Can create and view their own)
create policy "Users can create their own bookings"
  on design_bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own bookings"
  on design_bookings for select
  using (auth.uid() = user_id);

-- Policies for Admins (Can view and update all)
-- Assuming you have a way to identify admins, e.g., a role or a separate table.
-- For now, allowing authenticated users to insert, and maybe rely on a separate admin check or dashboard logic.
-- Ideally:
-- create policy "Admins can view all bookings"
--   on design_bookings for select
--   using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_design_bookings_updated_at
before update on design_bookings
for each row
execute function update_updated_at_column();
