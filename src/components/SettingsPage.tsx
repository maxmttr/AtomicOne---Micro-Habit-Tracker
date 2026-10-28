/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Haptics, ImpactFeedbackStyle } from '../utils/haptics';
import { soundManager } from '../utils/audio';
import {
  Smartphone,
  Zap,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  RefreshCcw,
  Check,
  Shield,
  Sliders,
  Database,
  Download,
  Flame,
} from 'lucide-react';
import { habitStorage } from '../services/habitStorage';

interface SettingsPageProps {
  isDark: boolean;
  onToggleDark: () => void;
  onResetData: () => void;
  habitCount: number;
  logCount: number;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isDark,
  onToggleDark,
  onResetData,
  habitCount,
  logCount,
}) => {
  const [hapticsEnabled, setHapticsEnabled] = useState(() => Haptics.isEnabled());
  const [intensity, setIntensity] = useState(() => Haptics.getIntensity());
  const [soundEnabled, setSoundEnabled] = useState(() => !soundManager.isMuted());
  const [testedHaptic, setTestedHaptic] = useState(false);
  const [testedSound, setTestedSound] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const handleToggleHaptics = (val: boolean) => {
    setHapticsEnabled(val);
    Haptics.setEnabled(val);
    if (val) {
      Haptics.impactAsync();
    }
  };

  const handleChangeIntensity = (style: ImpactFeedbackStyle) => {
    setIntensity(style);
    Haptics.setIntensity(style);
    if (hapticsEnabled) {
      Haptics.impactAsync(style);
    }
  };

  const handleTestHaptic = async () => {
    setTestedHaptic(true);
    await Haptics.testHaptic();
    soundManager.playTactileClick();
    setTimeout(() => setTestedHaptic(false), 900);
  };

  const handleToggleSound = (val: boolean) => {
    setSoundEnabled(val);
    if (val) {
      if (soundManager.isMuted()) soundManager.toggleMute();
      soundManager.playTactileClick();
    } else {
      if (!soundManager.isMuted()) soundManager.toggleMute();
    }
  };

  const handleTestSound = () => {
    setTestedSound(true);
    soundManager.playTactileClick();
    setTimeout(() => setTestedSound(false), 600);
  };

  const handleExportJSON = () => {
    const data = {
      habits: habitStorage.getHabits(),
      logs: habitStorage.getLogs(),
      exportDate: new Date().toISOString(),
      app: 'AtomicOne Micro-Habits',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atomic-habits-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2000);
  };

  const handleExecuteReset = () => {
    onResetData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
              System & Präferenzen
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Einstellungen
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-numbers text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 border border-zinc-900 dark:border-zinc-700">
              {habitCount} Habits aktiv · {logCount} Logs
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Expo Haptics & Vibration Settings */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900 dark:border-zinc-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#D8F22A] text-zinc-950 flex items-center justify-center border-2 border-zinc-900 font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  Physische Haptik (Vibration)
                </h3>
                <span className="text-[11px] font-mono-numbers text-zinc-500 dark:text-zinc-400 block">
                  Expo Haptics Engine
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => handleToggleHaptics(!hapticsEnabled)}
              className={`w-12 h-6 border-2 border-zinc-900 dark:border-zinc-600 transition-colors cursor-pointer relative p-0.5 ${
                hapticsEnabled ? 'bg-zinc-900 dark:bg-[#D8F22A]' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
              aria-label="Haptik umschalten"
            >
              <div
                className={`w-4 h-4 bg-white dark:bg-zinc-950 border border-zinc-900 transition-transform ${
                  hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Erzeugt bei jedem 1-Tap Habit-Check einen spürbaren physischen Impuls. In React Native über <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 border border-zinc-300 dark:border-zinc-700 font-mono-numbers text-[11px]">expo-haptics</code> und im Web über die Vibration API.
          </p>

          {/* Intensity selector */}
          <div className={`space-y-2.5 ${!hapticsEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-200 block">
              Vibrationsstärke wählen:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: ImpactFeedbackStyle.Light, label: 'Leicht', sub: '12 ms' },
                { id: ImpactFeedbackStyle.Medium, label: 'Mittel', sub: '22 ms' },
                { id: ImpactFeedbackStyle.Heavy, label: 'Kräftig', sub: '35 ms' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => handleChangeIntensity(lvl.id)}
                  className={`p-2.5 border-2 text-center transition-all cursor-pointer ${
                    intensity === lvl.id
                      ? 'bg-zinc-900 text-[#D8F22A] dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-300 font-bold shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-900 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{lvl.label}</span>
                  <span className="text-[10px] font-mono-numbers opacity-80 block">{lvl.sub}</span>
                </button>
              ))}
            </div>

            {/* Test Button */}
            <button
              type="button"
              onClick={handleTestHaptic}
              className={`w-full py-2.5 px-3 border-2 border-zinc-900 dark:border-zinc-700 text-xs font-mono-numbers font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] ${
                testedHaptic
                  ? 'bg-[#D8F22A] text-zinc-950 scale-[0.98]'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{testedHaptic ? 'Vibration ausgelöst! ⚡' : 'Haptik jetzt testen'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Audio & Appearance */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] space-y-5">
          {/* Audio Switch */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900 dark:border-zinc-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 font-bold">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  Mechanischer Switch-Sound
                </h3>
                <span className="text-[11px] font-mono-numbers text-zinc-500 dark:text-zinc-400 block">
                  Synthetisches Taptic-Audio
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleSound(!soundEnabled)}
              className={`w-12 h-6 border-2 border-zinc-900 dark:border-zinc-600 transition-colors cursor-pointer relative p-0.5 ${
                soundEnabled ? 'bg-zinc-900 dark:bg-[#D8F22A]' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
              aria-label="Sound umschalten"
            >
              <div
                className={`w-4 h-4 bg-white dark:bg-zinc-950 border border-zinc-900 transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              Web Audio Synthesizer (0 ms Latenz)
            </span>
            <button
              type="button"
              onClick={handleTestSound}
              disabled={!soundEnabled}
              className={`px-3 py-1.5 border-2 border-zinc-900 dark:border-zinc-700 text-xs font-mono-numbers font-bold cursor-pointer ${
                testedSound
                  ? 'bg-[#D8F22A] text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              } ${!soundEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Sound testen 🔊
            </button>
          </div>

          {/* Dark Mode Switch */}
          <div className="pt-4 border-t-2 border-zinc-900 dark:border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 font-bold">
                {isDark ? <Moon className="w-4 h-4 text-[#D8F22A]" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  Dunkles Erscheinungsbild
                </h3>
                <span className="text-[11px] font-mono-numbers text-zinc-500 dark:text-zinc-400 block">
                  {isDark ? 'Dark Mode aktiv' : 'Light Mode aktiv'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleDark}
              className={`w-12 h-6 border-2 border-zinc-900 dark:border-zinc-600 transition-colors cursor-pointer relative p-0.5 ${
                isDark ? 'bg-zinc-900 dark:bg-[#D8F22A]' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
              aria-label="Design-Modus umschalten"
            >
              <div
                className={`w-4 h-4 bg-white dark:bg-zinc-950 border border-zinc-900 transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card 3: Data Management & Export */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b-2 border-zinc-900 dark:border-zinc-700">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                Daten & Offline-Speicher
              </h3>
              <span className="text-[11px] font-mono-numbers text-zinc-500 dark:text-zinc-400 block">
                100% lokal auf deinem Gerät
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Deine Gewohnheiten und täglichen Logs werden ausschließlich im lokalen Speicher abgelegt (kein Tracking, kein Cloud-Zwang).
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex-1 py-2 px-3 border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-mono-numbers font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              {exportDone ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  JSON heruntergeladen
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Backup exportieren (.json)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExecuteReset}
              className="py-2 px-3 border-2 border-zinc-900 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-mono-numbers font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              {resetDone ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Neu geladen!
                </>
              ) : (
                <>
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Demodaten Reset
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 4: Micro-Habit Philosophy & Best Practices */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] space-y-3">
          <div className="flex items-center gap-2.5 pb-3 border-b-2 border-zinc-900 dark:border-zinc-700">
            <div className="w-8 h-8 bg-[#FF5C00] text-white flex items-center justify-center border-2 border-zinc-900 font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                Design & Verhaltensphilosophie
              </h3>
              <span className="text-[11px] font-mono-numbers text-zinc-500 dark:text-zinc-400 block">
                BJ Fogg & James Clear Prinzip
              </span>
            </div>
          </div>

          <ul className="text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-1.5">
              <span className="text-zinc-900 dark:text-[#D8F22A] font-bold">●</span>
              <span><strong>Unter 2 Minuten</strong>: Die Micro-Aktion muss so geringfügig sein, dass innerer Widerstand gar nicht erst entsteht.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-zinc-900 dark:text-[#D8F22A] font-bold">●</span>
              <span><strong>Anker-Verknüpfung</strong>: Verknüpfe den Habit an eine bestehende Routine (z. B. nach dem Zähneputzen).</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-zinc-900 dark:text-[#D8F22A] font-bold">●</span>
              <span><strong>Monatliche Resilienz</strong>: Ein verpasster Tag bricht keine Kette, sondern verringert den Monats-Score nur marginal.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
