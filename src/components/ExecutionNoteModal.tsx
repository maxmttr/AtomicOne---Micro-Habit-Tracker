/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MicroHabit } from '../types/habit';
import { formatDateGerman } from '../utils/date';
import { soundManager } from '../utils/audio';
import { Haptics } from '../utils/haptics';
import {
  MessageSquare,
  Sparkles,
  X,
  Trash2,
  Check,
  Calendar,
  Zap,
} from 'lucide-react';

interface ExecutionNoteModalProps {
  isOpen: boolean;
  habit: MicroHabit | null;
  date: string;
  initialNote?: string;
  onSave: (note: string) => void;
  onDeleteNote?: () => void;
  onClose: () => void;
}

const QUICK_TAGS = [
  '⚡ Voller Fokus',
  '✨ Leicht gefallen',
  '🌧️ Trotz Müdigkeit',
  '📖 Ziel übertroffen',
  '🎯 Ohne Ablenkung',
  '💧 Frisch hydriert',
];

export const ExecutionNoteModal: React.FC<ExecutionNoteModalProps> = ({
  isOpen,
  habit,
  date,
  initialNote = '',
  onSave,
  onDeleteNote,
  onClose,
}) => {
  const [note, setNote] = useState(initialNote);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote || '');
      // Focus textarea on modal open
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialNote]);

  if (!isOpen || !habit) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    soundManager.playTactileClick();
    onSave(note.trim());
    onClose();
  };

  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    soundManager.playUndoClick();
    if (onDeleteNote) {
      onDeleteNote();
    } else {
      onSave('');
    }
    onClose();
  };

  const handleAppendTag = (tag: string) => {
    soundManager.playTactileClick();
    setNote((prev) => {
      const clean = prev.trim();
      if (!clean) return tag;
      return `${clean} · ${tag}`;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const hasExistingNote = Boolean(initialNote && initialNote.trim());

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 shadow-[6px_6px_0px_#141414] dark:shadow-[6px_6px_0px_#27272a] p-5 space-y-4">
        {/* Color accent tab */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: habit.color || '#D8F22A' }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-700 bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 shrink-0 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]">
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono-numbers font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-400" />
                {formatDateGerman(date)} · Ausführungs-Notiz
              </span>
              <h2
                id="note-modal-title"
                className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 truncate"
              >
                {habit.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cue Reminder Sub-bar */}
        <div className="text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-dashed border-zinc-300 dark:border-zinc-700 p-2 text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
          <span className="truncate">
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Anker:</strong> {habit.cue}
          </span>
          <span className="font-mono-numbers text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 shrink-0 ml-2">
            ⏱ {habit.timeEstimate}
          </span>
        </div>

        {/* Note Textarea Input */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="execution-note"
                className="text-xs font-bold uppercase font-mono-numbers text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                Gedanke, Fortschritt oder Kontext:
              </label>
              <span className="text-[10px] font-mono-numbers text-zinc-400 dark:text-zinc-500">
                {note.length} / 250
              </span>
            </div>
            <textarea
              ref={textareaRef}
              id="execution-note"
              rows={3}
              maxLength={250}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="z. B. 'Kapitel 3 über Micro-Cues gelesen', 'Fühlte mich erfrischt', 'Direkt nach dem Aufwachen'..."
              className="w-full p-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-900 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#D8F22A] resize-none font-sans"
            />
          </div>

          {/* Quick Click Tags */}
          <div>
            <span className="text-[10px] font-mono-numbers uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5">
              Schnellauswahl:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAppendTag(tag)}
                  className="px-2 py-1 text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-zinc-900 dark:border-zinc-700">
            <div>
              {hasExistingNote && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-300 dark:border-rose-800 transition-colors cursor-pointer"
                  title="Notiz von dieser Ausführung löschen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Notiz löschen</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 border-2 border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-[#D8F22A] text-zinc-950 border-2 border-zinc-900 dark:border-zinc-700 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] hover:bg-lime-300 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Speichern</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
