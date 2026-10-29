/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MicroHabit, HabitExecution, MonthlyConsistency, WeeklyVictoryStatus, WeeklyVictoryDay, TimeWindow, TIME_WINDOW_META } from '../types/habit';
import { getTodayDateString, getCurrentYearMonth, getDaysInMonth, getRollingWeekDays, formatRangeGerman } from '../utils/date';

const STORAGE_KEY_HABITS = 'atomic_habits_v1';
const STORAGE_KEY_LOGS = 'atomic_logs_v1';
const STORAGE_KEY_MONTHLY_TARGETS = 'atomic_monthly_targets_v1';

const DEFAULT_HABITS: MicroHabit[] = [
  {
    id: 'habit-1',
    title: '1 Seite lesen',
    cue: 'Auf dem Nachttisch vor dem Schlafen',
    timeEstimate: '1 min',
    color: '#D8F22A', // Neo-Lime
    icon: 'BookOpen',
    archived: false,
    createdAt: new Date().toISOString(),
    orderIndex: 0,
    reminderTime: '21:30',
    timeWindow: 'evening',
  },
  {
    id: 'habit-2',
    title: '1 Minute dehnen',
    cue: 'Morgens direkt nach dem Aufstehen',
    timeEstimate: '1 min',
    color: '#FF5C00', // Neo-Orange
    icon: 'Activity',
    archived: false,
    createdAt: new Date().toISOString(),
    orderIndex: 1,
    reminderTime: '07:30',
    timeWindow: 'morning',
  },
  {
    id: 'habit-3',
    title: '1 Glas Wasser trinken',
    cue: 'Beim Betreten der Küche',
    timeEstimate: '30 sek',
    color: '#3B82F6', // Neo-Blue
    icon: 'Droplets',
    archived: false,
    createdAt: new Date().toISOString(),
    orderIndex: 2,
    reminderTime: '08:00',
    timeWindow: 'morning',
  },
  {
    id: 'habit-4',
    title: '3 tiefe Atemzüge',
    cue: 'Vor dem Aufklappen des Laptops',
    timeEstimate: '30 sek',
    color: '#10B981', // Neo-Emerald
    icon: 'Wind',
    archived: false,
    createdAt: new Date().toISOString(),
    orderIndex: 3,
    reminderTime: '09:00',
    timeWindow: 'midday',
  },
];

/**
 * Sorts habits naturally along the daytime progression:
 * 1. Morgens (morning)
 * 2. Mittags (midday)
 * 3. Abends (evening)
 * 4. Flexibel (anytime / undefined)
 * Within the same window, maintains orderIndex.
 */
export function sortHabitsByTimeWindow(habits: MicroHabit[]): MicroHabit[] {
  const getWeight = (tw?: TimeWindow): number => {
    if (!tw) return 4;
    return TIME_WINDOW_META[tw]?.sortOrder ?? 4;
  };

  return [...habits].sort((a, b) => {
    const weightA = getWeight(a.timeWindow);
    const weightB = getWeight(b.timeWindow);
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
  });
}

