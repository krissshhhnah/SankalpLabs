import React, { useState } from 'react';
import { X, Code, Key, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface DeveloperHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperHubModal: React.FC<DeveloperHubModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const apiKey = 'wb_live_9f83a7c6b5e4d3c2b1a0e9f8a7b6c5d4';

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 pointer-events-auto select-none">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-xs">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Developer Hub & API</h3>
              <p className="text-xs text-slate-400">Build custom canvas plugins & webhooks</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-500" />
              REST API Token
            </label>

            <div className="flex items-center gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
              <span className="font-mono text-slate-800 text-[11px] truncate flex-1">{apiKey}</span>
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-300 font-semibold text-[10px] shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-blue-600" />
              Webhooks Integration
            </h4>
            <p className="text-slate-500 text-[11px]">
              Receive real-time HTTP callbacks when whiteboards are updated or exported.
            </p>
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
