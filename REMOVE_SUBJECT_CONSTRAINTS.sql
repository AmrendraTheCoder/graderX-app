-- Remove constraints and allow same subjects across different branches
-- Run this in your Supabase SQL Editor

-- First, let's see what constraints currently exist
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    col.column_name
FROM 
    pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN information_schema.columns col ON col.table_name = rel.relname
WHERE 
    rel.relname = 'subjects'
    AND con.contype IN ('u', 'p', 'c')  -- unique, primary key, check constraints
ORDER BY con.conname;

-- Add branch column if it doesn't exist (in case it's missing)
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Common';

-- Update existing subjects to have a default branch if null
UPDATE public.subjects 
SET branch = 'Common' 
WHERE branch IS NULL;

-- Drop any unique constraint on the code column (if it exists)
-- This allows same subject codes to exist for different branches
DO $$ 
BEGIN
    -- Try to drop unique constraint on code (might have different names)
    IF EXISTS (
        SELECT 1 FROM pg_constraint con 
        JOIN pg_class rel ON rel.oid = con.conrelid 
        WHERE rel.relname = 'subjects' 
        AND con.contype = 'u'
        AND EXISTS (
            SELECT 1 FROM pg_attribute attr 
            WHERE attr.attrelid = con.conrelid 
            AND attr.attnum = ANY(con.conkey)
            AND attr.attname = 'code'
        )
    ) THEN
        -- Find and drop the constraint
        EXECUTE (
            SELECT 'ALTER TABLE public.subjects DROP CONSTRAINT ' || con.conname
            FROM pg_constraint con 
            JOIN pg_class rel ON rel.oid = con.conrelid 
            WHERE rel.relname = 'subjects' 
            AND con.contype = 'u'
            AND EXISTS (
                SELECT 1 FROM pg_attribute attr 
                WHERE attr.attrelid = con.conrelid 
                AND attr.attnum = ANY(con.conkey)
                AND attr.attname = 'code'
            )
            LIMIT 1
        );
        RAISE NOTICE 'Dropped unique constraint on code column';
    ELSE
        RAISE NOTICE 'No unique constraint found on code column';
    END IF;
END $$;

-- Remove any check constraints that might be too restrictive
-- Drop the credits check constraint if it exists and recreate with better range
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint con 
        JOIN pg_class rel ON rel.oid = con.conrelid 
        WHERE rel.relname = 'subjects' 
        AND con.conname = 'subjects_credits_check'
    ) THEN
        ALTER TABLE public.subjects DROP CONSTRAINT subjects_credits_check;
        RAISE NOTICE 'Dropped existing credits check constraint';
    END IF;
END $$;

-- Add a more flexible credits constraint
ALTER TABLE public.subjects 
ADD CONSTRAINT subjects_credits_check 
CHECK (credits >= 0.5 AND credits <= 20.0);

-- Update the credits column to support decimals if it's still integer
ALTER TABLE public.subjects 
ALTER COLUMN credits TYPE NUMERIC(4,1);

-- Create a compound unique constraint on (code, branch, semester) to prevent 
-- exact duplicates within the same branch and semester, but allow same code across branches
-- Comment this out if you want to allow even exact duplicates
/*
ALTER TABLE public.subjects 
ADD CONSTRAINT subjects_code_branch_semester_unique 
UNIQUE (code, branch, semester);
*/

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_branch ON public.subjects(branch);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester);
CREATE INDEX IF NOT EXISTS idx_subjects_code_branch ON public.subjects(code, branch);

-- Verify the changes
SELECT 
    'Current subjects table structure:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'subjects' 
ORDER BY ordinal_position;

-- Show current constraints
SELECT 
    'Current constraints:' as info,
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    CASE con.contype 
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'p' THEN 'PRIMARY KEY' 
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
    END AS constraint_description
FROM 
    pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
WHERE 
    rel.relname = 'subjects'
ORDER BY con.conname;

-- Sample test data to verify it works
-- (Uncomment these if you want to test)
/*
INSERT INTO public.subjects (name, code, credits, semester, branch) VALUES 
('Mathematics I', 'MATH101', 4.0, 1, 'CSE'),
('Mathematics I', 'MATH101', 4.0, 1, 'ECE'),
('Mathematics I', 'MATH101', 4.0, 1, 'ME'),
('Data Structures', 'CS201', 4.0, 3, 'CSE'),
('Digital Signal Processing', 'EC301', 4.0, 5, 'ECE');
*/

-- Final verification query
SELECT id, name, code, credits, semester, branch 
FROM public.subjects 
ORDER BY code, branch, semester
LIMIT 10; 