// Generate lively seed executions for the past days of the current month so the consistency score is alive!
function generateSeedLogs(habits: MicroHabit[]): HabitExecution[] {
  const today = getTodayDateString();
  const yearMonth = getCurrentYearMonth();
  const [year, month] = yearMonth.split('-').map(Number);
  const currentDay = Number(today.split('-')[2]);

  const logs: HabitExecution[] = [];

  for (let day = 1; day <= currentDay; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${dayStr}`;

    // On today, let's complete 2 of 4 habits initially
    if (day === currentDay) {
      logs.push({
        id: `seed-${dateStr}-${habits[0].id}`,
        habitId: habits[0].id,
        date: dateStr,
        completedAt: new Date().toISOString(),
        note: 'Kapitel 3 beendet – spannend!',
      });
      logs.push({
        id: `seed-${dateStr}-${habits[2].id}`,
        habitId: habits[2].id,
        date: dateStr,
        completedAt: new Date().toISOString(),
      });
      continue;
    }

    // Historical simulation: high realistic consistency (~80-90%)
    // Skip occasional days (e.g. day % 7 === 0 or day % 11 === 0) to demonstrate forgiving non-streak mechanics
    habits.forEach((habit, hIdx) => {
      const skipCondition = (day + hIdx) % 7 === 0 || (day === 4 && hIdx === 1);
      if (!skipCondition) {
        logs.push({
          id: `seed-${dateStr}-${habit.id}`,
          habitId: habit.id,
          date: dateStr,
          completedAt: new Date(year, month - 1, day, 8 + hIdx * 2, 15).toISOString(),
        });
      }
    });
  }

  return logs;
}

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export const habitStorage = {
  subscribe(listener: StorageListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify(): void {
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Storage listener error:', err);
      }
    });
  },

  getHabits(): MicroHabit[] {
    if (typeof window === 'undefined') return DEFAULT_HABITS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HABITS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(DEFAULT_HABITS));
        return DEFAULT_HABITS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_HABITS;
    }
  },

  saveHabits(habits: MicroHabit[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
    this.notify();
  },

  addHabit(habitData: Omit<MicroHabit, 'id' | 'createdAt' | 'orderIndex' | 'archived'>): MicroHabit {
    const current = this.getHabits();
    const newHabit: MicroHabit = {
      ...habitData,
      id: 'habit-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      orderIndex: current.length,
      archived: false,
    };
    this.saveHabits([...current, newHabit]);
    return newHabit;
  },

  deleteHabit(id: string): { habit: MicroHabit | null; logs: HabitExecution[] } {
    const current = this.getHabits();
    const habitToDelete = current.find((h) => h.id === id) || null;
    this.saveHabits(current.filter((h) => h.id !== id));

    const currentLogs = this.getLogs();
    const deletedLogs = currentLogs.filter((l) => l.habitId === id);
    const remainingLogs = currentLogs.filter((l) => l.habitId !== id);
    if (deletedLogs.length > 0) {
      this.saveLogs(remainingLogs);
    }
    return { habit: habitToDelete, logs: deletedLogs };
  },

  restoreHabit(habit: MicroHabit, logs: HabitExecution[] = []): void {
    const current = this.getHabits();
    if (!current.some((h) => h.id === habit.id)) {
      this.saveHabits([...current, habit]);
    }
    if (logs.length > 0) {
      const currentLogs = this.getLogs();
      const existingIds = new Set(currentLogs.map((l) => l.id));
      const toAdd = logs.filter((l) => !existingIds.has(l.id));
      if (toAdd.length > 0) {
        this.saveLogs([...currentLogs, ...toAdd]);
      }
    }
  },

  getLogs(): HabitExecution[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOGS);
      if (!stored) {
        const habits = this.getHabits();
        const initialLogs = generateSeedLogs(habits);
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(initialLogs));
        return initialLogs;
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  saveLogs(logs: HabitExecution[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    this.notify();
  },

  isCompleted(habitId: string, dateStr: string): boolean {
    const logs = this.getLogs();
    return logs.some((l) => l.habitId === habitId && l.date === dateStr);
  },

  getExecution(habitId: string, dateStr: string): HabitExecution | undefined {
    const logs = this.getLogs();
    return logs.find((l) => l.habitId === habitId && l.date === dateStr);
  },

  toggleCompletion(habitId: string, dateStr: string, note?: string): { completed: boolean; logId?: string; execution?: HabitExecution } {
    const logs = this.getLogs();
    const existingIndex = logs.findIndex((l) => l.habitId === habitId && l.date === dateStr);

    if (existingIndex >= 0) {
      // Remove
      const removed = logs.splice(existingIndex, 1)[0];
      this.saveLogs(logs);
      return { completed: false, logId: removed.id, execution: removed };
    } else {
      // Add
      const newLog: HabitExecution = {
        id: 'log-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        habitId,
        date: dateStr,
        completedAt: new Date().toISOString(),
        ...(note && note.trim() ? { note: note.trim() } : {}),
      };
      logs.push(newLog);
      this.saveLogs(logs);
      return { completed: true, logId: newLog.id, execution: newLog };
    }
  },

  updateExecutionNote(habitId: string, dateStr: string, note: string): { success: boolean; execution?: HabitExecution } {
    const logs = this.getLogs();
    const existingIndex = logs.findIndex((l) => l.habitId === habitId && l.date === dateStr);
    const trimmed = note.trim();

    if (existingIndex >= 0) {
      if (trimmed) {
        logs[existingIndex].note = trimmed;
      } else {
        delete logs[existingIndex].note;
      }
      this.saveLogs(logs);
      return { success: true, execution: logs[existingIndex] };
    } else if (trimmed) {
      // If not yet completed, completing it directly with this note
      const newLog: HabitExecution = {
        id: 'log-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        habitId,
        date: dateStr,
        completedAt: new Date().toISOString(),
        note: trimmed,
      };
      logs.push(newLog);
      this.saveLogs(logs);
      return { success: true, execution: newLog };
    }
    return { success: false };
  },

  getMonthlyTargets(): Record<string, number> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MONTHLY_TARGETS);
      if (!stored) {
        // Default seed: set an initial target of 85% for the current month so users immediately see it in action
        const currentYM = getCurrentYearMonth();
        const initial = { [currentYM]: 85 };
        localStorage.setItem(STORAGE_KEY_MONTHLY_TARGETS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored);
    } catch {
      return {};
    }
  },

  getMonthlyTarget(yearMonth: string = getCurrentYearMonth()): number | null {
    const targets = this.getMonthlyTargets();
    const val = targets[yearMonth];
    return typeof val === 'number' && val >= 1 && val <= 100 ? val : null;
  },

  setMonthlyTarget(yearMonth: string, target: number | null): void {
    if (typeof window === 'undefined') return;
    const targets = this.getMonthlyTargets();
    if (target === null || target === undefined || isNaN(target) || target <= 0) {
      delete targets[yearMonth];
    } else {
      targets[yearMonth] = Math.min(100, Math.max(1, Math.round(target)));
    }
    localStorage.setItem(STORAGE_KEY_MONTHLY_TARGETS, JSON.stringify(targets));
    this.notify();
  },

  getMonthlyConsistency(yearMonth: string = getCurrentYearMonth()): MonthlyConsistency {
    const habits = this.getHabits().filter((h) => !h.archived);
    const logs = this.getLogs();
    const days = getDaysInMonth(yearMonth);
    const today = getTodayDateString();

    const dailyMap: Record<string, { completedIds: string[]; total: number }> = {};
    let totalCompleted = 0;
    let daysWithAtLeastOne = 0;

    // Filter relevant days (up to current day if current month)
    const [curY, curM] = yearMonth.split('-').map(Number);
    const now = new Date();
    const isCurrentMonth = curY === now.getFullYear() && curM === now.getMonth() + 1;
    const currentDayNum = Number(today.split('-')[2]);

    // Weekday trackers: 1 = Mo, 2 = Di, 3 = Mi, 4 = Do, 5 = Fr, 6 = Sa, 0 = So
    const weekdayDayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const weekdayTotals = [0, 0, 0, 0, 0, 0, 0];
    const weekdayPossibles = [0, 0, 0, 0, 0, 0, 0];

    days.forEach((dayStr) => {
      const [y, m, d] = dayStr.split('-').map(Number);
      const dayDate = new Date(y, m - 1, d);
      const dayIndex = dayDate.getDay();
      const dayNum = Number(dayStr.split('-')[2]);
      const dayLogs = logs.filter((l) => l.date === dayStr && habits.some((h) => h.id === l.habitId));
      const completedIds = Array.from(new Set(dayLogs.map((l) => l.habitId)));

      dailyMap[dayStr] = {
        completedIds,
        total: habits.length,
      };

      // Only count days up to today if current month, or all days if past month
      if (!isCurrentMonth || dayNum <= currentDayNum) {
        totalCompleted += completedIds.length;
        if (completedIds.length > 0) {
          daysWithAtLeastOne++;
        }
        weekdayTotals[dayIndex] += completedIds.length;
        weekdayPossibles[dayIndex] += habits.length;
      }
    });

    // Formatted ordered Mo -> So (indices 1, 2, 3, 4, 5, 6, 0)
    const orderIndices = [1, 2, 3, 4, 5, 6, 0];
    let bestDayName = 'Dienstag';
    let bestDayPct = -1;

    const weekdayStats = orderIndices.map((idx) => {
      const comp = weekdayTotals[idx];
      const poss = Math.max(1, weekdayPossibles[idx]);
      const pct = Math.round((comp / poss) * 100);
      if (pct > bestDayPct && weekdayPossibles[idx] > 0) {
        bestDayPct = pct;
        bestDayName = weekdayDayNames[idx];
      }
      return {
        dayIndex: idx,
        dayName: weekdayDayNames[idx],
        completedCount: comp,
        possibleCount: poss,
        percentage: pct,
      };
    });

    const elapsedDays = isCurrentMonth ? currentDayNum : days.length;
    const totalPossible = Math.max(1, elapsedDays * habits.length);
    const score = Math.round((totalCompleted / totalPossible) * 100);
    const consistencyScore = Math.min(100, Math.max(0, score));
    const monthlyTarget = this.getMonthlyTarget(yearMonth);
    const isTargetAchieved = monthlyTarget !== null ? consistencyScore >= monthlyTarget : false;

    return {
      yearMonth,
      daysInMonth: days.length,
      activeDaysCount: daysWithAtLeastOne,
      totalCompletedExecutions: totalCompleted,
      totalPossibleExecutions: totalPossible,
      consistencyScore,
      monthlyTarget,
      isTargetAchieved,
      dailyMap,
      weekdayStats,
      bestWeekday: `${bestDayName} (${Math.max(0, bestDayPct)}%)`,
    };
  },

  updateHabit(id: string, updates: Partial<Omit<MicroHabit, 'id' | 'createdAt'>>): void {
    const current = this.getHabits();
    const updated = current.map((h) => (h.id === id ? { ...h, ...updates } : h));
    this.saveHabits(updated);
  },

  toggleArchiveHabit(id: string): void {
    const current = this.getHabits();
    const updated = current.map((h) => (h.id === id ? { ...h, archived: !h.archived } : h));
    this.saveHabits(updated);
  },

  reorderHabit(id: string, direction: 'up' | 'down'): void {
    const current = [...this.getHabits()];
    const index = current.findIndex((h) => h.id === id);
    if (index < 0) return;

    if (direction === 'up' && index > 0) {
      const temp = current[index];
      current[index] = current[index - 1];
      current[index - 1] = temp;
    } else if (direction === 'down' && index < current.length - 1) {
      const temp = current[index];
      current[index] = current[index + 1];
      current[index + 1] = temp;
    }

    // Refresh orderIndex
    current.forEach((h, idx) => {
      h.orderIndex = idx;
    });

    this.saveHabits(current);
  },

  getWeeklyVictoryStatus(endDateString: string = getTodayDateString()): WeeklyVictoryStatus {
    const habits = this.getHabits().filter((h) => !h.archived);
    const logs = this.getLogs();
    const rollingDays = getRollingWeekDays(endDateString);
    const weekdayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

    const evaluateDays = (daysList: string[]) => {
      let qualifyingCount = 0;
      let totalPct = 0;
      const dayItems: WeeklyVictoryDay[] = [];

      daysList.forEach((dayStr) => {
        const [y, m, d] = dayStr.split('-').map(Number);
        const dayDate = new Date(y, m - 1, d);
        const weekdayName = weekdayNames[dayDate.getDay()];
        const dayLogs = logs.filter((l) => l.date === dayStr && habits.some((h) => h.id === l.habitId));
        const completedIds = Array.from(new Set(dayLogs.map((l) => l.habitId)));
        const completedCount = completedIds.length;
        const total = habits.length;
        const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        const passed = total > 0 && percentage >= 80;

        if (passed) {
          qualifyingCount++;
        }
        totalPct += percentage;

        dayItems.push({
          date: dayStr,
          weekdayName,
          completedCount,
          totalHabits: total,
          percentage,
          passed,
        });
      });

      return {
        qualifyingCount,
        averagePercentage: daysList.length > 0 ? Math.round(totalPct / daysList.length) : 0,
        dayItems,
      };
    };

    const currentEval = evaluateDays(rollingDays);
    const isCurrentVictory = currentEval.qualifyingCount === 7 && habits.length > 0;

    let isVictory = isCurrentVictory;
    let chosenDays = currentEval.dayItems;
    let chosenQualifying = currentEval.qualifyingCount;
    let chosenAvg = currentEval.averagePercentage;
    let startDay = rollingDays[0];
    let endDay = rollingDays[rollingDays.length - 1];

    if (!isVictory) {
      // Fallback check: Did the 7-day period ending yesterday qualify?
      const [y, m, d] = endDateString.split('-').map(Number);
      const yesterday = new Date(y, m - 1, d);
      yesterday.setDate(yesterday.getDate() - 1);
      const prevDateStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      const prevRolling = getRollingWeekDays(prevDateStr);
      const prevEval = evaluateDays(prevRolling);
      if (prevEval.qualifyingCount === 7 && habits.length > 0) {
        isVictory = true;
        chosenDays = prevEval.dayItems;
        chosenQualifying = prevEval.qualifyingCount;
        chosenAvg = prevEval.averagePercentage;
        startDay = prevRolling[0];
        endDay = prevRolling[prevRolling.length - 1];
      }
    }

    return {
      isVictory,
      qualifyingDaysCount: chosenQualifying,
      totalDays: 7,
      startDate: startDay,
      endDate: endDay,
      dateRangeLabel: formatRangeGerman(startDay, endDay),
      days: chosenDays,
      averagePercentage: chosenAvg,
    };
  },

  seedVictoryWeek(endDateString: string = getTodayDateString()): void {
    const habits = this.getHabits().filter((h) => !h.archived);
    const rollingDays = getRollingWeekDays(endDateString);
    const currentLogs = this.getLogs();

    // Remove existing logs for these 7 days to avoid duplicates
    const filteredLogs = currentLogs.filter((l) => !rollingDays.includes(l.date));

    // Add 100% completions for all active habits across these 7 days
    rollingDays.forEach((dayStr) => {
      habits.forEach((habit) => {
        filteredLogs.push({
          id: `victory-${dayStr}-${habit.id}`,
          habitId: habit.id,
          date: dayStr,
          completedAt: new Date().toISOString(),
        });
      });
    });

    this.saveLogs(filteredLogs);
  },

  resetToDefaults(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY_HABITS);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    localStorage.removeItem(STORAGE_KEY_MONTHLY_TARGETS);
    const currentYM = getCurrentYearMonth();
    localStorage.setItem(STORAGE_KEY_MONTHLY_TARGETS, JSON.stringify({ [currentYM]: 85 }));
    this.saveHabits(DEFAULT_HABITS);
    this.saveLogs(generateSeedLogs(DEFAULT_HABITS));
  },
};
