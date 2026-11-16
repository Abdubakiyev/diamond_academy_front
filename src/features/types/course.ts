export type VideoSource = 'YOUTUBE' | 'EXTERNAL' | 'UPLOAD' | 'NONE';

export interface CourseLevel {
  id: string;
  type: string;
}

export interface CourseGroupLink {
  group: { id: string; name: string };
}

interface CourseBase {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  levelId: string | null;
  isPublished: boolean;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
  level: CourseLevel | null;
  /** faqat admin / o'qituvchi uchun */
  groups?: CourseGroupLink[];
}

/** GET /course (massiv) */
export interface CourseListItem extends CourseBase {
  _count: { lessons: number };
}

export interface CourseLessonItem {
  id: string;
  title: string;
  order: number;
  isPublished: boolean;
  videoSource: VideoSource;
  durationSec: number | null;
  /** faqat talaba uchun */
  progress?: { completed: boolean }[];
}

/** GET /course/:id */
export interface CourseDetail extends CourseBase {
  lessons: CourseLessonItem[];
}

export interface ListCoursesQuery {
  levelId?: string;
  search?: string;
  /** faqat admin / o'qituvchi */
  published?: 'true' | 'false';
}
export interface LevelOption {
  id: string;
  type: string;
}

export interface GroupOption {
  id: string;
  name: string;
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  coverUrl?: string;
  levelId?: string;
  isPublished?: boolean;
}

/** null yuborilsa maydon tozalanadi */
export interface UpdateCourseInput {
  title?: string;
  description?: string | null;
  coverUrl?: string | null;
  levelId?: string | null;
  isPublished?: boolean;
}
