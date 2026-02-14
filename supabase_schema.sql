
-- ========================================================
-- Akbar Khan Technical and Vocational Institute (Regd. TTB)
-- ROBUST DATABASE SCHEMA (Numeric ID Edition)
-- ========================================================

-- 1. CMS SETTINGS (Uses natural key, but we add an ID for standard)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. COURSES (Registry of Subjects/Trades)
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    duration TEXT,
    image TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'frozen')),
    contents JSONB DEFAULT '[]',
    next_class_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. STAFF REGISTRY
CREATE TABLE IF NOT EXISTS public.staff (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'instructor')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PENDING APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
    id SERIAL PRIMARY KEY,
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
    course_id INTEGER REFERENCES public.courses(id),
    background TEXT,
    passport_photo TEXT,
    admission_status TEXT DEFAULT 'pending',
    application_date TIMESTAMPTZ DEFAULT now(),
    nic_number TEXT
);

-- 5. ENROLLED STUDENTS (Admission Withdrawal Registry)
CREATE TABLE IF NOT EXISTS public.admission_withdrawal (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    course_id INTEGER REFERENCES public.courses(id),
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
    passport_photo TEXT,
    nic_number TEXT
);

-- 6. REJECTED ARCHIVES
CREATE TABLE IF NOT EXISTS public.rejected_applications (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    course_id INTEGER,
    admission_status TEXT DEFAULT 'rejected',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ATTENDANCE LOGS
CREATE TABLE IF NOT EXISTS public.ak_attendance_logs (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    course_id INTEGER REFERENCES public.courses(id),
    present_student_ids JSONB DEFAULT '[]',
    total_present INTEGER DEFAULT 0,
    UNIQUE(date, course_id)
);

-- ========================================================
-- REGISTRATION NUMBER TRIGGER
-- ========================================================

CREATE OR REPLACE FUNCTION generate_reg_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.registration_number := 'AKTVI/' || 
                               LPAD(NEW.id::text, 4, '0') || '/' || 
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

CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Staff Manage All" ON public.staff FOR ALL USING (true);
CREATE POLICY "Staff Manage Courses" ON public.courses FOR ALL USING (true);
CREATE POLICY "Staff Manage Applications" ON public.applications FOR ALL USING (true);
CREATE POLICY "Staff Manage Withdrawal" ON public.admission_withdrawal FOR ALL USING (true);
CREATE POLICY "Staff Manage Attendance" ON public.ak_attendance_logs FOR ALL USING (true);
