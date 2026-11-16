export type UploadPurpose =
  | 'LESSON_VIDEO'
  | 'LESSON_RESOURCE'
  | 'EXAM_AUDIO'
  | 'EXAM_IMAGE'
  | 'SUBMISSION_FILE'
  | 'SPEAKING_AUDIO';

export interface PresignRequest {
  purpose: UploadPurpose;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface PresignResponse {
  uploadUrl: string;
  headers: Record<string, string>;
  key: string;
  publicUrl: string | null;
  expiresIn: number;
}

export interface UploadedFile {
  key: string;
  publicUrl: string | null;
}
