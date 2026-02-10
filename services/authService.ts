
import { Student, UserProfile, AdmissionData, Course, ResultRecord, Achievement, Product, Testimonial, AttendanceLog } from '../types';
import { COURSES as INITIAL_COURSES_RAW, BOUTIQUE_PRODUCTS as INITIAL_PRODUCTS_RAW, ACHIEVEMENTS as INITIAL_ACHIEVEMENTS, TESTIMONIALS as INITIAL_TESTIMONIALS } from '../constants';
import { supabase, isSupabaseConfigured } from './supabase';

// Table Keys
const APPLICATIONS_KEY = 'applications';
const WITHDRAWAL_KEY = 'admission_withdrawal'; 
const REJECTED_KEY = 'rejected_applications';
const ATTENDANCE_KEY = 'ak_attendance_logs';
const STAFF_KEY = 'staff';

const COURSES_STORAGE_KEY = 'ak_courses_persistent_db';
const STORIES_STORAGE_KEY = 'ak_stories_persistent_db';
const PRODUCTS_STORAGE_KEY = 'ak_products_persistent_db';

export interface AuditReport {
  counts: { pending: number; enrolled: number; rejected: number; courses: number; staff: number };
  violations: { id: string; name: string; issue: string; table: string }[];
  healthScore: number;
  dbStatus: string;
}

/**
 * DB Mappers to bridge the gap between JS CamelCase and DB SnakeCase
 */
const mapStaffToUserProfile = (dbRow: any): UserProfile => ({
  id: dbRow.id,
  firstName: dbRow.first_name,
  lastName: dbRow.last_name,
  email: dbRow.email,
  password: dbRow.password,
  role: dbRow.role,
  mobileNumber: dbRow.mobile_number || '', 
  dateOfBirth: dbRow.date_of_birth || ''
});

const mapUserProfileToStaff = (profile: UserProfile): any => ({
  id: profile.id,
  first_name: profile.firstName,
  last_name: profile.lastName,
  email: profile.email,
  password: profile.password,
  role: profile.role,
  status: profile.password ? 'active' : 'suspended'
});

const mapStudentToDb = (student: any): any => ({
  id: student.id,
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
  course_id: student.courseId,
  background: student.background,
  passport_photo: student.passportPhoto,
  admission_status: student.admissionStatus,
  application_date: student.applicationDate,
  nic_number: student.nicNumber
});

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
  courseId: row.course_id,
  background: row.background,
  passportPhoto: row.passport_photo,
  admissionStatus: row.admission_status as any,
  applicationDate: row.application_date,
  enrolledCourses: [row.course_id],
  nicNumber: row.nic_number || '',
  role: 'student'
});

