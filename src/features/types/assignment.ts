export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'RETURNED';

export interface SubmissionFile {
  id: string;
  submissionId: string;
  url: string;
  kind: string;
  fileName: string | null;
  sizeBytes: number | null;
  createdAt: string;
  /** faqat admin / o'qituvchi */
  storageKey?: string | null;
}

export interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  text: string | null;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  submittedAt: string;
  files: SubmissionFile[];
}

interface AssignmentBase {
  id: string;
  lessonId: string;
  title: string;
  /** Vazifa sharti */
  instructions: string;
  maxScore: number;
  dueDate: string | null;
  allowText: boolean;
  allowFiles: boolean;
  createdAt: string;
  lesson: { id: string; title: string; courseId: string };
}

/** GET /assignment/:id: talaba uchun */
export interface StudentAssignment extends AssignmentBase {
  isOverdue: boolean;
  mySubmission: Submission | null;
}

/** GET /assignment/:id: admin / o'qituvchi uchun */
export interface StaffAssignment extends AssignmentBase {
  stats: { total: number; pending: number };
}

export type AssignmentDetail = StudentAssignment | StaffAssignment;

export const isStaffAssignment = (a: AssignmentDetail): a is StaffAssignment => 'stats' in a;

export interface SubmitAssignmentInput {
  text?: string;
  files?: { storageKey: string; fileName?: string; sizeBytes?: number }[];
}
export interface CreateAssignmentInput {
  lessonId: string;
  title: string;
  instructions: string;
  maxScore?: number;
  dueDate?: string;
  allowText?: boolean;
  allowFiles?: boolean;
}

export interface UpdateAssignmentInput {
  title?: string;
  instructions?: string;
  maxScore?: number;
  dueDate?: string | null;
  allowText?: boolean;
  allowFiles?: boolean;
}

export interface GradeInput {
  score?: number;
  feedback?: string;
  returnForRevision?: boolean;
}

export interface SubmissionUser {
  id: string;
  name: string;
  phone: string;
}

export interface SubmissionListItem {
  id: string;
  status: SubmissionStatus;
  score: number | null;
  submittedAt: string;
  gradedAt: string | null;
  user: SubmissionUser;
  _count: { files: number };
}

export interface SubmissionList {
  items: SubmissionListItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ListSubmissionsQuery {
  status?: SubmissionStatus;
  page?: number;
  limit?: number;
}

/** GET /assignment/submissions/:id */
export interface SubmissionDetail extends Submission {
  user: SubmissionUser;
  assignment: { id: string; title: string; maxScore: number };
}
