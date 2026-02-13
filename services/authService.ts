
import { Student, UserProfile, AdmissionData, Course, ResultRecord } from '../types';
import { COURSES as INITIAL_COURSES_RAW, TESTIMONIALS as INITIAL_TESTIMONIALS, BOUTIQUE_PRODUCTS as INITIAL_PRODUCTS_RAW } from '../constants';
import { supabase, isSupabaseConfigured, uploadImageToBucket } from './supabase';

const APPLICATIONS_KEY = 'applications';
const ENROLLED_KEY = 'admission_withdrawal'; 
const STAFF_KEY = 'staff';
const COURSES_KEY = 'courses';

const mapDbToStudent = (row: any): Student => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  guardianName: row.guardian_name,
  guardianRelation: row.guardian_relation,
  gender: row.gender,
  email: row.email,
  password: row.password,
  mobileNumber: row.mobile_number,
  guardianContact: row.guardian_contact,
  address: row.address,
  dateOfBirth: row.date_of_birth,
  qualification: row.qualification,
  majorSubject: row.major_subject,
  scoreType: row.score_type,
  scoreValue: row.score_value,
  lastSubject: row.last_subject,
  status: row.status,
  courseId: Number(row.course_id),
  background: row.background,
  passportPhoto: row.passport_photo,
  admissionStatus: row.admission_status as any,
  application_date: row.application_date,
  enrolledCourses: [Number(row.course_id)],
  nicNumber: row.nic_number || '',
  role: 'student',
  registrationNumber: row.registration_number
} as any);

const mapStudentToDb = (student: Partial<Student | AdmissionData>): any => ({
  first_name: student.firstName,
  last_name: student.lastName,
  guardian_name: student.guardianName,
  guardian_relation: student.guardianRelation,
  gender: student.gender,
  email: student.email,
  password: student.password,
  mobile_number: student.mobileNumber,
  guardian_contact: student.guardianContact,
  address: student.address,
  date_of_birth: student.dateOfBirth,
  qualification: student.qualification,
  major_subject: student.majorSubject,
  score_type: student.scoreType,
  score_value: student.scoreValue,
  last_subject: student.lastSubject,
  status: student.status,
  course_id: Number(student.courseId),
  background: student.background,
  passport_photo: student.passportPhoto,
  admission_status: (student as any).admissionStatus || 'pending',
  application_date: (student as any).applicationDate || new Date().toISOString(),
  nic_number: student.nicNumber
});

