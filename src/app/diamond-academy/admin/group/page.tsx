"use client";

import { useState } from 'react';
import { Plus, Edit, Trash2, Users, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { Group } from '@/features/types';
import { useDeleteGroup, useGroups } from '@/features/hooks/useGroups';
import { CreateGroupModal } from '@/features/modals/useCreateGroupModal';
import { EditGroupModal } from '@/features/modals/useEditGroupModal';
import { useLevels } from '@/features/hooks/useLevel';
import AdminHeader from '@/components/AdminLayout';

const levelColors: Record<string, { bg: string; text: string; dot: string }> = {
  BEGINNER:     { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
  ELEMENTARY:   { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-400' },
  INTERMEDIATE: { bg: 'bg-violet-50',   text: 'text-violet-700',  dot: 'bg-violet-400' },
  ADVANCED:     { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-400' },
};

export default function GroupsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const { data: groups, isLoading } = useGroups();
  const { data: levels } = useLevels();
  const deleteGroup = useDeleteGroup();

  const handleDelete = (id: string) => {
    if (window.confirm("Guruhni o'chirmoqchimisiz?")) {
      deleteGroup.mutate(id);
    }
  };

  const activeCount = groups?.filter(g => g.isActive).length ?? 0;
  const totalStudents = groups?.reduce((sum, g) => sum + (g._count?.students ?? 0), 0) ?? 0;

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
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Guruhlar</h1>
            </div>
            <p className="text-slate-500 text-sm ml-4">Barcha guruhlar ro'yxati va boshqaruv</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            Guruh qo'shish
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Jami guruhlar</p>
            <p className="text-3xl font-bold text-slate-800">{groups?.length ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Faol guruhlar</p>
            <p className="text-3xl font-bold text-blue-600">{activeCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Jami talabalar</p>
            <p className="text-3xl font-bold text-slate-800">{totalStudents}</p>
          </div>
        </div>

        {/* Groups Grid */}
        {groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((group) => {
              const levelKey = group.level?.type ?? '';
              const colors = levelColors[levelKey] ?? { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };
              return (
                <div key={group.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-800 truncate">{group.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            {group.level?.type || "Level noma'lum"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button onClick={() => setEditingGroup(group)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(group.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-4">
                      {group.schedule && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{group.schedule}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{group._count?.students ?? 0} ta talaba</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3.5 border-t border-slate-50">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${group.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${group.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                        {group.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                      <button onClick={() => setEditingGroup(group)} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                        Tahrirlash <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Guruhlar yo'q</p>
              <p className="text-xs text-slate-400 mt-1">Birinchi guruhni qo'shish uchun yuqoridagi tugmani bosing</p>
            </div>
          </div>
        )}
      </div>

      <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} levels={levels || []} />
      {editingGroup && (
        <EditGroupModal isOpen={!!editingGroup} onClose={() => setEditingGroup(null)} group={editingGroup} levels={levels || []} />
      )}
    </div>
  );
}