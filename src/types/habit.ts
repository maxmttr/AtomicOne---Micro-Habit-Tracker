/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TimeWindow = 'morning' | 'midday' | 'evening' | 'anytime';

export const TIME_WINDOW_META: Record<
  TimeWindow,
  { label: string; emoji: string; shortLabel: string; sortOrder: number; description: string }
> = {
  morning: { label: 'Morgens', emoji: '🌅', shortLabel: 'Morgens', sortOrder: 1, description: 'Start in den Tag (06:00 – 11:00)' },
  midday: { label: 'Mittags', emoji: '☀️', shortLabel: 'Mittags', sortOrder: 2, description: 'Mittag & Fokus (11:00 – 16:00)' },
  evening: { label: 'Abends', emoji: '🌙', shortLabel: 'Abends', sortOrder: 3, description: 'Feierabend & Nacht (16:00 – 23:00)' },
  anytime: { label: 'Flexibel', emoji: '⚡', shortLabel: 'Flexibel', sortOrder: 4, description: 'Jederzeit im Tagesverlauf' },
};

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
  timeWindow?: TimeWindow; // Optionales Zeitfenster: morgens, mittags, abends, flexibel
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

export interface WeeklyVictoryDay {
  date: string;
  weekdayName: string;
  completedCount: number;
  totalHabits: number;
  percentage: number;
  passed: boolean;
}

export interface WeeklyVictoryStatus {
  isVictory: boolean;
  qualifyingDaysCount: number;
  totalDays: number;
  startDate: string;
  endDate: string;
  dateRangeLabel: string;
  days: WeeklyVictoryDay[];
  averagePercentage: number;
}

export interface AiHabitSuggestion {
  title: string;           // z. B. "1 Glas Wasser vor dem Kaffee"
  cue: string;             // Physischer Trigger, z. B. "Sobald die Kaffeemaschine läuft"
  timeEstimate: string;    // z. B. "30 Sek" oder "1 Min"
  category: string;        // z. B. "Vitalität & Körper", "Klarheit & Fokus", "Ruhe & Balance"
  color: string;           // Neo-Brutalist Farbakzent (z. B. #D8F22A, #A78BFA, #38BDF8)
  icon: string;            // Icon Identifier
  rationale: string;       // Begründung: Warum das zu den bestehenden Habits passt
  missingDomain: string;   // Erkannte Lücke / Fokusbereich
  timeWindow?: TimeWindow; // Empfohlenes Zeitfenster (morgens, mittags, abends, anytime)
}


