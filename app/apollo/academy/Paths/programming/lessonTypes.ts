export type StudyDescription = {
  title: string;
  paragraphs: string[];
  videoUrl?: string;
};

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
};

export type QuizConfig = {
  id: string;
  title: string;
  questions: QuizQuestion[];
};

export type PracticePrompt = {
  title: string;
  description: string;
  instructions: string[];
};

export type PracticeCheckResult = {
  ok: boolean;
  message?: string;
};
