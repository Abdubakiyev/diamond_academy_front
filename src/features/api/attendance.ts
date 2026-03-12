import { Attendance, AttendanceFilter, AttendanceStats, CreateAttendanceDto, UpdateAttendanceDto } from '../types/attendance';
import apiClient from './client';



export const attendanceApi = {
  // Barcha davomatlar
  getAll: async (filter?: AttendanceFilter): Promise<Attendance[]> => {
    const params = new URLSearchParams();
    if (filter?.student) params.append('student', filter.student);
    if (filter?.group) params.append('group', filter.group);
    if (filter?.date) params.append('date', filter.date);

    const query = params.toString();
    const { data } = await apiClient.get<Attendance[]>(
      `/attendance${query ? `?${query}` : ''}`
    );
    return data;
  },

  // ID bo'yicha olish
  getOne: async (id: string): Promise<Attendance> => {
    const { data } = await apiClient.get<Attendance>(`/attendance/${id}`);
    return data;
  },

  // Talaba bo'yicha
  getByStudent: async (studentName: string): Promise<Attendance[]> => {
    const { data } = await apiClient.get<Attendance[]>(
      `/attendance/student/${encodeURIComponent(studentName)}`
    );
    return data;
  },

  // Guruh bo'yicha
  getByGroup: async (groupName: string): Promise<Attendance[]> => {
    const { data } = await apiClient.get<Attendance[]>(
      `/attendance/group/${encodeURIComponent(groupName)}`
    );
    return data;
  },

  // Yangi davomat
  create: async (dto: CreateAttendanceDto): Promise<Attendance> => {
    const { data } = await apiClient.post<Attendance>('/attendance', dto);
    return data;
  },

  // Yangilash
  update: async (id: string, dto: UpdateAttendanceDto): Promise<Attendance> => {
    const { data } = await apiClient.patch<Attendance>(`/attendance/${id}`, dto);
    return data;
  },

  // O'chirish
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/attendance/${id}`);
  },

  // Guruh statistikasi
  getGroupStats: async (
    groupName: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const query = params.toString();
    const { data } = await apiClient.get<AttendanceStats>(
      `/attendance/stats/group/${encodeURIComponent(groupName)}${query ? `?${query}` : ''}`
    );
    return data;
  },

  // Talaba statistikasi
  getStudentStats: async (
    studentName: string,
    group?: string
  ): Promise<AttendanceStats> => {
    const params = new URLSearchParams();
    if (group) params.append('group', group);

    const query = params.toString();
    const { data } = await apiClient.get<AttendanceStats>(
      `/attendance/stats/student/${encodeURIComponent(studentName)}${query ? `?${query}` : ''}`
    );
    return data;
  },
};