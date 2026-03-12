'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DollarSign, CheckCircle, Clock, AlertCircle,
  Plus, Trash2, Search, X, Users, ToggleLeft, ToggleRight,
} from 'lucide-react';
import AdminHeader from '@/components/AdminLayout';
import { PaymentStatus } from '@/features/types/payment';
import { useDeletePayment, useMarkAsPaid, usePayments, usePaymentStats } from '@/features/hooks/usePayment';
import { useGroups } from '@/features/hooks/useGroups';
import { useStudents } from '@/features/hooks/useStudents';
import { apiClient } from '@/features/api/client';
import { Group, Student } from '@/features/types';

export default function PaymentPage() {
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = useState<PaymentStatus | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Modal state
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState<number>(0);
  const [paidStudentIds, setPaidStudentIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: payments, isLoading } = usePayments({ status: filterStatus });
  const { data: stats } = usePaymentStats();
  const { data: groups = [] } = useGroups();
  const { data: students = [] } = useStudents(selectedGroupId || undefined);

  const deleteMutation = useDeletePayment();
  const markPaidMutation = useMarkAsPaid();

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

  // ✅ Saqlash — har bir student uchun payment yaratadi, keyin avtomatik refresh
  const handleSubmit = async () => {
    if (!selectedGroupId || !month || !amount) return;
    setIsSubmitting(true);

    try {
      const promises = students.map((student: Student) =>
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

      // ✅ Avtomatik refresh
      queryClient.invalidateQueries({ queryKey: ['payments'] });

      // Reset
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

  // ✅ To'langan deb belgilash — PATCH /payment/:id ga { status: 'PAID' }
  const handleMarkAsPaid = async (id: string) => {
    if (confirm("To'lovni to'langan deb belgilaysizmi?")) {
      await markPaidMutation.mutateAsync(id);
      // ✅ Avtomatik refresh (useMarkAsPaid hook ichida invalidateQueries bo'lishi kerak)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-700 mb-2">To'lovlar</h1>
              <p className="text-gray-500">O'quvchilar to'lovlarini boshqarish</p>
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
        </div>
      </div>

      {/* Modal */}
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
                      O'quvchilar ({students.length} ta) — to'laganlarni belgilang
                    </p>
                  </div>

                  {students.length > 0 ? (
                    <>
                      <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50">
                        {students.map((student: Student) => {
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
                        ✅ To'lagan: {paidStudentIds.size} | ⏳ Kutilmoqda: {students.length - paidStudentIds.size}
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
                disabled={!selectedGroupId || !amount || !month || isSubmitting || students.length === 0}
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
                    Saqlash ({students.length} ta student)
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