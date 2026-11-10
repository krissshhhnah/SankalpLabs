import React, { useState, useEffect } from 'react';
import { BoardSummary } from '@whiteboard/shared';
import { Layout, FileText, StickyNote, GitBranch } from 'lucide-react';

interface BoardThumbnailProps {
  board: BoardSummary;
  className?: string;
}

export const BoardThumbnail: React.FC<BoardThumbnailProps> = ({ board, className = '' }) => {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`wb_thumb_${board.id}`);
      if (stored && stored.startsWith('data:image/')) {
        setThumbUrl(stored);
      }
    } catch (e) {}
  }, [board.id]);

  // Deterministic palette based on board ID for procedural fallback preview
  const getProceduralTheme = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const themes = [
      { bg: 'bg-gradient-to-br from-[#F6E7DE]/50 to-[#FAFAF7]', sticky1: '#F6E7DE', sticky2: '#FAFAF7', stroke: '#A2502F' },
      { bg: 'bg-gradient-to-br from-[#FAFAF7] to-[#F6E7DE]/40', sticky1: '#fed7aa', sticky2: '#F6E7DE', stroke: '#D9542C' },
      { bg: 'bg-gradient-to-br from-[#FAFAF7] to-[#D9D8D5]/30', sticky1: '#fef08a', sticky2: '#F6E7DE', stroke: '#1A1917' },
      { bg: 'bg-gradient-to-br from-[#F6E7DE]/60 to-white', sticky1: '#F6E7DE', sticky2: '#fed7aa', stroke: '#A2502F' },
    ];
    return themes[hash % themes.length];
  };

  const theme = getProceduralTheme(board.id);

  if (thumbUrl) {
    return (
      <div className={`relative w-full aspect-[16/10] overflow-hidden rounded-xl bg-[#FAFAF7] border border-[#D9D8D5] group-hover:border-[#A2502F] transition shadow-inner ${className}`}>
        <img
          src={thumbUrl}
          alt={board.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-200" />
      </div>
    );
  }

  // Procedural Whiteboard Preview Graphic
  return (
    <div
      className={`relative w-full aspect-[16/10] overflow-hidden rounded-xl border border-[#D9D8D5] group-hover:border-[#A2502F] transition shadow-inner ${theme.bg} ${className}`}
    >
      {/* Background Dot Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`dot-grid-${board.id}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#D9D8D5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dot-grid-${board.id})`} />
      </svg>

      {/* Mock Objects & Stickies */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between select-none">
        {/* Top Floating Mini Sticky */}
        <div className="flex items-start justify-between">
          <div
            className="w-16 h-12 rounded-lg shadow-sm p-1.5 transform -rotate-3 border border-black/5 flex flex-col justify-between group-hover:scale-105 transition"
            style={{ backgroundColor: theme.sticky1 }}
          >
            <div className="w-8 h-1.5 bg-black/20 rounded-full" />
            <div className="space-y-1">
              <div className="w-full h-1 bg-black/15 rounded-full" />
              <div className="w-10 h-1 bg-black/15 rounded-full" />
            </div>
          </div>

          {/* Mini Flow Node */}
          <div className="w-14 h-8 rounded-md bg-white border border-[#D9D8D5] shadow-xs p-1 flex items-center justify-center group-hover:border-[#A2502F] transition">
            <div className="w-8 h-1.5 bg-[#D9D8D5] rounded-full" />
          </div>
        </div>

        {/* Vector Connection Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 125" preserveAspectRatio="none">
          <path
            d="M 60 45 C 90 45, 110 80, 140 80"
            fill="none"
            stroke={theme.stroke}
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.6"
          />
        </svg>

        {/* Bottom Floating Sticky */}
        <div className="flex items-end justify-end">
          <div
            className="w-18 h-14 rounded-lg shadow-sm p-1.5 transform rotate-2 border border-black/5 flex flex-col justify-between group-hover:scale-105 transition"
            style={{ backgroundColor: theme.sticky2 }}
          >
            <div className="w-9 h-1.5 bg-black/25 rounded-full" />
            <div className="space-y-1">
              <div className="w-full h-1 bg-black/15 rounded-full" />
              <div className="w-12 h-1 bg-black/15 rounded-full" />
              <div className="w-8 h-1 bg-black/15 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Vignette on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-200" />
    </div>
  );
};
