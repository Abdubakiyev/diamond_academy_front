'use client';

import { ExternalLink, VideoOff } from 'lucide-react';
import type { LessonVideo } from '../features/types/lesson';
import { getVimeoId, getYoutubeId, isDirectVideo } from '../lib/video';

const frame = 'relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl shadow-black/10 ring-1 ring-black/10';

export default function VideoPlayer({ video, title }: { video: LessonVideo; title: string }) {
  const url = video.playbackUrl;
  if (video.source === 'NONE' || !url) return null;

  if (video.source === 'YOUTUBE') {
    const id = getYoutubeId(url);
    if (id) {
      return (
        <div className={frame}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      );
    }
  }

  if (video.source === 'UPLOAD' || isDirectVideo(url)) {
    return (
      <div className={frame}>
        <video
          src={url}
          poster={video.thumbnail ?? undefined}
          controls
          controlsList="nodownload"
          playsInline
          preload="metadata"
          className="h-full w-full"
        />
      </div>
    );
  }

  const vimeo = getVimeoId(url);
  if (vimeo) {
    return (
      <div className={frame}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeo}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  // Boshqa tashqi havola: ichiga joylab bo'lmaydi, yangi oynada ochiladi
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-slate-800 to-indigo-900 text-white shadow-xl ring-1 ring-black/10 transition hover:from-slate-700"
    >
      <VideoOff className="h-10 w-10 text-white/40" />
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/20">
        Videoni yangi oynada ochish <ExternalLink className="h-4 w-4" />
      </span>
    </a>
  );
}
