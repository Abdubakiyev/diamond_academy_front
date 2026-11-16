import Link from 'next/link';
import { BookOpen, EyeOff, Gem, PlayCircle } from 'lucide-react';
import type { CourseListItem } from '../features/types/course';
import { gradientFor } from '../lib/course';

export default function CourseCard({ course }: { course: CourseListItem }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/10"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {course.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.coverUrl}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientFor(course.id)}`}>
            <Gem className="h-14 w-14 text-white/30 transition duration-500 group-hover:scale-110 group-hover:rotate-6" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex gap-2">
          {course.level && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur">
              {course.level.type}
            </span>
          )}
          {!course.isPublished && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/95 px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-sm">
              <EyeOff className="h-3 w-3" /> Qoralama
            </span>
          )}
        </div>

        <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-indigo-600 opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <PlayCircle className="h-5 w-5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900 transition group-hover:text-indigo-700">
          {course.title}
        </h3>
        {course.description && <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">{course.description}</p>}

        <div className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-medium text-gray-500">
          <BookOpen className="h-4 w-4 text-indigo-500" />
          {course._count.lessons} ta dars
        </div>
      </div>
    </Link>
  );
}
