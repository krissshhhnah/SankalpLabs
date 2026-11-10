import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { Tool } from '@whiteboard/shared';

interface ShortcutHandlers {
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSelectAll?: () => void;
  onSave?: () => void;
  onOpenShortcuts?: () => void;
  onToggleTheme?: () => void;
  onToggleGrid?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const { setActiveTool, setSelectedIds, setEditingTextId, selectedIds } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Suppress keyboard shortcuts when editing text inside inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (ctrlOrCmd) {
        if (e.key === '/' || e.key === '?') {
          e.preventDefault();
          if (handlers.onOpenShortcuts) handlers.onOpenShortcuts();
          return;
        }
        if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          if (handlers.onSave) handlers.onSave();
          return;
        }
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          if (handlers.onSelectAll) handlers.onSelectAll();
          return;
        }
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handlers.onRedo();
          } else {
            handlers.onUndo();
          }
          return;
        }
        if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          handlers.onCopy();
          return;
        }
        if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          handlers.onPaste();
          return;
        }
        if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          handlers.onDuplicate();
          return;
        }
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        if (handlers.onOpenShortcuts) handlers.onOpenShortcuts();
        return;
      }

      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        if (handlers.onToggleTheme) handlers.onToggleTheme();
        return;
      }

      if (!ctrlOrCmd && !e.altKey && e.key.toLowerCase() === 'g') {
        if (handlers.onToggleGrid) handlers.onToggleGrid();
        return;
      }

      if (e.key === 'Escape') {
        setEditingTextId(null);
        setSelectedIds([]);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        handlers.onDelete();
        return;
      }

      // Tool shortcuts
      const key = e.key.toLowerCase();
      const toolMap: Record<string, Tool> = {
        v: 'select',
        h: 'pan',
        n: 'sticky',
        t: 'text',
        r: 'rectangle',
        o: 'ellipse',
        l: 'line',
        a: 'arrow',
        c: 'connector',
        p: 'draw',
        f: 'frame',
        i: 'image',
        m: 'comment',
      };

      if (toolMap[key]) {
        setActiveTool(toolMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, selectedIds]);
}
