import { Download, File, FileAudio, FileImage, FileText, FileVideo } from 'lucide-react';
import type { LessonResource } from '../features/types/lesson';

function iconFor(r: LessonResource) {
  const kind = String(r.kind).toUpperCase();
  const url = (r.url ?? '').toLowerCase().split('?')[0];
  if (kind === 'IMAGE' || /\.(png|jpe?g|webp|gif|svg)$/.test(url)) return { Icon: FileImage, tone: 'bg-pink-50 text-pink-600' };
  if (kind === 'AUDIO' || /\.(mp3|wav|ogg|m4a|webm)$/.test(url)) return { Icon: FileAudio, tone: 'bg-amber-50 text-amber-600' };
  if (kind === 'VIDEO' || /\.(mp4|mov|mkv)$/.test(url)) return { Icon: FileVideo, tone: 'bg-violet-50 text-violet-600' };
  if (kind === 'PDF' || /\.(pdf|docx?|pptx?|xlsx?|txt)$/.test(url)) return { Icon: FileText, tone: 'bg-blue-50 text-blue-600' };
  return { Icon: File, tone: 'bg-gray-100 text-gray-600' };
}

export default function ResourceList({ resources }: { resources: LessonResource[] }) {
  if (resources.length === 0) return null;
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {resources.map((r) => {
        const { Icon, tone } = iconFor(r);
        const disabled = !r.url;
        return (
          <li key={r.id}>
            <a
              href={r.url ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={disabled}
              className={`group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition ${
                disabled ? 'pointer-events-none opacity-50' : 'hover:border-indigo-200 hover:shadow-md'
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{r.title}</span>
              <Download className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-indigo-500" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
