-- Add latitude and longitude to episodes table
ALTER TABLE public.episodes
ADD COLUMN latitude float8,
ADD COLUMN longitude float8;
