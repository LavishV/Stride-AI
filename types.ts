
export enum TaskDifficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  difficulty: TaskDifficulty;
  subTasks: SubTask[];
  dueDate: string;
  completedAt?: string;
  type?: 'exam' | 'webinar' | 'task' | 'weekend_plan';
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  color: string;
  stackWith?: string; // Habit stacking trigger
}

export interface MoodLog {
  id: string;
  timestamp: number;
  score: number; // 1-5
  note: string;
}

export interface AppState {
  tasks: Task[];
  habits: Habit[];
  moodLogs: MoodLog[];
  focusMode: boolean;
  username: string;
}
