import { Group, Student } from './index';

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
}

export interface Payment {
  id: string;
  studentId: string;
  groupId: string;
  student: Student;   // ✅ object
  group: Group;       // ✅ object
  amount: number;
  status: PaymentStatus;
  month: string;
  paidAt?: string;
  extra?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  studentId: string;  // ✅
  groupId: string;    // ✅
  amount: number;
  status?: PaymentStatus;
  month: string;
  paidAt?: string;
  extra?: Record<string, any>;
}

export interface UpdatePaymentDto {
  amount?: number;
  status?: PaymentStatus;
  paidAt?: string;
  extra?: Record<string, any>;
}

export interface PaymentFilter {
  studentId?: string;
  groupId?: string;
  status?: PaymentStatus;
  month?: string;
}

export interface PaymentStats {
  totalPayments: number;
  paidAmount: number;
  pendingAmount: number;
  partialAmount: number;
  overdueAmount: number;
  totalAmount: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalPayments: number;
  totalAmount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  payments: Payment[];
}