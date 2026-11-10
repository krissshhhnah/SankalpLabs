import React from 'react';
import { X, HelpCircle, BookOpen, Play, Command, Sparkles } from 'lucide-react';

interface LearningCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearningCenterModal: React.FC<LearningCenterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 pointer-events-auto select-none">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Learning Center</h3>
              <p className="text-xs text-slate-400">Master real-time whiteboard collaboration & shortcuts</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* Shortcuts Grid */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Command className="w-4 h-4 text-indigo-600" />
              Keyboard Shortcuts
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <span>Pan Canvas</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-2xs">Space + Drag</kbd>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <span>Quick Sticky Note</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-2xs">N key</kbd>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <span>Duplicate Selection</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-2xs">Ctrl + D</kbd>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <span>Force Save</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-2xs">Ctrl + S</kbd>
              </div>
            </div>
          </div>

          {/* Interactive Walkthroughs */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Play className="w-4 h-4 text-emerald-600" />
              Video Guides & Tutorials
            </h4>

            <div className="space-y-2">
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Getting Started with Team Whiteboards</span>
                  <span className="text-[10px] text-slate-400">2 min interactive video tour</span>
                </div>
                <button className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-[10px] font-semibold">Watch</button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
