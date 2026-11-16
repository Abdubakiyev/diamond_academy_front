'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarClock, ClipboardCheck, ExternalLink, FileText, Loader2, Paperclip, Pencil, Plus, Save, Trash2, Video } from 'lucide-react';
import AdminShell from '../../../../../components/admin/AdminShell';
import Segmented from '../../../../../components/admin/Segmented';
import ToggleRow from '../../../../../components/admin/ToggleRow';
import ConfirmModal from '../../../../../components/ui/ConfirmModal';
import EmptyState from '../../../../../components/ui/EmptyState';
import FileDropzone, { type UploadItem } from '../../../../../components/ui/FileDropzone';
import Spinner from '../../../../../components/ui/Spinner';
import VideoPlayer from '../../../../../components/VideoPlayer';
import { useLesson, useRemoveResource, useUpdateLesson } from '../../../../../features/hooks/useLesson';
import { useDeleteAssignment } from '../../../../../features/hooks/useAssignment';
import { useAddResourceModal } from '../../../../../features/modals/useAddResourceModal';
import { useAssignmentModal } from '../../../../../features/modals/useCreateAssignmentModal';
import { handleApiError } from '../../../../../features/api/api';
import type { VideoSource } from '../../../../../features/types/course';
import type { LessonAssignmentSummary, LessonDetail, LessonResource, UpdateLessonInput } from '../../../../../features/types/lesson';
import { ADMIN_HOME } from '../../../../../lib/config';
import { formatDateTime } from '../../../../../lib/format';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

