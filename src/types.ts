export interface Task {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  difficulty: 'Легко' | 'Средне' | 'Творчество';
  topic: string;
  initialCode: string;
  expectedDescription: string;
  instructions: string[];
  learningPoints: string[];
  hints: string[];
  solutionCode: string;
  starterTemplates?: { name: string; icon: string; code: string }[];
}

export interface RunResult {
  output: string;
  error: string | null;
  executionTimeMs: number;
}

export interface ValidationResult {
  isSuccess: boolean;
  message: string;
  kidAdvice?: string;
  expectedOutput?: string;
  actualOutput?: string;
}

export interface UserProgress {
  completedTaskIds: number[];
  currentTaskId: number;
  xp: number;
  soundsEnabled: boolean;
  codeState: Record<number, string>;
  studentName?: string;
  quizCompleted?: boolean;
  quizScore?: number;
}

export type IllustrationType = 'algorithm' | 'program' | 'industry' | 'spheres' | 'rules' | 'automation';

interface QuizQuestionBase {
  id: number;
  topic: string;
  question: string;
  explanation: string;
  fact: string;
  illustrationType: IllustrationType;
}

/** Один правильный ответ */
export interface SingleChoiceQuestion extends QuizQuestionBase {
  kind: 'single';
  options: string[];
  correctIndex: number;
}

/** Несколько правильных ответов */
export interface MultipleChoiceQuestion extends QuizQuestionBase {
  kind: 'multiple';
  options: string[];
  correctIndices: number[];
}

/** Соотнеси левый столбик с правым */
export interface MatchQuestion extends QuizQuestionBase {
  kind: 'match';
  pairs: { left: string; right: string }[];
}

export type QuizQuestion = SingleChoiceQuestion | MultipleChoiceQuestion | MatchQuestion;

