import React from 'react';
import { Camera } from '@whiteboard/canvas-engine';
import { UserPresence } from '@whiteboard/shared';

interface LiveCursorsOverlayProps {
  camera: Camera;
  presences: UserPresence[];
}

export const LiveCursorsOverlay: React.FC<LiveCursorsOverlayProps> = ({ camera, presences }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {presences.map((p) => {
        if (!p.cursor) return null;
        const screenPos = camera.worldToScreen(p.cursor);

        return (
          <div
            key={p.id}
            style={{
              transform: `translate3d(${screenPos.x}px, ${screenPos.y}px, 0)`,
            }}
            className="absolute top-0 left-0 transition-transform duration-75 ease-out flex items-center gap-1.5"
          >
            {/* Custom Colored Cursor Pointer */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={p.color}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="drop-shadow-md"
            >
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>

            {/* User Name Badge */}
            <div
              style={{ backgroundColor: p.color }}
              className="px-2 py-0.5 rounded-full text-white text-[11px] font-semibold shadow-md whitespace-nowrap"
            >
              {p.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
