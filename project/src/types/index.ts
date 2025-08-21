export interface User {
  id: string;
  name: string;
  email: string;
  role: 'therapist' | 'parent';
  specialization?: string;
  yearsOfExperience?: number;
  phone?: string;
  address?: string;
  emergencyContact?: string;
}

export interface LittleLearner {
  id: string;
  name: string;
  age: number;
  photo?: string;
  status: 'active' | 'new' | 'assessment_due' | 'inactive';
  nextSession?: string;
  progressPercentage: number;
  parentId?: string;
  therapistId: string;
  goals: string[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  domain: string;
}

export interface Session {
  id: string;
  learnerId: string;
  therapistId: string;
  date: string;
  time: string;
  status: 'planned' | 'in_progress' | 'completed';
  activities: Activity[];
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  domain: string;
  duration: number;
  difficultyLevel: number;
  materials: string[];
  description: string;
}

export interface Homework {
  id: string;
  learnerId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
  resources?: string[];
  parentNotes?: string;
}

export interface ProgressData {
  skillDomain: string;
  mastery: number;
  promptLevel: number;
  date: string;
}