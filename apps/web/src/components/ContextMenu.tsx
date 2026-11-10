import React, { useEffect, useRef } from 'react';
import { Copy, Clipboard, Layers, Lock, Unlock, ArrowUp, ArrowDown, Trash2, Sparkles } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  selectedCount: number;
  isLocked: boolean;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onLockToggle: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDelete: () => void;
  onOpenAi?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  selectedCount,
  isLocked,
  onClose,
  onCopy,
  onPaste,
  onDuplicate,
  onLockToggle,
  onBringToFront,
  onSendToBack,
  onDelete,
  onOpenAi,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ left: `${x}px`, top: `${y}px` }}
      className="fixed z-50 bg-white/95 backdrop-blur py-1.5 rounded-2xl shadow-xl border border-slate-200 min-w-[190px] text-xs font-medium text-slate-800 animate-in fade-in zoom-in-95 duration-100"
    >
      {onOpenAi && (
        <>
          <button
            onClick={() => {
              onOpenAi();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-purple-50 hover:text-purple-600 text-purple-700 font-semibold transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Ask AI Copilot</span>
            </div>
            <span className="text-[10px] text-purple-400 font-mono">⌘K</span>
          </button>
          <div className="my-1 border-t border-slate-100" />
        </>
      )}

      {selectedCount > 0 && (
        <>
          <button
            onClick={() => {
              onCopy();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <div className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </div>
            <span className="text-[10px] text-slate-400">Ctrl+C</span>
          </button>

          <button
            onClick={() => {
              onDuplicate();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </div>
            <span className="text-[10px] text-slate-400">Ctrl+D</span>
          </button>
        </>
      )}

      <button
        onClick={() => {
          onPaste();
          onClose();
        }}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition"
      >
        <div className="flex items-center gap-2">
          <Clipboard className="w-3.5 h-3.5" />
          <span>Paste</span>
        </div>
        <span className="text-[10px] text-slate-400">Ctrl+V</span>
      </button>

      {selectedCount > 0 && (
        <>
          <div className="my-1 border-t border-slate-200" />

          <button
            onClick={() => {
              onLockToggle();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <div className="flex items-center gap-2">
              {isLocked ? <Unlock className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isLocked ? 'Unlock' : 'Lock'}</span>
            </div>
            <span className="text-[10px] text-slate-400">Ctrl+L</span>
          </button>

          <button
            onClick={() => {
              onBringToFront();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <div className="flex items-center gap-2">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Bring to Front</span>
            </div>
            <span className="text-[10px] text-slate-400">Ctrl+]</span>
          </button>

          <button
            onClick={() => {
              onSendToBack();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <div className="flex items-center gap-2">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Send to Back</span>
            </div>
            <span className="text-[10px] text-slate-400">Ctrl+[</span>
          </button>

          <div className="my-1 border-t border-slate-200" />

          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </div>
            <span className="text-[10px] opacity-70">Del</span>
          </button>
        </>
      )}
    </div>
  );
};
