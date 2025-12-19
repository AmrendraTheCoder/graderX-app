-- Update credits column to support decimal values
-- Run this in your Supabase SQL Editor

-- First, check current column type
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'subjects' AND column_name = 'credits';

-- Change credits column from integer to decimal/numeric
ALTER TABLE public.subjects 
ALTER COLUMN credits TYPE NUMERIC(3,1);

-- Add a check constraint to ensure valid credit values
ALTER TABLE public.subjects 
ADD CONSTRAINT subjects_credits_check 
CHECK (credits >= 0.5 AND credits <= 10.0);

-- Verify the changes
SELECT id, name, code, credits, semester FROM public.subjects LIMIT 5;

-- Check the updated column type
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'subjects' AND column_name = 'credits'; 