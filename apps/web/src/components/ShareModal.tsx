import React, { useState } from 'react';
import { X, Copy, Check, Link2, ShieldCheck } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

interface ShareModalProps {
  boardId?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ boardId }) => {
  const { isShareModalOpen, setShareModalOpen } = useUIStore();
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen) return null;

  const shareUrl = boardId
    ? `${window.location.origin}/?board=${boardId}`
    : window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Share Board</h2>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Anyone with this link can view and collaborate on this infinite canvas in real time.
          </p>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-2 text-xs font-mono text-slate-700 outline-none truncate select-all"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 leading-normal">
            💡 <strong>Quick Test:</strong> Copy this link and open it in a <strong>new tab or incognito window</strong>. You will immediately see each other's colored live cursors, sticky notes, and drawing in real time!
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>End-to-end CRDT Yjs WebSocket state synchronization active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
