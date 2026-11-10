import React from 'react';

interface AnimatedNotificationBellProps {
  hasUnread?: boolean;
  className?: string;
  size?: number;
}

export const AnimatedNotificationBell: React.FC<AnimatedNotificationBellProps> = ({
  hasUnread = true,
  className = '',
  size = 18,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center leading-none ${className}`}>
      <style>{`
        @keyframes flaticonBellSwing {
          0%, 100% {
            transform: rotate(0deg);
          }
          6% {
            transform: rotate(14deg);
          }
          12% {
            transform: rotate(-12deg);
          }
          18% {
            transform: rotate(9deg);
          }
          24% {
            transform: rotate(-6deg);
          }
          30% {
            transform: rotate(3deg);
          }
          36% {
            transform: rotate(-1deg);
          }
          42% {
            transform: rotate(0deg);
          }
        }

        @keyframes flaticonClapperSwing {
          0%, 100% {
            transform: translateX(0);
          }
          6% {
            transform: translateX(-2.5px);
          }
          12% {
            transform: translateX(2.5px);
          }
          18% {
            transform: translateX(-1.8px);
          }
          24% {
            transform: translateX(1.2px);
          }
          30% {
            transform: translateX(-0.6px);
          }
          36% {
            transform: translateX(0);
          }
        }

        .bell-body-swing {
          transform-origin: 12px 2.5px;
          animation: flaticonBellSwing 3s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
        }

        .bell-clapper-swing {
          animation: flaticonClapperSwing 3s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
        }

        /* Hover accelerates ringing */
        .group:hover .bell-body-swing {
          animation: flaticonBellSwing 1.1s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
        }
        .group:hover .bell-clapper-swing {
          animation: flaticonClapperSwing 1.1s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
        }
      `}</style>

      {/* Exact Optical 1:1 Bell Matching Lucide ViewBox & Alignment */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="overflow-visible block"
      >
        {/* Bell Body (Dome & Flare) swinging smoothly around top pivot */}
        <g className="bell-body-swing">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        </g>

        {/* Bell Clapper swinging counter-phase */}
        <g className="bell-clapper-swing">
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </g>
      </svg>

      {/* Perfectly Proportioned Notifying Red Mark */}
      {hasUnread && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-2 ring-white shadow-2xs" />
        </span>
      )}
    </div>
  );
};
