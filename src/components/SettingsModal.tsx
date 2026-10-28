/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Haptics, ImpactFeedbackStyle } from '../utils/haptics';
import { soundManager } from '../utils/audio';
import { X, Smartphone, Volume2, VolumeX, Moon, Sun, RefreshCcw, Check, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onToggleDark,
  onResetData,
}) => {
  const [hapticsEnabled, setHapticsEnabled] = useState(() => Haptics.isEnabled());
  const [intensity, setIntensity] = useState(() => Haptics.getIntensity());
  const [soundEnabled, setSoundEnabled] = useState(() => !soundManager.isMuted());
  const [testedHaptic, setTestedHaptic] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!isOpen) return null;

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
    setTimeout(() => setTestedHaptic(false), 800);
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

  const handleExecuteReset = () => {
    onResetData();
    setResetConfirm(true);
    setTimeout(() => {
      setResetConfirm(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-[#FAF9F5] dark:bg-zinc-900 border-3 border-zinc-900 dark:border-zinc-700 shadow-[6px_6px_0px_#141414] dark:shadow-[6px_6px_0px_#27272a] p-6 relative max-h-[90vh] overflow-y-auto"
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
          Konfiguration
        </span>
        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
          App-Einstellungen
        </h2>

        <div className="space-y-5">
          {/* Section 1: Expo Haptics Setting */}
          <div className="bg-white dark:bg-zinc-800/90 border-2 border-zinc-900 dark:border-zinc-700 p-4 shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#D8F22A] text-zinc-950 flex items-center justify-center border border-zinc-900 font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    Physische Haptik (Vibration)
                  </h3>
                  <span className="text-[11px] font-mono-numbers text-zinc-500 dark:text-zinc-400">
                    Expo Haptics Engine
                  </span>
                </div>
              </div>

              {/* On/Off Switch */}
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

            {hapticsEnabled && (
              <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
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
                      className={`p-2 border-2 text-center transition-all cursor-pointer ${
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

                {/* Test Vibration Button */}
                <button
                  type="button"
                  onClick={handleTestHaptic}
                  className={`w-full py-2 px-3 border-2 border-zinc-900 dark:border-zinc-700 text-xs font-mono-numbers font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    testedHaptic
                      ? 'bg-[#D8F22A] text-zinc-950 scale-[0.98]'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{testedHaptic ? 'Vibration ausgelöst! ⚡' : 'Vibration testen'}</span>
                </button>
              </div>
            )}

            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono-numbers block mt-2">
              ● Vibrations-Hardware auf Mobilgeräten oder React Native Expo
            </span>
          </div>

          {/* Section 2: Sound Feedback */}
          <div className="bg-white dark:bg-zinc-800/90 border-2 border-zinc-900 dark:border-zinc-700 p-4 shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-900 dark:border-zinc-600">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  Mechanischer Switch-Sound
                </h3>
                <span className="text-[11px] font-mono-numbers text-zinc-500 dark:text-zinc-400">
                  Taktile Klicks bei 1-Tap Interaktionen
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

          {/* Section 3: Dark Mode */}
          <div className="bg-white dark:bg-zinc-800/90 border-2 border-zinc-900 dark:border-zinc-700 p-4 shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-900 dark:border-zinc-600">
                {isDark ? <Moon className="w-4 h-4 text-[#D8F22A]" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  Dunkles Erscheinungsbild
                </h3>
                <span className="text-[11px] font-mono-numbers text-zinc-500 dark:text-zinc-400">
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

          {/* Section 4: Data Reset */}
          <div className="bg-white dark:bg-zinc-800/90 border-2 border-zinc-900 dark:border-zinc-700 p-4 shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a] flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                Demodaten zurücksetzen
              </h3>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Stellt Standard-Habits & Logs wieder her
              </span>
            </div>

            <button
              type="button"
              onClick={handleExecuteReset}
              className="px-3 py-1.5 border-2 border-zinc-900 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-xs font-mono-numbers font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px]"
            >
              {resetConfirm ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Zurückgesetzt!
                </>
              ) : (
                <>
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Reset
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Done */}
        <div className="mt-6 pt-4 border-t-2 border-zinc-900 dark:border-zinc-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border-2 border-zinc-900 dark:border-zinc-700 bg-[#D8F22A] text-zinc-950 font-bold text-xs shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a] hover:bg-lime-300 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