function LessonForm({ lesson }: { lesson: LessonDetail }) {
  const update = useUpdateLesson();
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description ?? '');
  const [published, setPublished] = useState(lesson.isPublished);
  const [source, setSource] = useState<VideoSource>(lesson.videoSource);
  const [videoUrl, setVideoUrl] = useState(lesson.videoSource === 'YOUTUBE' || lesson.videoSource === 'EXTERNAL' ? lesson.videoUrl ?? '' : '');
  const [minutes, setMinutes] = useState(lesson.durationSec ? String(Math.round(lesson.durationSec / 60)) : '');
  const [items, setItems] = useState<UploadItem[]>([]);

  const newKey = items.find((i) => i.status === 'done')?.key ?? null;
  const uploading = items.some((i) => i.status === 'uploading');

  const save = () => {
    if (!title.trim()) return toast.error('Dars nomini kiriting');
    if (uploading) return toast.error('Video yuklanishini kuting');

    const input: UpdateLessonInput = {
      title: title.trim(),
      description: description.trim() || null,
      isPublished: published,
      durationSec: minutes ? Math.round(Number(minutes) * 60) : null,
      videoSource: source,
    };

    if (source === 'NONE') {
      input.videoUrl = null;
      input.videoKey = null;
    } else if (source === 'YOUTUBE' || source === 'EXTERNAL') {
      if (!videoUrl.trim()) return toast.error('Video havolasini kiriting');
      input.videoUrl = videoUrl.trim();
      input.videoKey = null;
    } else {
      const key = newKey ?? lesson.videoKey ?? null;
      if (!key) return toast.error('Video faylni yuklang');
      input.videoKey = key;
    }

    update.mutate(
      { id: lesson.id, input },
      { onSuccess: () => toast.success('Dars saqlandi'), onError: (e) => toast.error(handleApiError(e)) },
    );
  };

  const showCurrent = source === lesson.videoSource && !newKey && !!lesson.video.playbackUrl;

  return (
    <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Dars nomi</label>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Dars matni / konspekt</label>
        <textarea className={`${inputCls} resize-y leading-relaxed`} rows={10} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={50000} />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Video</p>
        <Segmented
          value={source}
          onChange={setSource}
          options={[
            { value: 'NONE', label: 'Yo‘q' },
            { value: 'YOUTUBE', label: 'YouTube' },
            { value: 'EXTERNAL', label: 'Boshqa havola' },
            { value: 'UPLOAD', label: 'Fayl yuklash' },
          ]}
        />

        {(source === 'YOUTUBE' || source === 'EXTERNAL') && (
          <input
            className={inputCls}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={source === 'YOUTUBE' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}
          />
        )}

        {source === 'UPLOAD' && (
          <FileDropzone
            purpose="LESSON_VIDEO"
            accept={VIDEO_TYPES}
            maxFiles={1}
            maxSizeMb={1024}
            hint="MP4, WEBM yoki MOV · 1 GB gacha"
            onChange={setItems}
          />
        )}

        {showCurrent && (
          <div className="max-w-xl">
            <p className="mb-2 text-xs text-gray-400">Joriy video</p>
            <VideoPlayer video={lesson.video} title={lesson.title} />
          </div>
        )}

        <div className="max-w-[12rem]">
          <label className="mb-1.5 block text-xs font-medium text-gray-500">Davomiyligi (daqiqa)</label>
          <input className={inputCls} type="number" min={0} max={1440} value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="Masalan: 25" />
        </div>
      </div>

      <ToggleRow
        label="Holat"
        description={published ? 'E’lon qilingan: talabalarga ko‘rinadi' : 'Qoralama: faqat xodimlarga ko‘rinadi'}
        checked={published}
        onChange={setPublished}
      />

      <button
        onClick={save}
        disabled={update.isPending || uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {update.isPending || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {uploading ? 'Video yuklanmoqda...' : 'Saqlash'}
      </button>
    </section>
  );
}

function LessonEditor() {
  const { id } = useParams<{ id: string }>();
  const { data: lesson, isLoading, isError, error } = useLesson(id);
  const addResource = useAddResourceModal();
  const assignmentModal = useAssignmentModal();
  const removeResource = useRemoveResource();
  const deleteAssignment = useDeleteAssignment();
  const [resToDelete, setResToDelete] = useState<LessonResource | null>(null);
  const [asToDelete, setAsToDelete] = useState<LessonAssignmentSummary | null>(null);

  if (isLoading) return <Spinner className="py-24" />;
  if (isError || !lesson) return <EmptyState title="Dars topilmadi" description={handleApiError(error)} />;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <LessonForm key={lesson.id} lesson={lesson} />

        <div className="space-y-6">
          {/* materiallar */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Paperclip className="h-4 w-4 text-indigo-500" /> Materiallar
              </h2>
              <button onClick={() => addResource.open(lesson.id)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                <Plus className="h-3.5 w-3.5" /> Qo‘shish
              </button>
            </div>
            {lesson.resources.length === 0 ? (
              <p className="text-sm text-gray-400">Hali material yo‘q.</p>
            ) : (
              <ul className="space-y-2">
                {lesson.resources.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                    <a href={r.url ?? undefined} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-sm text-gray-700 hover:text-indigo-600">
                      {r.title}
                    </a>
                    <button onClick={() => setResToDelete(r)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="O‘chirish">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* vazifalar */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ClipboardCheck className="h-4 w-4 text-indigo-500" /> Vazifalar
              </h2>
              <button onClick={() => assignmentModal.openCreate(lesson.id)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                <Plus className="h-3.5 w-3.5" /> Qo‘shish
              </button>
            </div>
            {lesson.assignments.length === 0 ? (
              <p className="text-sm text-gray-400">Hali vazifa yo‘q.</p>
            ) : (
              <ul className="space-y-2">
                {lesson.assignments.map((a) => (
                  <li key={a.id} className="rounded-xl bg-gray-50 p-3">
                    <p className="truncate text-sm font-medium text-gray-800">{a.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                      <span>{a.maxScore} ball</span>
                      {a.dueDate && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" /> {formatDateTime(a.dueDate)}
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Link
                        href={`${ADMIN_HOME}/assignments/${a.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Ishlarni tekshirish
                      </Link>
                      <button onClick={() => assignmentModal.openEdit(a.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-700" aria-label="Tahrirlash">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setAsToDelete(a)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="O‘chirish">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {addResource.modal}
      {assignmentModal.modal}
      <ConfirmModal
        open={!!resToDelete}
        title={`“${resToDelete?.title}” materialini o‘chirasizmi?`}
        isPending={removeResource.isPending}
        onClose={() => setResToDelete(null)}
        onConfirm={() =>
          resToDelete &&
          removeResource.mutate(resToDelete.id, {
            onSuccess: () => {
              toast.success('Material o‘chirildi');
              setResToDelete(null);
            },
            onError: (e) => toast.error(handleApiError(e)),
          })
        }
      />
      <ConfirmModal
        open={!!asToDelete}
        title={`“${asToDelete?.title}” vazifasini o‘chirasizmi?`}
        message="Talabalar topshirgan ishlar va ularning baholari ham o‘chadi."
        isPending={deleteAssignment.isPending}
        onClose={() => setAsToDelete(null)}
        onConfirm={() =>
          asToDelete &&
          deleteAssignment.mutate(asToDelete.id, {
            onSuccess: () => {
              toast.success('Vazifa o‘chirildi');
              setAsToDelete(null);
            },
            onError: (e) => toast.error(handleApiError(e)),
          })
        }
      />
    </>
  );
}

export default function AdminLessonPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lesson } = useLesson(id);
  return (
    <AdminShell
      title={lesson?.title ?? 'Dars'}
      subtitle="Video, matn, materiallar va vazifalar"
      back={{ href: lesson ? `${ADMIN_HOME}/courses/${lesson.courseId}` : `${ADMIN_HOME}/courses`, label: 'Kursga qaytish' }}
      actions={
        lesson && (
          <Link
            href={`/lesson/${lesson.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
          >
            <Video className="h-4 w-4" /> Talaba ko‘rinishi
          </Link>
        )
      }
    >
      <LessonEditor />
    </AdminShell>
  );
}
