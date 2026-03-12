import { useState, useEffect } from 'react';
import { X, Edit3, BookOpen, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { Group, Level, UpdateGroupDto } from '@/features/types';
import { useUpdateGroup } from '@/features/hooks/useGroups';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  levels: Level[];
}

export function EditGroupModal({ isOpen, onClose, group, levels }: EditGroupModalProps) {
  const [form, setForm] = useState<UpdateGroupDto>({
    name: '',
    levelId: '',
    schedule: '',
    isActive: true,
  });

  const updateGroup = useUpdateGroup();

  useEffect(() => {
    if (group) {
      setForm({
        name: group.name,
        levelId: group.levelId,
        schedule: group.schedule || '',
        isActive: group.isActive,
      });
    }
  }, [group]);

  const handleSubmit = () => {
    if (!form.name?.trim() || !form.levelId) return;

    updateGroup.mutate(
      { id: group.id, dto: form },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-xl">
              <Edit3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Guruhni tahrirlash</h2>
              <p className="text-xs text-gray-500">{group.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Guruh nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masalan: Guruh A1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Level <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={form.levelId}
                onChange={(e) => setForm({ ...form, levelId: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all appearance-none bg-white text-gray-700"
              >
                <option value="">Levelni tanlang</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Dars jadvali
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Masalan: Du, Chor, Ju 14:00"
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* isActive toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <p className="text-xs text-gray-500">
                {form.isActive ? 'Guruh faol' : 'Guruh nofaol'}
              </p>
            </div>
            <button
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className="transition-colors"
            >
              {form.isActive ? (
                <ToggleRight className="w-8 h-8 text-green-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name?.trim() || !form.levelId || updateGroup.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {updateGroup.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Saqlash
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}