export const mockAuth = {
  getDbStatus: () => isSupabaseConfigured ? 'Cloud Active' : 'Mock Mode (Local)',

  login: async (email: string, pass: string): Promise<UserProfile | Student | null> => {
    // 1. Emergency Fallback Admin
    if (email.toLowerCase() === 'admin@ak.edu.pk' && pass === 'admin123') {
      return { 
        id: 'admin-master', 
        firstName: 'Principal', 
        lastName: 'Akbar Khan', 
        email: 'admin@ak.edu.pk', 
        role: 'admin' 
      };
    }

    // 2. Cloud Auth Check
    if (isSupabaseConfigured && supabase) {
      const { data: staffData } = await supabase
        .from(STAFF_KEY)
        .select('*')
        .eq('email', email)
        .eq('password', pass)
        .eq('status', 'active')
        .maybeSingle();
      
      if (staffData) return mapStaffToUserProfile(staffData);

      const { data: studentData } = await supabase
        .from(WITHDRAWAL_KEY)
        .select('*')
        .eq('email', email)
        .eq('password', pass)
        .maybeSingle();
      
      if (studentData) return mapDbToStudent(studentData);
    }

    // 3. Local Mock Check
    const staff: UserProfile[] = JSON.parse(localStorage.getItem(`ak_${STAFF_KEY}_db`) || '[]');
    const member = staff.find(s => s.email.toLowerCase() === email.toLowerCase() && s.password === pass);
    if (member) return member;

    const enrolled: Student[] = JSON.parse(localStorage.getItem(`ak_${WITHDRAWAL_KEY}_db`) || '[]');
    const student = enrolled.find(s => s.email.toLowerCase() === email.toLowerCase() && s.password === pass);
    if (student) return { ...student, role: 'student' };

    return null;
  },

  getStaff: async (): Promise<UserProfile[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from(STAFF_KEY).select('*').order('created_at', { ascending: false });
      if (!error && data) return data.map(mapStaffToUserProfile);
    }
    return JSON.parse(localStorage.getItem(`ak_${STAFF_KEY}_db`) || '[]');
  },

  saveStaff: async (member: UserProfile) => {
    const id = member.id || 'staff-' + Date.now();
    const staffRecord = mapUserProfileToStaff({ ...member, id });

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from(STAFF_KEY).upsert([staffRecord]);
      if (error) throw error;
    }
    
    const staff = await mockAuth.getStaff();
    const idx = staff.findIndex(s => s.id === id);
    const profile = mapStaffToUserProfile(staffRecord);
    if (idx > -1) staff[idx] = profile; else staff.push(profile);
    localStorage.setItem(`ak_${STAFF_KEY}_db`, JSON.stringify(staff));
  },

  removeStaff: async (id: string) => {
    if (id === 'admin-master') throw new Error("Cannot remove primary administrator.");

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from(STAFF_KEY).delete().eq('id', id);
      if (error) throw error;
    }
    const staff = await mockAuth.getStaff();
    localStorage.setItem(`ak_${STAFF_KEY}_db`, JSON.stringify(staff.filter(s => s.id !== id)));
  },

  resetPassword: async (email: string, mobile: string, dob: string, newPass: string): Promise<boolean> => {
    const tableKeys = [STAFF_KEY, WITHDRAWAL_KEY, APPLICATIONS_KEY];
    
    if (isSupabaseConfigured && supabase) {
      for (const table of tableKeys) {
        const { data } = await supabase.from(table).select('id').eq('email', email).maybeSingle();
        if (data) {
          const { error } = await supabase.from(table).update({ password: newPass }).eq('id', data.id);
          return !error;
        }
      }
    }

    for (const table of tableKeys) {
      const list: any[] = JSON.parse(localStorage.getItem(`ak_${table}_db`) || '[]');
      const index = list.findIndex(s => s.email === email);
      if (index !== -1) {
        list[index].password = newPass;
        localStorage.setItem(`ak_${table}_db`, JSON.stringify(list));
        return true;
      }
    }
    return false;
  },

  registerStudent: async (data: AdmissionData): Promise<Student | null> => {
    const newApp: Student = {
      ...data,
      id: 'app-' + Date.now(),
      role: 'student',
      admissionStatus: 'pending',
      applicationDate: new Date().toISOString(),
      enrolledCourses: [data.courseId]
    };

    if (isSupabaseConfigured && supabase) {
      const dbRow = mapStudentToDb(newApp);
      const { error } = await supabase.from(APPLICATIONS_KEY).insert([dbRow]);
      if (error) return null;
    } else {
      const pending: Student[] = JSON.parse(localStorage.getItem(`ak_${APPLICATIONS_KEY}_db`) || '[]');
      if (pending.some(a => a.email === data.email)) return null;
      pending.push(newApp);
      localStorage.setItem(`ak_${APPLICATIONS_KEY}_db`, JSON.stringify(pending));
    }
    return newApp;
  },

  getPendingApplications: async (): Promise<Student[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from(APPLICATIONS_KEY).select('*');
      if (data) return data.map(mapDbToStudent);
    }
    return JSON.parse(localStorage.getItem(`ak_${APPLICATIONS_KEY}_db`) || '[]');
  },

  getEnrolledStudents: async (): Promise<Student[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from(WITHDRAWAL_KEY).select('*');
      if (data) return data.map(mapDbToStudent);
    }
    return JSON.parse(localStorage.getItem(`ak_${WITHDRAWAL_KEY}_db`) || '[]');
  },

  getRejectedApplications: async (): Promise<Student[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from(REJECTED_KEY).select('*');
      if (data) return data.map(mapDbToStudent);
    }
    return JSON.parse(localStorage.getItem(`ak_${REJECTED_KEY}_db`) || '[]');
  },

  getAttendanceLogs: async (): Promise<AttendanceLog[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from(ATTENDANCE_KEY).select('*').order('date', { ascending: false });
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
  },

  saveAttendanceLog: async (log: AttendanceLog): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from(ATTENDANCE_KEY).upsert([log], { onConflict: 'date,course_id' });
    }
    const logs: AttendanceLog[] = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
    const existingIdx = logs.findIndex(l => l.date === log.date && l.course_id === log.course_id);
    if (existingIdx > -1) {
      logs[existingIdx] = { ...log, timestamp: new Date().toISOString() };
    } else {
      logs.push(log);
    }
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(logs));
  },

  getSystemAudit: async (): Promise<AuditReport> => {
    const pending = await mockAuth.getPendingApplications();
    const enrolled = await mockAuth.getEnrolledStudents();
    const rejected = await mockAuth.getRejectedApplications();
    const courses = await mockAuth.getCourses();
    const staff = await mockAuth.getStaff();
    
    const violations: AuditReport['violations'] = [];
    const emailsSeen = new Set<string>();
    
    const checkList = [
      { data: pending, label: 'Applications' },
      { data: enrolled, label: 'Withdrawal Reg' },
      { data: rejected, label: 'Rejected' },
      { data: staff, label: 'Staff' }
    ];

    checkList.forEach(list => {
      list.data.forEach((s: any) => {
        if (s.email && emailsSeen.has(s.email)) {
          violations.push({ id: s.id, name: `${s.firstName} ${s.lastName}`, issue: `Duplicate Email: ${s.email}`, table: list.label });
        }
        if (s.email) emailsSeen.add(s.email);
      });
    });

    const totalRecords = pending.length + enrolled.length + rejected.length;
    const healthScore = totalRecords === 0 ? 100 : Math.round(((totalRecords - violations.length) / totalRecords) * 100);

    return {
      counts: { pending: pending.length, enrolled: enrolled.length, rejected: rejected.length, courses: courses.length, staff: staff.length },
      violations,
      healthScore,
      dbStatus: mockAuth.getDbStatus()
    };
  },

  approveApplication: async (app: Student): Promise<void> => {
    const approvedApp = { ...app, admissionStatus: 'approved' as const };
    if (isSupabaseConfigured && supabase) {
      const dbRow = mapStudentToDb(approvedApp);
      await supabase.from(WITHDRAWAL_KEY).insert([dbRow]);
      await supabase.from(APPLICATIONS_KEY).delete().eq('id', app.id);
    } else {
      const pending: Student[] = JSON.parse(localStorage.getItem(`ak_${APPLICATIONS_KEY}_db`) || '[]');
      const withdrawal: Student[] = JSON.parse(localStorage.getItem(`ak_${WITHDRAWAL_KEY}_db`) || '[]');
      const updatedPending = pending.filter(a => a.id !== app.id);
      withdrawal.push(approvedApp);
      localStorage.setItem(`ak_${APPLICATIONS_KEY}_db`, JSON.stringify(updatedPending));
      localStorage.setItem(`ak_${WITHDRAWAL_KEY}_db`, JSON.stringify(withdrawal));
    }
  },

  rejectApplication: async (app: Student): Promise<void> => {
    const rejectedApp = { ...app, admissionStatus: 'rejected' as const };
    if (isSupabaseConfigured && supabase) {
      const dbRow = mapStudentToDb(rejectedApp);
      await supabase.from(REJECTED_KEY).insert([dbRow]);
      await supabase.from(APPLICATIONS_KEY).delete().eq('id', app.id);
    } else {
      const pending: Student[] = JSON.parse(localStorage.getItem(`ak_${APPLICATIONS_KEY}_db`) || '[]');
      const rejected: Student[] = JSON.parse(localStorage.getItem(`ak_${REJECTED_KEY}_db`) || '[]');
      const updatedPending = pending.filter(a => a.id !== app.id);
      rejected.push(rejectedApp);
      localStorage.setItem(`ak_${APPLICATIONS_KEY}_db`, JSON.stringify(updatedPending));
      localStorage.setItem(`ak_${REJECTED_KEY}_db`, JSON.stringify(rejected));
    }
  },

  checkStatus: async (email: string, dob: string): Promise<Student | null> => {
    const tables = [
      { key: APPLICATIONS_KEY, label: 'pending' },
      { key: WITHDRAWAL_KEY, label: 'approved' },
      { key: REJECTED_KEY, label: 'rejected' }
    ];
    if (isSupabaseConfigured && supabase) {
      for (const table of tables) {
        const { data } = await supabase.from(table.key).select('*').eq('email', email).maybeSingle();
        if (data) return mapDbToStudent(data);
      }
    }
    for (const table of tables) {
      const list: Student[] = JSON.parse(localStorage.getItem(`ak_${table.key}_db`) || '[]');
      const found = list.find(s => s.email === email);
      if (found) return { ...found, admissionStatus: table.label as any };
    }
    return null;
  },

  getCourses: async (): Promise<Course[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('courses').select('*');
      if (data && data.length > 0) return data;
    }
    const local = localStorage.getItem(COURSES_STORAGE_KEY);
    return local ? JSON.parse(local) : INITIAL_COURSES_RAW;
  },

  saveCourse: async (course: Course) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('courses').upsert([course]);
    }
    const courses = await mockAuth.getCourses();
    const idx = courses.findIndex(c => c.id === course.id);
    if (idx > -1) courses[idx] = course; else courses.push(course);
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
  },

  removeCourse: async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('courses').delete().eq('id', id);
    }
    const courses = await mockAuth.getCourses();
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses.filter(c => c.id !== id)));
  },

  fetchResult: async (roll: string): Promise<ResultRecord | null> => {
    const results = [{
      rollNumber: '1001',
      name: 'Sana Ahmed',
      fatherName: 'Ahmed Khan',
      session: 'Annual 2023',
      courseTitle: 'Fashion Designing & Textile Art',
      totalObtained: 580,
      totalMax: 600,
      grade: 'A+',
      status: 'Pass' as const,
      marks: [{ theory: 180, practical: 400, total: 580, max: 600 }]
    }];
    return results.find(r => r.rollNumber === roll) || null;
  },

  getStories: async () => {
    const local = localStorage.getItem(STORIES_STORAGE_KEY);
    return local ? JSON.parse(local) : INITIAL_TESTIMONIALS;
  },

  saveStory: async (story: Testimonial) => {
    const stories = await mockAuth.getStories();
    const idx = stories.findIndex(s => s.id === story.id);
    if (idx > -1) stories[idx] = story; else stories.push(story);
    localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(stories));
  },

  removeStory: async (id: string) => {
    const stories = await mockAuth.getStories();
    localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(stories.filter(s => s.id !== id)));
  },

  getBoutiqueProducts: async () => {
    const local = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return local ? JSON.parse(local) : INITIAL_PRODUCTS_RAW;
  },

  saveProduct: async (product: Product) => {
    const prods = await mockAuth.getBoutiqueProducts();
    const idx = prods.findIndex(p => p.id === product.id);
    if (idx > -1) prods[idx] = product; else prods.push(product);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(prods));
  },

  removeProduct: async (id: string) => {
    const prods = await mockAuth.getBoutiqueProducts();
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(prods.filter(p => p.id !== id)));
  }
};
