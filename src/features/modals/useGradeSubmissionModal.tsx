'use client';

import { useState } from 'react';
import { CheckCheck, MessageSquare, Phone, RotateCcw, User } from 'lucide-react';
import { toast } from 'sonner';
import { Field, ModalShell, TextAreaInput, TextInput } from './ui/ModalUI';
import Segmented from '../../components/admin/Segmented';
import SubmittedFiles from '../../components/SubmittedFiles';
import SubmissionStatusBadge from '../../components/SubmissionStatus';
import Spinner from '../../components/ui/Spinner';
import { useGradeSubmission, useSubmission } from '../hooks/useAssignment';
import { handleApiError } from '../api/api';
import type { SubmissionDetail } from '../types/assignment';
import { formatDateTime, formatPhone } from '../../lib/format';

const PERCENTS = [50, 70, 90, 100];

function GradeForm({ s, onClose }: { s: SubmissionDetail; onClose: () => void }) {
  const max = s.assignment.maxScore;
  const [mode, setMode] = useState<'grade' | 'return'>('grade');
  const [score, setScore] = useState(s.score != null ? String(s.score) : '');
  const [feedback, setFeedback] = useState(s.feedback ?? '');
  const [error, setError] = useState<string | null>(null);
  const grade = useGradeSubmission();

  const submit = () => {
    if (mode === 'grade') {
      const n = Number(score);
      if (score === '' || !Number.isInteger(n) || n < 0 || n > max) return setError(`Ball 0 dan ${max} gacha butun son bo‘lishi kerak`);
    } else if (!feedback.trim()) {
      return setError('Qaytarishda izoh yozish shart');
    }
    setError(null);

    grade.mutate(
      {
        id: s.id,
        input:
          mode === 'grade'
            ? { score: Number(score), feedback: feedback.trim() || undefined }
            : { returnForRevision: true, feedback: feedback.trim() },
      },
      {
        onSuccess: () => {
          toast.success(mode === 'grade' ? 'Baholandi' : 'Ish talabaga qaytarildi');
          onClose();
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell
      maxWidth="max-w-2xl"
      theme={mode === 'return' ? 'amber' : 'blue'}
      icon={CheckCheck}
      title={s.assignment.title}
      subtitle={`Maksimal ball: ${max}`}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={mode === 'grade' ? 'Baholash' : 'Qaytarish'}
      submitIcon={mode === 'grade' ? CheckCheck : RotateCcw}
      isPending={grade.isPending}
      errorMessage={error}
    >
      {/* talaba */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-100">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <User className="h-4 w-4 text-gray-400" /> {s.user.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
            <Phone className="h-3 w-3" /> {formatPhone(s.user.phone)} · {formatDateTime(s.submittedAt)}
          </p>
        </div>
        <SubmissionStatusBadge status={s.status} />
      </div>

      {/* ish */}
      {s.text && (
        <div className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-gray-100 bg-white p-4 text-sm leading-relaxed text-gray-700">
          {s.text}
        </div>
      )}
      <SubmittedFiles files={s.files} />
      {!s.text && s.files.length === 0 && <p className="text-sm text-gray-400">Ishda matn ham, fayl ham yo‘q.</p>}

      <div className="border-t border-gray-100 pt-4">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'grade', label: 'Baholash' },
            { value: 'return', label: 'Qayta ishlashga qaytarish' },
          ]}
        />
      </div>

      {mode === 'grade' && (
        <Field label={`Ball (0–${max})`} required>
          <TextInput icon={CheckCheck} type="number" min={0} max={max} value={score} onChange={(e) => setScore(e.target.value)} placeholder="0" />
          <div className="mt-2 flex flex-wrap gap-2">
            {PERCENTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setScore(String(Math.round((max * p) / 100)))}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                {p}% · {Math.round((max * p) / 100)}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label={mode === 'return' ? 'Izoh (nimani tuzatish kerak)' : 'Izoh'} required={mode === 'return'}>
        <div className="relative">
          <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <TextAreaInput className="pl-10" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={5000} placeholder="Talabaga fikringiz..." />
        </div>
      </Field>
    </ModalShell>
  );
}

function Loader({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading, isError, error } = useSubmission(id);
  if (data) return <GradeForm key={data.id + data.status} s={data} onClose={onClose} />;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-2xl bg-white p-6 shadow-2xl">
        {isLoading ? <Spinner /> : <p className="text-sm text-red-600">{isError ? handleApiError(error) : 'Ish topilmadi'}</p>}
      </div>
    </div>
  );
}

export function useGradeSubmissionModal() {
  const [id, setId] = useState<string | null>(null);
  return {
    open: (submissionId: string) => setId(submissionId),
    modal: id ? <Loader id={id} onClose={() => setId(null)} /> : null,
  };
}
