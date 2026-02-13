
export interface Course {
  id: number;
  title: string;
  description: string;
  category: 'Technical' | 'Creative' | 'Professional' | 'Vocational';
  duration: string;
  image: string;
  status: 'active' | 'scheduled' | 'frozen';
  nextClassTime?: string;
  contents?: string[];
}

export type UserRole = 'admin' | 'instructor' | 'student';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: 'Textile' | 'Handcrafted' | 'Digital';
  image: string;
  gallery?: string[];
  isHero?: boolean;
}

export interface ClassroomParticipant {
  id: string;
  name: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised: boolean;
  isLive: boolean;
  isSpeaking?: boolean;
  role: UserRole;
  avatar?: string;
}

export interface Student extends UserProfile {
  enrolledCourses: number[];
  courseId: number;
  courseProgress?: Record<string, number>;
  guardianName?: string;
  guardianRelation?: string;
  gender?: string;
  guardianContact?: string;
  address?: string;
  qualification?: string;
  majorSubject?: string;
  scoreType?: 'Percentage' | 'CGPA';
  scoreValue?: string;
  lastSubject?: string;
  background?: string;
  status?: string;
  nicNumber: string;
  admissionStatus: 'pending' | 'approved' | 'rejected';
  applicationDate: string;
  passportPhoto?: string;
  registrationNumber?: string;
}

export interface UserProfile {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password?: string;
  dateOfBirth?: string;
  mobileNumber?: string;
}

export interface ResultRecord {
  rollNumber: string;
  name: string;
  fatherName: string;
  session: string;
  courseTitle: string;
  marks: {
    theory: number;
    practical: number;
    total: number;
    max: number;
  }[];
  totalObtained: number;
  totalMax: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

export interface AdmissionData {
  firstName: string;
  lastName: string;
  guardianName: string;
  guardianRelation: string;
  gender: string;
  email: string;
  password?: string;
  mobileNumber: string;
  guardianContact: string;
  address: string;
  dateOfBirth: string;
  qualification: string;
  majorSubject: string;
  scoreType: 'Percentage' | 'CGPA';
  scoreValue: string;
  lastSubject: string;
  status: string;
  courseId: number;
  background: string;
  passportPhoto: string;
  nicNumber: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system' | 'student' | 'instructor';
  text: string;
  userName: string;
  timestamp: string;
}

export interface Testimonial {
  id: string;
  name: string;
  course: string;
  story: string;
  impact: string;
  image: string;
  year: string;
}

export interface Achievement {
  id: string;
  name: string;
  course: string;
  percentage: string;
  year: string;
  image: string;
  award: string;
}
