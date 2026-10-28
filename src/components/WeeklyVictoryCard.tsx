/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WeeklyVictoryStatus } from '../types/habit';
import { Trophy, Sparkles, Check, X, Flame } from 'lucide-react';

interface WeeklyVictoryCardProps {
  victory: WeeklyVictoryStatus;
  onFireConfetti: () => void;
  onDismiss?: () => void;
}

export const WeeklyVictoryCard: React.FC<WeeklyVictoryCardProps> = ({
  victory,
  onFireConfetti,
  onDismiss,
}) => {
  if (!victory.isVictory) return null;

  return (
    <div className="relative bg-[#D8F22A] text-zinc-950 border-3 border-zinc-900 dark:border-zinc-700 p-5 sm:p-6 shadow-[6px_6px_0px_#141414] dark:shadow-[6px_6px_0px_#27272a] overflow-hidden select-none">
      {/* Decorative background grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center border-2 border-zinc-900 bg-white/80 hover:bg-white text-zinc-900 shadow-[1px_1px_0px_#141414] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          title="Ausblenden"
          aria-label="Ausblenden"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      )}

      {/* Header */}
      <div className="relative flex items-start gap-3 sm:gap-4 mb-4">
        <div className="w-12 h-12 shrink-0 bg-zinc-950 text-[#D8F22A] border-2 border-zinc-900 flex items-center justify-center shadow-[3px_3px_0px_#141414]">
          <Trophy className="w-7 h-7 stroke-[2.5]" />
        </div>

        <div className="min-w-0 flex-1 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] sm:text-[11px] font-mono-numbers uppercase tracking-wider font-extrabold bg-zinc-950 text-[#D8F22A] px-2 py-0.5 border border-zinc-900 inline-block">
              WÖCHENTLICHE VICTORY · 7 TAGE MEISTERSCHAFT
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 leading-tight">
            Wöchentliche Victory gemeistert!
          </h2>

          <p className="text-xs sm:text-sm font-bold text-zinc-900 mt-1">
            Alle Habits wurden über eine gesamte Woche hinweg ({victory.dateRangeLabel}) jeden einzelnen Tag zu mindestens 80% erfüllt!
          </p>
        </div>
      </div>

      {/* 7-Day Consistency Matrix Strip */}
      <div className="relative bg-zinc-950 text-white border-2 border-zinc-900 p-3 sm:p-4 my-4 shadow-[3px_3px_0px_#141414]">
        <div className="flex items-center justify-between text-xs font-mono-numbers font-bold text-zinc-400 mb-2">
          <span>7-TAGE DURCHGEHEND ≥ 80% ERFÜLLT</span>
          <span className="text-[#D8F22A]">{victory.averagePercentage}% WOCHENDURCHSCHNITT</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {victory.days.map((day) => (
            <div
              key={day.date}
              className="bg-zinc-900 border border-zinc-700 p-1.5 sm:p-2 text-center flex flex-col items-center justify-between"
            >
              <span className="text-[10px] font-mono-numbers text-zinc-400 font-bold block">
                {day.weekdayName}
              </span>
              <span className="text-[9px] font-mono-numbers text-zinc-500 block mb-1">
                {day.date.split('-')[2]}.
              </span>

              <div className="w-5 h-5 rounded-full bg-[#D8F22A] text-zinc-950 flex items-center justify-center my-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>

              <span className="text-[10px] font-mono-numbers font-bold text-[#D8F22A] mt-1">
                {day.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Note & Confetti Trigger Button */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs text-zinc-900 font-medium max-w-lg">
          <strong>Psychologische Verhaltens-Kopplung</strong>: 7 Tage ununterbrochene Micro-Aktionen schaffen neuronale Automatismen. Du hast bewiesen, dass kleine Gewohnheiten Großes bewirken!
        </div>

        <button
          type="button"
          onClick={onFireConfetti}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 text-[#D8F22A] hover:bg-zinc-900 font-mono-numbers font-bold text-xs border-2 border-zinc-900 shadow-[3px_3px_0px_#141414] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Konfetti zünden 🎊</span>
        </button>
      </div>
    </div>
  );
};
