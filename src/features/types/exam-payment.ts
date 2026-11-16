import type { Paginated, Skill } from './common';
import type { ExamLevel } from './exam';

export type PaymentProvider = 'CLICK' | 'PAYME' | 'UZUM' | 'MANUAL';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type ExamAccessType = 'PAID' | 'FREE_STAFF' | 'FREE_STUDENT' | 'FREE_EXAM';

/** GET /exam/:id: oddiy foydalanuvchiga faqat umumiy tuzilma ko'rsatiladi */
export interface PublicExamSection {
  id: string;
  skill: Skill;
  order: number;
  title: string | null;
  timeLimitSec: number | null;
  maxScore: number;
  partCount: number;
  questionCount: number;
}

export interface PublicExam {
  id: string;
  title: string;
  description: string | null;
  type: 'FULL_MULTILEVEL' | 'CUSTOM';
  durationMinutes: number | null;
  price: number;
  isFree: boolean;
  level: ExamLevel | null;
  sections: PublicExamSection[];
}

/** GET /exam-payment/access/:examId */
export interface ExamAccessInfo {
  examId: string;
  title: string;
  price: number;
  accessType: ExamAccessType;
  requiresPayment: boolean;
  canStart: boolean;
  unusedPaymentId: string | null;
  pendingPaymentId: string | null;
}

export interface ExamPayment {
  id: string;
  examId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerTxnId: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  exam: { id: string; title: string };
  /** To'lov bilan urinish ochilganmi */
  used: boolean;
  attemptId: string | null;
}

export interface AdminPayment extends ExamPayment {
  user: { id: string; name: string; phone: string };
}

export type AdminPaymentList = Paginated<AdminPayment> & { pages: number };

export interface PaymentListQuery {
  status?: PaymentStatus;
  examId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface CheckoutResult {
  payment: ExamPayment;
  /** Provayder sozlanmagan bo'lsa null (note da sababi) */
  paymentUrl: string | null;
  note: string | null;
}

export interface ManualPaymentInput {
  userId: string;
  examId: string;
  amount?: number;
  note?: string;
}

export type PaymentAction = 'confirm' | 'cancel' | 'refund';

export interface CenterStudent {
  id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  isCenterStudent: boolean;
}

export type CenterStudentList = Paginated<CenterStudent> & { pages: number };

export interface CenterStudentQuery {
  search?: string;
  isCenterStudent?: boolean;
  page?: number;
  limit?: number;
}

/** POST /exam-attempt/start */
export interface StartAttemptResult {
  attemptId: string;
  /** true: tugallanmagan urinish topildi va davom ettirildi */
  resumed: boolean;
}
