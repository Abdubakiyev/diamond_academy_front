import { Test } from './test';
import { TestResult } from './test-result';

export type LevelType = 'BEGINNER'| 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED';

export interface Level {
  id: string;
  type: LevelType;
  tests?: Test[];             // optional, faqat testlarni fetch qilganda
  testResults?: TestResult[]; // optional, faqat natijalarni fetch qilganda
}
