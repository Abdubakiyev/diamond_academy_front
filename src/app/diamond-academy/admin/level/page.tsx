'use client';

import { useState } from 'react';
import { useLevels } from '@/features/hooks/useLevel';
import { createLevel, updateLevel, deleteLevel } from '@/features/api/level';
import { BookOpen, Plus, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { Level, LevelType } from '@/features/types';
import AdminHeader from '@/components/AdminLayout';

export default function LevelPage() {
  const { data: levels = [], isLoading, error } = useLevels();
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState<{ type: LevelType }>({ type: LevelType.BEGINNER });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const levelColors: Record<LevelType, { bg: string; border: string; text: string; icon: string }> = {
    [LevelType.BEGINNER]:     { bg: 'bg-green-100',  border: 'border-green-500',  text: 'text-green-700',  icon: 'bg-green-500' },
    [LevelType.ELEMENTARY]:   { bg: 'bg-blue-100',   border: 'border-blue-500',   text: 'text-blue-700',   icon: 'bg-blue-500' },
    [LevelType.INTERMEDIATE]: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', icon: 'bg-yellow-500' },
    [LevelType.ADVANCED]:     { bg: 'bg-red-100',    border: 'border-red-500',    text: 'text-red-700',    icon: 'bg-red-500' },
  };

  const levelNames: Record<LevelType, string> = {
    [LevelType.BEGINNER]:     'Boshlang\'ich',
    [LevelType.ELEMENTARY]:   'Elementar',
    [LevelType.INTERMEDIATE]: 'O\'rta',
    [LevelType.ADVANCED]:     'Yuqori',
  };

  const handleOpenModal = (level?: Level) => {
    if (level) {
      setEditingLevel(level);
      setFormData({ type: level.type });
    } else {
      setEditingLevel(null);
      setFormData({ type: LevelType.BEGINNER });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLevel(null);
    setFormData({ type: LevelType.BEGINNER });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingLevel) {
        await updateLevel(editingLevel.id, formData);
      } else {
        await createLevel(formData);
      }
      handleCloseModal();
      window.location.reload();
    } catch (err) {
      console.error('Error saving level:', err);
      alert('Xatolik yuz berdi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Levelni o\'chirmoqchimisiz?')) {
      try {
        await deleteLevel(id);
        window.location.reload();
      } catch (err) {
        console.error('Error deleting level:', err);
        alert('O\'chirishda xatolik!');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-medium">Xatolik: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Darajalar</h1>
                <p className="text-gray-600">O'quv darajalarini boshqarish</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                Daraja qo'shish
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Jami darajalar</p>
                  <p className="text-3xl font-bold text-gray-800">{levels.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <GraduationCap className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            {([LevelType.BEGINNER, LevelType.ELEMENTARY, LevelType.INTERMEDIATE, LevelType.ADVANCED]).map((type) => {
              const count = levels.filter((l: Level) => l.type === type).length;
              const colors = levelColors[type];
              return (
                <div key={type} className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${colors.border}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{levelNames[type]}</p>
                      <p className="text-3xl font-bold text-gray-800">{count}</p>
                    </div>
                    <div className={`${colors.bg} p-3 rounded-full`}>
                      <BookOpen className={colors.text} size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Levels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {levels.map((level: Level) => {
              const colors = levelColors[level.type];
              return (
                <div
                  key={level.id}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 ${colors.border}`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${colors.icon} p-3 rounded-lg`}>
                        <GraduationCap className="text-white" size={24} />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(level)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(level.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {levelNames[level.type]}
                    </h3>

                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {level.type}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {levels.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <GraduationCap className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg">Hech qanday daraja topilmadi</p>
              <p className="text-gray-400 text-sm mt-2">Yangi daraja qo'shish uchun yuqoridagi tugmani bosing</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingLevel ? 'Darajani tahrirlash' : 'Yangi daraja qo\'shish'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daraja turi
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ type: e.target.value as LevelType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value={LevelType.BEGINNER}>Boshlang'ich (BEGINNER)</option>
                    <option value={LevelType.ELEMENTARY}>Elementar (ELEMENTARY)</option>
                    <option value={LevelType.INTERMEDIATE}>O'rta (INTERMEDIATE)</option>
                    <option value={LevelType.ADVANCED}>Yuqori (ADVANCED)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Yuklanmoqda...' : editingLevel ? 'Yangilash' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}