// src/app/diamond-academy/admin/advertisements/page.tsx
'use client';

import { useState } from 'react';
import { useAdvertisements, useCreateAdvertisement, useUpdateAdvertisement, useDeleteAdvertisement } from '@/features/hooks/useAdvertisement';
import { Megaphone, Plus, Edit2, Trash2, Eye, EyeOff, Upload } from 'lucide-react';
import { Advertisement } from '@/features/types/advertisement';
import AdminHeader from '@/components/AdminLayout';

export default function AdvertisementsPage() {
  const { data: advertisements, isLoading } = useAdvertisements();
  const createMutation = useCreateAdvertisement();
  const updateMutation = useUpdateAdvertisement();
  const deleteMutation = useDeleteAdvertisement();

  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewVideo, setIsPreviewVideo] = useState(false);

  // ✅ Video yoki rasm ekanligini aniqlash
  const isVideo = (url: string) => {
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg');
  };

  const handleOpenModal = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        title: ad.title,
        description: ad.description,
        isActive: ad.isActive,
      });
      const url = ad.imageUrl ? `http://localhost:3000${ad.imageUrl}` : null;
      setPreviewUrl(url);
      setIsPreviewVideo(url ? isVideo(url) : false);
    } else {
      setEditingAd(null);
      setFormData({ title: '', description: '', isActive: false });
      setPreviewUrl(null);
      setIsPreviewVideo(false);
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAd(null);
    setFormData({ title: '', description: '', isActive: false });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsPreviewVideo(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // ✅ File type tekshirish
      setIsPreviewVideo(file.type.startsWith('video/'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAd) {
        await updateMutation.mutateAsync({
          id: editingAd.id,
          dto: {
            ...formData,
            ...(selectedFile && { file: selectedFile }),
          },
        });
      } else {
        if (!selectedFile) {
          alert('Fayl tanlash shart!');
          return;
        }
        await createMutation.mutateAsync({
          ...formData,
          file: selectedFile,
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      alert('Xatolik yuz berdi!');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Reklamani o\'chirmoqchimisiz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = async (ad: Advertisement) => {
    await updateMutation.mutateAsync({
      id: ad.id,
      dto: { isActive: !ad.isActive },
    });
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

  const activeAd = advertisements?.find(ad => ad.isActive);
  const inactiveAds = advertisements?.filter(ad => !ad.isActive) || [];

  return (
    <div>
      <AdminHeader/>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Reklamalar</h1>
                <p className="text-gray-600">Sayt reklamalarini boshqarish</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                Reklama qo'shish
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Jami reklamalar</p>
                  <p className="text-3xl font-bold text-gray-800">{advertisements?.length || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Megaphone className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Faol reklama</p>
                  <p className="text-3xl font-bold text-gray-800">{activeAd ? 1 : 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Eye className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Nofaol</p>
                  <p className="text-3xl font-bold text-gray-800">{inactiveAds.length}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <EyeOff className="text-gray-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Active Advertisement */}
          {activeAd && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Faol Reklama</h2>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-6 border-2 border-green-500">
                <div className="flex flex-col md:flex-row gap-6">
                  {activeAd.imageUrl && (
                    <div className="w-full md:w-48 h-48 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      {isVideo(activeAd.imageUrl) ? (
                        <video
                          src={`http://localhost:3000${activeAd.imageUrl}`}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={`http://localhost:3000${activeAd.imageUrl}`}
                          alt={activeAd.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white mb-2">
                          <Eye size={14} />
                          FAOL
                        </span>
                        <h3 className="text-2xl font-bold text-gray-800">{activeAd.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleActive(activeAd)}
                          className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 p-2 rounded transition"
                          title="Nofaol qilish"
                        >
                          <EyeOff size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(activeAd)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(activeAd.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{activeAd.description}</p>
                    <div className="mt-4 text-sm text-gray-500">
                      Yaratilgan: {new Date(activeAd.createdAt).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inactive Advertisements */}
          {inactiveAds.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Nofaol Reklamalar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveAds.map((ad) => (
                  <div key={ad.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                    {ad.imageUrl && (
                      <div className="w-full h-48 bg-gray-100 rounded-t-xl overflow-hidden">
                        {isVideo(ad.imageUrl) ? (
                          <video
                            src={`http://localhost:3000${ad.imageUrl}`}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={`http://localhost:3000${ad.imageUrl}`}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <EyeOff size={14} />
                          Nofaol
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(ad)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded transition"
                            title="Faol qilish"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenModal(ad)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{ad.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{ad.description}</p>
                      <div className="mt-4 text-xs text-gray-500">
                        {new Date(ad.createdAt).toLocaleDateString('uz-UZ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!advertisements || advertisements.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Megaphone className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg">Hech qanday reklama topilmadi</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingAd ? 'Reklamani tahrirlash' : 'Yangi reklama qo\'shish'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sarlavha *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Reklama sarlavhasi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tavsif *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Reklama tavsifi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rasm yoki Video {editingAd ? '(ixtiyoriy)' : '*'}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition">
                    <div className="space-y-1 text-center">
                      {previewUrl ? (
                        <div className="mb-4">
                          {isPreviewVideo ? (
                            <video
                              src={previewUrl}
                              className="mx-auto h-48 w-auto rounded-lg"
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="mx-auto h-48 w-auto rounded-lg"
                            />
                          )}
                        </div>
                      ) : (
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Fayl yuklash</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            required={!editingAd}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF, MP4, WEBM (max 50MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Darhol faollashtirish
                  </label>
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
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Yuklanmoqda...' : editingAd ? 'Yangilash' : 'Saqlash'}
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