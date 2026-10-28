/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MonthlyConsistency, MicroHabit } from '../types/habit';
import { getMonthLabel, getTodayDateString } from '../utils/date';
import { ChevronLeft, ChevronRight, Check, ShieldCheck, TrendingUp, CalendarDays } from 'lucide-react';

interface MonthlyScoreCardProps {
  consistency: MonthlyConsistency;
  habits: MicroHabit[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  showWeekdayInsights?: boolean;
}

export const MonthlyScoreCard: React.FC<MonthlyScoreCardProps> = ({
  consistency,
  habits,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  showWeekdayInsights = true,
}) => {
  const today = getTodayDateString();
  const days = Object.keys(consistency.dailyMap).sort();

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
        <div className="bg-[#D8F22A] text-zinc-950 border-2 border-zinc-900 dark:border-zinc-700 p-3 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]">
          <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-800 font-bold block">
            Konsistenz-Score
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-extrabold font-mono-numbers tracking-tight text-zinc-950">
              {consistency.consistencyScore}%
            </span>
            <span className="text-xs font-bold text-zinc-800">Gesamt</span>
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
