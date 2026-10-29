/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MicroHabit, TIME_WINDOW_META } from '../types/habit';
import { Trash2, AlertTriangle, X, Clock, MapPin } from 'lucide-react';

interface DeleteHabitModalProps {
  habit: MicroHabit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (habit: MicroHabit) => void;
}

export const DeleteHabitModal: React.FC<DeleteHabitModalProps> = ({
  habit,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !habit) return null;

  const timeWindowMeta = habit.timeWindow ? TIME_WINDOW_META[habit.timeWindow] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-[#FAF9F5] dark:bg-zinc-900 border-3 border-zinc-900 dark:border-zinc-700 shadow-[6px_6px_0px_#141414] dark:shadow-[6px_6px_0px_#27272a] p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          aria-label="Schließen"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 mb-2">
          <div className="w-8 h-8 bg-rose-100 dark:bg-rose-950/60 border-2 border-zinc-900 dark:border-zinc-700 flex items-center justify-center">
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs font-mono-numbers font-black uppercase tracking-wider">
            Habit entfernen
          </span>
        </div>

        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
          Habit wirklich löschen?
        </h2>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
          Bist du sicher, dass du diesen Micro-Habit aus deinen täglichen Routinen entfernen möchtest?
        </p>

        {/* Preview of the habit being deleted */}
        <div className="relative p-3.5 bg-white dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] mb-4">
          <div
            className="absolute left-0 top-0 bottom-0 w-2"
            style={{ backgroundColor: habit.color }}
          />
          <div className="pl-2 space-y-1">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
              {habit.title}
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono-numbers">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-zinc-400" />
                {habit.cue}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                {habit.timeEstimate}
              </span>
              {timeWindowMeta && (
                <>
                  <span>·</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {timeWindowMeta.emoji} {timeWindowMeta.label}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Note on Undoability */}
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 mb-5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Der Habit wird sofort aus deiner Liste entfernt. Du kannst das Löschen direkt im Anschluss über die Rückgängig-Benachrichtigung rückgängig machen.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono-numbers font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] cursor-pointer"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onConfirm(habit)}
            className="px-4 py-2 border-2 border-zinc-900 bg-rose-600 hover:bg-rose-700 text-white font-mono-numbers font-extrabold text-xs shadow-[3px_3px_0px_#141414] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
            Habit endgültig löschen
          </button>
        </div>
      </div>
    </div>
  );
};
