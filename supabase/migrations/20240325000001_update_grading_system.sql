-- Update grading system to use A, AB, B, BC, C, CD, D, F scale

-- Drop the existing constraint
ALTER TABLE public.user_grades DROP CONSTRAINT IF EXISTS user_grades_grade_check;

-- Add new constraint with updated grades
ALTER TABLE public.user_grades ADD CONSTRAINT user_grades_grade_check 
CHECK (grade IN ('A', 'AB', 'B', 'BC', 'C', 'CD', 'D', 'F'));

-- Update existing grades if any exist (mapping old grades to new ones)
UPDATE public.user_grades SET grade = 'A' WHERE grade IN ('A+', 'A');
UPDATE public.user_grades SET grade = 'AB' WHERE grade = 'B+';
UPDATE public.user_grades SET grade = 'B' WHERE grade = 'B';
UPDATE public.user_grades SET grade = 'BC' WHERE grade = 'C+';
UPDATE public.user_grades SET grade = 'C' WHERE grade = 'C';
UPDATE public.user_grades SET grade = 'CD' WHERE grade = 'D';
-- D and F remain the same

-- Update the grade points calculation function
CREATE OR REPLACE FUNCTION get_grade_points(grade_letter text)
RETURNS decimal(3,2) AS $$
BEGIN
    CASE grade_letter
        WHEN 'A' THEN RETURN 10.00;
        WHEN 'AB' THEN RETURN 9.00;
        WHEN 'B' THEN RETURN 8.00;
        WHEN 'BC' THEN RETURN 7.00;
        WHEN 'C' THEN RETURN 6.00;
        WHEN 'CD' THEN RETURN 5.00;
        WHEN 'D' THEN RETURN 4.00;
        WHEN 'F' THEN RETURN 0.00;
        ELSE RETURN 0.00;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Update existing grade points for any existing records
UPDATE public.user_grades SET 
    grade_points = get_grade_points(grade)
WHERE grade_points != get_grade_points(grade); 