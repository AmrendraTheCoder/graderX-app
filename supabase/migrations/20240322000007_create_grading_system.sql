-- Create tables for the LNMIIT grading system

-- Subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code text NOT NULL UNIQUE,
    credits integer NOT NULL DEFAULT 3,
    semester integer NOT NULL,
    branch text DEFAULT 'Common',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- User grades table
CREATE TABLE IF NOT EXISTS public.user_grades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade text NOT NULL CHECK (grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F')),
    grade_points decimal(3,2) NOT NULL,
    semester integer NOT NULL,
    academic_year text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, subject_id, semester, academic_year)
);

-- CGPA calculations table
CREATE TABLE IF NOT EXISTS public.cgpa_calculations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    semester integer NOT NULL,
    sgpa decimal(4,2) NOT NULL,
    cgpa decimal(4,2) NOT NULL,
    total_credits integer NOT NULL,
    academic_year text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, semester, academic_year)
);

-- Add admin role to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'student' CHECK (role IN ('student', 'admin'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_lnmiit_email boolean DEFAULT false;

-- Insert default subjects for LNMIIT
INSERT INTO public.subjects (name, code, credits, semester, branch) VALUES
('Mathematics I', 'MATH101', 4, 1, 'Common'),
('Physics I', 'PHY101', 3, 1, 'Common'),
('Chemistry', 'CHEM101', 3, 1, 'Common'),
('Programming Fundamentals', 'CS101', 4, 1, 'Common'),
('English Communication', 'ENG101', 2, 1, 'Common'),
('Mathematics II', 'MATH102', 4, 2, 'Common'),
('Physics II', 'PHY102', 3, 2, 'Common'),
('Data Structures', 'CS102', 4, 2, 'CSE'),
('Digital Logic', 'CS103', 3, 2, 'Common'),
('Environmental Science', 'ENV101', 2, 2, 'Common')
ON CONFLICT (code) DO NOTHING;

-- Enable realtime for all tables (only if not already added)
DO $$
BEGIN
    -- Add subjects table to realtime if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'subjects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE subjects;
    END IF;
    
    -- Add user_grades table to realtime if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'user_grades'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE user_grades;
    END IF;
    
    -- Add cgpa_calculations table to realtime if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'cgpa_calculations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE cgpa_calculations;
    END IF;
END $$;

-- Create function to calculate grade points
CREATE OR REPLACE FUNCTION get_grade_points(grade_letter text)
RETURNS decimal(3,2) AS $$
BEGIN
    CASE grade_letter
        WHEN 'A+' THEN RETURN 10.00;
        WHEN 'A' THEN RETURN 9.00;
        WHEN 'B+' THEN RETURN 8.00;
        WHEN 'B' THEN RETURN 7.00;
        WHEN 'C+' THEN RETURN 6.00;
        WHEN 'C' THEN RETURN 5.00;
        WHEN 'D' THEN RETURN 4.00;
        WHEN 'F' THEN RETURN 0.00;
        ELSE RETURN 0.00;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to update CGPA automatically
CREATE OR REPLACE FUNCTION update_cgpa_calculation()
RETURNS TRIGGER AS $$
DECLARE
    total_grade_points decimal := 0;
    total_credits integer := 0;
    semester_grade_points decimal := 0;
    semester_credits integer := 0;
    calculated_sgpa decimal(4,2);
    calculated_cgpa decimal(4,2);
BEGIN
    -- Calculate SGPA for the current semester
    SELECT 
        COALESCE(SUM(ug.grade_points * s.credits), 0),
        COALESCE(SUM(s.credits), 0)
    INTO semester_grade_points, semester_credits
    FROM user_grades ug
    JOIN subjects s ON ug.subject_id = s.id
    WHERE ug.user_id = NEW.user_id 
    AND ug.semester = NEW.semester 
    AND ug.academic_year = NEW.academic_year;
    
    IF semester_credits > 0 THEN
        calculated_sgpa := semester_grade_points / semester_credits;
    ELSE
        calculated_sgpa := 0;
    END IF;
    
    -- Calculate overall CGPA
    SELECT 
        COALESCE(SUM(ug.grade_points * s.credits), 0),
        COALESCE(SUM(s.credits), 0)
    INTO total_grade_points, total_credits
    FROM user_grades ug
    JOIN subjects s ON ug.subject_id = s.id
    WHERE ug.user_id = NEW.user_id;
    
    IF total_credits > 0 THEN
        calculated_cgpa := total_grade_points / total_credits;
    ELSE
        calculated_cgpa := 0;
    END IF;
    
    -- Insert or update CGPA calculation
    INSERT INTO cgpa_calculations (user_id, semester, sgpa, cgpa, total_credits, academic_year)
    VALUES (NEW.user_id, NEW.semester, calculated_sgpa, calculated_cgpa, total_credits, NEW.academic_year)
    ON CONFLICT (user_id, semester, academic_year)
    DO UPDATE SET
        sgpa = calculated_sgpa,
        cgpa = calculated_cgpa,
        total_credits = EXCLUDED.total_credits,
        updated_at = timezone('utc'::text, now());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for CGPA calculation
DROP TRIGGER IF EXISTS trigger_update_cgpa ON user_grades;
CREATE TRIGGER trigger_update_cgpa
    AFTER INSERT OR UPDATE OR DELETE ON user_grades
    FOR EACH ROW EXECUTE FUNCTION update_cgpa_calculation();
