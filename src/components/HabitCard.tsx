/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MicroHabit, TIME_WINDOW_META } from '../types/habit';
import { soundManager } from '../utils/audio';
import {
  Check,
  Trash2,
  Clock,
  MapPin,
  BookOpen,
  Activity,
  Droplets,
  Wind,
  Sparkles,
  Pencil,
  ChevronUp,
  ChevronDown,
  Bell,
} from 'lucide-react';

interface HabitCardProps {
  habit: MicroHabit;
  index: number;
  isCompleted: boolean;
  onToggle: (habitId: string) => void;
  onEdit: (habit: MicroHabit) => void;
  onDelete: (habitId: string) => void;
  onMoveUp?: (habitId: string) => void;
  onMoveDown?: (habitId: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Activity,
  Droplets,
  Wind,
  Sparkles,
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  index,
  isCompleted,
  onToggle,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}) => {
  const IconComponent = ICON_MAP[habit.icon] || Sparkles;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) {
      soundManager.playUndoClick();
    } else {
      soundManager.playTactileClick();
    }
    onToggle(habit.id);
  };

  return (
    <div
      onClick={handleToggle}
      className={`group relative flex items-center justify-between p-4 cursor-pointer transition-all duration-100 select-none ${
        isCompleted
          ? 'bg-zinc-50 dark:bg-zinc-900/60 border-2 border-zinc-900 dark:border-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] translate-x-[1px] translate-y-[1px]'
          : 'bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] hover:shadow-[5px_5px_0px_#141414] dark:hover:shadow-[5px_5px_0px_#3f3f46] hover:translate-x-[-1px] hover:translate-y-[-1px]'
      }`}
    >
      {/* Accent corner stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2.5"
        style={{ backgroundColor: habit.color }}
      />

      <div className="flex items-center gap-3.5 pl-3 min-w-0 flex-1">
        {/* Large 1-Tap Checkbox (48x48 Hitbox) with keyboard shortcut badge */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={handleToggle}
            aria-label={isCompleted ? `${habit.title} als unerledigt markieren` : `${habit.title} erledigen`}
            className={`w-12 h-12 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-600 transition-all duration-100 cursor-pointer ${
              isCompleted
                ? 'bg-zinc-900 dark:bg-zinc-100 text-[#D8F22A] dark:text-zinc-950 shadow-none translate-x-[1px] translate-y-[1px]'
                : 'bg-white dark:bg-zinc-800 text-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]'
            }`}
          >
            <Check className={`w-6 h-6 stroke-[3] transition-transform duration-100 ${isCompleted ? 'scale-100' : 'scale-50'}`} />
          </button>

          {/* Quick Keyboard Shortcut Key badge (1, 2, 3...) */}
          {index < 9 && (
            <span
              className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border border-zinc-900 dark:border-zinc-700 text-[9px] font-mono-numbers font-black flex items-center justify-center shadow-xs"
              title={`Taste [${index + 1}] drücken zum Umschalten`}
            >
              {index + 1}
            </span>
          )}
        </div>

        {/* Habit Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-base font-bold tracking-tight truncate ${
                isCompleted
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {habit.title}
            </span>
            <IconComponent
              className={`w-4 h-4 shrink-0 ${isCompleted ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-300'}`}
            />
          </div>

          {/* Context Cue & Metadata (Unboxed Clean Typography) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            <span className="flex items-center gap-1 font-medium truncate">
              <MapPin className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
              {habit.cue}
            </span>
            <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">·</span>
            <span className="flex items-center gap-1 font-mono-numbers text-zinc-500 dark:text-zinc-400 uppercase shrink-0 font-semibold text-[11px]">
              <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
              {habit.timeEstimate}
            </span>
            {habit.reminderTime && (
              <>
                <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">·</span>
                <span className="flex items-center gap-1 font-mono-numbers text-zinc-700 dark:text-zinc-300 text-[11px]">
                  <Bell className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                  {habit.reminderTime}
                </span>
              </>
            )}
            {habit.timeWindow && (
              <>
                <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">·</span>
                <span
                  className="inline-flex items-center gap-1 font-mono-numbers text-[10px] uppercase font-bold px-1.5 py-0.5 border border-zinc-900/30 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  title={`Zeitfenster: ${TIME_WINDOW_META[habit.timeWindow]?.description || habit.timeWindow}`}
                >
                  <span className="text-[11px]">{TIME_WINDOW_META[habit.timeWindow]?.emoji}</span>
                  <span>{TIME_WINDOW_META[habit.timeWindow]?.label}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Web Controls: Reorder, Edit, Delete */}
      <div className="flex items-center gap-1 shrink-0 ml-3 opacity-80 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {/* Move Up / Down */}
        <div className="hidden sm:flex flex-col mr-1">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp?.(habit.id);
            }}
            className={`p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 ${!canMoveUp ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
            title="Nach oben verschieben"
            aria-label="Nach oben verschieben"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown?.(habit.id);
            }}
            className={`p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 ${!canMoveDown ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
            title="Nach unten verschieben"
            aria-label="Nach unten verschieben"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Edit Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(habit);
          }}
          title="Habit bearbeiten"
          aria-label="Habit bearbeiten"
          className="p-1.5 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-900 dark:hover:border-zinc-700 cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        {/* Delete Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(habit.id);
          }}
          title="Habit entfernen"
          aria-label="Habit löschen"
          className="p-1.5 text-zinc-400 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-900 dark:hover:border-zinc-700 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
