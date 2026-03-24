export type UserRole = 'student' | 'pi';
export type YearLevel = 'freshman' | 'sophomore' | 'junior' | 'senior' | 'grad';
export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface StudentProfile {
  id: string;
  userId?: string;
  major: string | null;
  gpa: number | null;
  graduationYear: number | null;
  skills: string[];
  bio: string | null;
  resumeUrl: string | null;
  yearLevel: YearLevel | null;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface PIProfile {
  id: string;
  userId?: string;
  department: string | null;
  labName: string | null;
  researchArea: string | null;
  labWebsite: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Position {
  id: string;
  piId: string;
  title: string;
  description: string | null;
  requiredSkills: string[];
  minGpa: number | null;
  isFunded: boolean;
  isOpen: boolean;
  createdAt: string;
  deadline: string | null;
  department?: string;
  labName?: string;
  researchArea?: string;
  labWebsite?: string;
}

export interface ParticipantProfile {
  id?: string;
  availableDays: string[];
  availableTimes: string[];
  hoursPerWeek: number | null;
  ageRange: string | null;
  gender: string | null;
  ethnicity: string | null;
  studyTypes: string[];
  compensationPref: string[];
  locationPref: string | null;
  notes: string | null;
}

export interface Application {
  id: string;
  positionId: string;
  studentId: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  appliedAt: string;
  positionTitle?: string;
  labName?: string;
}
