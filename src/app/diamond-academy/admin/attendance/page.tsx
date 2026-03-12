'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useGroups } from '@/features/hooks/useGroups';
import { useAttendanceByGroupAndDate, useCreateAttendanceBulk } from '@/features/hooks/useAttendance';
import AdminHeader from '@/components/AdminLayout';

export default function AttendancePage() {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});

  const { data: groups } = useGroups(true);
  const { data: students, isLoading } = useAttendanceByGroupAndDate(selectedGroupId, selectedDate);
  const createAttendance = useCreateAttendanceBulk();

  const handleToggle = (studentId: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSave = () => {
    if (!selectedGroupId) return;
    const attendances = students?.map((item) => ({
      studentId: item.student.id,
      present: attendanceData[item.student.id] ?? item.present,
    })) || [];
    createAttendance.mutate({ groupId: selectedGroupId, date: selectedDate, attendances });
  };

  const presentCount = students?.filter(item => attendanceData[item.student.id] ?? item.present).length ?? 0;
  const totalCount = students?.length ?? 0;
  const absentCount = totalCount - presentCount;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div>
      <AdminHeader />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-blue-600 rounded-full" />
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Davomat</h1>
          </div>
          <p className="text-slate-500 text-sm ml-4">Talabalar davomatini belgilang va saqlang</p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">

            {/* Group Select */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Guruh</label>
              <div className="relative">
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    setSelectedGroupId(e.target.value);
                    setAttendanceData({});
                  }}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Guruhni tanlang</option>
                  {groups?.map((group) => (
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

            {/* Date Input */}
            <div className="sm:w-52">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sana</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {selectedGroupId && totalCount > 0 && (
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
        )}

        {/* Progress Bar */}
        {selectedGroupId && totalCount > 0 && (
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
        )}

        {/* Attendance List */}
        {selectedGroupId ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Yuklanmoqda...</p>
              </div>

            ) : students && students.length > 0 ? (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_auto] px-6 py-3 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Talaba</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Holat</span>
                </div>

                {/* Student Rows */}
                <div className="divide-y divide-slate-50">
                  {students.map((item, index) => {
                    const isPresent = attendanceData[item.student.id] ?? item.present;
                    return (
                      <div
                        key={item.student.id}
                        onClick={() => handleToggle(item.student.id)}
                        className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/40 cursor-pointer transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            isPresent
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-slate-100 text-slate-400'
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

                        {/* Toggle */}
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-400'
                          }`}>
                            {isPresent ? 'Keldi' : 'Kelmadi'}
                          </span>

                          {/* Custom Toggle Switch */}
                          <div className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                            isPresent ? 'bg-blue-500' : 'bg-slate-200'
                          }`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
                              isPresent ? 'left-6' : 'left-1'
                            }`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Button */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {presentCount} / {totalCount} talaba belgilangan
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={createAttendance.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md shadow-blue-100"
                  >
                    {createAttendance.isPending ? (
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
          /* Empty state - no group selected */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center h-72 gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Guruh tanlang</p>
              <p className="text-xs text-slate-400 mt-1">Davomat belgilash uchun yuqoridan guruh tanlang</p>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}