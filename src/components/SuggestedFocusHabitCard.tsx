/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SuggestedFocusHabit, MicroHabit } from '../types/habit';
import { soundManager } from '../utils/audio';
import { Haptics } from '../utils/haptics';
import confetti from 'canvas-confetti';
import {
  Target,
  Sparkles,
  Zap,
  Check,
  RotateCw,
  Play,
  Pause,
  RotateCcw,
  Clock,
  MapPin,
  MessageSquare,
  BookOpen,
  Activity,
  Droplets,
  Wind,
  Trophy,
} from 'lucide-react';

interface SuggestedFocusHabitCardProps {
  focusData: SuggestedFocusHabit | null;
  onToggleHabit: (habitId: string) => void;
  onOpenNote?: (habit: MicroHabit) => void;
  onCycleNext?: () => void;
  hasMultipleHabits?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Activity,
  Droplets,
  Wind,
  Sparkles,
};

export const SuggestedFocusHabitCard: React.FC<SuggestedFocusHabitCardProps> = ({
  focusData,
  onToggleHabit,
  onOpenNote,
  onCycleNext,
  hasMultipleHabits = false,
}) => {
  // Interactive 60-Second Countdown Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Reset timer if focus habit changes
  useEffect(() => {
    setIsTimerRunning(false);
    setTimerSeconds(60);
    setTimerCompleted(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, [focusData?.habit.id]);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            setTimerCompleted(true);
            soundManager.playCelebrationChime();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#D8F22A', '#141414', '#FF5C00', '#38BDF8'],
            });
            return 0;
          }
          // Subtle pulse on last 5 seconds
          if (prev <= 6) {
            soundManager.playTactileClick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  if (!focusData) return null;

  const { habit, previousWeek, challengeTitle, challengePrompt, reason, isCompletedToday } = focusData;
  const IconComponent = ICON_MAP[habit.icon] || Sparkles;

  const handleStartTimer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    soundManager.playTactileClick();
    if (timerSeconds === 0) {
      setTimerSeconds(60);
      setTimerCompleted(false);
    }
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    soundManager.playTactileClick();
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    soundManager.playUndoClick();
    setIsTimerRunning(false);
    setTimerSeconds(60);
    setTimerCompleted(false);
  };

  const handleCompleteHabit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleHabit(habit.id);
  };

  const timerPct = ((60 - timerSeconds) / 60) * 100;
  const formattedSeconds = String(timerSeconds % 60).padStart(2, '0');
  const formattedMinutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0');

  return (
    <div className="relative bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] overflow-hidden">
      {/* Dynamic colored accent bar */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: habit.color || '#D8F22A' }}
      />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-zinc-900 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#D8F22A] text-zinc-950 font-mono-numbers text-[10px] sm:text-xs font-black uppercase border border-zinc-900 shadow-xs">
              <Target className="w-3.5 h-3.5 stroke-[2.5]" />
              Heutiger Fokus-Habit
            </span>
            <span className="text-[11px] font-mono-numbers text-zinc-500 dark:text-zinc-400 font-semibold hidden sm:inline">
              Vorwochen-Analyse
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Week Stats Badge */}
            <span
              className="text-[11px] font-mono-numbers font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-900/30 dark:border-zinc-700"
              title={`Berechnung basierend auf Vorwoche: ${previousWeek.dateRangeLabel}`}
            >
              {previousWeek.percentage}% Quote ({previousWeek.completedDays}/7 Tage)
            </span>

            {/* Cycle to another habit if multiple habits exist */}
            {hasMultipleHabits && onCycleNext && (
              <button
                type="button"
                onClick={onCycleNext}
                className="flex items-center gap-1 p-1 text-[11px] font-mono-numbers font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 border border-transparent hover:border-zinc-900 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Anderen Habit aus der Vorwochen-Analyse anzeigen"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Anderer Habit</span>
              </button>
            )}
          </div>
        </div>

        {/* Habit Summary & Reason Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className="w-11 h-11 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 shrink-0 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]"
              style={{ backgroundColor: `${habit.color}33` }}
            >
              <IconComponent className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                  {habit.title}
                </h3>
                {isCompletedToday ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700 text-[10px] font-bold uppercase font-mono-numbers">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Heute erledigt
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-[10px] font-bold uppercase font-mono-numbers">
                    🎯 Heutiger Fokus
                  </span>
                )}
              </div>

              {/* Cue and Time Metadata */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  {habit.cue}
                </span>
                <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">·</span>
                <span className="flex items-center gap-1 font-mono-numbers text-[11px] font-semibold text-zinc-500">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  {habit.timeEstimate}
                </span>
              </div>
            </div>
          </div>

          {/* Previous Week 7-Day History Mini-Pills */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-900/20 dark:border-zinc-700 p-2 shrink-0">
            <span className="text-[9px] font-mono-numbers uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
              Vorwoche ({previousWeek.dateRangeLabel}):
            </span>
            <div className="flex items-center gap-1">
              {previousWeek.dayHistory.map((d) => (
                <div
                  key={d.date}
                  className={`w-6 h-6 flex flex-col items-center justify-center border text-[9px] font-mono-numbers font-bold ${
                    d.completed
                      ? 'bg-[#D8F22A] text-zinc-950 border-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-700/60 text-zinc-400 dark:text-zinc-500 border-zinc-300 dark:border-zinc-600'
                  }`}
                  title={`${d.dayName} (${d.date}): ${d.completed ? 'Erledigt' : 'Nicht erledigt'}`}
                >
                  <span>{d.dayName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The 1-Minute Challenge Prompt Box */}
        <div className="p-3.5 sm:p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-zinc-900 dark:border-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-mono-numbers font-black text-amber-950 dark:text-amber-200 uppercase">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
              <span>1-Minuten Challenge: {challengeTitle}</span>
            </div>
            <span className="text-[10px] font-mono-numbers font-semibold text-amber-800/80 dark:text-amber-300/80">
              {reason}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
            {challengePrompt}
          </p>

          {/* Interactive 60-Second Challenge Timer Widget */}
          <div className="pt-2 border-t border-amber-200/80 dark:border-amber-900/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Timer Progress Bar & Time */}
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <div className="flex items-center gap-1 font-mono-numbers font-black text-base text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 px-2 py-0.5 border border-zinc-900 dark:border-zinc-700 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>
                    {formattedMinutes}:{formattedSeconds}
                  </span>
                </div>

                <div className="flex-1 h-3 bg-white dark:bg-zinc-800 border border-zinc-900 dark:border-zinc-700 overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-300 ${
                      timerCompleted
                        ? 'bg-emerald-500'
                        : isTimerRunning
                        ? 'bg-[#FF5C00]'
                        : 'bg-[#D8F22A]'
                    }`}
                    style={{ width: `${timerPct}%` }}
                  />
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-1.5">
                {!isTimerRunning ? (
                  <button
                    type="button"
                    onClick={handleStartTimer}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold font-mono-numbers bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border border-zinc-900 hover:bg-zinc-800 cursor-pointer shadow-xs active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{timerSeconds < 60 && timerSeconds > 0 ? 'Fortsetzen' : 'Timer starten (60s)'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePauseTimer}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold font-mono-numbers bg-amber-400 text-zinc-950 border border-zinc-900 hover:bg-amber-300 cursor-pointer shadow-xs"
                  >
                    <Pause className="w-3 h-3 fill-current" />
                    <span>Pause</span>
                  </button>
                )}

                {(timerSeconds < 60 || timerCompleted) && (
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent hover:border-zinc-900 transition-colors cursor-pointer"
                    title="Timer zurücksetzen"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {timerCompleted && (
              <div className="mt-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 p-2 border border-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  60 Sekunden geschafft! Hürde erfolgreich genommen.
                </span>
                {!isCompletedToday && (
                  <button
                    type="button"
                    onClick={handleCompleteHabit}
                    className="px-2.5 py-0.5 bg-zinc-900 text-[#D8F22A] font-black border border-zinc-900 text-[11px] cursor-pointer hover:bg-zinc-800"
                  >
                    Jetzt abhaken ✓
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions: Complete Habit / Add Note */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Aktualisiert sich täglich basierend auf deiner Konsistenz.</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNote && isCompletedToday && (
              <button
                type="button"
                onClick={() => onOpenNote(habit)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-900 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Notiz bearbeiten</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCompleteHabit}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold border-2 border-zinc-900 dark:border-zinc-700 transition-all cursor-pointer ${
                isCompletedToday
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-none'
                  : 'bg-[#D8F22A] text-zinc-950 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] hover:bg-lime-300 active:translate-x-[1px] active:translate-y-[1px]'
              }`}
            >
              <Check className={`w-4 h-4 stroke-[3] ${isCompletedToday ? 'text-zinc-500' : 'text-zinc-950'}`} />
              <span>
                {isCompletedToday ? 'Als unerledigt markieren' : 'Fokus-Challenge für heute abschließen'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
