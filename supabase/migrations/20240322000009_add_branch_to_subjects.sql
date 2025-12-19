-- Add branch column to subjects table

-- Add branch column for subject's academic branch
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS branch text DEFAULT 'Common';

-- Update existing subjects to have a default branch
UPDATE public.subjects SET branch = 'Common' WHERE branch IS NULL; 