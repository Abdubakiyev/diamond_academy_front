'use client';

import { useParams } from 'next/navigation';
import AdminShell from '../../../../../../../components/admin/AdminShell';
import PartEditor from '../../../../../../../components/admin/PartEditor';
import { useExam } from '../../../../../../../features/hooks/useExam';
import { useExamPart } from '../../../../../../../features/hooks/useExamPart';
import { FORMAT_LABELS, SKILL_META } from '../../../../../../../lib/exam-rules';
import { ADMIN_HOME } from '../../../../../../../lib/config';

export default function AdminPartPage() {
  const { id, partId } = useParams<{ id: string; partId: string }>();
  const { data: exam } = useExam(id);
  const { data: part } = useExamPart(partId);
  const section = exam?.sections.find((s) => s.id === part?.sectionId);

  return (
    <AdminShell
      title={part ? part.title || FORMAT_LABELS[part.format] : 'Part'}
      subtitle={exam && section ? `${exam.title} · ${SKILL_META[section.skill].label}` : exam?.title}
      back={{
        href: part ? `${ADMIN_HOME}/exams/${id}/section/${part.sectionId}` : `${ADMIN_HOME}/exams/${id}`,
        label: 'Bo‘limga qaytish',
      }}
    >
      <PartEditor examId={id} partId={partId} />
    </AdminShell>
  );
}
