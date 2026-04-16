'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import {
  DollarSign, CheckCircle, Clock, AlertCircle,
  Plus, Trash2, Search, X, Users, ToggleLeft, ToggleRight,
  CalendarCheck, CreditCard,
} from 'lucide-react';
import AdminHeader from '@/components/AdminLayout';
import { PaymentStatus } from '@/features/types/payment';
import { useDeletePayment, useMarkAsPaid, usePayments, usePaymentStats } from '@/features/hooks/usePayment';
import { useGroups } from '@/features/hooks/useGroups';
import { useStudents } from '@/features/hooks/useStudents';
import { useAttendanceByGroupAndDate, useCreateAttendanceBulk } from '@/features/hooks/useAttendance';
import { apiClient } from '@/features/api/client';
import { Group, Student } from '@/features/types';

type Tab = 'payments' | 'attendance';

export default function CombinedPage() {
  const [activeTab, setActiveTab] = useState<Tab>('payments');

  // ─── Payment state ────────────────────────────────────────────
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState<number>(0);
  const [paidStudentIds, setPaidStudentIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: payments, isLoading: paymentsLoading } = usePayments({ status: filterStatus });
  const { data: stats } = usePaymentStats();
  const { data: groups = [] } = useGroups();
  const { data: modalStudents = [] } = useStudents(selectedGroupId || undefined);

  const deleteMutation = useDeletePayment();
  const markPaidMutation = useMarkAsPaid();

  // ─── Attendance state ─────────────────────────────────────────
  const [attGroupId, setAttGroupId] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});

  const { data: attGroups } = useGroups(true);
  const { data: students, isLoading: attLoading } = useAttendanceByGroupAndDate(attGroupId, selectedDate);
  const createAttendance = useCreateAttendanceBulk();

  // ─── Payment handlers ─────────────────────────────────────────
  const togglePaid = (studentId: string) => {
    setPaidStudentIds((prev) => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    setPaidStudentIds(new Set());
  };

  const handleSubmit = async () => {
    if (!selectedGroupId || !month || !amount) return;
    setIsSubmitting(true);
    try {
      const promises = modalStudents.map((student: Student) =>
        apiClient.post('/payment', {
          studentId: student.id,
          groupId: selectedGroupId,
          amount,
          status: paidStudentIds.has(student.id) ? PaymentStatus.PAID : PaymentStatus.PENDING,
          month: new Date(month + '-01'),
          paidAt: paidStudentIds.has(student.id) ? new Date() : undefined,
        })
      );
      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowModal(false);
      setSelectedGroupId('');
      setMonth(new Date().toISOString().slice(0, 7));
      setAmount(0);
      setPaidStudentIds(new Set());
    } catch (error) {
      console.error('Error creating payments:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("To'lovni o'chirmoqchimisiz?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (confirm("To'lovni to'langan deb belgilaysizmi?")) {
      await markPaidMutation.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  };

  const filteredPayments = payments?.filter((payment) => {
    const name = payment.student?.name ?? '';
    const group = payment.group?.name ?? '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:    return 'bg-green-100 text-green-700';
      case PaymentStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case PaymentStatus.PARTIAL: return 'bg-blue-100 text-blue-700';
      case PaymentStatus.OVERDUE: return 'bg-red-100 text-red-700';
      default:                    return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:    return "To'langan";
      case PaymentStatus.PENDING: return 'Kutilmoqda';
      case PaymentStatus.PARTIAL: return 'Qisman';
      case PaymentStatus.OVERDUE: return "Muddati o'tgan";
      default:                    return status;
    }
  };

  // ─── Attendance handlers ──────────────────────────────────────
  const handleToggle = (studentId: string) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleSave = () => {
    if (!attGroupId) return;
    const attendances = students?.map((item) => ({
      studentId: item.student.id,
      present: attendanceData[item.student.id] ?? item.present,
    })) || [];
    createAttendance.mutate({ groupId: attGroupId, date: selectedDate, attendances });
  };

  const presentCount = students?.filter(item => attendanceData[item.student.id] ?? item.present).length ?? 0;
  const totalCount = students?.length ?? 0;
  const absentCount = totalCount - presentCount;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white p-6">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-700 mb-1">Boshqaruv</h1>
            <p className="text-gray-500">To'lovlar va davomat</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-fit">
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'payments'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={16} />
              To'lovlar
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CalendarCheck size={16} />
              Davomat
            </button>
          </div>

          {/* ═══════════════ PAYMENTS TAB ═══════════════ */}
          {activeTab === 'payments' && (
            <>
              {paymentsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-700">To'lovlar</h2>
                      <p className="text-gray-500 text-sm">O'quvchilar to'lovlarini boshqarish</p>
                    </div>
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md"
                    >
                      <Plus size={20} />
                      To'lov qo'shish
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm mb-1">To'langan</p>
                          <p className="text-2xl font-bold text-gray-700">{stats?.paidAmount?.toLocaleString()} so'm</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full"><CheckCircle className="text-green-600" size={24} /></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm mb-1">Kutilmoqda</p>
                          <p className="text-2xl font-bold text-gray-700">{stats?.pendingAmount?.toLocaleString()} so'm</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full"><Clock className="text-yellow-600" size={24} /></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm mb-1">Muddati o'tgan</p>
                          <p className="text-2xl font-bold text-gray-700">{stats?.overdueAmount?.toLocaleString()} so'm</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full"><AlertCircle className="text-red-600" size={24} /></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm mb-1">Jami</p>
                          <p className="text-2xl font-bold text-gray-700">{stats?.totalAmount?.toLocaleString()} so'm</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full"><DollarSign className="text-blue-600" size={24} /></div>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Talaba yoki guruh qidirish..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-600"
                        />
                      </div>
                      <select
                        value={filterStatus || ''}
                        onChange={(e) => setFilterStatus((e.target.value as PaymentStatus) || undefined)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-600"
                      >
                        <option value="">Barcha holatlar</option>
                        <option value={PaymentStatus.PAID}>To'langan</option>
                        <option value={PaymentStatus.PENDING}>Kutilmoqda</option>
                        <option value={PaymentStatus.PARTIAL}>Qisman</option>
                        <option value={PaymentStatus.OVERDUE}>Muddati o'tgan</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Talaba</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Guruh</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Summa</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Oy</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Holat</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amallar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredPayments && filteredPayments.length > 0 ? (
                            filteredPayments.map((payment) => (
                              <tr key={payment.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{payment.student?.name ?? '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{payment.group?.name ?? '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                                  {Number(payment.amount).toLocaleString()} so'm
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {new Date(payment.month).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                    {getStatusText(payment.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    {payment.status !== PaymentStatus.PAID && (
                                      <button
                                        onClick={() => handleMarkAsPaid(payment.id)}
                                        className="text-green-600 hover:bg-green-50 p-2 rounded transition"
                                        title="To'langan deb belgilash"
                                      >
                                        <CheckCircle size={18} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDelete(payment.id)}
                                      className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                Hech qanday to'lov topilmadi
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ═══════════════ ATTENDANCE TAB ═══════════════ */}
          {activeTab === 'attendance' && (
            <div className="max-w-4xl">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Davomat</h2>
                <p className="text-slate-500 text-sm">Talabalar davomatini belgilang va saqlang</p>
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
                        }}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Guruhni tanlang</option>
                        {attGroups?.map((group) => (
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
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
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

              {/* Attendance List */}
              {attGroupId ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {attLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-slate-500">Yuklanmoqda...</p>
                    </div>
                  ) : students && students.length > 0 ? (
                    <>
                      <div className="grid grid-cols-[1fr_auto] px-6 py-3 bg-slate-50 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Talaba</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Holat</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {students.map((item) => {
                          const isPresent = attendanceData[item.student.id] ?? item.present;
                          return (
                            <div
                              key={item.student.id}
                              onClick={() => handleToggle(item.student.id)}
                              className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/40 cursor-pointer transition-all duration-150"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
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
                              <div className="flex items-center gap-3">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
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
                            </div>
                          );
                        })}
                      </div>
                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          {presentCount} / {totalCount} talaba belgilangan
                        </p>
                        <button
                          onClick={handleSave}
                          disabled={createAttendance.isPending}
                          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-md shadow-blue-100"
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
          )}
        </div>
      </div>

      {/* ═══════════════ PAYMENT MODAL ═══════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">To'lov qo'shish</h2>
                  <p className="text-xs text-gray-500">Guruh tanlang, summa va oy kiriting</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Guruh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Guruh <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-gray-700"
                >
                  <option value="">Guruhni tanlang</option>
                  {groups.map((group: Group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              {/* Oy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Oy <span className="text-red-500">*</span>
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>

              {/* Summa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Summa (so'm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="500000"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>

              {/* Studentlar */}
              {selectedGroupId && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">
                      O'quvchilar ({modalStudents.length} ta) — to'laganlarni belgilang
                    </p>
                  </div>
                  {modalStudents.length > 0 ? (
                    <>
                      <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50">
                        {modalStudents.map((student: Student) => {
                          const isPaid = paidStudentIds.has(student.id);
                          return (
                            <div key={student.id} className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-100">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.phone || "Telefon yo'q"}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${isPaid ? 'text-green-600' : 'text-gray-400'}`}>
                                  {isPaid ? "To'langan" : 'Kutilmoqda'}
                                </span>
                                <button onClick={() => togglePaid(student.id)}>
                                  {isPaid
                                    ? <ToggleRight className="w-8 h-8 text-green-500" />
                                    : <ToggleLeft className="w-8 h-8 text-gray-400" />
                                  }
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        ✅ To'lagan: {paidStudentIds.size} | ⏳ Kutilmoqda: {modalStudents.length - paidStudentIds.size}
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm border border-gray-200 rounded-xl bg-gray-50">
                      Bu guruhda o'quvchilar yo'q
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedGroupId || !amount || !month || isSubmitting || modalStudents.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Saqlash ({modalStudents.length} ta student)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}