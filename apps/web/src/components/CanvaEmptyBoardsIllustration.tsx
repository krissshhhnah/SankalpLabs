import React from 'react';

interface CanvaEmptyBoardsIllustrationProps {
  className?: string;
  size?: number;
}

export const CanvaEmptyBoardsIllustration: React.FC<CanvaEmptyBoardsIllustrationProps> = ({
  className = '',
  size = 180,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="boardFloorShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.26" />
          <stop offset="60%" stopColor="#9333ea" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
        </radialGradient>

        {/* Board Frame Gradient (Rich Canva Purple) */}
        <linearGradient id="boardFrameGrad" x1="50" y1="55" x2="150" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#b366ff" />
          <stop offset="30%" stopColor="#9a3bff" />
          <stop offset="70%" stopColor="#7e22ce" />
          <stop offset="100%" stopColor="#581c87" />
        </linearGradient>

        {/* Board Face Gradient (Clean White to Soft Lavender) */}
        <linearGradient id="boardFaceGrad" x1="60" y1="65" x2="140" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#faf5ff" />
          <stop offset="100%" stopColor="#f3e8ff" />
        </linearGradient>

        {/* Easel Leg Gradient */}
        <linearGradient id="easelLegGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="40%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#581c87" />
        </linearGradient>

        {/* Easel Shelf Gradient */}
        <linearGradient id="easelShelfGrad" x1="40" y1="134" x2="160" y2="142" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>

        {/* Sticky Note Gradient */}
        <linearGradient id="stickyNoteGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="40%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>

        {/* Floating Pencil Body Gradient */}
        <linearGradient id="pencilBodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>

        {/* Gold Accent Gradient */}
        <linearGradient id="goldSparkle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Cyan Sparkle Gradient */}
        <linearGradient id="cyanSparkle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        {/* Trail Glow Gradient */}
        <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* ── Floor Shadow ── */}
      <ellipse cx="100" cy="182" rx="56" ry="9" fill="url(#boardFloorShadow)" />

      {/* ── Easel Tripod Stand ── */}
      {/* Back center leg */}
      <path
        d="M100 48 L100 178"
        stroke="url(#easelLegGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Left front leg */}
      <path
        d="M97 52 L62 178"
        stroke="url(#easelLegGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Right front leg */}
      <path
        d="M103 52 L138 178"
        stroke="url(#easelLegGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Leg highlight */}
      <path
        d="M96 56 L63 175"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />

      {/* ── Whiteboard Canvas Board with 3D Depth ── */}
      {/* Board Drop Shadow */}
      <rect
        x="51"
        y="62"
        width="98"
        height="76"
        rx="10"
        fill="#581c87"
        fillOpacity="0.18"
      />

      {/* Outer Purple Frame */}
      <rect
        x="49"
        y="58"
        width="102"
        height="76"
        rx="10"
        fill="url(#boardFrameGrad)"
      />

      {/* Glossy Top Edge Highlight on Frame */}
      <path
        d="M57 60 L143 60"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />

      {/* Inner Whiteboard Canvas Face */}
      <rect
        x="55"
        y="64"
        width="90"
        height="64"
        rx="6"
        fill="url(#boardFaceGrad)"
      />

      {/* Subtle Grid Guidelines on the Whiteboard */}
      <line x1="55" y1="84" x2="145" y2="84" stroke="#e9d5ff" strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="55" y1="104" x2="145" y2="104" stroke="#e9d5ff" strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="85" y1="64" x2="85" y2="128" stroke="#e9d5ff" strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="115" y1="64" x2="115" y2="128" stroke="#e9d5ff" strokeWidth="0.8" strokeDasharray="3 3" />

      {/* Creative Playful Doodle on Canvas: Flowchart / Card Shapes */}
      {/* Small UI Card 1 */}
      <rect x="62" y="72" width="22" height="15" rx="3" fill="#818cf8" fillOpacity="0.25" stroke="#6366f1" strokeWidth="1" />
      <line x1="66" y1="77" x2="78" y2="77" stroke="#6366f1" strokeWidth="1" strokeLinecap="round" />
      <line x1="66" y1="81" x2="74" y2="81" stroke="#818cf8" strokeWidth="0.8" strokeLinecap="round" />

      {/* Connecting Arrow */}
      <path d="M84 80 C88 80 91 80 94 87" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />

      {/* Small UI Card 2 */}
      <rect x="94" y="87" width="24" height="16" rx="3" fill="#ec4899" fillOpacity="0.2" stroke="#ec4899" strokeWidth="1" />
      <line x1="98" y1="93" x2="112" y2="93" stroke="#db2777" strokeWidth="1" strokeLinecap="round" />
      <line x1="98" y1="97" x2="106" y2="97" stroke="#f472b6" strokeWidth="0.8" strokeLinecap="round" />

      {/* Pinned Pastel Sticky Note on Corner */}
      <g transform="rotate(-7 132 74)">
        <rect
          x="120"
          y="68"
          width="18"
          height="18"
          rx="2.5"
          fill="url(#stickyNoteGrad)"
          className="drop-shadow-xs"
        />
        {/* Sticky note fold corner */}
        <path d="M134 82 L138 82 L138 86 Z" fill="#eab308" />
        <line x1="123" y1="73" x2="133" y2="73" stroke="#ca8a04" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="123" y1="77" x2="130" y2="77" stroke="#ca8a04" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* ── Easel Horizontal Ledge (Board Support Shelf) ── */}
      <rect
        x="42"
        y="134"
        width="116"
        height="8"
        rx="3"
        fill="url(#easelShelfGrad)"
      />
      {/* Ledge Top Highlight */}
      <path
        d="M45 135 L155 135"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      {/* Markers sitting on the shelf */}
      {/* Purple marker */}
      <rect x="74" y="131" width="14" height="3" rx="1" fill="#7e22ce" />
      {/* Pink marker */}
      <rect x="92" y="131" width="12" height="3" rx="1" fill="#ec4899" />
      {/* Cyan marker cap */}
      <rect x="108" y="131" width="10" height="3" rx="1" fill="#06b6d4" />

      {/* ── Floating Stylus / Magic Pencil with Arc Trail ── */}
      {/* Curved Motion Trail */}
      <path
        d="M136 50 C146 54 152 64 148 76"
        fill="none"
        stroke="url(#trailGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />

      {/* Floating Pencil */}
      <g transform="translate(150, 48) rotate(38)">
        {/* Pencil Shadow */}
        <rect x="1" y="2" width="6" height="24" rx="2" fill="#581c87" fillOpacity="0.2" />
        {/* Pencil Body */}
        <rect x="0" y="0" width="6" height="24" rx="2" fill="url(#pencilBodyGrad)" />
        {/* White Edge Highlight */}
        <line x1="1.2" y1="2" x2="1.2" y2="22" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
        {/* Gold Ferrule Band */}
        <rect x="0" y="2" width="6" height="3" fill="url(#goldSparkle)" />
        {/* Eraser */}
        <rect x="0.5" y="-3" width="5" height="5" rx="1.5" fill="#f472b6" />
        {/* Pencil Tip (Cone) */}
        <polygon points="0,24 6,24 3,29" fill="#fde047" />
        {/* Graphite / Lead Tip */}
        <polygon points="2,27.5 4,27.5 3,29.5" fill="#581c87" />
      </g>

      {/* ── Whimsical Accents: Golden Butterfly & Sparkles (Matches Trash Style) ── */}
      {/* 1. Golden Butterfly / Double-Wing Fluttering at Top-Left */}
      <g transform="translate(48, 46) scale(0.92) rotate(-12)">
        {/* Left Wing */}
        <path
          d="M0 0 C-4 -6 -11 -7 -13 -2 C-14 3 -9 9 0 0 Z"
          fill="url(#goldSparkle)"
        />
        {/* Right Wing */}
        <path
          d="M0 0 C5 -8 13 -8 15 -3 C16 3 10 9 0 0 Z"
          fill="url(#goldSparkle)"
        />
        {/* Lower Left Winglet */}
        <path
          d="M0 0 C-5 3 -9 8 -7 11 C-5 13 -1 10 0 0 Z"
          fill="#fbbf24"
        />
        {/* Lower Right Winglet */}
        <path
          d="M0 0 C4 3 9 7 8 11 C6 13 2 10 0 0 Z"
          fill="#fbbf24"
        />
        {/* Butterfly Body */}
        <ellipse cx="0" cy="1" rx="1.5" ry="4" fill="#78350f" />
      </g>

      {/* 2. Cyan 4-Point Star Sparkle (Top-Right) */}
      <path
        d="M166 38 C166 35 168 33 171 33 C168 33 166 31 166 28 C166 31 164 33 161 33 C164 33 166 35 166 38 Z"
        fill="url(#cyanSparkle)"
      />

      {/* 3. Gold 4-Point Star Sparkle (Near Board Top) */}
      <path
        d="M102 42 C102 39.5 103.5 38 106 38 C103.5 38 102 36.5 102 34 C102 36.5 100.5 38 98 38 C100.5 38 102 39.5 102 42 Z"
        fill="url(#goldSparkle)"
      />

      {/* 4. Small Yellow Sparkle (Beside Easel) */}
      <path
        d="M38 96 C38 94 39 92.5 41 92.5 C39 92.5 38 91 38 89 C38 91 37 92.5 35 92.5 C37 92.5 38 94 38 96 Z"
        fill="#fde047"
      />

      {/* 5. Glowing Circular Dots */}
      <circle cx="160" cy="76" r="1.5" fill="#38bdf8" />
      <circle cx="44" cy="62" r="1.5" fill="#c084fc" />
      <circle cx="148" cy="32" r="1.2" fill="#fbbf24" />
      <circle cx="58" cy="118" r="1.2" fill="#67e8f9" />
    </svg>
  );
};

