/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MonthlyConsistency, MicroHabit } from '../types/habit';
import { getMonthLabel, getTodayDateString } from '../utils/date';
import { habitStorage } from '../services/habitStorage';
import { soundManager } from '../utils/audio';
import { Haptics } from '../utils/haptics';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ShieldCheck,
  TrendingUp,
  CalendarDays,
  Target,
  Trophy,
  Sparkles,
  Sliders,
  X,
  PartyPopper,
  Flame,
  Minus,
  Plus,
} from 'lucide-react';

interface MonthlyScoreCardProps {
  consistency: MonthlyConsistency;
  habits: MicroHabit[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  showWeekdayInsights?: boolean;
  onUpdateTarget?: (target: number | null) => void;
  onTriggerCelebration?: () => void;
}

export const MonthlyScoreCard: React.FC<MonthlyScoreCardProps> = ({
  consistency,
  habits,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  showWeekdayInsights = true,
  onUpdateTarget,
  onTriggerCelebration,
}) => {
  const today = getTodayDateString();
  const days = Object.keys(consistency.dailyMap).sort();

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState<number>(consistency.monthlyTarget ?? 85);

  // Sync internal input state when month changes
  useEffect(() => {
    setTargetInput(consistency.monthlyTarget ?? 85);
  }, [consistency.yearMonth, consistency.monthlyTarget]);

  const fireLocalConfetti = () => {
    try {
      soundManager.playCelebrationChime();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D8F22A', '#141414', '#FF5C00', '#3B82F6', '#10B981'],
      });
    } catch {
      // fallback
    }
  };

  const handleApplyTarget = (val: number | null) => {
    soundManager.playTactileClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    habitStorage.setMonthlyTarget(consistency.yearMonth, val);
    if (onUpdateTarget) {
      onUpdateTarget(val);
    }
    setIsEditingTarget(false);

    // If target set and already achieved, celebrate immediately!
    if (val !== null && consistency.consistencyScore >= val) {
      if (onTriggerCelebration) {
        onTriggerCelebration();
      } else {
        fireLocalConfetti();
      }
    }
  };

  const handleCelebrationClick = () => {
    if (onTriggerCelebration) {
      onTriggerCelebration();
    } else {
      fireLocalConfetti();
    }
  };

  const hasTarget = typeof consistency.monthlyTarget === 'number' && consistency.monthlyTarget > 0;
  const isAchieved = consistency.isTargetAchieved ?? (hasTarget && consistency.consistencyScore >= (consistency.monthlyTarget || 0));
  const targetPct = consistency.monthlyTarget || 85;
  const delta = consistency.consistencyScore - targetPct;

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] p-5 space-y-5">
      {/* Header: Month switch and Title */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-zinc-900 dark:border-zinc-700">
        <div>
          <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Monatlicher Konsistenz-Tracker
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {getMonthLabel(consistency.yearMonth)}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            className="w-8 h-8 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            title="Vorheriger Monat"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="w-8 h-8 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            title="Nächster Monat"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Metric Hero Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Score Box */}
        <div
          className={`border-2 border-zinc-900 dark:border-zinc-700 p-3 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] relative transition-colors ${
            isAchieved
              ? 'bg-[#D8F22A] text-zinc-950'
              : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-numbers uppercase tracking-wider font-bold block opacity-80">
              Konsistenz-Score
            </span>
            {hasTarget && (
              <span
                className={`text-[10px] font-mono-numbers font-black px-1.5 py-0.5 border border-zinc-900 dark:border-zinc-700 ${
                  isAchieved
                    ? 'bg-zinc-950 text-[#D8F22A]'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                }`}
                title={`Monatsziel: ${consistency.monthlyTarget}%`}
              >
                {isAchieved ? `🎯 ${consistency.monthlyTarget}% ✔` : `🎯 Ziel ${consistency.monthlyTarget}%`}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-extrabold font-mono-numbers tracking-tight">
              {consistency.consistencyScore}%
            </span>
            <span className="text-xs font-bold opacity-75">Gesamt</span>
          </div>
        </div>

        {/* Active Days */}
        <div className="bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 p-3 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]">
          <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Aktive Tage
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-extrabold font-mono-numbers tracking-tight text-zinc-900 dark:text-zinc-100">
              {consistency.activeDaysCount}
            </span>
            <span className="text-xs font-mono-numbers text-zinc-500 dark:text-zinc-400">/ {consistency.daysInMonth} Tage</span>
          </div>
        </div>

        {/* Best Weekday */}
        <div className="bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 p-3 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]">
          <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Stärkster Rhythmus
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold font-mono-numbers tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              {consistency.bestWeekday}
            </span>
          </div>
        </div>
      </div>

      {/* OPTIONALES MONATSZIEL: Success Visualization & Goal Management */}
      <div className="space-y-3">
        {hasTarget ? (
          /* Target is Configured: Visual Success Banner or Active Goal Tracker */
          <div
            className={`border-2 p-4 transition-all duration-200 ${
              isAchieved
                ? 'bg-[#D8F22A]/15 dark:bg-[#D8F22A]/10 border-zinc-900 dark:border-[#D8F22A] shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#D8F22A]'
                : 'bg-zinc-50 dark:bg-zinc-850 border-2 border-zinc-900 dark:border-zinc-700 shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a]'
            }`}
          >
            {/* Top row: Status header & action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                {isAchieved ? (
                  <div className="w-8 h-8 bg-[#D8F22A] border-2 border-zinc-900 flex items-center justify-center text-zinc-950 font-black shadow-[1.5px_1.5px_0px_#141414]">
                    <Trophy className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 border-2 border-zinc-900 dark:border-zinc-600 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                    <Target className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-numbers font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      {isAchieved ? 'Monatsziel Erreicht! 🏆' : `Monatsziel: ${targetPct}% Quote`}
                    </span>
                    {isAchieved && (
                      <span className="text-[10px] bg-zinc-950 text-[#D8F22A] font-mono-numbers font-extrabold px-1.5 py-0.5 border border-zinc-900">
                        {delta > 0 ? `+${delta}% über Plan` : 'Ziel exakt erreicht'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400 block">
                    {isAchieved
                      ? `Hervorragende Konsistenz! Du hast dein Monatsziel von ${targetPct}% mit ${consistency.consistencyScore}% gemeistert.`
                      : `Noch ${targetPct - consistency.consistencyScore}% Konsistenz bis zum Monatserfolg.`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                {isAchieved && (
                  <button
                    type="button"
                    onClick={handleCelebrationClick}
                    className="px-2.5 py-1 bg-[#D8F22A] text-zinc-950 border-2 border-zinc-900 font-mono-numbers font-black text-[11px] shadow-[2px_2px_0px_#141414] hover:bg-lime-300 active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 cursor-pointer"
                    title="Konfetti zünden"
                  >
                    <PartyPopper className="w-3.5 h-3.5" />
                    <span>Feiern 🎊</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingTarget((prev) => !prev)}
                  className="px-2 py-1 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-2 border-zinc-900 dark:border-zinc-700 font-mono-numbers font-bold text-[11px] shadow-[1.5px_1.5px_0px_#141414] dark:shadow-[1.5px_1.5px_0px_#27272a] hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-1 cursor-pointer"
                  title="Monatsziel bearbeiten"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{isEditingTarget ? 'Schließen' : 'Ziel ändern'}</span>
                </button>
              </div>
            </div>

            {/* Visual Progress Bar with Target Milestone Indicator */}
            <div className="space-y-1.5 pt-1">
              <div className="relative pt-4 pb-1">
                {/* Milestone Pin atop the bar */}
                <div
                  className="absolute top-0 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
                  style={{ left: `${Math.min(96, Math.max(8, targetPct))}%` }}
                >
                  <span
                    className={`text-[9px] font-mono-numbers font-black px-1 py-0.5 border leading-none whitespace-nowrap shadow-xs ${
                      isAchieved
                        ? 'bg-zinc-950 text-[#D8F22A] border-zinc-900'
                        : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-700'
                    }`}
                  >
                    🎯 Ziel {targetPct}%
                  </span>
                  <span className="w-0.5 h-1.5 bg-zinc-900 dark:bg-zinc-200" />
                </div>

                {/* Outer Track */}
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-600 relative overflow-hidden">
                  {/* Current Progress Fill */}
                  <div
                    className={`h-full transition-all duration-500 ${
                      isAchieved
                        ? 'bg-[#D8F22A]'
                        : consistency.consistencyScore >= targetPct * 0.75
                        ? 'bg-amber-400 dark:bg-amber-500'
                        : 'bg-[#FF5C00]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, consistency.consistencyScore))}%` }}
                  />
                  {/* Target line across track */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-zinc-950 dark:bg-white z-10"
                    style={{ left: `${targetPct}%` }}
                  />
                </div>
              </div>

              {/* Bottom label stats */}
              <div className="flex items-center justify-between text-[11px] font-mono-numbers text-zinc-600 dark:text-zinc-400">
                <span className="font-bold">
                  Aktuell: <strong className="text-zinc-900 dark:text-zinc-100 font-extrabold">{consistency.consistencyScore}%</strong>
                </span>
                <span>
                  {isAchieved ? (
                    <span className="text-emerald-700 dark:text-lime-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Monats-Erfolg gesichert
                    </span>
                  ) : (
                    <span>Zielquote: {targetPct}%</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Target is NOT configured: Prompt user to set an optional target */
          <div className="bg-zinc-50 dark:bg-zinc-800/80 border-2 border-dashed border-zinc-900 dark:border-zinc-700 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 border-2 border-zinc-900 dark:border-zinc-600 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0">
                <Target className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-mono-numbers font-bold text-zinc-900 dark:text-zinc-100 block">
                  Optionales Monatsziel festlegen
                </span>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Definiere eine Quote (z. B. 85%) als Ansporn. Das Erreichen wird als Erfolg gefeiert.
                </span>
              </div>
            </div>

            {/* Quick 1-click Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleApplyTarget(80)}
                className="px-2 py-1 bg-white dark:bg-zinc-700 hover:bg-[#D8F22A] hover:text-zinc-950 border border-zinc-900 dark:border-zinc-600 text-xs font-mono-numbers font-bold cursor-pointer transition-colors shadow-xs"
              >
                80%
              </button>
              <button
                type="button"
                onClick={() => handleApplyTarget(85)}
                className="px-2.5 py-1 bg-[#D8F22A] text-zinc-950 hover:bg-lime-300 border border-zinc-900 text-xs font-mono-numbers font-extrabold cursor-pointer transition-colors shadow-xs"
              >
                85% (Empfohlen)
              </button>
              <button
                type="button"
                onClick={() => handleApplyTarget(90)}
                className="px-2 py-1 bg-white dark:bg-zinc-700 hover:bg-[#D8F22A] hover:text-zinc-950 border border-zinc-900 dark:border-zinc-600 text-xs font-mono-numbers font-bold cursor-pointer transition-colors shadow-xs"
              >
                90%
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTarget(true)}
                className="px-2 py-1 bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 border border-zinc-900 dark:border-zinc-600 text-xs font-mono-numbers font-bold cursor-pointer"
              >
                Anpassen…
              </button>
            </div>
          </div>
        )}

        {/* Target Edit/Customize Drawer */}
        {isEditingTarget && (
          <div className="p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a] space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-xs font-mono-numbers font-black uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
                Monatsziel konfigurieren ({getMonthLabel(consistency.yearMonth)})
              </span>
              <button
                type="button"
                onClick={() => setIsEditingTarget(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper & Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-numbers text-zinc-600 dark:text-zinc-400">
                  Angestrebte Konsistenz-Quote:
                </span>
                <span className="text-lg font-black font-mono-numbers text-zinc-900 dark:text-zinc-100 bg-[#D8F22A] text-zinc-950 px-2 py-0.5 border border-zinc-900">
                  {targetInput}%
                </span>
              </div>

              {/* Stepper buttons */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setTargetInput((prev) => Math.max(50, prev - 5))}
                  className="w-8 h-8 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold cursor-pointer"
                  title="5% weniger"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={targetInput}
                  onChange={(e) => setTargetInput(Number(e.target.value))}
                  className="flex-1 accent-zinc-900 dark:accent-[#D8F22A] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setTargetInput((prev) => Math.min(100, prev + 5))}
                  className="w-8 h-8 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold cursor-pointer"
                  title="5% mehr"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[70, 75, 80, 85, 90, 95].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTargetInput(pct)}
                    className={`px-2 py-1 text-xs font-mono-numbers font-bold border transition-colors cursor-pointer ${
                      targetInput === pct
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-black'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {pct}% {pct === 85 && '⭐'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => handleApplyTarget(null)}
                className="text-xs font-mono-numbers text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Ziel für {getMonthLabel(consistency.yearMonth)} deaktivieren
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(false)}
                  className="px-3 py-1.5 border-2 border-zinc-900 dark:border-zinc-700 text-xs font-mono-numbers font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTarget(targetInput)}
                  className="px-4 py-1.5 bg-[#D8F22A] text-zinc-950 border-2 border-zinc-900 font-mono-numbers font-extrabold text-xs shadow-[2px_2px_0px_#141414] hover:bg-lime-300 cursor-pointer"
                >
                  Ziel auf {targetInput}% festlegen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forgiving Philosophy Banner */}
      <div className="flex items-start gap-2.5 p-3 bg-zinc-100 dark:bg-zinc-800/80 border-2 border-zinc-900 dark:border-zinc-700 text-xs">
        <ShieldCheck className="w-4 h-4 text-zinc-900 dark:text-[#D8F22A] shrink-0 mt-0.5 stroke-[2.5]" />
        <div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Anti-Streak Ausfall-Resilienz</span>
          <span className="text-zinc-600 dark:text-zinc-300">
            Jeder einzelne ausgeführte Tag zählt kumulativ für deinen Monat. Ein Ruhetag wirft dich niemals auf Null zurück.
          </span>
        </div>
      </div>

      {/* 30/31-Day Interactive Dot Matrix */}
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-mono-numbers font-bold">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            TAGES-MATRIX (Klick zum Umschalten)
          </span>
          <span className="text-[11px]">
            {selectedDate === today ? '● HEUTE AKTIV' : `TAG ${selectedDate.split('-')[2]} AUSGEWÄHLT`}
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-11 gap-1.5">
          {days.map((dayStr) => {
            const dayNum = dayStr.split('-')[2];
            const data = consistency.dailyMap[dayStr] || { completedIds: [], total: habits.length };
            const isToday = dayStr === today;
            const isSelected = dayStr === selectedDate;
            const isFull = data.completedIds.length === data.total && data.total > 0;
            const isPartial = data.completedIds.length > 0 && !isFull;
            const isFuture = dayStr > today;

            return (
              <button
                key={dayStr}
                type="button"
                onClick={() => onSelectDate(dayStr)}
                title={`${dayNum}. ${getMonthLabel(consistency.yearMonth)}: ${data.completedIds.length}/${data.total} erledigt`}
                className={`relative flex flex-col items-center justify-center p-1.5 border-2 transition-all duration-100 font-mono-numbers text-xs cursor-pointer ${
                  isSelected
                    ? 'border-zinc-900 dark:border-[#D8F22A] ring-2 ring-zinc-900 dark:ring-[#D8F22A] ring-offset-1 dark:ring-offset-zinc-900 z-10 scale-105'
                    : 'border-zinc-900 dark:border-zinc-700'
                } ${
                  isFull
                    ? 'bg-[#D8F22A] text-zinc-950 font-bold'
                    : isPartial
                    ? 'bg-amber-100 dark:bg-amber-950 text-zinc-900 dark:text-amber-200'
                    : isFuture
                    ? 'bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-600 opacity-60'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <span className="text-[10px] leading-none mb-1 font-bold">{dayNum}</span>
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  {isFull ? (
                    <Check className="w-3 h-3 stroke-[3] text-zinc-950" />
                  ) : isPartial ? (
                    <span className="text-[9px] font-bold">{data.completedIds.length}</span>
                  ) : isFuture ? (
                    <span className="text-[8px] text-zinc-300 dark:text-zinc-600">·</span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full border border-zinc-400 dark:border-zinc-500" />
                  )}
                </div>
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF5C00] border border-zinc-900 dark:border-zinc-700" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekday Rhythm Breakdown */}
      {showWeekdayInsights && consistency.weekdayStats && consistency.weekdayStats.length > 0 && (
        <div className="pt-3 border-t-2 border-zinc-900 dark:border-zinc-700">
          <div className="flex items-center justify-between text-xs font-mono-numbers font-bold text-zinc-500 dark:text-zinc-400 mb-2.5">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              WOCHEN-RHYTHMUS (KONSISTENZ NACH TAGEN)
            </span>
            <span className="text-[11px] text-zinc-700 dark:text-zinc-300">
              Bester Tag: {consistency.bestWeekday}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {consistency.weekdayStats.map((w) => (
              <div
                key={w.dayIndex}
                className="bg-zinc-50 dark:bg-zinc-800/80 border-2 border-zinc-900 dark:border-zinc-700 p-2 flex flex-col items-center justify-between text-center"
              >
                <span className="text-xs font-mono-numbers font-bold text-zinc-900 dark:text-zinc-100">
                  {w.dayName}
                </span>

                {/* Progress bar pillar */}
                <div className="w-full h-12 bg-zinc-200 dark:bg-zinc-700 my-1.5 border border-zinc-900 dark:border-zinc-600 flex items-end overflow-hidden">
                  <div
                    className={`w-full transition-all duration-300 ${
                      w.percentage >= 80
                        ? 'bg-[#D8F22A]'
                        : w.percentage >= 50
                        ? 'bg-amber-300 dark:bg-amber-500'
                        : 'bg-zinc-400 dark:bg-zinc-500'
                    }`}
                    style={{ height: `${Math.max(8, w.percentage)}%` }}
                  />
                </div>

                <span className="text-[11px] font-mono-numbers font-bold text-zinc-800 dark:text-zinc-200">
                  {w.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
