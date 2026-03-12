// Enums
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum LevelType {
  BEGINNER = 'BEGINNER',
  ELEMENTARY = 'ELEMENTARY',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum AdMediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
}

// Base Types
export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Level {
  id: string;
  type: LevelType;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  levelId: string;
  schedule?: string;
  isActive: boolean;
  level?: Level;
  _count?: {
    students: number;
  };
  students?: Student[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  phone?: string;
  groupId: string;
  isActive: boolean;
  group?: Group;
  attendances?: Attendance[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  present: boolean;
  extra?: any;
  student?: Student;
  group?: Group;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  groupId: string;
  amount: number;
  status: PaymentStatus;
  month: string;
  paidAt?: string;
  extra?: any;
  student?: Student;
  group?: Group;
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  mediaType?: AdMediaType;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Test {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD?: string;
  correct: string;
  levelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: string;
  userId: string;
  levelId: string;
  correctCount: number;
  wrongCount: number;
  createdAt: string;
}

// DTOs (Data Transfer Objects)
export interface CreateStudentDto {
  name: string;
  phone?: string;
  groupId: string;
}

export interface UpdateStudentDto {
  name?: string;
  phone?: string;
  groupId?: string;
  isActive?: boolean;
}

export interface CreateGroupDto {
  name: string;
  levelId: string;
  schedule?: string;
}

export interface UpdateGroupDto {
  name?: string;
  levelId?: string;
  schedule?: string;
  isActive?: boolean;
}

export interface CreateAttendanceDto {
  groupId: string;
  date: string;
  attendances: Array<{
    studentId: string;
    present: boolean;
    extra?: any;
  }>;
}

export interface CreatePaymentDto {
  studentId: string;
  groupId: string;
  amount: number;
  status: PaymentStatus;
  month: string;
  paidAt?: string;
  extra?: any;
}

export interface UpdatePaymentDto {
  amount?: number;
  status?: PaymentStatus;
  paidAt?: string;
  extra?: any;
}

export interface CreateMonthlyPaymentsDto {
  groupId: string;
  month: string;
  amount: number;
}

// Statistics
export interface AttendanceStats {
  student: Student;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendanceRate: string;
}

export interface PaymentStats {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  totalPayments: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

// API Response
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}