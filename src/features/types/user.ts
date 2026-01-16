import { TestResult } from './test-result';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  results?: TestResult[]; // optional, agar fetch qilsak
  createdAt: string;
}
