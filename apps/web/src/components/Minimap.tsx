import React, { useState, useRef, useEffect } from 'react';
import { Camera } from '@whiteboard/canvas-engine';
import {
  Minus,
  Plus,
  Maximize2,
  HelpCircle,
  Grid,
  Sun,
  Moon,
  Palette,
  Check,
} from 'lucide-react';
import { useUIStore, CanvasTheme, GridStyle } from '../stores/uiStore';

interface MinimapProps {
  camera: Camera;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onOpenShortcuts?: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  camera,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenShortcuts,
}) => {
  const {
    canvasTheme,
    setCanvasTheme,
    toggleCanvasTheme,
    gridStyle,
    setGridStyle,
    toggleGrid,
  } = useUIStore();

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const zoomPercentage = Math.round(camera.zoom * 100);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes: { id: CanvasTheme; name: string; bg: string; border: string; isDark: boolean }[] = [
    { id: 'light', name: 'Light', bg: '#f8fafc', border: '#cbd5e1', isDark: false },
    { id: 'dark', name: 'Dark', bg: '#0f172a', border: '#334155', isDark: true },
    { id: 'sepia', name: 'Sepia', bg: '#fbf0d9', border: '#d5c3a5', isDark: false },
    { id: 'blueprint', name: 'Blueprint', bg: '#0c2340', border: '#1e40af', isDark: true },
  ];

  const gridStyles: { id: GridStyle; name: string; desc: string }[] = [
    { id: 'dotted', name: 'Dotted', desc: 'Dot matrix' },
    { id: 'lines', name: 'Lines', desc: 'Grid lines' },
    { id: 'crosses', name: 'Crosses', desc: 'Engineering +' },
    { id: 'none', name: 'None', desc: 'Blank canvas' },
  ];

  const isDarkCurrent = canvasTheme === 'dark' || canvasTheme === 'blueprint';

  return (
    <div className="absolute bottom-3 right-3 z-40 flex items-center gap-2 bg-white/95 backdrop-blur border border-slate-200/90 px-3 py-1.5 rounded-2xl shadow-md pointer-events-auto text-slate-700 text-xs font-semibold select-none">
      {/* Fit to Screen / Overview */}
      <button
        onClick={onResetZoom}
        title="Fit View / Frame Overview"
        className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-200" />

      {/* Zoom Out (-) */}
      <button
        onClick={onZoomOut}
        title="Zoom Out (-)"
        className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Zoom Percentage Label */}
      <button
        onClick={onResetZoom}
        title="Reset Zoom to 100%"
        className="px-2 py-0.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 rounded-lg transition min-w-[45px] text-center"
      >
        {zoomPercentage}%
      </button>

      {/* Zoom In (+) */}
      <button
        onClick={onZoomIn}
        title="Zoom In (+)"
        className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition"
      >
        <Plus className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-200" />

      {/* Canvas Theme & Background Grid Menu Popover */}
      <div ref={themeMenuRef} className="relative">
        <button
          onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
          title={`Appearance: ${canvasTheme} theme, ${gridStyle} grid`}
          className={`p-1.5 rounded-xl transition flex items-center gap-1 ${
            isThemeMenuOpen ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {isDarkCurrent ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {isThemeMenuOpen && (
          <div className="absolute bottom-full right-0 mb-3 bg-white/95 backdrop-blur border border-slate-200 shadow-2xl rounded-2xl p-3.5 flex flex-col gap-3 min-w-[220px] z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Theme section */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Canvas Theme
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {themes.map((t) => {
                  const isActive = canvasTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setCanvasTheme(t.id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${
                        isActive
                          ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 text-blue-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border shadow-xs shrink-0"
                        style={{ backgroundColor: t.bg, borderColor: t.border }}
                      />
                      <span className="truncate">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Grid style section */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Background Grid</span>
                <span className="capitalize text-slate-500 font-normal">{gridStyle}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {gridStyles.map((g) => {
                  const isActive = gridStyle === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGridStyle(g.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition text-center ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid Quick Toggle Shortcut */}
      <button
        onClick={toggleGrid}
        title={`Cycle Grid Style (${gridStyle})`}
        className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition"
      >
        <Grid className="w-4 h-4" />
      </button>

      {/* Help Icon (?) */}
      <button
        onClick={onOpenShortcuts}
        title="Help & Shortcuts"
        className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
};
