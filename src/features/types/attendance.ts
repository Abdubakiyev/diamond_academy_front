export interface Attendance {
  id: string;
  student: string;
  group: string;
  date: string;
  present: boolean;
  extra?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceDto {
  student: string;
  group: string;
  date: string;
  present?: boolean;
  extra?: Record<string, any>;
}

export interface UpdateAttendanceDto {
  student?: string;
  group?: string;
  date?: string;
  present?: boolean;
  extra?: Record<string, any>;
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