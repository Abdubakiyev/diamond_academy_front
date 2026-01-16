  
  export interface TestResult {
    id: string;
    userId: string;
    levelId: string;
    correctCount: number;
    wrongCount: number;
    createdAt: string;

    user?: {
        id: string;
        name: string;
        phone: string;
        role: string;
    };
    level?: {
        id: string;
        type: string;
    };
  }

  
  export interface CreateTestResultAnswer {
    testId: string;
    answer: 'A' | 'B' | 'C' | 'D';
  }
  
  export interface CreateTestResultDto {
    levelId: string;
    answers: CreateTestResultAnswer[];
  }
  