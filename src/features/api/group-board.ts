import apiClient from './client';
import type { BoardFee, BoardGroupList, DayRecordInput, GroupBoard } from '../types/group-board';

export const getBoardGroups = (month?: string) =>
  apiClient.get<BoardGroupList>('/group-board/groups', { params: { month } }).then((r) => r.data);

export const getBoard = (groupId: string, month: string) =>
  apiClient.get<GroupBoard>(`/group-board/${groupId}`, { params: { month } }).then((r) => r.data);

export const setFee = (groupId: string, month: string, amount: number) =>
  apiClient.put<BoardFee>(`/group-board/${groupId}/fee`, { month, amount }).then((r) => r.data);

export const resetFee = (groupId: string, month: string) =>
  apiClient.delete<BoardFee>(`/group-board/${groupId}/fee`, { params: { month } }).then((r) => r.data);

export const setAttendance = (groupId: string, body: { studentId: string; date: string; present: boolean | null; diamond: boolean }) =>
  apiClient.put(`/group-board/${groupId}/attendance`, body).then((r) => r.data);

export const setDayAttendance = (groupId: string, date: string, records: DayRecordInput[]) =>
  apiClient.put<{ date: string; saved: number }>(`/group-board/${groupId}/attendance/day`, { date, records }).then((r) => r.data);

export const setPayment = (groupId: string, body: { studentId: string; month: string; paid: boolean; amount?: number }) =>
  apiClient.put(`/group-board/${groupId}/payment`, body).then((r) => r.data);
