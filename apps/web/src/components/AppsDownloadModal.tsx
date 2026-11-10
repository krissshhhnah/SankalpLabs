import React from 'react';
import { X, Smartphone, Monitor, Download, Apple } from 'lucide-react';

interface AppsDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsDownloadModal: React.FC<AppsDownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 pointer-events-auto select-none">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Mobile & Desktop Apps</h3>
              <p className="text-xs text-slate-400">Take your infinite whiteboard anywhere</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Apps List */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-6 text-slate-700" />
              <div>
                <span className="font-bold text-slate-900 block">Desktop App for macOS & Windows</span>
                <span className="text-[10px] text-slate-400">High performance native WebGL canvas engine</span>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold">
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-slate-700" />
              <div>
                <span className="font-bold text-slate-900 block">iOS & iPad App</span>
                <span className="text-[10px] text-slate-400">Apple Pencil pressure sensitivity support</span>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold">
              <span>App Store</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-slate-700" />
              <div>
                <span className="font-bold text-slate-900 block">Android & Tablet App</span>
                <span className="text-[10px] text-slate-400">Touch pan & zoom controls</span>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-bold">
              <span>Google Play</span>
            </button>
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
