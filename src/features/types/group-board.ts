export interface BoardGroupItem {
  id: string;
  name: string;
  schedule: string | null;
  level: { id: string; type: string } | null;
  teacher: { id: string; name: string } | null;
  studentCount: number;
  paidCount: number;
  fee: number | null;
}

export interface BoardGroupList {
  month: string;
  items: BoardGroupItem[];
}

export interface BoardFee {
  amount: number | null;
  /** true: shu oyning o'z summasi yo'q, oldingi oydan o'tgan */
  inherited: boolean;
  fromMonth: string | null;
}

export interface BoardCell {
  present: boolean;
  diamond: boolean;
}

export interface BoardStudent {
  id: string;
  name: string;
  phone: string | null;
  payment: { paid: boolean; status: string | null; amount: number | null; paidAt: string | null };
  /** Kalit: "YYYY-MM-DD" */
  attendance: Record<string, BoardCell>;
}

export interface GroupBoard {
  group: {
    id: string;
    name: string;
    schedule: string | null;
    level: { id: string; type: string } | null;
    teacher: { id: string; name: string } | null;
  };
  month: string;
  fee: BoardFee;
  /** Shu oyda davomat olingan kunlar */
  days: string[];
  students: BoardStudent[];
  totals: { students: number; paid: number; unpaid: number; expected: number | null; collected: number };
}

export interface AttendanceVars {
  groupId: string;
  /** Keshni yangilash uchun ko'rilayotgan oy */
  month: string;
  studentId: string;
  date: string;
  /** null = yozuvni o'chirish */
  present: boolean | null;
  diamond: boolean;
}

export interface DayRecordInput {
  studentId: string;
  present: boolean | null;
  diamond: boolean;
}
