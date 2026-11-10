import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  X,
  Presentation,
  Plus,
  Crosshair,
  Sparkles,
  Play,
  Pause,
  LayoutGrid,
  FileText,
  ChevronUp,
  ChevronDown,
  Clock,
  Radio,
  StickyNote,
} from 'lucide-react';
import { Camera } from '@whiteboard/canvas-engine';
import { BoardObject, FrameObject } from '@whiteboard/shared';

interface PresentationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  objects: BoardObject[];
  camera: Camera;
  onCameraChange: () => void;
  onAddObject?: (obj: BoardObject) => void;
}

interface LaserTrailPoint {
  x: number;
  y: number;
  time: number;
}

export const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  isOpen,
  onClose,
  objects,
  camera,
  onCameraChange,
  onAddObject,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLaserPointer, setIsLaserPointer] = useState(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [laserTrail, setLaserTrail] = useState<LaserTrailPoint[]>([]);

  // Filmstrip & Presenter Tools
  const [isFilmstripOpen, setIsFilmstripOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayIntervalSec, setAutoPlayIntervalSec] = useState(8);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);

  const animationFrameRef = useRef<number | null>(null);

  // Extract and sort all Frame objects as presentation slides (top-to-bottom, left-to-right)
  const frames = useMemo(() => {
    return (objects.filter((o) => o.type === 'frame') as FrameObject[]).sort((a, b) => {
      if (Math.abs(a.y - b.y) > 100) return a.y - b.y;
      return a.x - b.x;
    });
  }, [objects]);

  // Smooth easeInOut cinematic camera transition
  const animateCameraTo = (targetX: number, targetY: number, targetZoom: number, durationMs = 500) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startX = camera.x;
    const startY = camera.y;
    const startZoom = camera.zoom;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Cubic easeInOut
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.x = startX + (targetX - startX) * ease;
      camera.y = startY + (targetY - startY) * ease;
      camera.zoom = startZoom + (targetZoom - startZoom) * ease;
      onCameraChange();

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      }
    };
    animationFrameRef.current = requestAnimationFrame(step);
  };

  // Focus camera on a specific frame/slide
  const focusOnFrame = (frame: FrameObject) => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const pad = 100;

    const scaleX = (screenW - pad * 2) / Math.max(frame.width, 100);
    const scaleY = (screenH - pad * 2) / Math.max(frame.height, 100);
    const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.2), 2.0);

    const targetX = frame.x + frame.width / 2 - screenW / (2 * targetZoom);
    const targetY = frame.y + frame.height / 2 - screenH / (2 * targetZoom);

    animateCameraTo(targetX, targetY, targetZoom);
  };

  // Focus on entire content if no frames exist
  const focusOnAllContent = () => {
    if (objects.length === 0) return;
    const minX = Math.min(...objects.map((o) => o.x));
    const minY = Math.min(...objects.map((o) => o.y));
    const maxX = Math.max(...objects.map((o) => o.x + (o.width || 100)));
    const maxY = Math.max(...objects.map((o) => o.y + (o.height || 100)));
    const w = maxX - minX || 400;
    const h = maxY - minY || 300;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const pad = 120;
    const scaleX = (screenW - pad * 2) / w;
    const scaleY = (screenH - pad * 2) / h;
    const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.15), 1.8);

    const targetX = minX + w / 2 - screenW / (2 * targetZoom);
    const targetY = minY + h / 2 - screenH / (2 * targetZoom);

    animateCameraTo(targetX, targetY, targetZoom);
  };

  // On open or slide index change, focus camera
  useEffect(() => {
    if (!isOpen) return;
    if (frames.length > 0) {
      const idx = Math.min(currentSlideIndex, frames.length - 1);
      focusOnFrame(frames[idx]);
    } else {
      focusOnAllContent();
    }
  }, [isOpen, currentSlideIndex, frames]);

  // Reset slide index & cleanup when opening/closing
  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(0);
      setIsAutoPlaying(false);
      setAutoPlayProgress(0);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      setIsLaserPointer(false);
      setIsFilmstripOpen(false);
      setIsNotesOpen(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isOpen]);

  // Slideshow auto-advance interval
  useEffect(() => {
    if (!isOpen || !isAutoPlaying || frames.length === 0) {
      setAutoPlayProgress(0);
      return;
    }

    const startTime = Date.now();
    const intervalMs = autoPlayIntervalSec * 1000;

    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / intervalMs) * 100);
      setAutoPlayProgress(progress);

      if (elapsed >= intervalMs) {
        setCurrentSlideIndex((prev) => (prev >= frames.length - 1 ? 0 : prev + 1));
      }
    }, 100);

    return () => clearInterval(tick);
  }, [isOpen, isAutoPlaying, currentSlideIndex, frames.length, autoPlayIntervalSec]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'PageDown') {
        e.preventDefault();
        if (frames.length > 0) {
          setCurrentSlideIndex((prev) => Math.min(prev + 1, frames.length - 1));
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (frames.length > 0) {
          setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
        }
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLaserPointer((prev) => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        setIsFilmstripOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, frames, onClose]);

  // Laser pointer mouse follower and glow trail
  useEffect(() => {
    if (!isOpen || !isLaserPointer) {
      setLaserPos(null);
      setLaserTrail([]);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const newPt: LaserTrailPoint = { x: e.clientX, y: e.clientY, time: now };
      setLaserPos({ x: e.clientX, y: e.clientY });
      setLaserTrail((prev) => [...prev.filter((p) => now - p.time < 350), newPt]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen, isLaserPointer]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleAutoCreateSlides = () => {
    if (!onAddObject) return;
    const baseW = 800;
    const baseH = 500;
    const startX = camera.x;
    const startY = camera.y;

    const slideTitles = ['1. Executive Summary', '2. System Architecture', '3. Key Milestones'];
    slideTitles.forEach((title, idx) => {
      const newFrame: FrameObject = {
        id: `frame-${Date.now()}-${idx}`,
        boardId: 'default',
        type: 'frame',
        title,
        x: startX + idx * (baseW + 100),
        y: startY,
        width: baseW,
        height: baseH,
        rotation: 0,
        zIndex: 0,
        locked: false,
        createdBy: 'presentation-mode',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fillColor: '#1e293b',
        strokeColor: '#3b82f6',
        childIds: [],
      };
      onAddObject(newFrame);
    });

    setCurrentSlideIndex(0);
  };

  if (!isOpen) return null;

  const currentFrame = frames[currentSlideIndex];
  const totalSlides = frames.length;

  // Find objects inside current frame for presenter notes
  const currentFrameObjects = currentFrame
    ? objects.filter(
        (o) =>
          o.id !== currentFrame.id &&
          o.x >= currentFrame.x &&
          o.x <= currentFrame.x + currentFrame.width &&
          o.y >= currentFrame.y &&
          o.y <= currentFrame.y + currentFrame.height
      )
    : [];

  const notesList = currentFrameObjects
    .filter((o) => (o.type === 'text' || o.type === 'sticky') && (o as any).text)
    .map((o) => (o as any).text as string);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* Luminous Glowing Laser Pointer Trail */}
      {isLaserPointer && laserTrail.length > 1 && (
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-[99]">
          {laserTrail.map((pt, idx) => {
            if (idx === 0) return null;
            const prev = laserTrail[idx - 1];
            const age = Date.now() - pt.time;
            const opacity = Math.max(0, 1 - age / 350);
            return (
              <line
                key={idx}
                x1={prev.x}
                y1={prev.y}
                x2={pt.x}
                y2={pt.y}
                stroke="#ef4444"
                strokeWidth={Math.max(1, 4 * opacity)}
                strokeLinecap="round"
                opacity={opacity * 0.8}
              />
            );
          })}
        </svg>
      )}

      {/* Laser Pointer Dot */}
      {isLaserPointer && laserPos && (
        <div
          style={{
            left: laserPos.x - 7,
            top: laserPos.y - 7,
          }}
          className="fixed w-3.5 h-3.5 bg-red-500 rounded-full shadow-[0_0_20px_6px_rgba(239,68,68,0.95)] pointer-events-none z-[100] ring-2 ring-white/80 animate-ping"
        />
      )}

      {/* Top Left Presentation Banner */}
      <div className="absolute top-4 left-4 pointer-events-auto flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-md text-white border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in duration-200">
        <Presentation className="w-4 h-4 text-blue-400" />
        <span className="font-bold">Presentation Deck</span>
        {isAutoPlaying && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>Auto-Advance</span>
          </span>
        )}
        <span className="text-[10px] text-slate-400 px-2 py-0.5 bg-slate-800 rounded-lg font-mono">
          Esc to exit
        </span>
      </div>

      {/* Top Right Presenter Notes Toggle Button */}
      {totalSlides > 0 && (
        <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold backdrop-blur-md border shadow-xl transition ${
              isNotesOpen
                ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
                : 'bg-slate-900/85 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Speaker Notes</span>
            <span className="text-[10px] bg-white/20 px-1 rounded-full">{notesList.length}</span>
          </button>
        </div>
      )}

      {/* Presenter Speaker Notes Drawer (Right Side) */}
      {isNotesOpen && (
        <div className="absolute top-16 right-4 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 shadow-2xl text-white pointer-events-auto z-40 animate-in fade-in slide-in-from-right-3 duration-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Speaker Notes</span>
            </div>
            <button onClick={() => setIsNotesOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs">
            <h5 className="font-bold text-sm text-white mb-1">{currentFrame?.title || 'Slide Overview'}</h5>
            <span className="text-[10px] text-slate-400">
              Slide {currentSlideIndex + 1} of {totalSlides}
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
            {notesList.length > 0 ? (
              notesList.map((note, idx) => (
                <div key={idx} className="bg-slate-800/70 border border-slate-700/50 p-2.5 rounded-xl">
                  <p className="text-slate-200 leading-relaxed">{note}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <StickyNote className="w-6 h-6 mx-auto opacity-40 text-blue-400" />
                <p className="text-xs">No text or stickies detected inside this slide frame.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Frames Tip Banner */}
      {totalSlides === 0 && (
        <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 px-4 py-2 rounded-2xl shadow-2xl text-xs font-medium animate-in fade-in duration-200">
          <span>Viewing full canvas overview</span>
          <button
            onClick={handleAutoCreateSlides}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create 3 Slide Frames</span>
          </button>
        </div>
      )}

      {/* Slide Deck Filmstrip Carousel Drawer (Bottom Above Dock) */}
      {isFilmstripOpen && totalSlides > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-3.5 rounded-3xl shadow-2xl text-white">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300">Slide Deck Filmstrip</span>
              </div>
              <span className="text-[10px] text-slate-400">Click any slide to jump</span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full">
              {frames.map((frame, idx) => {
                const isActive = currentSlideIndex === idx;
                return (
                  <button
                    key={frame.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`flex-shrink-0 w-36 aspect-[16/10] rounded-xl border p-2 flex flex-col justify-between transition cursor-pointer text-left relative overflow-hidden group ${
                      isActive
                        ? 'bg-blue-900/40 border-blue-400 shadow-md ring-2 ring-blue-500/50'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        #{idx + 1}
                      </span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                    </div>

                    <div className="truncate">
                      <span className="text-xs font-semibold text-white block truncate">{frame.title}</span>
                      <span className="text-[9px] text-slate-400">
                        {frame.width}×{frame.height}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Center Bottom Floating Presenter Control Dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl text-white px-4 py-2 rounded-2xl animate-in slide-in-from-bottom-4 duration-200">
        {/* Toggle Filmstrip */}
        {totalSlides > 0 && (
          <button
            onClick={() => setIsFilmstripOpen(!isFilmstripOpen)}
            title={isFilmstripOpen ? 'Hide Slide Deck (S)' : 'Show Slide Deck Filmstrip (S)'}
            className={`p-2 rounded-xl transition ${
              isFilmstripOpen
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        )}

        <div className="w-px h-5 bg-slate-800" />

        {/* Previous Slide */}
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
          disabled={totalSlides === 0 || currentSlideIndex === 0}
          title="Previous Slide (← / PageUp)"
          className="p-2 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition text-slate-200 hover:text-white active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Slide Counter & Title */}
        <div className="flex items-center gap-2 px-2 text-xs font-medium">
          {totalSlides > 0 ? (
            <>
              <span className="font-bold text-blue-400 font-mono">
                {currentSlideIndex + 1} / {totalSlides}
              </span>
              <span className="text-slate-600">•</span>
              <span className="max-w-[180px] truncate text-slate-200 font-semibold">
                {currentFrame?.title || `Slide ${currentSlideIndex + 1}`}
              </span>
            </>
          ) : (
            <span className="text-slate-300">Canvas Overview</span>
          )}
        </div>

        {/* Next Slide */}
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1))}
          disabled={totalSlides === 0 || currentSlideIndex >= totalSlides - 1}
          title="Next Slide (→ / Space / PageDown)"
          className="p-2 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition text-slate-200 hover:text-white active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="w-px h-5 bg-slate-800" />

        {/* Auto-Play Slideshow Toggle */}
        {totalSlides > 0 && (
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            title={isAutoPlaying ? 'Pause Slideshow' : 'Start Auto-Play Slideshow'}
            className={`p-2 rounded-xl transition ${
              isAutoPlaying
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
        )}

        {/* Laser Pointer Toggle */}
        <button
          onClick={() => setIsLaserPointer(!isLaserPointer)}
          title={isLaserPointer ? 'Turn Off Laser Pointer (L)' : 'Turn On Laser Pointer (L)'}
          className={`p-2 rounded-xl transition ${
            isLaserPointer
              ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (F11)'}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        <div className="w-px h-5 bg-slate-800" />

        {/* Exit Presentation Mode */}
        <button
          onClick={onClose}
          title="Exit Presentation Mode (Esc)"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>
    </div>
  );
};
