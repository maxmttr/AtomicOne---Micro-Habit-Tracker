/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { MicroHabit, HabitExecution, MonthlyConsistency, WeeklyVictoryStatus, AiHabitSuggestion, TimeWindow, TIME_WINDOW_META } from './types/habit';
import { habitStorage, sortHabitsByTimeWindow } from './services/habitStorage';
import { soundManager } from './utils/audio';
import { Haptics } from './utils/haptics';
import { getTodayDateString, getCurrentYearMonth, formatDateGerman, formatShortDate } from './utils/date';

import { HabitCard } from './components/HabitCard';
import { MonthlyScoreCard } from './components/MonthlyScoreCard';
import { WeeklyVictoryCard } from './components/WeeklyVictoryCard';
import { AiHabitSuggestionCard } from './components/AiHabitSuggestionCard';
import { AddHabitModal } from './components/AddHabitModal';
import { EditHabitModal } from './components/EditHabitModal';
import { DeleteHabitModal } from './components/DeleteHabitModal';
import { ExecutionNoteModal } from './components/ExecutionNoteModal';
import { SettingsPage } from './components/SettingsPage';
import { WidgetSimulator } from './components/WidgetSimulator';
import { UndoToast } from './components/UndoToast';

import {
  Plus,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Calendar,
  Layers,
  RefreshCcw,
  Sun,
  Moon,
  Keyboard,
  Sliders,
  CheckCircle2,
  TrendingUp,
  X,
  ArrowRight,
  ArrowUpDown,
  SunMedium,
} from 'lucide-react';

