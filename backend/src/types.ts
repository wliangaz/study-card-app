
export interface Question {
  id: number;
  topic: string;
  question: string;
  difficulty: 'basic' | 'mid' | 'advanced' | 'expert';
  answer?: string;
}

export interface UserHistory {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: Date;
}
