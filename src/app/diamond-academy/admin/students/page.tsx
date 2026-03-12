"use client";

import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import { useDeleteStudent, useStudents } from '@/features/hooks/useStudents';
import { useGroups } from '@/features/hooks/useGroups';
import { Student } from '@/features/types';
import { CreateStudentModal } from '@/features/modals/useCreateStudent';
import { EditStudentModal } from '@/features/modals/useUpdateStudent';
import AdminHeader from '@/components/AdminLayout';

export default function StudentsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const { data: students, isLoading } = useStudents(selectedGroupId || undefined);
  const { data: groups } = useGroups(true);
  const deleteStudent = useDeleteStudent();

  const handleDelete = (id: string) => {
    if (window.confirm("Talabani o'chirmoqchimisiz?")) {
      deleteStudent.mutate(id);
    }
  };

  const filteredStudents = students?.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = students?.filter(s => s.isActive).length ?? 0;

  if (isLoading) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-blue-600 rounded-full" />
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Talabalar</h1>
            </div>
            <p className="text-slate-500 text-sm ml-4">Barcha talabalar ro'yxati va boshqaruv</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            Talaba qo'shish
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Jami</p>
            <p className="text-3xl font-bold text-slate-800">{students?.length ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Faol</p>
            <p className="text-3xl font-bold text-blue-600">{activeCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nofaol</p>
            <p className="text-3xl font-bold text-slate-400">{(students?.length ?? 0) - activeCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Talaba qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative sm:w-52">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Barcha guruhlar</option>
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
        </div>

        {/* Table */}
        {filteredStudents && filteredStudents.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] px-6 py-3 bg-slate-50 border-b border-slate-100 gap-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ism</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Telefon</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Guruh</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amallar</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <div key={student.id} className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] px-6 py-4 gap-4 items-center hover:bg-blue-50/30 transition-colors group">

                  {/* Name + Avatar */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      student.isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-800 truncate">{student.name}</span>
                  </div>

                  {/* Phone */}
                  <span className="text-sm text-slate-500 truncate">{student.phone || '—'}</span>

                  {/* Group */}
                  <span className="text-sm text-slate-500 truncate">
                    {student.group?.name ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {student.group.name}
                      </span>
                    ) : '—'}
                  </span>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    student.isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${student.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    {student.isActive ? 'Faol' : 'Nofaol'}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingStudent(student)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-400">{filteredStudents.length} ta talaba topildi</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Talabalar yo'q</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery ? 'Qidiruv bo\'yicha natija topilmadi' : 'Birinchi talabani qo\'shish uchun yuqoridagi tugmani bosing'}
              </p>
            </div>
          </div>
        )}
      </div>

      <CreateStudentModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} groups={groups || []} />
      {editingStudent && (
        <EditStudentModal isOpen={!!editingStudent} onClose={() => setEditingStudent(null)} student={editingStudent} groups={groups || []} />
      )}
    </div>
  );
}