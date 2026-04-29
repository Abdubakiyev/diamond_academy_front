'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import AdminHeader from '@/components/AdminLayout';
import { PaymentStatus } from '@/features/types/payment';
import { useGroups } from '@/features/hooks/useGroups';
import { useAttendanceByGroupAndDate, useCreateAttendanceBulk } from '@/features/hooks/useAttendance';
import { apiClient } from '@/features/api/client';

export default function AttendancePaymentPage() {
  const queryClient = useQueryClient();

  const [attGroupId, setAttGroupId] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMonth, setPaymentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isSaving, setIsSaving] = useState(false);

  const { data: attGroups } = useGroups(true);
  const { data: students, isLoading: attLoading } = useAttendanceByGroupAndDate(attGroupId, selectedDate);
  const createAttendance = useCreateAttendanceBulk();

  const presentCount = students?.filter(item => attendanceData[item.student.id] ?? item.present).length ?? 0;
  const totalCount = students?.length ?? 0;
  const absentCount = totalCount - presentCount;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const handleToggleAttendance = (studentId: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !(prev[studentId] ?? students?.find(s => s.student.id === studentId)?.present ?? false),
    }));
  };

  const handleTogglePayment = (studentId: string) => {
    setPaidIds(prev => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

  const handleSaveAll = async () => {
    if (!attGroupId || !students?.length) return;
    setIsSaving(true);
    try {
      // 1. Davomat saqlash
      const attendances = students.map(item => ({
        studentId: item.student.id,
        present: attendanceData[item.student.id] ?? item.present,
      }));
      await new Promise<void>((resolve, reject) => {
        createAttendance.mutate(
          { groupId: attGroupId, date: selectedDate, attendances },
          { onSuccess: () => resolve(), onError: reject }
        );
      });

      // 2. To'lov saqlash (agar summa kiritilgan bo'lsa)
      if (paymentAmount > 0) {
        await Promise.all(
          students.map(item =>
            apiClient.post('/payment', {
              studentId: item.student.id,
              groupId: attGroupId,
              amount: paymentAmount,
              status: paidIds.has(item.student.id) ? PaymentStatus.PAID : PaymentStatus.PENDING,
              month: new Date(paymentMonth + '-01'),
              paidAt: paidIds.has(item.student.id) ? new Date() : undefined,
            })
          )
        );
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        setPaidIds(new Set());
      }
    } catch (e) {
      console.error('Saqlashda xato:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white p-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-700 mb-1">Davomat</h1>
            <p className="text-gray-500">Davomat va to'lov holatini belgilang</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Guruh</label>
                <div className="relative">
                  <select
                    value={attGroupId}
                    onChange={(e) => {
                      setAttGroupId(e.target.value);
                      setAttendanceData({});
                      setPaidIds(new Set());
                    }}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Guruhni tanlang</option>
                    {attGroups?.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="sm:w-52">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sana</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Payment fields */}
            {attGroupId && (
              <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-slate-100">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    To'lov summasi (so'm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500000"
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="sm:w-52">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    To'lov oyi
                  </label>
                  <input
                    type="month"
                    value={paymentMonth}
                    onChange={(e) => setPaymentMonth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          {attGroupId && totalCount > 0 && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{totalCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Jami</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-500 mb-1">{presentCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Keldi</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-rose-400 mb-1">{absentCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Kelmadi</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-700">Davomat foizi</span>
                  <span className="text-sm font-bold text-blue-600">{attendanceRate}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Student list */}
          {attGroupId ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {attLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Yuklanmoqda...</p>
                </div>
              ) : students && students.length > 0 ? (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_auto_auto] px-6 py-3 bg-slate-50 border-b border-slate-100 gap-8">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Talaba</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Davomat</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">To'lov</span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-slate-50">
                    {students.map((item) => {
                      const isPresent = attendanceData[item.student.id] ?? item.present;
                      const isPaid = paidIds.has(item.student.id);

                      return (
                        <div
                          key={item.student.id}
                          className="grid grid-cols-[1fr_auto_auto] items-center px-6 py-4 hover:bg-slate-50/60 transition-all duration-150 gap-8"
                        >
                          {/* Student */}
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                              isPresent ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {item.student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{item.student.name}</div>
                              {item.student.phone && (
                                <div className="text-xs text-slate-400 mt-0.5">{item.student.phone}</div>
                              )}
                            </div>
                          </div>

                          {/* Attendance toggle */}
                          <div
                            className="flex flex-col items-center gap-1 cursor-pointer select-none"
                            onClick={() => handleToggleAttendance(item.student.id)}
                          >
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all whitespace-nowrap ${
                              isPresent ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-400'
                            }`}>
                              {isPresent ? 'Keldi' : 'Kelmadi'}
                            </span>
                            <div className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                              isPresent ? 'bg-blue-500' : 'bg-slate-200'
                            }`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
                                isPresent ? 'left-6' : 'left-1'
                              }`} />
                            </div>
                          </div>

                          {/* Payment toggle */}
                          <div
                            className="flex flex-col items-center gap-1 cursor-pointer select-none"
                            onClick={() => handleTogglePayment(item.student.id)}
                          >
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all whitespace-nowrap ${
                              isPaid ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                            }`}>
                              {isPaid ? "To'landi" : 'Kutilmoqda'}
                            </span>
                            <div className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                              isPaid ? 'bg-green-500' : 'bg-slate-200'
                            }`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
                                isPaid ? 'left-6' : 'left-1'
                              }`} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer — 1 ta button */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>👤 {presentCount}/{totalCount} keldi</span>
                      <span>💰 {paidIds.size}/{totalCount} to'ladi</span>
                    </div>
                    <button
                      onClick={handleSaveAll}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-md shadow-blue-100"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Saqlanmoqda...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Saqlash
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600">Bu guruhda talabalar yo'q</p>
                  <p className="text-xs text-slate-400">Boshqa guruhni tanlang</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center h-72 gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <CalendarCheck className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Guruh tanlang</p>
                <p className="text-xs text-slate-400 mt-1">Davomat va to'lov belgilash uchun yuqoridan guruh tanlang</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}