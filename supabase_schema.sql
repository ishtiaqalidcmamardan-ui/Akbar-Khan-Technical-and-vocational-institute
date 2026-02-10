
-- ========================================================
-- Akbar Khan Technical and Vocational Institute (Regd. TTB)
-- ROBUST DATABASE SCHEMA (Standard PostgreSQL)
-- ========================================================

/* 
  📝 SUPABASE AI ASSISTANT PROMPT 
  (Copy & Paste this into the Supabase Studio AI Chat to auto-generate the schema):

  "Create a PostgreSQL schema for the Akbar Khan Institute with these tables:
  1. site_settings: (key text primary key, value text)
  2. staff: (id text pk, first_name, last_name, email unique, password, role [admin/instructor], status [active/suspended])
  3. courses: (id text pk, title, description, category, duration, image, status, contents jsonb, next_class_time timestamptz)
  4. applications: (id text pk, first_name, last_name, email unique, password, guardian_name, course_id references courses, admission_status [pending], application_date timestamptz default now(), passport_photo text)
  5. admission_withdrawal: (id_serial serial pk, id unique, first_name, last_name, email unique, password, course_id references courses, admission_status [approved], registration_number text, application_date timestamptz default now(), passport_photo text). 
  6. rejected_applications: (id pk, email unique, first_name, last_name, course_id, admission_status [rejected])
  7. ak_attendance_logs: (date date, course_id references courses, present_student_ids jsonb, total_present int). Set a unique constraint on (date, course_id).
  
  Logic: Add a trigger to 'admission_withdrawal' that sets 'registration_number' to 'AKTVI/XXXX/YYYY' where XXXX is 'id_serial' (zero-padded to 4 digits) and YYYY is the current year.
  Security: Enable RLS on all tables. Public can read 'site_settings' and 'courses'. Staff can manage all tables. Students can read their own records from 'applications' and 'admission_withdrawal' based on their email."
*/

-- 1. CMS SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. STAFF REGISTRY
CREATE TABLE IF NOT EXISTS public.staff (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'instructor')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    duration TEXT,
    image TEXT,
    status TEXT DEFAULT 'active',
    contents JSONB DEFAULT '[]',
    next_class_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PENDING APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    guardian_name TEXT,
    guardian_relation TEXT,
    gender TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    mobile_number TEXT,
    guardian_contact TEXT,
    address TEXT,
    date_of_birth DATE,
    qualification TEXT,
    major_subject TEXT,
    score_type TEXT,
    score_value TEXT,
    last_subject TEXT,
    status TEXT,
    course_id TEXT REFERENCES public.courses(id),
    background TEXT,
    passport_photo TEXT,
    admission_status TEXT DEFAULT 'pending',
    application_date TIMESTAMPTZ DEFAULT now()
);

-- 5. ENROLLED STUDENTS (Admission Withdrawal)
CREATE TABLE IF NOT EXISTS public.admission_withdrawal (
    id_serial SERIAL PRIMARY KEY,
    id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    course_id TEXT REFERENCES public.courses(id),
    admission_status TEXT DEFAULT 'approved',
    registration_number TEXT, -- Populated by trigger
    application_date TIMESTAMPTZ DEFAULT now(),
    guardian_name TEXT,
    guardian_relation TEXT,
    gender TEXT,
    mobile_number TEXT,
    guardian_contact TEXT,
    address TEXT,
    date_of_birth DATE,
    qualification TEXT,
    major_subject TEXT,
    score_type TEXT,
    score_value TEXT,
    last_subject TEXT,
    status TEXT,
    background TEXT,
    passport_photo TEXT
);

-- 6. REJECTED ARCHIVES
CREATE TABLE IF NOT EXISTS public.rejected_applications (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    course_id TEXT,
    admission_status TEXT DEFAULT 'rejected',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.ak_attendance_logs (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    course_id TEXT REFERENCES public.courses(id),
    present_student_ids JSONB DEFAULT '[]',
    total_present INTEGER DEFAULT 0,
    UNIQUE(date, course_id)
);

-- ========================================================
-- REGISTRATION NUMBER TRIGGER (ROBUST VERSION)
-- ========================================================

CREATE OR REPLACE FUNCTION generate_reg_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Use COALESCE to handle cases where application_date might be null during insert
    NEW.registration_number := 'AKTVI/' || 
                               LPAD(NEW.id_serial::text, 4, '0') || '/' || 
                               TO_CHAR(COALESCE(NEW.application_date, now()), 'YYYY');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_reg_number ON public.admission_withdrawal;
CREATE TRIGGER tr_generate_reg_number
BEFORE INSERT ON public.admission_withdrawal
FOR EACH ROW EXECUTE FUNCTION generate_reg_number();

-- ========================================================
-- SECURITY POLICIES
-- ========================================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_withdrawal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ak_attendance_logs ENABLE ROW LEVEL SECURITY;

-- Permissions
CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Courses" ON public.courses FOR SELECT USING (true);

-- Staff can do everything
CREATE POLICY "Staff Manage All" ON public.staff FOR ALL USING (true);
CREATE POLICY "Staff Manage Courses" ON public.courses FOR ALL USING (true);
CREATE POLICY "Staff Manage Applications" ON public.applications FOR ALL USING (true);
CREATE POLICY "Staff Manage Withdrawal" ON public.admission_withdrawal FOR ALL USING (true);
CREATE POLICY "Staff Manage Attendance" ON public.ak_attendance_logs FOR ALL USING (true);

-- Students can read their own data by email
CREATE POLICY "Student Read Own App" ON public.applications FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Student Read Own Enrollment" ON public.admission_withdrawal FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');
