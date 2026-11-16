import type { VideoSource } from './course';

/** Backend FileKind qiymatlari to'liq ma'lum emas, shuning uchun erkin satr */
export type FileKind = 'IMAGE' | 'PDF' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'OTHER' | (string & {});

export interface LessonResource {
  id: string;
  lessonId: string;
  title: string;
  url: string | null;
  kind: FileKind;
  createdAt: string;
  /** faqat admin / o'qituvchi */
  storageKey?: string | null;
}

export interface LessonAssignmentSummary {
  id: string;
  title: string;
  maxScore: number;
  dueDate: string | null;
  allowText: boolean;
  allowFiles: boolean;
  /** faqat talaba: o'zining topshirgan ishi */
  submissions?: { id: string; status: string; score: number | null; submittedAt: string }[];
}

export interface LessonVideo {
  source: VideoSource;
  playbackUrl: string | null;
  thumbnail: string | null;
  durationSec: number | null;
}

export interface LessonNeighbor {
  id: string;
  title: string;
  order: number;
}

/** GET /lesson/:id */
export interface LessonDetail {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  isPublished: boolean;
  videoSource: VideoSource;
    /** YouTube uchun embed havola; faqat tahrirlash uchun */
  videoUrl?: string | null;
  /** faqat admin / o'qituvchi */
  videoKey?: string | null;
  durationSec: number | null;
  video: LessonVideo;
  resources: LessonResource[];
  assignments: LessonAssignmentSummary[];
  /** faqat talaba */
  progress?: { completed: boolean; completedAt: string | null }[];
  prev: LessonNeighbor | null;
  next: LessonNeighbor | null;
}

export interface LessonProgressResult {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}
export interface CreateLessonInput {
  courseId: string;
  title: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
  videoSource?: VideoSource;
  videoUrl?: string;
  videoKey?: string;
  durationSec?: number;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string | null;
  order?: number;
  isPublished?: boolean;
  videoSource?: VideoSource;
  videoUrl?: string | null;
  videoKey?: string | null;
  durationSec?: number | null;
}

export interface CreateResourceInput {
  title: string;
  url?: string;
  storageKey?: string;
}
