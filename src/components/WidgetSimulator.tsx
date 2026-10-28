/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MicroHabit } from '../types/habit';
import { soundManager } from '../utils/audio';
import { Check, Smartphone, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

interface WidgetSimulatorProps {
  habits: MicroHabit[];
  completedIds: string[];
  onToggleHabit: (habitId: string) => void;
  selectedDate: string;
}

export const WidgetSimulator: React.FC<WidgetSimulatorProps> = ({
  habits,
  completedIds,
  onToggleHabit,
  selectedDate,
}) => {
  const [widgetType, setWidgetType] = useState<'medium' | 'small'>('medium');
  const activeHabits = habits.filter((h) => !h.archived).slice(0, 4);

  const completedCount = activeHabits.filter((h) => completedIds.includes(h.id)).length;
  const progressPercent = activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;

  const handleWidgetTap = (habitId: string) => {
    soundManager.playTactileClick();
    onToggleHabit(habitId);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-zinc-900 dark:border-zinc-700 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
              Home-Screen Live-Simulator
            </span>
            <span className="text-[10px] bg-[#D8F22A] text-zinc-900 font-mono-numbers font-bold px-1.5 py-0.5 border border-zinc-900 dark:border-zinc-700">
              Zero-Tap App-Start
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Interaktive Widget-Vorschau
          </h2>
        </div>

        {/* Widget Format Selector */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setWidgetType('medium')}
            className={`px-3 py-1 text-xs font-bold font-mono-numbers transition-colors cursor-pointer ${
              widgetType === 'medium'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Medium (2x1)
          </button>
          <button
            type="button"
            onClick={() => setWidgetType('small')}
            className={`px-3 py-1 text-xs font-bold font-mono-numbers transition-colors cursor-pointer ${
              widgetType === 'small'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Small (2x2)
          </button>
        </div>
      </div>

      {/* Device Canvas Screen */}
      <div className="my-5 rounded-2xl bg-zinc-900 p-6 sm:p-8 border-4 border-zinc-950 shadow-[6px_6px_0px_#141414] relative overflow-hidden">
        {/* Subtle grid background simulating iOS / Android Wallpaper */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top Status Bar Mock */}
        <div className="relative flex items-center justify-between text-zinc-400 text-xs font-mono-numbers mb-6 px-1">
          <span>09:41</span>
          <div className="flex items-center gap-2">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* The Interactive Widget Itself */}
        <div className="relative flex justify-center">
          {widgetType === 'medium' ? (
            /* Medium 2x1 Widget */
            <div className="w-full max-w-md bg-[#FAF9F5] border-2 border-zinc-900 rounded-xl p-4 shadow-[4px_4px_0px_#141414]">
              {/* Widget Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#D8F22A] border border-zinc-900" />
                  <span className="text-xs font-black tracking-tight uppercase text-zinc-900">
                    Atomic/One
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-numbers font-bold text-zinc-900">
                    {completedCount}/{activeHabits.length}
                  </span>
                  <div className="w-16 h-2 bg-zinc-200 border border-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Direct interactive rows */}
              <div className="space-y-2">
                {activeHabits.map((habit) => {
                  const done = completedIds.includes(habit.id);
                  return (
                    <div
                      key={habit.id}
                      onClick={() => handleWidgetTap(habit.id)}
                      className={`flex items-center justify-between p-2 border-2 border-zinc-900 transition-all cursor-pointer select-none ${
                        done
                          ? 'bg-zinc-200 shadow-none translate-x-[1px] translate-y-[1px]'
                          : 'bg-white shadow-[2px_2px_0px_#141414] hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <div
                          className="w-1.5 h-6 shrink-0"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span
                          className={`text-xs font-bold truncate ${
                            done ? 'line-through text-zinc-500' : 'text-zinc-900'
                          }`}
                        >
                          {habit.title}
                        </span>
                      </div>

                      {/* 1-Tap Widget Trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWidgetTap(habit.id);
                        }}
                        aria-label={done ? 'Unerledigt' : 'Erledigt'}
                        className={`w-6 h-6 shrink-0 flex items-center justify-center border-2 border-zinc-900 transition-colors ${
                          done ? 'bg-zinc-900 text-[#D8F22A]' : 'bg-white hover:bg-zinc-100'
                        }`}
                      >
                        {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-[10px] text-zinc-500 font-mono-numbers text-center">
                ● Live 1-Tap Widget Interaction (Kein App-Launch nötig)
              </div>
            </div>
          ) : (
            /* Small 2x2 Square Widget */
            <div className="w-52 h-52 bg-[#FAF9F5] border-2 border-zinc-900 rounded-xl p-4 shadow-[4px_4px_0px_#141414] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-tight uppercase text-zinc-500 font-mono-numbers">
                    HEUTE
                  </span>
                  <div className="w-2.5 h-2.5 bg-[#D8F22A] border border-zinc-900" />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold font-mono-numbers tracking-tight text-zinc-900">
                    {completedCount}
                  </span>
                  <span className="text-sm font-mono-numbers text-zinc-500">
                    /{activeHabits.length}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-zinc-700 block">
                  {progressPercent === 100 ? 'Alle Habits erledigt!' : `${activeHabits.length - completedCount} offen`}
                </span>
              </div>

              {/* Quick toggle dots */}
              <div className="grid grid-cols-2 gap-1.5 my-2">
                {activeHabits.map((habit) => {
                  const done = completedIds.includes(habit.id);
                  return (
                    <button
                      key={habit.id}
                      type="button"
                      onClick={() => handleWidgetTap(habit.id)}
                      title={habit.title}
                      className={`h-9 border-2 border-zinc-900 flex items-center justify-center p-1 text-[10px] font-bold truncate transition-all cursor-pointer ${
                        done
                          ? 'bg-zinc-900 text-[#D8F22A] translate-x-[1px] translate-y-[1px]'
                          : 'bg-white text-zinc-900 shadow-[2px_2px_0px_#141414]'
                      }`}
                    >
                      {done ? <Check className="w-4 h-4 stroke-[3]" /> : habit.title.slice(0, 8) + '...'}
                    </button>
                  );
                })}
              </div>

              <div className="text-[9px] font-mono-numbers text-zinc-500 text-center">
                Tippe ein Feld an
              </div>
            </div>
          )}
        </div>

        {/* Dummy App Icons below */}
        <div className="mt-8 grid grid-cols-4 gap-4 px-2 max-w-md mx-auto opacity-40">
          {['Fotos', 'Kalender', 'Notizen', 'Karten'].map((label, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-700 rounded-xl" />
              <span className="text-[10px] text-zinc-400 font-mono-numbers">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Integration Note */}
      <div className="bg-zinc-50 dark:bg-zinc-800/80 border-2 border-zinc-900 dark:border-zinc-700 p-4 text-xs space-y-1">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 block font-mono-numbers">
          NATIVE IMPLEMENTIERUNGS-ARCHITEKTUR
        </span>
        <p className="text-zinc-600 dark:text-zinc-300">
          <strong>iOS (WidgetKit + AppIntent)</strong>: Seit iOS 17 ermöglicht das <code className="bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 px-1 py-0.5 border border-zinc-400 dark:border-zinc-600">AppIntent</code>-Protokoll Buttons in Widgets, die Code im Hintergrund ausführen (z. B. den SQLite-Log-Eintrag schreiben) und das Widget per <code className="bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 px-1 py-0.5 border border-zinc-400 dark:border-zinc-600">WidgetCenter.shared.reloadAllTimelines()</code> sofort synchronisieren.
        </p>
        <p className="text-zinc-600 dark:text-zinc-300">
          <strong>Android (Jetpack Glance)</strong>: Mit Compose-Glance wird über <code className="bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 px-1 py-0.5 border border-zinc-400 dark:border-zinc-600">actionRunCallback&lt;ToggleHabitAction&gt;()</code> die Room/SQLite-DB aktualisiert, ohne jemals die Activity in den Vordergrund zu holen.
        </p>
      </div>
    </div>
  );
};
