/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Undo2, X } from 'lucide-react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  message,
  onUndo,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-2 border-zinc-950 dark:border-zinc-300 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#27272a] text-xs font-mono-numbers">
      <span className="font-bold truncate max-w-xs">{message}</span>

      <button
        type="button"
        onClick={onUndo}
        className="flex items-center gap-1 px-2.5 py-1 bg-[#D8F22A] text-zinc-950 font-bold border border-zinc-950 hover:bg-lime-300 transition-colors cursor-pointer"
      >
        <Undo2 className="w-3.5 h-3.5 stroke-[2.5]" />
        Rückgängig
      </button>

      <button
        type="button"
        onClick={onDismiss}
        className="text-zinc-400 dark:text-zinc-600 hover:text-white dark:hover:text-zinc-950 p-0.5 cursor-pointer"
        aria-label="Schließen"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
