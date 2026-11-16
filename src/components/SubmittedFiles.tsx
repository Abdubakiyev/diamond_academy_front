import { ExternalLink, FileText } from 'lucide-react';
import type { SubmissionFile } from '../features/types/assignment';
import { formatFileSize } from '../lib/format';

export default function SubmittedFiles({ files }: { files: SubmissionFile[] }) {
  if (files.length === 0) return null;
  const isImage = (f: SubmissionFile) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(f.fileName ?? f.url);
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {files.map((f) => (
        <li key={f.id}>
          <a
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
              {isImage(f) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-gray-800">{f.fileName ?? 'Fayl'}</span>
              {f.sizeBytes ? <span className="text-xs text-gray-400">{formatFileSize(f.sizeBytes)}</span> : null}
            </span>
            <ExternalLink className="h-4 w-4 text-gray-300 transition group-hover:text-indigo-500" />
          </a>
        </li>
      ))}
    </ul>
  );
}
