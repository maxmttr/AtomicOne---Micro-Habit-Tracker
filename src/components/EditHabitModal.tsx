/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MicroHabit, TimeWindow, TIME_WINDOW_META } from '../types/habit';
import { X, Check } from 'lucide-react';

interface EditHabitModalProps {
  habit: MicroHabit | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<MicroHabit>) => void;
}

const COLORS = ['#D8F22A', '#FF5C00', '#3B82F6', '#10B981', '#A855F7', '#F43F5E'];

const TIME_WINDOWS: TimeWindow[] = ['morning', 'midday', 'evening', 'anytime'];

export const EditHabitModal: React.FC<EditHabitModalProps> = ({
  habit,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [cue, setCue] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('1 min');
  const [color, setColor] = useState('#D8F22A');
  const [reminderTime, setReminderTime] = useState('');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('anytime');

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setCue(habit.cue);
      setTimeEstimate(habit.timeEstimate);
      setColor(habit.color);
      setReminderTime(habit.reminderTime || '');
      setTimeWindow(habit.timeWindow || 'anytime');
    }
  }, [habit]);

  if (!isOpen || !habit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(habit.id, {
      title: title.trim(),
      cue: cue.trim() || 'Im Alltag',
      timeEstimate,
      color,
      reminderTime: reminderTime.trim() || undefined,
      timeWindow,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-[#FAF9F5] dark:bg-zinc-900 border-3 border-zinc-900 dark:border-zinc-700 shadow-[6px_6px_0px_#141414] dark:shadow-[6px_6px_0px_#27272a] p-6 relative max-h-[90vh] overflow-y-auto"
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

        <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
          Habit Bearbeiten
        </span>
        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
          Micro-Aktion anpassen
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
              Micro-Aktion *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
            />
          </div>

          {/* Context Cue */}
          <div>
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
              Kontext-Anker (Trigger)
            </label>
            <input
              type="text"
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
            />
          </div>

          {/* Time & Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                Dauer
              </label>
              <select
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 px-3 py-2 text-xs font-bold font-mono-numbers text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              >
                <option value="30 sek">30 Sekunden</option>
                <option value="1 min">1 Minute</option>
                <option value="2 min">2 Minuten</option>
                <option value="3 min">3 Minuten</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                Erinnerungs-Uhrzeit
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 px-3 py-2 text-xs font-bold font-mono-numbers text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              />
            </div>
          </div>

          {/* Color Accent */}
          <div>
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
              Farbakzent
            </label>
            <div className="flex items-center gap-2 h-9">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  aria-label={`Farbe ${c} wählen`}
                  className={`w-7 h-7 border-2 border-zinc-900 dark:border-zinc-600 transition-transform cursor-pointer ${
                    color === c
                      ? 'scale-125 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] ring-2 ring-zinc-900 dark:ring-white'
                      : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Time Window (Zeitfenster im Tagesverlauf) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                Zeitfenster im Tagesverlauf (optional)
              </label>
              <span className="text-[10px] font-mono-numbers text-zinc-500 dark:text-zinc-400">
                Für Tagesverlauf-Sortierung
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIME_WINDOWS.map((tw) => {
                const meta = TIME_WINDOW_META[tw];
                const isSelected = timeWindow === tw;
                return (
                  <button
                    key={tw}
                    type="button"
                    onClick={() => setTimeWindow(tw)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-bold font-mono-numbers border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-zinc-900 dark:border-zinc-100 bg-[#D8F22A] text-zinc-950 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#f4f4f5]'
                        : 'border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-[1px_1px_0px_#141414] dark:shadow-[1px_1px_0px_#27272a]'
                    }`}
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
              {TIME_WINDOW_META[timeWindow].description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-zinc-900 dark:border-zinc-700 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2 border-2 border-zinc-900 dark:border-zinc-700 bg-[#D8F22A] text-zinc-950 font-bold text-xs shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a] hover:bg-lime-300 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Änderungen sichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
