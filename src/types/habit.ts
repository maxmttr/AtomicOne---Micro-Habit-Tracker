/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MicroHabit {
  id: string;
  title: string;           // z. B. "1 Seite lesen"
  cue: string;             // Trigger-Anker, z. B. "Nach dem Morgenkaffee"
  timeEstimate: string;    // z. B. "1 min", "30 sek"
  color: string;           // Neo-Brutalist Farbakzent (z. B. #D8F22A, #FF5C00, #3B82F6)
  icon: string;            // Icon-Name
  archived: boolean;
  createdAt: string;       // ISO Timestamp
  orderIndex: number;
  reminderTime?: string;   // Optional z. B. "08:00"
}

export interface HabitExecution {
  id: string;
  habitId: string;
  date: string;            // Format: YYYY-MM-DD (zeitzonenfest)
  completedAt: string;     // ISO Timestamp
}

export interface DayStats {
  date: string;
  totalHabits: number;
  completedCount: number;
  isAllCompleted: boolean;
  percentage: number;
}

export interface WeekdayStat {
  dayIndex: number;        // 0 = Sonntag, 1 = Montag...
  dayName: string;         // 'Mo', 'Di', etc.
  completedCount: number;
  possibleCount: number;
  percentage: number;
}

export interface MonthlyConsistency {
  yearMonth: string;       // Format: YYYY-MM
  daysInMonth: number;
  activeDaysCount: number; // Tage mit mind. 1 erledigtem Habit
  totalCompletedExecutions: number;
  totalPossibleExecutions: number;
  consistencyScore: number; // z. B. 84 (%)
  dailyMap: Record<string, { completedIds: string[]; total: number }>;
  weekdayStats: WeekdayStat[];
  bestWeekday: string;
}
