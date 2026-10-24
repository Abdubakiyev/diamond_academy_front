export interface Attendance {
  id: string;
  student: string;
  group: string;
  date: string;
  present: boolean;
  extra?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceDto {
  student: string;
  group: string;
  date: string;
  present?: boolean;
  extra?: Record<string, unknown>;
}

export interface UpdateAttendanceDto {
  student?: string;
  group?: string;
  date?: string;
  present?: boolean;
  extra?: Record<string, unknown>;
}

export interface AttendanceStats {
  student?: string;
  group?: string;
  totalDays: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface AttendanceFilter {
  student?: string;
  group?: string;
  date?: string;
}