import React, { useState } from 'react';
import { X, Zap, Search, Check, Layers, MessageSquare, Palette, Video, HardDrive } from 'lucide-react';

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({ isOpen, onClose }) => {
  const [installed, setInstalled] = useState<Set<string>>(new Set(['slack', 'figma']));

  if (!isOpen) return null;

  const toggleInstall = (id: string) => {
    setInstalled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const APPS = [
    { id: 'jira', name: 'Jira Cards & Sync', desc: 'Convert sticky notes into Jira issues automatically', Icon: Layers, color: '#0284c7' },
    { id: 'slack', name: 'Slack Notifications', desc: 'Receive live board comment alerts in Slack channels', Icon: MessageSquare, color: '#4a154b' },
    { id: 'figma', name: 'Figma Canvas Embed', desc: 'Import Figma artboards directly onto your whiteboard', Icon: Palette, color: '#a855f7' },
    { id: 'zoom', name: 'Zoom Whiteboard App', desc: 'Open collaborative canvas inside Zoom meetings', Icon: Video, color: '#2563eb' },
    { id: 'gdrive', name: 'Google Drive Sync', desc: 'Auto-save board JSON backups into Google Drive', Icon: HardDrive, color: '#16a34a' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 pointer-events-auto select-none">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">SankalpLabs Marketplace</h3>
              <p className="text-xs text-slate-400">Integrate your favorite tools & automated workflows</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {APPS.map((app) => {
            const isInst = installed.has(app.id);
            return (
              <div key={app.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-center bg-white"
                    style={{ color: app.color }}
                  >
                    <app.Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{app.name}</span>
                    <span className="text-[10px] text-slate-400">{app.desc}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleInstall(app.id)}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isInst
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                  }`}
                >
                  {isInst ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Installed</span>
                    </>
                  ) : (
                    <span>Install</span>
                  )}
                </button>
              </div>
            );
          })}
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
