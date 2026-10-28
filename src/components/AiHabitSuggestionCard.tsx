import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Plus, Check, Clock, Anchor, HelpCircle, Flame, ArrowRight } from 'lucide-react';
import { MicroHabit, AiHabitSuggestion } from '../types/habit';
import { fetchAiHabitSuggestion } from '../services/aiHabitService';

interface AiHabitSuggestionCardProps {
  currentHabits: MicroHabit[];
  onAddHabit: (suggestion: AiHabitSuggestion) => void;
  onCustomizeHabit: (suggestion: AiHabitSuggestion) => void;
  onHapticFeedback?: () => void;
}

export const AiHabitSuggestionCard: React.FC<AiHabitSuggestionCardProps> = ({
  currentHabits,
  onAddHabit,
  onCustomizeHabit,
  onHapticFeedback,
}) => {
  const [suggestion, setSuggestion] = useState<AiHabitSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [sourceTag, setSourceTag] = useState<string>('');

  const loadSuggestion = async () => {
    setIsLoading(true);
    setJustAdded(false);
    try {
      const res = await fetchAiHabitSuggestion(currentHabits);
      setSuggestion(res.suggestion);
      setSourceTag(res.source);
    } catch (e) {
      console.error('Failed to load suggestion:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestion();
  }, []);

  const handleApply = () => {
    if (!suggestion || justAdded) return;
    onHapticFeedback?.();
    onAddHabit(suggestion);
    setJustAdded(true);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] relative overflow-hidden transition-all">
      {/* Neo-Brutalist Top Accent Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D8F22A] via-[#A78BFA] to-[#38BDF8]" />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 mt-0.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#A78BFA] border-2 border-zinc-900 dark:border-zinc-700 flex items-center justify-center shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]">
            <Sparkles className="w-4 h-4 text-zinc-950" />
          </div>
          <div>
            <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block leading-none">
              KI-Entdecken & Routine-Impuls
            </span>
            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mt-0.5">
              1-Klick Empfehlung
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono-numbers px-1.5 py-0.2 border border-zinc-400 dark:border-zinc-600">
                {sourceTag === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Smart Analysis'}
              </span>
            </span>
          </div>
        </div>

        {/* Refresh / Next Suggestion Button */}
        <button
          type="button"
          onClick={loadSuggestion}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-2 border-zinc-900 dark:border-zinc-700 text-xs font-mono-numbers font-bold text-zinc-800 dark:text-zinc-200 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer disabled:opacity-50"
          title="Anderen Vorschlag anfordern"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Neuer Impuls</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3 py-2 animate-pulse">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-1/3" />
          <div className="h-7 bg-zinc-300 dark:bg-zinc-700 w-3/4" />
          <div className="h-14 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700" />
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 w-full" />
        </div>
      ) : suggestion ? (
        <div>
          {/* Missing domain / synergy kicker */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 border border-amber-800/40 text-amber-900 dark:text-amber-200 text-[11px] font-mono-numbers font-bold mb-2">
            <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Erkannte Ergänzung: {suggestion.missingDomain || 'Synergie'}</span>
          </div>

          {/* Habit Title */}
          <div className="mb-2">
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
              {suggestion.title}
            </h3>
          </div>

          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-mono-numbers">
            <span
              className="px-2 py-0.5 border border-zinc-900 dark:border-zinc-700 font-bold text-zinc-950 flex items-center gap-1 shadow-[1px_1px_0px_#141414]"
              style={{ backgroundColor: suggestion.color || '#D8F22A' }}
            >
              <Clock className="w-3 h-3" />
              {suggestion.timeEstimate}
            </span>
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-900 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 font-medium">
              {suggestion.category}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono-numbers">
              Keine Ausrede: &lt; 2 Min.
            </span>
          </div>

          {/* Habit Stacking Cue Box */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border-2 border-zinc-900 dark:border-zinc-700 mb-3">
            <div className="flex items-start gap-2">
              <Anchor className="w-4 h-4 text-[#FF5C00] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono-numbers font-bold text-zinc-500 dark:text-zinc-400 uppercase block">
                  Physischer Trigger-Anker (Habit-Stacking)
                </span>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  „{suggestion.cue}“
                </p>
              </div>
            </div>
          </div>

          {/* Rationale / James Clear Explanation */}
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-l-amber-500 border border-zinc-200 dark:border-zinc-800 mb-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <strong className="text-zinc-900 dark:text-zinc-100">Warum das zu dir passt:</strong>{' '}
                {suggestion.rationale}
              </p>
            </div>
          </div>

          {/* Actions */}
          {justAdded ? (
            <div className="flex items-center justify-between p-3 bg-lime-100 dark:bg-lime-950/50 border-2 border-zinc-900 dark:border-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#D8F22A] border border-zinc-900 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </div>
                <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
                  Erfolgreich hinzugefügt! Jetzt in deinen Habits aktiv.
                </span>
              </div>
              <button
                type="button"
                onClick={loadSuggestion}
                className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-900 dark:border-zinc-700 text-xs font-bold font-mono-numbers text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
              >
                Nächsten Impuls laden →
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D8F22A] hover:bg-lime-300 text-zinc-950 border-2 border-zinc-900 dark:border-zinc-700 font-extrabold text-xs font-mono-numbers shadow-[3px_3px_0px_#141414] dark:shadow-[3px_3px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Mit 1 Klick übernehmen ⚡</span>
              </button>

              <button
                type="button"
                onClick={() => onCustomizeHabit(suggestion)}
                className="px-3.5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-900 dark:border-zinc-700 font-bold text-xs font-mono-numbers shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-1.5"
                title="Details anpassen, bevor der Habit hinzugefügt wird"
              >
                <span>Anpassen ✏️</span>
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
