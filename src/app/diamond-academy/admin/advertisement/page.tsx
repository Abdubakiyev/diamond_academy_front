// src/app/diamond-academy/admin/advertisements/page.tsx
'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  useAdvertisements,
  useCreateAdvertisement,
  useUpdateAdvertisement,
  useDeleteAdvertisement,
} from '@/features/hooks/useAdvertisement';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Film,
  Calendar,
} from 'lucide-react';
import { Advertisement } from '@/features/types/advertisement';
import AdminHeader from '@/components/AdminLayout';

/* ───────────── Konstantalar va yordamchilar ───────────── */
const API_URL = 'https://diamond-academy-back-guqx.onrender.com';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const mediaUrl = (path?: string | null) =>
  path ? (path.startsWith('http') ? path : `${API_URL}${path}`) : null;

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const getErrorMessage = (err: unknown, fallback: string) => {
  const e = err as { response?: { data?: { message?: string | string[] } } };
  const msg = e?.response?.data?.message;
  return (Array.isArray(msg) ? msg.join(', ') : msg) || fallback;
};

type Filter = 'all' | 'active' | 'inactive';
type ToastState = { type: 'success' | 'error'; text: string } | null;

/* ───────────── Media (rasm / video) ───────────── */
function Media({
  src,
  alt,
  autoPlay = false,
  className = '',
}: {
  src: string;
  alt: string;
  autoPlay?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  if (isVideoUrl(src)) {
    return (
      <video
        ref={ref}
        src={src}
        className={className}
        muted
        loop
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        onMouseEnter={() => {
          if (!autoPlay) ref.current?.play().catch(() => {});
        }}
        onMouseLeave={() => {
          if (!autoPlay && ref.current) {
            ref.current.pause();
            ref.current.currentTime = 0;
          }
        }}
      />
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}

/* ───────────── Switch ───────────── */
function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-emerald-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

/* ───────────── Sahifa ───────────── */
export default function AdvertisementsPage() {
  const { data: advertisements, isLoading } = useAdvertisements();
  const createMutation = useCreateAdvertisement();
  const updateMutation = useUpdateAdvertisement();
  const deleteMutation = useDeleteAdvertisement();

  // Modal / forma
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
  const [formError, setFormError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  // Ro'yxat boshqaruvi
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Advertisement | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  /* ── Toast avtomatik yopiladi ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Modal ochiq paytda: scroll qulfi + ESC ── */
  const modalOpen = showModal || !!deleteTarget;
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (deleteTarget) setDeleteTarget(null);
      else handleCloseModal();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, deleteTarget]);

  /* ── Blob URL xotirasini tozalash ── */
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  /* ── Hisob-kitoblar ── */
  const sorted = useMemo(
    () =>
      [...(advertisements ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [advertisements],
  );

  const total = sorted.length;
  const activeCount = sorted.filter((a) => a.isActive).length;
  const inactiveCount = total - activeCount;
  const activeAd = sorted.find((a) => a.isActive);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((ad) => {
      if (filter === 'active' && !ad.isActive) return false;
      if (filter === 'inactive' && ad.isActive) return false;
      if (!q) return true;
      return (
        ad.title.toLowerCase().includes(q) ||
        ad.description.toLowerCase().includes(q)
      );
    });
  }, [sorted, filter, query]);

  const showFeatured = !!activeAd && filter !== 'inactive' && !query.trim();
  const gridItems = filtered.filter((ad) => !(showFeatured && ad.id === activeAd?.id));

  /* ── Modal amallari ── */
  const handleOpenModal = (ad?: Advertisement) => {
    revokeObjectUrl();
    setFormError('');
    setDragOver(false);
    if (ad) {
      setEditingAd(ad);
      setFormData({
        title: ad.title,
        description: ad.description,
        isActive: ad.isActive,
      });
      const url = mediaUrl(ad.imageUrl);
      setPreviewUrl(url);
      setIsPreviewVideo(url ? isVideoUrl(url) : false);
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
    revokeObjectUrl();
    setShowModal(false);
    setEditingAd(null);
    setFormData({ title: '', description: '', isActive: false });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsPreviewVideo(false);
    setFormError('');
    setDragOver(false);
  };

  const acceptFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setFormError('Faqat rasm yoki video fayl yuklash mumkin');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFormError('Fayl hajmi 50MB dan oshmasligi kerak');
      return;
    }
    setFormError('');
    revokeObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setSelectedFile(file);
    setPreviewUrl(url);
    setIsPreviewVideo(file.type.startsWith('video/'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };

  const handleRemoveFile = () => {
    revokeObjectUrl();
    setSelectedFile(null);
    // Tahrirlashda — eski faylga qaytamiz
    const url = editingAd ? mediaUrl(editingAd.imageUrl) : null;
    setPreviewUrl(url);
    setIsPreviewVideo(url ? isVideoUrl(url) : false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingAd) {
        await updateMutation.mutateAsync({
          id: editingAd.id,
          dto: {
            ...formData,
            ...(selectedFile && { file: selectedFile }),
          },
        });
        setToast({ type: 'success', text: 'Reklama yangilandi' });
      } else {
        if (!selectedFile) {
          setFormError('Fayl tanlash shart!');
          return;
        }
        await createMutation.mutateAsync({
          ...formData,
          file: selectedFile,
        });
        setToast({ type: 'success', text: "Reklama qo'shildi" });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      setFormError(getErrorMessage(error, 'Xatolik yuz berdi!'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setToast({ type: 'success', text: "Reklama o'chirildi" });
      setDeleteTarget(null);
    } catch (error) {
      setToast({ type: 'error', text: getErrorMessage(error, "O'chirishda xatolik") });
    }
  };

  const handleToggleActive = async (ad: Advertisement) => {
    setTogglingId(ad.id);
    try {
      await updateMutation.mutateAsync({
        id: ad.id,
        dto: { isActive: !ad.isActive },
      });
      setToast({
        type: 'success',
        text: ad.isActive ? 'Reklama nofaol qilindi' : 'Reklama faollashtirildi',
      });
    } catch (error) {
      setToast({ type: 'error', text: getErrorMessage(error, 'Xatolik yuz berdi!') });
    } finally {
      setTogglingId(null);
    }
  };

  /* ───────────── Yuklanmoqda (skeleton) ───────────── */
  if (isLoading) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white p-4 md:p-8">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-9 w-56 rounded-lg bg-slate-200" />
                <div className="h-4 w-72 rounded bg-slate-200" />
              </div>
              <div className="h-11 w-44 rounded-xl bg-slate-200" />
            </div>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-200" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-72 rounded-2xl bg-slate-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────── Asosiy sahifa ───────────── */
  const stats = [
    {
      label: 'Jami reklamalar',
      value: total,
      icon: Megaphone,
      iconBox: 'bg-indigo-100 text-indigo-600',
      bar: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Faol',
      value: activeCount,
      icon: Eye,
      iconBox: 'bg-emerald-100 text-emerald-600',
      bar: 'from-emerald-400 to-green-500',
    },
    {
      label: 'Nofaol',
      value: inactiveCount,
      icon: EyeOff,
      iconBox: 'bg-slate-100 text-slate-600',
      bar: 'from-slate-300 to-slate-400',
    },
  ];

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Barchasi', count: total },
    { key: 'active', label: 'Faol', count: activeCount },
    { key: 'inactive', label: 'Nofaol', count: inactiveCount },
  ];

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                Reklamalar
              </h1>
              <p className="mt-1 text-slate-500">Sayt reklamalarini boshqarish</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl active:scale-[0.98]"
            >
              <Plus size={20} />
              Reklama qo&apos;shish
            </button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.bar}`}
                />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-slate-500">{s.label}</p>
                    <p className="text-3xl font-bold text-slate-800">{s.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${s.iconBox}`}>
                    <s.icon size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar: qidiruv + filtr */}
          {total > 0 && (
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Sarlavha yoki tavsif bo'yicha qidirish..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Tozalash"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setFilter(t.key)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                      filter === t.key
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                    <span
                      className={`rounded-full px-1.5 text-xs ${
                        filter === t.key
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Faol reklama (featured) */}
          {showFeatured && activeAd && (
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <h2 className="text-lg font-bold text-slate-800">Hozir ko&apos;rsatilmoqda</h2>
              </div>

              <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/10 lg:flex">
                {mediaUrl(activeAd.imageUrl) && (
                  <div className="relative aspect-video w-full shrink-0 bg-slate-100 lg:aspect-auto lg:w-[26rem]">
                    <Media
                      src={mediaUrl(activeAd.imageUrl)!}
                      alt={activeAd.title}
                      autoPlay
                      className="h-full w-full object-cover"
                    />
                    {isVideoUrl(activeAd.imageUrl ?? '') && (
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                        <Film size={12} /> Video
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      <Eye size={13} />
                      FAOL
                    </span>
                    <h3 className="mb-2 text-2xl font-bold text-slate-800">
                      {activeAd.title}
                    </h3>
                    <p className="leading-relaxed text-slate-600">{activeAd.description}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                      <Calendar size={14} />
                      {formatDate(activeAd.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(activeAd)}
                        disabled={togglingId === activeAd.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        {togglingId === activeAd.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <EyeOff size={16} />
                        )}
                        Nofaol qilish
                      </button>
                      <button
                        onClick={() => handleOpenModal(activeAd)}
                        aria-label="Tahrirlash"
                        title="Tahrirlash"
                        className="rounded-lg border border-slate-200 p-2 text-indigo-600 transition hover:bg-indigo-50"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(activeAd)}
                        aria-label="O'chirish"
                        title="O'chirish"
                        className="rounded-lg border border-slate-200 p-2 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reklamalar to'ri */}
          {gridItems.length > 0 && (
            <div>
              {showFeatured && (
                <h2 className="mb-4 text-lg font-bold text-slate-800">Boshqa reklamalar</h2>
              )}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gridItems.map((ad) => {
                  const src = mediaUrl(ad.imageUrl);
                  return (
                    <div
                      key={ad.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-100">
                        {src ? (
                          <Media
                            src={src}
                            alt={ad.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-300">
                            <Megaphone size={40} />
                          </div>
                        )}
                        <span
                          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur ${
                            ad.isActive
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/90 text-slate-600'
                          }`}
                        >
                          {ad.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                          {ad.isActive ? 'Faol' : 'Nofaol'}
                        </span>
                        {src && isVideoUrl(src) && (
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                            <Film size={12} /> Video
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="mb-1.5 line-clamp-1 text-lg font-bold text-slate-800">
                          {ad.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-slate-500">{ad.description}</p>

                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={ad.isActive}
                              onChange={() => handleToggleActive(ad)}
                              disabled={togglingId === ad.id}
                              label={ad.isActive ? 'Nofaol qilish' : 'Faol qilish'}
                            />
                            <span className="hidden items-center gap-1 text-xs text-slate-400 sm:inline-flex">
                              <Calendar size={12} />
                              {formatDate(ad.createdAt)}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleOpenModal(ad)}
                              aria-label="Tahrirlash"
                              title="Tahrirlash"
                              className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(ad)}
                              aria-label="O'chirish"
                              title="O'chirish"
                              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bo'sh holatlar */}
          {total === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <Megaphone className="text-indigo-400" size={32} />
              </div>
              <p className="mb-1 text-lg font-semibold text-slate-700">
                Hech qanday reklama topilmadi
              </p>
              <p className="mb-6 text-sm text-slate-500">
                Birinchi reklamangizni qo&apos;shib ko&apos;ring
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
              >
                <Plus size={18} />
                Reklama qo&apos;shish
              </button>
            </div>
          )}

          {total > 0 && filtered.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Search className="mx-auto mb-3 text-slate-300" size={40} />
              <p className="font-medium text-slate-600">Hech narsa topilmadi</p>
              <button
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                }}
                className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
              >
                Filtrlarni tozalash
              </button>
            </div>
          )}
        </div>

        {/* ───────────── Qo'shish / tahrirlash modali ───────────── */}
        {showModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isSaving) handleCloseModal();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {editingAd ? 'Reklamani tahrirlash' : "Yangi reklama qo'shish"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {editingAd
                      ? "O'zgartirishlarni kiriting va saqlang"
                      : "Ma'lumotlarni to'ldiring va fayl yuklang"}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  aria-label="Yopish"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Sarlavha *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Reklama sarlavhasi"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Tavsif *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Reklama tavsifi"
                  />
                </div>

                {/* Fayl yuklash */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Rasm yoki Video {editingAd ? '(ixtiyoriy)' : '*'}
                  </label>

                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative block cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition ${
                      dragOver
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                    }`}
                  >
                    {previewUrl ? (
                      <div className="mx-auto max-w-sm overflow-hidden rounded-lg bg-slate-100">
                        {isPreviewVideo ? (
                          <video
                            src={previewUrl}
                            className="mx-auto max-h-48 w-full object-contain"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="mx-auto max-h-48 w-full object-contain"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="py-4">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                          <Upload className="text-indigo-500" size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          Faylni shu yerga tashlang yoki{' '}
                          <span className="text-indigo-600">tanlang</span>
                        </p>
                      </div>
                    )}
                    <p className="mt-3 text-xs text-slate-400">
                      PNG, JPG, GIF, MP4, WEBM (max 50MB)
                    </p>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      required={!editingAd && !selectedFile}
                    />
                  </label>

                  {selectedFile && (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="truncate text-slate-600">
                        {selectedFile.name}{' '}
                        <span className="text-slate-400">
                          ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="ml-3 shrink-0 font-medium text-red-600 hover:underline"
                      >
                        Olib tashlash
                      </button>
                    </div>
                  )}
                </div>

                {/* Faollashtirish */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Darhol faollashtirish</p>
                    <p className="text-xs text-slate-500">
                      Reklama saytda hoziroq ko&apos;rinadi
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onChange={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    label="Darhol faollashtirish"
                  />
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3"
                  >
                    <XCircle className="mt-0.5 shrink-0 text-red-500" size={18} />
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-medium text-white shadow-md transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
                  >
                    {isSaving && <RefreshCw size={16} className="animate-spin" />}
                    {isSaving
                      ? 'Yuklanmoqda...'
                      : editingAd
                        ? 'Yangilash'
                        : 'Saqlash'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ───────────── O'chirishni tasdiqlash ───────────── */}
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !deleteMutation.isPending)
                setDeleteTarget(null);
            }}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="text-red-600" size={26} />
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-800">Reklamani o&apos;chirasizmi?</h3>
              <p className="mb-6 text-sm text-slate-500">
                <span className="font-medium text-slate-700">{deleteTarget.title}</span>{' '}
                butunlay o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteMutation.isPending && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}
                  O&apos;chirish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── Toast ───────────── */}
        {toast && (
          <div
            role="status"
            className={`fixed bottom-5 right-5 z-[120] flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
              toast.type === 'success' ? 'bg-slate-900' : 'bg-red-600'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={18} className="shrink-0 text-emerald-400" />
            ) : (
              <XCircle size={18} className="shrink-0" />
            )}
            <span>{toast.text}</span>
            <button
              onClick={() => setToast(null)}
              aria-label="Yopish"
              className="ml-1 text-white/60 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}