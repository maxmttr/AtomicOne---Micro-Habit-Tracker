/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MicroHabit, TimeWindow, TIME_WINDOW_META } from '../types/habit';
import { X, Plus, Sparkles, Clock, MapPin } from 'lucide-react';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Omit<MicroHabit, 'id' | 'createdAt' | 'orderIndex' | 'archived'>) => void;
  initialValues?: { title?: string; cue?: string; timeEstimate?: string; color?: string; timeWindow?: TimeWindow } | null;
}

const PRESETS: Array<{ title: string; cue: string; time: string; color: string; icon: string; timeWindow: TimeWindow }> = [
  { title: '1 Seite Fachbuch lesen', cue: 'Auf dem Schreibtisch', time: '1 min', color: '#D8F22A', icon: 'BookOpen', timeWindow: 'evening' },
  { title: '1 Minute dehnen', cue: 'Nach dem Aufstehen', time: '1 min', color: '#FF5C00', icon: 'Activity', timeWindow: 'morning' },
  { title: '1 Glas kaltes Wasser', cue: 'Direkt in der Küche', time: '30 sek', color: '#3B82F6', icon: 'Droplets', timeWindow: 'morning' },
  { title: '1 Satz Tagebuch schreiben', cue: 'Vor dem Einschlafen', time: '1 min', color: '#10B981', icon: 'Sparkles', timeWindow: 'evening' },
  { title: '3 tiefe Bauchatemzüge', cue: 'Vor dem ersten Zoom-Call', time: '30 sek', color: '#A855F7', icon: 'Wind', timeWindow: 'midday' },
];

const COLORS = ['#D8F22A', '#FF5C00', '#3B82F6', '#10B981', '#A855F7', '#F43F5E'];

const TIME_WINDOWS: TimeWindow[] = ['morning', 'midday', 'evening', 'anytime'];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  initialValues,
}) => {
  const [title, setTitle] = useState('');
  const [cue, setCue] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('1 min');
  const [color, setColor] = useState('#D8F22A');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('anytime');

  React.useEffect(() => {
    if (initialValues && isOpen) {
      setTitle(initialValues.title || '');
      setCue(initialValues.cue || '');
      setTimeEstimate(initialValues.timeEstimate || '1 min');
      setColor(initialValues.color || '#D8F22A');
      setTimeWindow(initialValues.timeWindow || 'anytime');
    } else if (!isOpen) {
      setTitle('');
      setCue('');
      setTimeEstimate('1 min');
      setColor('#D8F22A');
      setTimeWindow('anytime');
    }
  }, [initialValues, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      cue: cue.trim() || 'Im Alltag',
      timeEstimate,
      color,
      icon: 'Sparkles',
      timeWindow,
    });

    setTitle('');
    setCue('');
    setTimeWindow('anytime');
    onClose();
  };

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setTitle(p.title);
    setCue(p.cue);
    setTimeEstimate(p.time);
    setColor(p.color);
    setTimeWindow(p.timeWindow);
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
          Neuer Micro-Habit
        </span>
        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
          Minimalistische Gewohnheit definieren
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
          Die goldene Regel: Formuliere die Aktion so klein, dass Scheitern unmöglich ist (unter 2 Minuten).
        </p>

        {/* 1-Click Presets */}
        <div className="mb-5">
          <label className="text-[11px] font-mono-numbers font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5 uppercase">
            Schnell-Vorlagen
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-xs border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 px-2.5 py-1 font-semibold text-zinc-800 dark:text-zinc-200 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
              Micro-Aktion *
            </label>
            <input
              type="text"
              required
              placeholder="z. B. 1 Seite lesen, 1 Liegestütz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
            />
          </div>

          {/* Context Cue */}
          <div>
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
              Kontext-Anker (Wo / Wann)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="z. B. Nach dem ersten Kaffee, Vor dem Laptop-Start"
                value={cue}
                onChange={(e) => setCue(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              />
            </div>
          </div>

          {/* Time Estimate & Color Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Time */}
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                Geschätzte Dauer
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

            {/* Color Accent */}
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                Farbakzent
              </label>
              <div className="flex items-center gap-1.5 h-9">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    aria-label={`Farbe ${c} wählen`}
                    className={`w-6 h-6 border-2 border-zinc-900 dark:border-zinc-600 transition-transform cursor-pointer ${
                      color === c ? 'scale-125 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] ring-2 ring-zinc-900 dark:ring-white' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
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
              className="px-4 py-2 border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2 border-2 border-zinc-900 dark:border-zinc-700 bg-zinc-900 dark:bg-[#D8F22A] text-[#D8F22A] dark:text-zinc-950 font-bold text-xs shadow-[3px_3px_0px_#737373] hover:bg-zinc-800 dark:hover:bg-lime-300 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Habit speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