export default function App() {
  const [habits, setHabits] = useState<MicroHabit[]>([]);
  const [logs, setLogs] = useState<HabitExecution[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeYearMonth, setActiveYearMonth] = useState<string>(getCurrentYearMonth());
  const [activeTab, setActiveTab] = useState<'today' | 'monthly' | 'rhythm' | 'settings'>('today');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [timeWindowFilter, setTimeWindowFilter] = useState<'all' | TimeWindow>('all');
  const [sortByDaytime, setSortByDaytime] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialValues, setAddModalInitialValues] = useState<{ title?: string; cue?: string; timeEstimate?: string; color?: string; timeWindow?: TimeWindow } | null>(null);
  const [editingHabit, setEditingHabit] = useState<MicroHabit | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [undoState, setUndoState] = useState<{
    message: string;
    type: 'toggle' | 'delete';
    habitId?: string;
    date?: string;
    deletedHabit?: MicroHabit;
    deletedLogs?: HabitExecution[];
  } | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<MicroHabit | null>(null);
  const [noteModalHabit, setNoteModalHabit] = useState<MicroHabit | null>(null);
  const [noteModalInitialNote, setNoteModalInitialNote] = useState<string>('');
  const [victoryDismissed, setVictoryDismissed] = useState(false);

  // Dark mode state with persistence
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('atomic_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('atomic_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('atomic_theme', 'light');
    }
  }, [isDark]);

  // Sync data from reactive storage
  const reloadData = useCallback(() => {
    setHabits(habitStorage.getHabits());
    setLogs(habitStorage.getLogs());
  }, []);

  useEffect(() => {
    reloadData();
    return habitStorage.subscribe(reloadData);
  }, [reloadData]);

  const today = getTodayDateString();
  const activeHabits = habits.filter((h) => !h.archived);

  // Completed IDs for the selected date
  const completedIdsForSelectedDate = logs
    .filter((l) => l.date === selectedDate)
    .map((l) => l.habitId);

  // Order active habits according to sort preference (Tagesverlauf vs. Manuell)
  const orderedActiveHabits = sortByDaytime ? sortHabitsByTimeWindow(activeHabits) : activeHabits;

  // Filtered habits for Today list
  const displayedHabits = orderedActiveHabits.filter((h) => {
    const isDone = completedIdsForSelectedDate.includes(h.id);
    if (filterMode === 'pending' && isDone) return false;
    if (filterMode === 'completed' && !isDone) return false;
    if (timeWindowFilter !== 'all' && (h.timeWindow || 'anytime') !== timeWindowFilter) return false;
    return true;
  });

  // Time window counts
  const morningCount = activeHabits.filter((h) => (h.timeWindow || 'anytime') === 'morning').length;
  const middayCount = activeHabits.filter((h) => (h.timeWindow || 'anytime') === 'midday').length;
  const eveningCount = activeHabits.filter((h) => (h.timeWindow || 'anytime') === 'evening').length;
  const anytimeCount = activeHabits.filter((h) => (h.timeWindow || 'anytime') === 'anytime').length;

  // Consistency for active month
  const consistency: MonthlyConsistency = habitStorage.getMonthlyConsistency(activeYearMonth);

  // Weekly Victory status: checks if every single day in the 7-day period is >= 80%
  const weeklyVictory: WeeklyVictoryStatus = habitStorage.getWeeklyVictoryStatus(selectedDate);

  // Celebratory Victory Confetti Animation (Multi-stage burst)
  const fireVictoryConfetti = useCallback(() => {
    soundManager.playCelebrationChime();
    // Left Cannon
    confetti({
      particleCount: 90,
      angle: 60,
      spread: 60,
      origin: { x: 0.1, y: 0.65 },
      colors: ['#D8F22A', '#141414', '#FF5C00', '#3B82F6', '#10B981'],
    });
    // Right Cannon
    confetti({
      particleCount: 90,
      angle: 120,
      spread: 60,
      origin: { x: 0.9, y: 0.65 },
      colors: ['#D8F22A', '#141414', '#FF5C00', '#3B82F6', '#10B981'],
    });
    // Center Firework
    setTimeout(() => {
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { x: 0.5, y: 0.45 },
        colors: ['#D8F22A', '#FF5C00', '#FFFFFF', '#3B82F6'],
      });
    }, 220);
  }, []);

  // Toggle Habit execution with Expo Haptics physical feedback and Victory detection
  const handleToggleHabit = useCallback(async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    const prevVictory = habitStorage.getWeeklyVictoryStatus(selectedDate);
    const { completed } = habitStorage.toggleCompletion(habitId, selectedDate);
    const newVictory = habitStorage.getWeeklyVictoryStatus(selectedDate);

    if (completed && habit) {
      // Physical haptic vibration
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setUndoState({
        message: `„${habit.title}“ erledigt!`,
        type: 'toggle',
        habitId,
        date: selectedDate,
      });

      // Check if this completion unlocked a Weekly Victory!
      if (!prevVictory.isVictory && newVictory.isVictory) {
        setVictoryDismissed(false);
        fireVictoryConfetti();
      } else {
        // Daily completion check
        const updatedLogs = habitStorage.getLogs().filter((l) => l.date === selectedDate);
        if (updatedLogs.length === activeHabits.length && activeHabits.length > 0) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          soundManager.playCelebrationChime();
          confetti({
            particleCount: 75,
            spread: 65,
            origin: { y: 0.65 },
            colors: ['#D8F22A', '#141414', '#FF5C00', '#3B82F6'],
          });
        }
      }
    } else if (habit) {
      // Light haptic pulse on untoggle/reset
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setUndoState({
        message: `„${habit.title}“ zurückgesetzt`,
        type: 'toggle',
        habitId,
        date: selectedDate,
      });
    }
  }, [habits, selectedDate, activeHabits.length, fireVictoryConfetti]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Numbers 1 to 9 to toggle habits
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= activeHabits.length) {
        e.preventDefault();
        const targetHabit = activeHabits[num - 1];
        if (targetHabit) {
          handleToggleHabit(targetHabit.id);
        }
        return;
      }

      // 'n' for New Habit
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setAddModalInitialValues(null);
        setIsAddModalOpen(true);
        return;
      }

      // 't' for Today
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setSelectedDate(today);
        setActiveTab('today');
        return;
      }

      // 'd' for Dark mode toggle
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setIsDark((prev) => !prev);
        soundManager.playTactileClick();
        return;
      }

      // '?' for Shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHabits, handleToggleHabit, today]);

  const handleUndo = async () => {
    if (!undoState) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    soundManager.playUndoClick();
    if (undoState.type === 'delete' && undoState.deletedHabit) {
      habitStorage.restoreHabit(undoState.deletedHabit, undoState.deletedLogs);
    } else if (undoState.habitId && undoState.date) {
      habitStorage.toggleCompletion(undoState.habitId, undoState.date);
    }
    setUndoState(null);
  };

  const handleRequestDeleteHabit = (habit: MicroHabit) => {
    soundManager.playTactileClick();
    setHabitToDelete(habit);
  };

  const handleConfirmDeleteHabit = async (habit: MicroHabit) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    soundManager.playUndoClick();
    const result = habitStorage.deleteHabit(habit.id);
    setHabitToDelete(null);
    if (editingHabit?.id === habit.id) {
      setEditingHabit(null);
    }
    if (result.habit) {
      setUndoState({
        message: `„${result.habit.title}“ gelöscht`,
        type: 'delete',
        deletedHabit: result.habit,
        deletedLogs: result.logs,
      });
    }
  };

  const handleOpenNoteModal = (habit: MicroHabit) => {
    soundManager.playTactileClick();
    const execution = logs.find((l) => l.habitId === habit.id && l.date === selectedDate);
    setNoteModalInitialNote(execution?.note || '');
    setNoteModalHabit(habit);
  };

  const handleSaveExecutionNote = (noteText: string) => {
    if (!noteModalHabit) return;
    const result = habitStorage.updateExecutionNote(noteModalHabit.id, selectedDate, noteText);
    if (result.success) {
      soundManager.playTactileClick();
    }
    setNoteModalHabit(null);
  };

  const handleDeleteExecutionNote = () => {
    if (!noteModalHabit) return;
    habitStorage.updateExecutionNote(noteModalHabit.id, selectedDate, '');
    setNoteModalHabit(null);
  };

  const handleAddHabit = (newHabitData: Omit<MicroHabit, 'id' | 'createdAt' | 'orderIndex' | 'archived'>) => {
    habitStorage.addHabit(newHabitData);
  };

  const handleApplyAiSuggestion = async (suggestion: AiHabitSuggestion) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    soundManager.playCelebrationChime();
    handleAddHabit({
      title: suggestion.title,
      cue: suggestion.cue,
      timeEstimate: suggestion.timeEstimate,
      color: suggestion.color || '#D8F22A',
      icon: suggestion.icon || 'Sparkles',
      timeWindow: suggestion.timeWindow || 'anytime',
    });
    setUndoState({
      message: `KI-Habit „${suggestion.title}“ hinzugefügt!`,
      type: 'toggle',
      habitId: '',
      date: selectedDate,
    });
  };

  const handleCustomizeAiSuggestion = (suggestion: AiHabitSuggestion) => {
    setAddModalInitialValues({
      title: suggestion.title,
      cue: suggestion.cue,
      timeEstimate: suggestion.timeEstimate,
      color: suggestion.color || '#D8F22A',
      timeWindow: suggestion.timeWindow || 'anytime',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = (id: string, updates: Partial<MicroHabit>) => {
    habitStorage.updateHabit(id, updates);
  };

  const handleMoveUp = (id: string) => {
    habitStorage.reorderHabit(id, 'up');
  };

  const handleMoveDown = (id: string) => {
    habitStorage.reorderHabit(id, 'down');
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleTheme = () => {
    soundManager.playTactileClick();
    setIsDark((prev) => !prev);
  };

  const handleResetDefaults = () => {
    habitStorage.resetToDefaults();
  };

  const handlePrevMonth = () => {
    const [year, month] = activeYearMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevY = prevDate.getFullYear();
    const prevM = String(prevDate.getMonth() + 1).padStart(2, '0');
    setActiveYearMonth(`${prevY}-${prevM}`);
  };

  const handleNextMonth = () => {
    const [year, month] = activeYearMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextY = nextDate.getFullYear();
    const nextM = String(nextDate.getMonth() + 1).padStart(2, '0');
    setActiveYearMonth(`${nextY}-${nextM}`);
  };

  const todayCompletedCount = completedIdsForSelectedDate.length;
  const isAllTodayDone = activeHabits.length > 0 && todayCompletedCount === activeHabits.length;

  return (
    <div className="min-h-screen bg-[#F6F6F3] dark:bg-[#101012] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
      {/* 
        Top Bar Contract:
        [Brand title, one line] — [4–5 nav links, 1–2 word labels, single-line] — [1 primary action]
      */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5] dark:bg-zinc-900 border-b-2 border-zinc-900 dark:border-zinc-700 px-3 sm:px-8 py-2.5 sm:py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-8">
          {/* Top Row on Mobile: Brand on Left, Quick Actions on Right */}
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
              <div className="w-4 h-4 bg-[#D8F22A] border-2 border-zinc-900 dark:border-zinc-600 shadow-[1px_1px_0px_#141414] dark:shadow-[1px_1px_0px_#27272a]" />
              <span className="text-base sm:text-lg font-black tracking-tighter text-zinc-900 dark:text-zinc-100">
                ATOMIC/ONE
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono-numbers text-zinc-500 dark:text-zinc-400 font-bold ml-1">
                WEB-APP
              </span>
            </div>

            {/* Mobile Actions Bar (Visible only on < md screens) */}
            <div className="flex items-center gap-1.5 md:hidden shrink-0">
              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={handleToggleTheme}
                title={isDark ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
                className="w-7 h-7 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-[1.5px_1.5px_0px_#141414] dark:shadow-[1.5px_1.5px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                aria-label="Design-Modus umschalten"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-[#D8F22A]" /> : <Moon className="w-3.5 h-3.5 text-zinc-900" />}
              </button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={handleToggleMute}
                title={isMuted ? 'Ton aktivieren' : 'Ton stummschalten'}
                className="w-7 h-7 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-[1.5px_1.5px_0px_#141414] dark:shadow-[1.5px_1.5px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                aria-label="Sound umschalten"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> : <Volume2 className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
              </button>

              {/* Primary Action Button (+ Neu) */}
              <button
                type="button"
                onClick={() => {
                  setAddModalInitialValues(null);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#D8F22A] text-zinc-950 font-black text-xs border-2 border-zinc-900 dark:border-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ml-0.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Neu</span>
              </button>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Row 2 on Mobile, Inline on Desktop) */}
          <nav className="flex items-center justify-between md:justify-start gap-1 sm:gap-4 md:gap-7 text-xs font-bold font-mono-numbers border-t border-zinc-200 dark:border-zinc-800 md:border-t-0 pt-1.5 md:pt-0 overflow-x-auto scrollbar-none w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 px-1.5 sm:px-0 ${
                activeTab === 'today'
                  ? 'text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-[#D8F22A] font-extrabold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Heute
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 px-1.5 sm:px-0 ${
                activeTab === 'monthly'
                  ? 'text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-[#D8F22A] font-extrabold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">Monats-Matrix</span>
              <span className="sm:hidden">Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rhythm')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 px-1.5 sm:px-0 flex items-center gap-1 ${
                activeTab === 'rhythm'
                  ? 'text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-[#D8F22A] font-extrabold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wochen-Rhythmus</span>
              <span className="sm:hidden">Rhythmus</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 px-1.5 sm:px-0 flex items-center gap-1 ${
                activeTab === 'settings'
                  ? 'text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-[#D8F22A] font-extrabold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Einstellungen</span>
              <span className="sm:hidden">Optionen</span>
            </button>
          </nav>

          {/* Zone 3: Controls + primary action (Desktop only) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Keyboard Shortcuts Hint */}
            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              title="Tastenkombinationen anzeigen (?)"
              className="w-8 h-8 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              aria-label="Tastenkürzel"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={handleToggleTheme}
              title={isDark ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
              className="w-8 h-8 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              aria-label="Design-Modus umschalten"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-[#D8F22A]" /> : <Moon className="w-3.5 h-3.5 text-zinc-900" />}
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              title={isMuted ? 'Ton aktivieren' : 'Ton stummschalten'}
              className="w-8 h-8 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              aria-label="Sound umschalten"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> : <Volume2 className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => {
                setAddModalInitialValues(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D8F22A] text-zinc-950 font-bold text-xs border-2 border-zinc-900 dark:border-zinc-700 shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a] hover:bg-lime-300 active:translate-x-[1px] active:translate-y-[1px] whitespace-nowrap cursor-pointer ml-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Neuer Habit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Web App Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {/* Sub-Header Banner with Quick Day Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-5 mb-5 sm:mb-6 border-b-2 border-zinc-300 dark:border-zinc-800 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-500 dark:text-zinc-400 font-bold mb-1">
              <span>{formatDateGerman(selectedDate)}</span>
              {selectedDate === today && (
                <span className="bg-[#141414] dark:bg-[#D8F22A] text-[#D8F22A] dark:text-zinc-950 px-1.5 py-0.5 text-[10px] font-bold">
                  HEUTE
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {activeTab === 'today' && 'Tägliche Micro-Ziele'}
              {activeTab === 'monthly' && 'Monatliche Konsistenz-Matrix'}
              {activeTab === 'rhythm' && 'Wochen-Rhythmus Analyse'}
              {activeTab === 'settings' && 'App-Einstellungen & Daten'}
            </h1>
          </div>

          {/* Quick Date Shortcuts & Consistency Score Quick-Tab */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Victory Badge if achieved */}
            {weeklyVictory.isVictory && (
              <button
                type="button"
                onClick={() => {
                  setVictoryDismissed(false);
                  fireVictoryConfetti();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-zinc-900 dark:border-zinc-700 bg-[#D8F22A] text-zinc-950 font-mono-numbers text-xs font-bold shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] hover:bg-lime-300 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                title="Wöchentliche Victory anzeigen und feiern"
              >
                <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Victory aktiv! 🏆</span>
                <span className="sm:hidden">🏆 7 Tage</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className={`px-3 py-1.5 border-2 border-zinc-900 dark:border-zinc-700 text-xs font-mono-numbers font-bold transition-all cursor-pointer ${
                selectedDate === today
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-[2px_2px_0px_#737373] dark:shadow-[2px_2px_0px_#27272a]'
                  : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]'
              }`}
            >
              Heute ({formatShortDate(today)})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-mono-numbers font-bold text-zinc-900 dark:text-zinc-100 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{consistency.consistencyScore}% Score</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Today Web Dashboard View */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Wöchentliche Victory Nachricht & Feier-Banner */}
            {weeklyVictory.isVictory && !victoryDismissed && (
              <WeeklyVictoryCard
                victory={weeklyVictory}
                onFireConfetti={fireVictoryConfetti}
                onDismiss={() => setVictoryDismissed(true)}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Habits Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Daily Progress Kicker & Filter Controls */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-mono-numbers uppercase text-zinc-500 dark:text-zinc-400 font-bold block">
                      Tagesfortschritt
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black font-mono-numbers text-zinc-900 dark:text-zinc-100">
                        {todayCompletedCount} / {activeHabits.length}
                      </span>
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        {isAllTodayDone ? 'Alle Micro-Aktionen erfüllt!' : 'Aktionen erledigt'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-28 sm:w-36">
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 overflow-hidden">
                      <div
                        className="h-full bg-[#141414] dark:bg-[#D8F22A] transition-all duration-300"
                        style={{
                          width: `${activeHabits.length > 0 ? (todayCompletedCount / activeHabits.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono-numbers text-zinc-500 dark:text-zinc-400 text-right block mt-1">
                      {activeHabits.length > 0
                        ? Math.round((todayCompletedCount / activeHabits.length) * 100)
                        : 0}
                      % abgeschlossen
                    </span>
                  </div>
                </div>

                {/* Filter & Sort Controls */}
                <div className="space-y-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono-numbers">
                  {/* Row 1: Status Filters & Daytime Sort Toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFilterMode('all')}
                        className={`px-2.5 py-1 border border-zinc-900 dark:border-zinc-700 font-bold transition-colors cursor-pointer ${
                          filterMode === 'all'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        Alle ({activeHabits.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode('pending')}
                        className={`px-2.5 py-1 border border-zinc-900 dark:border-zinc-700 font-bold transition-colors cursor-pointer ${
                          filterMode === 'pending'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        Offen ({activeHabits.length - todayCompletedCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode('completed')}
                        className={`px-2.5 py-1 border border-zinc-900 dark:border-zinc-700 font-bold transition-colors cursor-pointer ${
                          filterMode === 'completed'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        Erledigt ({todayCompletedCount})
                      </button>
                    </div>

                    {/* Daytime Sort Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playTactileClick();
                        setSortByDaytime((prev) => !prev);
                      }}
                      title={sortByDaytime ? 'Sortierung: Nach Tagesverlauf (Morgens ➔ Abends)' : 'Sortierung: Manuelle Anordnung'}
                      className={`flex items-center gap-1.5 px-2.5 py-1 border border-zinc-900 dark:border-zinc-700 font-bold transition-all cursor-pointer ${
                        sortByDaytime
                          ? 'bg-[#D8F22A] text-zinc-950 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-[1px_1px_0px_#141414]'
                      }`}
                    >
                      <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
                      <span>{sortByDaytime ? 'Tagesverlauf 🌅➔🌙' : 'Manuell ↕️'}</span>
                    </button>
                  </div>

                  {/* Row 2: Zeitfenster Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 mr-1">
                      Zeitfenster:
                    </span>
                    <button
                      type="button"
                      onClick={() => setTimeWindowFilter('all')}
                      className={`px-2 py-0.5 border text-[11px] font-bold transition-colors cursor-pointer ${
                        timeWindowFilter === 'all'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      Alle Zeiten
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeWindowFilter('morning')}
                      className={`px-2 py-0.5 border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        timeWindowFilter === 'morning'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>🌅</span>
                      <span>Morgens ({morningCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeWindowFilter('midday')}
                      className={`px-2 py-0.5 border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        timeWindowFilter === 'midday'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>☀️</span>
                      <span>Mittags ({middayCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeWindowFilter('evening')}
                      className={`px-2 py-0.5 border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        timeWindowFilter === 'evening'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>🌙</span>
                      <span>Abends ({eveningCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeWindowFilter('anytime')}
                      className={`px-2 py-0.5 border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        timeWindowFilter === 'anytime'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>⚡</span>
                      <span>Flexibel ({anytimeCount})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Habit Cards */}
              <div className="space-y-3">
                {displayedHabits.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-8 text-center shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a]">
                    <Sparkles className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mx-auto mb-2" />
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                      {filterMode === 'pending'
                        ? 'Alle Micro-Ziele für diese Auswahl erledigt!'
                        : timeWindowFilter !== 'all'
                        ? `Keine Habits im Zeitfenster „${TIME_WINDOW_META[timeWindowFilter].label}“`
                        : 'Keine Habits gefunden'}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
                      {filterMode === 'pending'
                        ? 'Großartige Arbeit! Schau dir deine monatliche Konsistenz-Matrix an.'
                        : timeWindowFilter !== 'all'
                        ? 'Lege einen neuen Habit für diese Tageszeit an oder wechsle zu „Alle Zeiten“.'
                        : 'Erstelle jetzt deinen ersten 1-Minuten Micro-Habit.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAddModalInitialValues({
                          timeWindow: timeWindowFilter !== 'all' ? timeWindowFilter : 'morning',
                        });
                        setIsAddModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#D8F22A] text-zinc-950 border-2 border-zinc-900 dark:border-zinc-700 font-bold text-xs shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] cursor-pointer"
                    >
                      + Habit anlegen
                    </button>
                  </div>
                ) : (
                  displayedHabits.map((habit, idx) => {
                    const currentWindow = habit.timeWindow || 'anytime';
                    const prevWindow = idx > 0 ? (displayedHabits[idx - 1].timeWindow || 'anytime') : null;
                    const isNewWindow = sortByDaytime && timeWindowFilter === 'all' && currentWindow !== prevWindow;
                    const meta = TIME_WINDOW_META[currentWindow];

                    return (
                      <React.Fragment key={habit.id}>
                        {isNewWindow && (
                          <div className={`flex items-center gap-2 ${idx > 0 ? 'pt-3' : 'pt-1'} pb-0.5`}>
                            <span className="text-[11px] font-mono-numbers font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 bg-zinc-200 dark:bg-zinc-800 border border-zinc-900 dark:border-zinc-700 px-2 py-0.5 shadow-xs">
                              <span>{meta.emoji}</span>
                              <span>{meta.label}</span>
                            </span>
                            <span className="text-[10px] font-mono-numbers text-zinc-500 dark:text-zinc-400">
                              {meta.description}
                            </span>
                            <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-800" />
                          </div>
                        )}
                        <HabitCard
                          habit={habit}
                          index={idx}
                          isCompleted={completedIdsForSelectedDate.includes(habit.id)}
                          note={logs.find((l) => l.habitId === habit.id && l.date === selectedDate)?.note}
                          onToggle={handleToggleHabit}
                          onEdit={(h) => setEditingHabit(h)}
                          onDelete={handleRequestDeleteHabit}
                          onOpenNote={handleOpenNoteModal}
                          onMoveUp={(id) => {
                            if (sortByDaytime) setSortByDaytime(false);
                            handleMoveUp(id);
                          }}
                          onMoveDown={(id) => {
                            if (sortByDaytime) setSortByDaytime(false);
                            handleMoveDown(id);
                          }}
                          canMoveUp={idx > 0}
                          canMoveDown={idx < displayedHabits.length - 1}
                        />
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              {/* Web Helper Footnote */}
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/80 border-2 border-zinc-900 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
                <span>1-Tap Logging mit physischer Haptik & mechanischem Klick.</span>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline flex items-center gap-1 text-[11px] font-mono-numbers cursor-pointer"
                >
                  <RefreshCcw className="w-3 h-3" />
                  Demodaten Reset
                </button>
              </div>
            </div>

            {/* Sidebar Column: AI Habit Discover & Compact Monthly Matrix (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* KI-Entdecken Bereich: 1-Klick Micro-Habit Empfehlung */}
              <AiHabitSuggestionCard
                currentHabits={habits}
                onAddHabit={handleApplyAiSuggestion}
                onCustomizeHabit={handleCustomizeAiSuggestion}
                onHapticFeedback={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  soundManager.playTactileClick();
                }}
              />

              <MonthlyScoreCard
                consistency={consistency}
                habits={habits}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                showWeekdayInsights={true}
                onTriggerCelebration={fireVictoryConfetti}
                onUpdateTarget={(target) => habitStorage.setMonthlyTarget(activeYearMonth, target)}
              />

              {/* Quick Philosophy Card */}
              <div className="bg-[#FAF9F5] dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono-numbers font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Micro-Habit Kernregel
                  </span>
                  <span className="text-[10px] bg-[#D8F22A] text-zinc-950 font-mono-numbers font-bold px-1.5 py-0.5 border border-zinc-900 dark:border-zinc-700">
                    James Clear
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 mb-1">
                  Mach es so klein, dass du nicht ablehnen kannst
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                  1 Seite lesen schlägt 0 Seiten. 1 Minute dehnen schlägt 0 Minuten. Konstanz schlägt Intensität auf lange Sicht.
                </p>
                <div className="flex items-center justify-between text-xs font-mono-numbers text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span>Kein Druck · Volle Resilienz</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rhythm')}
                    className="text-zinc-900 dark:text-zinc-100 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Wochen-Analyse <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Monthly Consistency Grid */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            <MonthlyScoreCard
              consistency={consistency}
              habits={habits}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              showWeekdayInsights={true}
              onTriggerCelebration={fireVictoryConfetti}
              onUpdateTarget={(target) => habitStorage.setMonthlyTarget(activeYearMonth, target)}
            />

            {/* In-Depth Philosophy Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-4 shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a]">
                <span className="text-[11px] font-mono-numbers font-bold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                  01. Kumulativ statt Linear
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                  Ausfall-Resilienz
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Herkömmliche Tracker setzen bei einem Ausfall den Streak auf 0. Das demotiviert Nutzer messbar. Unsere monatliche Konsistenz belohnt jeden einzelnen Tag kumulativ.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-4 shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a]">
                <span className="text-[11px] font-mono-numbers font-bold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                  02. 60-Sekunden Regel
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                  Micro-Trigger Hürde
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  „1 Seite lesen“ oder „1 Minute dehnen“ ist so winzig, dass das Gehirn keine Ausrede findet. Die Ausführung wird zur unbewussten Routine.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-4 shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a]">
                <span className="text-[11px] font-mono-numbers font-bold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                  03. Kontext-Anker
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                  Gewohnheits-Kopplung
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Jeder Habit besitzt einen festen physischen Trigger (z. B. „Nach dem Kaffeekochen“), wodurch Zeitplanung obsolet wird.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Weekday Rhythm Analysis */}
        {activeTab === 'rhythm' && (
          <div className="space-y-6">
            {weeklyVictory.isVictory && (
              <WeeklyVictoryCard
                victory={weeklyVictory}
                onFireConfetti={fireVictoryConfetti}
              />
            )}

            <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a]">
              <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block mb-1">
                Wochen-Verhaltensmuster
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                Konsistenz nach Wochentagen
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
                Erkenne Muster in deinem Alltag: An welchen Wochentagen fallen dir Micro-Habits leicht, und an welchen Tagen brauchst du sanftere Trigger?
              </p>

              {/* Big Weekday Pillar Visualization */}
              <div className="grid grid-cols-7 gap-3 mb-6">
                {consistency.weekdayStats.map((w) => (
                  <div
                    key={w.dayIndex}
                    className="bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 p-3 flex flex-col items-center justify-between text-center"
                  >
                    <span className="text-sm font-mono-numbers font-bold text-zinc-900 dark:text-zinc-100">
                      {w.dayName}
                    </span>

                    <div className="w-full h-32 bg-zinc-200 dark:bg-zinc-700 my-3 border border-zinc-900 dark:border-zinc-600 flex items-end overflow-hidden">
                      <div
                        className={`w-full transition-all duration-300 ${
                          w.percentage >= 80
                            ? 'bg-[#D8F22A]'
                            : w.percentage >= 50
                            ? 'bg-amber-300 dark:bg-amber-500'
                            : 'bg-zinc-400 dark:bg-zinc-500'
                        }`}
                        style={{ height: `${Math.max(10, w.percentage)}%` }}
                      />
                    </div>

                    <span className="text-sm font-mono-numbers font-black text-zinc-900 dark:text-zinc-100">
                      {w.percentage}%
                    </span>
                    <span className="text-[10px] font-mono-numbers text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {w.completedCount} Logs
                    </span>
                  </div>
                ))}
              </div>

              {/* Insight summary */}
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800/80 border-2 border-zinc-900 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                    Dein Spitzenreiter-Tag: {consistency.bestWeekday}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-300">
                    An diesem Tag ist deine Hürde für Micro-Aktionen am geringsten. Nutze dieses Momentum!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('today')}
                  className="px-3.5 py-1.5 bg-[#D8F22A] text-zinc-950 font-bold border-2 border-zinc-900 dark:border-zinc-700 whitespace-nowrap shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] cursor-pointer"
                >
                  Zu den heutigen Habits
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Web Settings & Data Management */}
        {activeTab === 'settings' && (
          <SettingsPage
            isDark={isDark}
            onToggleDark={handleToggleTheme}
            onResetData={handleResetDefaults}
            habitCount={activeHabits.length}
            logCount={logs.length}
            habits={activeHabits}
            onDeleteHabit={handleRequestDeleteHabit}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-zinc-900 dark:border-zinc-700 bg-[#FAF9F5] dark:bg-zinc-900 py-4 px-6 text-xs text-zinc-600 dark:text-zinc-400 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-numbers">
          <span>ATOMIC/ONE · Minimalistischer Micro-Habit Web-Tracker</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Offline-First</span>
            <span aria-hidden="true">·</span>
            <span>Web Audio Synthesizer</span>
            <span aria-hidden="true">·</span>
            <span>Neo-Brutalism</span>
          </div>
        </div>
      </footer>

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalInitialValues(null);
        }}
        onAdd={handleAddHabit}
        initialValues={addModalInitialValues}
      />

      {/* Edit Habit Modal */}
      <EditHabitModal
        habit={editingHabit}
        isOpen={editingHabit !== null}
        onClose={() => setEditingHabit(null)}
        onSave={handleSaveEdit}
        onDelete={handleRequestDeleteHabit}
      />

      {/* Delete Habit Confirmation Modal */}
      <DeleteHabitModal
        habit={habitToDelete}
        isOpen={habitToDelete !== null}
        onClose={() => setHabitToDelete(null)}
        onConfirm={handleConfirmDeleteHabit}
      />

      {/* Keyboard Shortcuts Helper Modal */}
      {isShortcutsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-sm bg-[#FAF9F5] dark:bg-zinc-900 border-3 border-zinc-900 dark:border-zinc-700 shadow-[6px_6px_0px_#141414] dark:shadow-[6px_6px_0px_#27272a] p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(false)}
              className="absolute top-3.5 right-3.5 w-7 h-7 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] cursor-pointer"
              aria-label="Schließen"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block mb-1">
              Web-Navigation
            </span>
            <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
              Tastenkombinationen
            </h3>

            <div className="space-y-2 text-xs font-mono-numbers">
              <div className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800 border border-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-700 dark:text-zinc-300">Habits 1 bis 9 umschalten</span>
                <span className="bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 border border-zinc-900 dark:border-zinc-600 font-bold text-zinc-900 dark:text-zinc-100">
                  1..9
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800 border border-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-700 dark:text-zinc-300">Neuen Habit erstellen</span>
                <span className="bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 border border-zinc-900 dark:border-zinc-600 font-bold text-zinc-900 dark:text-zinc-100">
                  N
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800 border border-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-700 dark:text-zinc-300">Zu Heute springen</span>
                <span className="bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 border border-zinc-900 dark:border-zinc-600 font-bold text-zinc-900 dark:text-zinc-100">
                  T
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800 border border-zinc-900 dark:border-zinc-700">
                <span className="text-zinc-700 dark:text-zinc-300">Dark Mode umschalten</span>
                <span className="bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 border border-zinc-900 dark:border-zinc-600 font-bold text-zinc-900 dark:text-zinc-100">
                  D
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(false)}
              className="w-full mt-4 py-2 border-2 border-zinc-900 dark:border-zinc-700 bg-[#D8F22A] text-zinc-950 font-bold text-xs shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] cursor-pointer"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}

      {/* Execution Note Modal */}
      <ExecutionNoteModal
        isOpen={Boolean(noteModalHabit)}
        habit={noteModalHabit}
        date={selectedDate}
        initialNote={noteModalInitialNote}
        onSave={handleSaveExecutionNote}
        onDeleteNote={handleDeleteExecutionNote}
        onClose={() => setNoteModalHabit(null)}
      />

      {/* 4-Second Undo Notification */}
      {undoState && (
        <UndoToast
          message={undoState.message}
          onUndo={handleUndo}
          onDismiss={() => setUndoState(null)}
          onAddNote={
            undoState.type === 'toggle' && undoState.habitId && undoState.message.includes('erledigt')
              ? () => {
                  const targetHabit = habits.find((h) => h.id === undoState.habitId);
                  if (targetHabit) {
                    handleOpenNoteModal(targetHabit);
                    setUndoState(null);
                  }
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
