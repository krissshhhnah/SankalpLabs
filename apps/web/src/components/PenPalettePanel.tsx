import React, { useState } from 'react';
import {
  Pencil,
  Highlighter,
  Sparkles,
  Eraser,
  Scissors,
  Lasso,
  HelpCircle,
  Plus,
  Check,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

interface PenPalettePanelProps {
  onClose?: () => void;
}

export const PenPalettePanel: React.FC<PenPalettePanelProps> = () => {
  const {
    activeTool,
    setActiveTool,
    penStyle,
    setPenStyle,
    activeFillColor,
    setActiveFillColor,
    activeStrokeWidth,
    setActiveStrokeWidth,
  } = useUIStore();

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(true);

  if (activeTool !== 'draw') return null;

  const colorGrid = [
    // Row 1
    ['#fef08a', '#f59e0b', '#b45309', '#ffffff'],
    // Row 2
    ['#fed7aa', '#fb923c', '#9a3412', '#e2e8f0'],
    // Row 3
    ['#fbcfe8', '#ef4444', '#991b1b', '#94a3b8'],
    // Row 4
    ['#bbf7d0', '#22c55e', '#15803d', '#475569'],
    // Row 5
    ['#bfdbfe', '#60a5fa', '#1d4ed8', '#000000'],
    // Row 6
    ['#e9d5ff', '#8b5cf6', '#6d28d9'],
  ];

  return (
    <div className="absolute left-16 top-16 z-40 flex items-start gap-3 select-none animate-in fade-in slide-in-from-left-3 duration-200">
      {/* 1. Left Vertical Tool Strip (Capsule Pill) */}
      <div className="bg-white/95 backdrop-blur border border-slate-200/90 shadow-xl rounded-2xl p-2 flex flex-col gap-2 items-center text-slate-700 pointer-events-auto">
        {/* Pen Button */}
        <button
          onClick={() => {
            setPenStyle('pen');
            setActiveTool('draw');
          }}
          title="Fine Pen"
          className={`p-2 rounded-xl transition flex items-center justify-center ${
            penStyle === 'pen'
              ? 'bg-slate-100 text-blue-600 font-bold shadow-sm ring-1 ring-slate-200'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Pencil className="w-5 h-5" />
        </button>

        {/* Highlighter Button */}
        <button
          onClick={() => {
            setPenStyle('highlighter');
            setActiveTool('draw');
          }}
          title="Highlighter"
          className={`p-2 rounded-xl transition flex items-center justify-center ${
            penStyle === 'highlighter'
              ? 'bg-slate-100 text-amber-500 font-bold shadow-sm ring-1 ring-slate-200'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Highlighter className="w-5 h-5" />
        </button>

        {/* Smart Pen Button */}
        <button
          onClick={() => {
            setPenStyle('smart');
            setActiveTool('draw');
          }}
          title="Smart Pen (Shape Recognition)"
          className={`p-2 rounded-xl transition flex items-center justify-center ${
            penStyle === 'smart'
              ? 'bg-slate-100 text-purple-600 font-bold shadow-sm ring-1 ring-slate-200'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Eraser Button */}
        <button
          onClick={() => {
            setPenStyle('eraser');
            setActiveTool('draw');
            if (activeStrokeWidth < 8) {
              setActiveStrokeWidth(20);
            }
          }}
          title="Eraser"
          className={`p-2 rounded-xl transition flex items-center justify-center ${
            penStyle === 'eraser'
              ? 'bg-slate-100 text-rose-600 font-bold shadow-sm ring-1 ring-slate-200'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Eraser className="w-5 h-5" />
        </button>

        {/* Partial Eraser Button */}
        <button
          onClick={() => {
            setPenStyle('dashed');
            setActiveTool('draw');
          }}
          title="Partial / Dashed Eraser"
          className={`p-2 rounded-xl transition flex items-center justify-center ${
            penStyle === 'dashed'
              ? 'bg-slate-100 text-slate-900 font-bold shadow-sm ring-1 ring-slate-200'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Scissors className="w-5 h-5" />
        </button>

        {/* Lasso Select Button */}
        <button
          onClick={() => setActiveTool('select')}
          title="Lasso Select"
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition flex items-center justify-center"
        >
          <Lasso className="w-5 h-5" />
        </button>

        <div className="w-6 h-px bg-slate-200 my-1" />

        {/* Thickness / Eraser Quick Presets */}
        <button
          onClick={() => setActiveStrokeWidth(penStyle === 'eraser' ? 8 : 2)}
          title={penStyle === 'eraser' ? 'Small Eraser (8px)' : 'Thin (2px)'}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
            activeStrokeWidth <= 8 ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
        </button>

        <button
          onClick={() => setActiveStrokeWidth(penStyle === 'eraser' ? 20 : 6)}
          title={penStyle === 'eraser' ? 'Medium Eraser (20px)' : 'Medium (6px)'}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
            activeStrokeWidth > 8 && activeStrokeWidth <= 24 ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-100'
          }`}
        >
          <span
            className="w-3.5 h-3.5 rounded-full border-2 border-slate-800"
            style={{ backgroundColor: activeFillColor }}
          />
        </button>

        <button
          onClick={() => setActiveStrokeWidth(penStyle === 'eraser' ? 48 : 14)}
          title={penStyle === 'eraser' ? 'Large Eraser (48px)' : 'Thick (14px)'}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
            activeStrokeWidth > 24 ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-100'
          }`}
        >
          <span
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: activeFillColor }}
          />
        </button>
      </div>

      {/* 2. Attached Color & Thickness Popover Panel */}
      {isColorPickerOpen && (
        <div className="bg-white/95 backdrop-blur border border-slate-200/90 shadow-2xl rounded-3xl p-5 min-w-[290px] flex flex-col gap-4 text-slate-800 pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
          {/* Thickness / Eraser Size Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{penStyle === 'eraser' ? 'Eraser Size' : 'Stroke Thickness'}</span>
              <span className="text-slate-500 font-mono text-[11px]">{activeStrokeWidth}px</span>
            </div>
            <input
              type="range"
              min={penStyle === 'eraser' ? 4 : 2}
              max={penStyle === 'eraser' ? 80 : 24}
              value={activeStrokeWidth}
              onChange={(e) => setActiveStrokeWidth(Number(e.target.value))}
              className={`w-full h-2 bg-slate-200 rounded-lg cursor-pointer outline-none ${
                penStyle === 'eraser' ? 'accent-rose-600' : 'accent-blue-600'
              }`}
            />
          </div>

          {/* Brand Colors Header & Swatches */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span>Brand colors</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[11px] font-semibold text-[#A2502F]">SankalpLabs Palette</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 p-2 bg-[#FAFAF7] rounded-2xl border border-[#D9D8D5]">
              {[
                { name: 'Warm Ivory', hex: '#FAFAF7' },
                { name: 'Ink Black', hex: '#1A1917' },
                { name: 'Terracotta', hex: '#A2502F' },
                { name: 'Vibrant Orange', hex: '#D9542C' },
                { name: 'Soft Blush', hex: '#F6E7DE' },
                { name: 'Warm Grey', hex: '#5E5C56' },
                { name: 'Soft Stone', hex: '#D9D8D5' },
              ].map((c) => {
                const isSelected = activeFillColor.toLowerCase() === c.hex.toLowerCase();
                const isLight = c.hex === '#FAFAF7' || c.hex === '#F6E7DE' || c.hex === '#D9D8D5';
                return (
                  <button
                    key={c.hex}
                    onClick={() => setActiveFillColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (${c.hex})`}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition shadow-2xs hover:scale-110 relative ${
                      isLight ? 'border-[#D9D8D5]' : 'border-transparent'
                    } ${isSelected ? 'ring-2 ring-[#D9542C] ring-offset-1 scale-105' : ''}`}
                  >
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${isLight ? 'text-[#1A1917]' : 'text-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* All Colors Swatches Grid (6 rows x 4 cols) */}
          <div className="flex flex-col gap-2.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              All colors
            </div>
            <div className="grid grid-cols-4 gap-3">
              {colorGrid.flat().map((color) => {
                const isSelected = activeFillColor.toLowerCase() === color.toLowerCase();
                const isWhite = color.toLowerCase() === '#ffffff';
                return (
                  <button
                    key={color}
                    onClick={() => setActiveFillColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-sm hover:scale-110 transition relative ${
                      isWhite ? 'border-slate-300' : 'border-black/10'
                    } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''}`}
                  >
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 ${isWhite ? 'text-slate-800' : 'text-white'}`}
                      />
                    )}
                  </button>
                );
              })}
              {/* Custom Color Plus Button */}
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.onchange = (e: any) => setActiveFillColor(e.target.value);
                  input.click();
                }}
                className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
