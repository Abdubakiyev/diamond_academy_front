export type StatsPaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
export type StatsAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING' | 'COMPLETED' | 'EXPIRED';
export type StatsCefr = 'BELOW_B1' | 'B1' | 'B2' | 'C1';

export interface MyStats {
  isStudent: true;
  student: {
    id: string;
    name: string;
    phone: string | null;
    isActive: boolean;
    group: { id: string; name: string; schedule: string | null };
    level: string | null;
  };
  attendance: {
    total: number;
    present: number;
    absent: number;
    rate: number | null;
    recent: { date: string; present: boolean; diamond: boolean }[];
  };
  diamonds: number;
  payment: {
    currentMonth: {
      month: string;
      status: StatsPaymentStatus | null; // null = bu oy uchun yozuv yo'q
      amount: number | null;
      paidAt: string | null;
    };
    history: {
      id: string;
      month: string;
      amount: number;
      status: StatsPaymentStatus;
      paidAt: string | null;
    }[];
  };
  exams: {
    count: number;
    bestScore: number | null;
    lastCefr: StatsCefr | null;
    attempts: {
      id: string;
      examId: string;
      title: string;
      status: StatsAttemptStatus;
      startedAt: string;
      finishedAt: string | null;
      listening: number | null;
      reading: number | null;
      writing: number | null;
      speaking: number | null;
      total: number | null;
      cefr: StatsCefr | null;
    }[];
  };
}

export interface MyStatsNotStudent {
  isStudent: false;
}

export type MyStatsResponse = MyStats | MyStatsNotStudent;
