import React from 'react';

interface CanvaTrashIllustrationProps {
  className?: string;
  size?: number;
}

export const CanvaTrashIllustration: React.FC<CanvaTrashIllustrationProps> = ({
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
        {/* Can Body Gradient */}
        <linearGradient id="canBodyGrad" x1="60" y1="70" x2="140" y2="175" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#b366ff" />
          <stop offset="25%" stopColor="#9a3bff" />
          <stop offset="70%" stopColor="#7e22ce" />
          <stop offset="100%" stopColor="#581c87" />
        </linearGradient>

        {/* Can Rib Light Gradient */}
        <linearGradient id="ribGradLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>

        {/* Can Rib Shadow Gradient */}
        <linearGradient id="ribGradDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b21a8" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>

        {/* Lid Gradient */}
        <linearGradient id="lidGrad" x1="45" y1="40" x2="125" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="40%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>

        {/* Can Rim Gradient */}
        <linearGradient id="rimGrad" x1="55" y1="70" x2="145" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>

        {/* Inner Void */}
        <linearGradient id="innerVoid" x1="65" y1="72" x2="135" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b0764" />
          <stop offset="100%" stopColor="#1e1035" />
        </linearGradient>

        {/* Sparkle Gold Gradient */}
        <linearGradient id="goldSparkle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Sparkle Cyan Gradient */}
        <linearGradient id="cyanSparkle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        {/* Soft Drop Shadow under Can */}
        <radialGradient id="canFloorShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#9333ea" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Floor Shadow ── */}
      <ellipse cx="100" cy="180" rx="46" ry="10" fill="url(#canFloorShadow)" />

      {/* ── Can Body ── */}
      {/* Main tapered bucket shape */}
      <path
        d="M66 84 L75 168 C75.5 173 80 176 86 176 L114 176 C120 176 124.5 173 125 168 L134 84 Z"
        fill="url(#canBodyGrad)"
      />

      {/* Vertical flutes / embossed ridges on the bin */}
      {/* Flute 1 */}
      <path
        d="M80 92 L86 166"
        stroke="url(#ribGradDark)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M79 92 L85 166"
        stroke="url(#ribGradLight)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Flute 2 (Center-Left) */}
      <path
        d="M93 93 L95 167"
        stroke="url(#ribGradDark)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M92 93 L94 167"
        stroke="url(#ribGradLight)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Flute 3 (Center-Right) */}
      <path
        d="M107 93 L105 167"
        stroke="url(#ribGradDark)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M106 93 L104 167"
        stroke="url(#ribGradLight)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Flute 4 */}
      <path
        d="M120 92 L114 166"
        stroke="url(#ribGradDark)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M119 92 L113 166"
        stroke="url(#ribGradLight)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Glossy highlight strip down the left side */}
      <path
        d="M71 88 L78 165"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />

      {/* Inner Void (Dark mouth inside open bin) */}
      <ellipse cx="100" cy="83" rx="34" ry="9" fill="url(#innerVoid)" />

      {/* Top Rim of the Bin */}
      <path
        d="M64 83 C64 77.5 80.1 73 100 73 C119.9 73 136 77.5 136 83 C136 88.5 119.9 93 100 93 C80.1 93 64 88.5 64 83 Z"
        fill="url(#rimGrad)"
        stroke="#d8b4fe"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* ── Tilted Floating Lid ── */}
      <g transform="rotate(-18 88 64)">
        {/* Lid Top Handle */}
        <path
          d="M78 48 C78 41 84 36 92 36 C100 36 106 41 106 48"
          stroke="url(#lidGrad)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M80 47 C80 42 85 38 92 38 C99 38 104 42 104 47"
          stroke="#e9d5ff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />

        {/* Lid Dome / Cone */}
        <path
          d="M62 60 C70 48 114 48 122 60 Z"
          fill="url(#lidGrad)"
        />

        {/* Lid Rim Lip */}
        <ellipse
          cx="92"
          cy="61"
          rx="33"
          ry="8"
          fill="url(#lidGrad)"
          stroke="#f3e8ff"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />

        {/* Lid Rim Highlight */}
        <path
          d="M64 61 C70 57 114 57 120 61"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
      </g>

      {/* ── Magic Sparkles and Butterfly emerging from Can ── */}
      {/* 1. Golden Butterfly / Double-Wing Sparkle (Top Right) */}
      <g transform="translate(132, 54) scale(0.95)">
        {/* Left Wing */}
        <path
          d="M0 0 C-4 -6 -11 -7 -13 -2 C-14 3 -9 9 0 0 Z"
          fill="url(#goldSparkle)"
          className="drop-shadow-xs"
        />
        {/* Right Wing */}
        <path
          d="M0 0 C5 -8 13 -8 15 -3 C16 3 10 9 0 0 Z"
          fill="url(#goldSparkle)"
          className="drop-shadow-xs"
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

      {/* 2. Cyan 4-Point Star Sparkle (Above Opening) */}
      <path
        d="M124 74 C124 71 126 69 129 69 C126 69 124 67 124 64 C124 67 122 69 119 69 C122 69 124 71 124 74 Z"
        fill="url(#cyanSparkle)"
      />

      {/* 3. Tiny Yellow Star Sparkle (Near Can Rim) */}
      <path
        d="M142 80 C142 78 143 76.5 145 76.5 C143 76.5 142 75 142 73 C142 75 141 76.5 139 76.5 C141 76.5 142 78 142 80 Z"
        fill="#fde047"
      />

      {/* 4. Soft Cyan Sparkle (Center) */}
      <circle cx="118" cy="83" r="1.5" fill="#38bdf8" />

      {/* 5. Violet Tiny Sparkle (Left) */}
      <circle cx="70" cy="68" r="1.5" fill="#e9d5ff" />
    </svg>
  );
};

