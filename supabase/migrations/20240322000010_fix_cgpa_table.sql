-- Fix CGPA calculations table

-- Add missing total_grade_points column
ALTER TABLE public.cgpa_calculations ADD COLUMN IF NOT EXISTS total_grade_points decimal(8,2) DEFAULT 0; 