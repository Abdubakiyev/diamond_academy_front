// src/features/types/access.ts
export interface AccessCode {
  code: string;
  expiresAt: string;
  remainingSeconds: number;
  remainingMinutes: number;
}

export interface AccessCodeResponse {
  code: string;
  expiresAt: string;
  remainingSeconds: number;
  remainingMinutes: number;
  message?: string;
}

export interface CheckAccessDto {
  code: string;
}

export interface CheckAccessResponse {
  success: boolean;
}