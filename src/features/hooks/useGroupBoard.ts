import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBoard, getBoardGroups, resetFee, setAttendance, setDayAttendance, setFee, setPayment } from '../api/group-board';
import type { AttendanceVars, DayRecordInput, GroupBoard } from '../types/group-board';

export const boardKeys = {
  all: ['group-board'] as const,
  groups: (month?: string) => [...boardKeys.all, 'groups', month ?? 'now'] as const,
  board: (groupId: string, month: string) => [...boardKeys.all, 'board', groupId, month] as const,
};

export const useBoardGroups = (month?: string) =>
  useQuery({ queryKey: boardKeys.groups(month), queryFn: () => getBoardGroups(month) });

export const useGroupBoard = (groupId: string | undefined, month: string) =>
  useQuery({
    queryKey: boardKeys.board(groupId ?? '', month),
    queryFn: () => getBoard(groupId as string, month),
    enabled: !!groupId,
    placeholderData: keepPreviousData,
    retry: false,
  });

const useRefresh = (groupId: string) => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: boardKeys.all });
};

export const useSetFee = (groupId: string) => {
  const refresh = useRefresh(groupId);
  return useMutation({
    mutationFn: ({ month, amount }: { month: string; amount: number }) => setFee(groupId, month, amount),
    onSuccess: refresh,
  });
};

export const useResetFee = (groupId: string) => {
  const refresh = useRefresh(groupId);
  return useMutation({ mutationFn: (month: string) => resetFee(groupId, month), onSuccess: refresh });
};

export const useSetPayment = (groupId: string) => {
  const refresh = useRefresh(groupId);
  return useMutation({
    mutationFn: (v: { studentId: string; month: string; paid: boolean }) => setPayment(groupId, v),
    onSuccess: refresh,
  });
};

/** Katak bosilganda darhol ko'rinadi (optimistik), xato bo'lsa orqaga qaytadi */
export const useSetAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: AttendanceVars) =>
      setAttendance(v.groupId, { studentId: v.studentId, date: v.date, present: v.present, diamond: v.diamond }),
    onMutate: async (v) => {
      const key = boardKeys.board(v.groupId, v.month);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<GroupBoard>(key);
      if (prev) {
        qc.setQueryData<GroupBoard>(key, {
          ...prev,
          students: prev.students.map((s) => {
            if (s.id !== v.studentId) return s;
            const attendance = { ...s.attendance };
            if (v.present === null) delete attendance[v.date];
            else attendance[v.date] = { present: v.present, diamond: v.present ? v.diamond : false };
            return { ...s, attendance };
          }),
        });
      }
      return { prev, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: (_d, _e, v) => qc.invalidateQueries({ queryKey: boardKeys.board(v.groupId, v.month) }),
  });
};

export const useSetDayAttendance = (groupId: string) => {
  const refresh = useRefresh(groupId);
  return useMutation({
    mutationFn: ({ date, records }: { date: string; records: DayRecordInput[] }) => setDayAttendance(groupId, date, records),
    onSuccess: refresh,
  });
};