export const mockAuth = {
  login: async (email: string, pass: string): Promise<UserProfile | Student | null> => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin@ak.edu.pk' && pass === 'admin123') {
      return { id: 'admin-master', firstName: 'Principal', lastName: 'Akbar Khan', email: 'admin@ak.edu.pk', role: 'admin' };
    }

    if (isSupabaseConfigured && supabase) {
      const { data: staff } = await supabase.from(STAFF_KEY).select('*').eq('email', cleanEmail).eq('password', pass).eq('status', 'active').maybeSingle();
      if (staff) return { id: staff.id, firstName: staff.first_name, lastName: staff.last_name, email: staff.email, role: staff.role as any };

      const { data: enrolled } = await supabase.from(ENROLLED_KEY).select('*').eq('email', cleanEmail).eq('password', pass).maybeSingle();
      if (enrolled) return mapDbToStudent(enrolled);

      const { data: pending } = await supabase.from(APPLICATIONS_KEY).select('*').eq('email', cleanEmail).eq('password', pass).maybeSingle();
      if (pending) return mapDbToStudent(pending);
    }
    return null;
  },

  registerStudent: async (data: AdmissionData): Promise<Student | null> => {
    let finalPhotoUrl = data.passportPhoto;
    if (isSupabaseConfigured && data.passportPhoto && data.passportPhoto.startsWith('data:')) {
      const publicUrl = await uploadImageToBucket('student-records', `passport-${Date.now()}.webp`, data.passportPhoto);
      if (publicUrl) finalPhotoUrl = publicUrl;
    }

    if (isSupabaseConfigured && supabase) {
      const payload = mapStudentToDb(data);
      console.log("Attempting database sync for candidate...", payload);
      
      const { data: inserted, error } = await supabase.from(APPLICATIONS_KEY).insert([payload]).select().single();
      
      if (error) {
        console.error("Database Registry Error:", error.message, error.details, error.hint);
        return null;
      }
      return mapDbToStudent(inserted);
    }
    return null;
  },

  approveApplication: async (app: Student): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const payload = mapStudentToDb({ ...app, admissionStatus: 'approved' });
      const { error: insErr } = await supabase.from(ENROLLED_KEY).insert([payload]);
      if (insErr) {
        console.error("Enrollment error:", insErr.message);
        throw new Error("Registry move failed: " + insErr.message);
      }
      await supabase.from(APPLICATIONS_KEY).delete().eq('id', (app as any).id);
    }
  },

  getPendingApplications: async (): Promise<Student[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from(APPLICATIONS_KEY).select('*').order('application_date', { ascending: false });
      return (data || []).map(mapDbToStudent);
    }
    return [];
  },

  getCourses: async (): Promise<Course[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from(COURSES_KEY).select('*').order('id', { ascending: true });
      if (error) console.error("Fetch courses error:", error.message);
      if (data && data.length > 0) return data;
    }
    return INITIAL_COURSES_RAW;
  },

  createCourse: async (course: Omit<Course, 'id'>): Promise<Course | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from(COURSES_KEY).insert([course]).select().single();
      if (error) {
        console.error("Course creation error:", error.message);
        return null;
      }
      return data;
    }
    return null;
  },

  updateCourse: async (id: number, updates: Partial<Course>): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from(COURSES_KEY).update(updates).eq('id', id);
      if (error) console.error("Course update error:", error.message);
    }
  },

  deleteCourse: async (id: number): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from(COURSES_KEY).delete().eq('id', id);
      if (error) console.error("Course deletion error:", error.message);
    }
  },

  seedDatabase: async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: "Supabase connection not established." };
    }
    try {
      // Filter out 'id' for auto-incrementing SERIAL tables
      const coursesToSeed = INITIAL_COURSES_RAW.map(({ id, ...rest }) => rest);
      const { error } = await supabase.from(COURSES_KEY).upsert(coursesToSeed, { onConflict: 'title' });
      if (error) throw error;
      return { success: true, message: "Registry initialized with default curriculum." };
    } catch (err: any) {
      return { success: false, message: err.message || "Seeding failed." };
    }
  },

  checkStatus: async (email: string, dob: string): Promise<Student | null> => {
    const cleanEmail = email.toLowerCase().trim();
    if (isSupabaseConfigured && supabase) {
      const { data: enrolled } = await supabase.from(ENROLLED_KEY).select('*').eq('email', cleanEmail).eq('date_of_birth', dob).maybeSingle();
      if (enrolled) return mapDbToStudent(enrolled);
      const { data: pending } = await supabase.from(APPLICATIONS_KEY).select('*').eq('email', cleanEmail).eq('date_of_birth', dob).maybeSingle();
      if (pending) return mapDbToStudent(pending);
    }
    return null;
  },

  resetPassword: async (email: string, mobile: string, dob: string, newPass: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();
    if (isSupabaseConfigured && supabase) {
      const { data: enrolled } = await supabase.from(ENROLLED_KEY).select('*').eq('email', cleanEmail).eq('mobile_number', mobile).eq('date_of_birth', dob).maybeSingle();
      if (enrolled) {
        const { error } = await supabase.from(ENROLLED_KEY).update({ password: newPass }).eq('id', enrolled.id);
        return !error;
      }
      const { data: pending } = await supabase.from(APPLICATIONS_KEY).select('*').eq('email', cleanEmail).eq('mobile_number', mobile).eq('date_of_birth', dob).maybeSingle();
      if (pending) {
        const { error = null } = await supabase.from(APPLICATIONS_KEY).update({ password: newPass }).eq('id', pending.id);
        return !error;
      }
    }
    return false;
  },

  getStories: async () => INITIAL_TESTIMONIALS,
  getBoutiqueProducts: async () => INITIAL_PRODUCTS_RAW,
  fetchResult: async (roll: string): Promise<ResultRecord | null> => {
    const results: ResultRecord[] = [{
      rollNumber: '1001',
      name: 'Sana Ahmed',
      fatherName: 'Ahmed Khan',
      session: 'Annual 2023',
      courseTitle: 'Fashion Designing & Textile Art',
      totalObtained: 580,
      totalMax: 600,
      grade: 'A+',
      status: 'Pass',
      marks: [{ theory: 180, practical: 400, total: 580, max: 600 }]
    }];
    return results.find(r => r.rollNumber === roll) || null;
  }
};
