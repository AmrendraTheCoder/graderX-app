-- Add branch column to subjects table
-- Run this in your Supabase SQL Editor

-- First, check current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'subjects' 
ORDER BY ordinal_position;

-- Add branch column if it doesn't exist
ALTER TABLE public.subjects 
ADD COLUMN branch TEXT DEFAULT 'Common';

-- Update existing subjects to have a default branch
UPDATE public.subjects 
SET branch = 'Common' 
WHERE branch IS NULL;

-- Add a check constraint to ensure only valid branches
ALTER TABLE public.subjects 
ADD CONSTRAINT subjects_branch_check 
CHECK (branch IN ('Common', 'CSE', 'ECE', 'ME', 'CE', 'CCE', 'Other'));

-- Create an index for better performance when filtering by branch
CREATE INDEX idx_subjects_branch ON public.subjects(branch);

-- Verify the changes
SELECT * FROM public.subjects LIMIT 5; 