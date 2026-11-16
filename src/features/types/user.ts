import { TestResult } from './test-result';

// eski:  export type UserRole = 'USER' | 'ADMIN';
export type UserRole = 'USER' | 'ADMIN' | 'TEACHER';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  results?: TestResult[]; // optional, agar fetch qilsak
  createdAt: string;
}
