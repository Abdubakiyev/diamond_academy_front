export interface Test {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD?: string;
    correct: 'A' | 'B' | 'C' | 'D';
    levelId: string;
  }
  