import React, { useState, useRef, useEffect } from 'react';
import {
  Square,
  Smile,
  MoreVertical,
  Upload,
  Download,
  Timer,
  MessageSquare,
  Video,
  Presentation,
  Share2,
  PanelRight,
  ChevronDown,
  Cloud,
  CloudOff,
  Check,
  Save,
  FileCode,
  FileText,
  FileImage,
  FileUp,
  Edit2,
  FileJson,
  ArrowLeft,
  X,
  Send,
  Mic,
  MicOff,
  VideoOff,
  Zap,
  CheckCircle,
  Grid,
  Sun,
  Moon,
  Lock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Bell,
  Plus,
} from 'lucide-react';
import { BoardCommentThread, UserPresence } from '@whiteboard/shared';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { ProfileDropdown } from './ProfileDropdown';
import { soundEffects } from '../utils/audioUtils';

interface TopBarProps {
  boardName: string;
  onRenameBoard?: (newName: string) => void;
  onBackToDashboard: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onForceSave?: () => void;
  onExportPng?: () => void;
  onExportSvg?: () => void;
  onExportPdf?: () => void;
  onExportJson?: () => void;
  onImportJson?: (file: File) => void;
  onAddComment?: (text: string) => void;
  onOpenProfileSettings?: () => void;
  onOpenAdminConsole?: () => void;
  onOpenTrash?: () => void;
  onOpenLearningCenter?: () => void;
  onOpenAppsModal?: () => void;
  onOpenDeveloperHub?: () => void;
  onOpenMarketplace?: () => void;
  roomTimer?: {
    isRunning: boolean;
    totalSeconds: number;
    remainingSeconds: number;
    endsAt: number | null;
    startedBy?: string;
    hasFinished?: boolean;
  };
  timerRemaining?: number;
  onStartTimer?: (seconds?: number) => void;
  onPauseTimer?: () => void;
  onResetTimer?: (seconds?: number) => void;
  commentThreads?: BoardCommentThread[];
  presences?: UserPresence[];
  onSelectCommentThread?: (threadId: string) => void;
  onActivateCommentTool?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  boardName,
  onRenameBoard,
  onBackToDashboard,
  onForceSave,
  onExportPng,
  onExportSvg,
  onExportPdf,
  onExportJson,
  onImportJson,
  onAddComment,
  onOpenProfileSettings = () => {},
  onOpenAdminConsole = () => {},
  onOpenTrash = () => {},
  onOpenLearningCenter = () => {},
  onOpenAppsModal = () => {},
  onOpenDeveloperHub = () => {},
  onOpenMarketplace = () => {},
  roomTimer,
  timerRemaining,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  commentThreads = [],
  presences = [],
  onSelectCommentThread,
  onActivateCommentTool,
}) => {
  const {
    setShareModalOpen,
    saveStatus,
    togglePresentationMode,
    isPresentationMode,
    canvasTheme,
    toggleCanvasTheme,
    gridStyle,
    toggleGrid,
  } = useUIStore();
  const { user } = useAuthStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(boardName);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Widget States
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [localTimerSeconds, setLocalTimerSeconds] = useState(300); // 5 mins fallback
  const [isLocalTimerRunning, setIsLocalTimerRunning] = useState(false);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsFilter, setCommentsFilter] = useState<'open' | 'resolved' | 'all'>('open');
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; time: string }>>([]);
  const [commentInput, setCommentInput] = useState('');

  const openCommentsCount = commentThreads.filter((t) => !t.resolved).length;
  const resolvedCommentsCount = commentThreads.filter((t) => t.resolved).length;
  const filteredThreads = commentThreads.filter((t) => {
    if (commentsFilter === 'open') return !t.resolved;
    if (commentsFilter === 'resolved') return t.resolved;
    return true;
  });

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // If collaborative room timer is passed, use it; otherwise fallback to local
  const effectiveIsRunning = roomTimer ? roomTimer.isRunning : isLocalTimerRunning;
  const effectiveSeconds =
    timerRemaining !== undefined
      ? timerRemaining
      : roomTimer
      ? (roomTimer.remainingSeconds ?? roomTimer.totalSeconds ?? 300)
      : localTimerSeconds;
  const effectiveTotalSeconds = roomTimer?.totalSeconds ?? 300;

  useEffect(() => {
    let interval: any = null;
    if (!roomTimer && isLocalTimerRunning && localTimerSeconds > 0) {
      interval = setInterval(() => setLocalTimerSeconds((s) => s - 1), 1000);
    } else if (!roomTimer && localTimerSeconds === 0) {
      setIsLocalTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [roomTimer, isLocalTimerRunning, localTimerSeconds]);

  const handleToggleTimer = () => {
    if (effectiveIsRunning) {
      if (onPauseTimer) onPauseTimer();
      else setIsLocalTimerRunning(false);
    } else {
      if (onStartTimer) {
        onStartTimer(effectiveSeconds > 0 ? effectiveSeconds : effectiveTotalSeconds);
      } else {
        setIsLocalTimerRunning(true);
      }
    }
  };

  const handleResetTimer = (sec?: number) => {
    const target = sec ?? effectiveTotalSeconds;
    if (onResetTimer) {
      onResetTimer(target);
    } else {
      setIsLocalTimerRunning(false);
      setLocalTimerSeconds(target);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput.trim() !== boardName && onRenameBoard) {
      onRenameBoard(titleInput.trim());
    }
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onImportJson) {
      onImportJson(e.target.files[0]);
      setIsExportMenuOpen(false);
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
    }
  };

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    const newC = {
      id: `c-${Date.now()}`,
      user: user?.name || 'You',
      text: commentInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setComments((prev) => [...prev, newC]);
    if (onAddComment) onAddComment(commentInput.trim());
    setCommentInput('');
  };

  const formatTimerTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between pointer-events-none select-none">
      {/* Hidden File Input for Importing JSON canvas backups */}
      <input
        type="file"
        ref={jsonFileInputRef}
        accept=".json"
        onChange={handleJsonFileChange}
        className="hidden"
      />

      {/* Top-Left Floating Capsule Pill */}
      <div className="flex items-center gap-2 bg-[#FAFAF7]/95 backdrop-blur border border-[#D9D8D5] px-3 py-1.5 rounded-2xl shadow-md pointer-events-auto text-[#1A1917] text-xs font-medium">
        {/* Explicit Back to Dashboard Button & Brand Logo */}
        <button
          onClick={onBackToDashboard}
          title="Back to Home / Dashboard"
          className="flex items-center gap-1.5 hover:bg-slate-100 px-2 py-1 rounded-xl transition text-slate-900 font-bold group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition" />
          <img
            src="/logo_black.png"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/lgo_black.png'; }}
            alt="SankalpLabs"
            style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
            className="shrink-0 select-none"
          />
        </button>

        <div className="w-px h-4 bg-slate-200" />

        {/* Board Title & Editable Name Input */}
        {isEditingTitle ? (
          <input
            type="text"
            autoFocus
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') setIsEditingTitle(false);
            }}
            className="font-semibold text-xs text-slate-900 bg-slate-100 border border-blue-400 px-2 py-0.5 rounded-lg outline-none max-w-[180px]"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            title="Click to rename board"
            className="flex items-center gap-1.5 hover:bg-slate-100 px-2 py-1 rounded-xl transition text-slate-700 hover:text-slate-900 group"
          >
            <Smile className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
            <span className="font-semibold text-xs text-slate-800 truncate max-w-[160px]">
              {boardName || 'Untitled Board'}
            </span>
            <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
          </button>
        )}

        <div className="w-px h-4 bg-slate-200" />

        {/* Cloud Save & Synchronization Status Pill */}
        <button
          onClick={() => {
            if (onForceSave) onForceSave();
          }}
          title="Auto-Save Active. Click to force save now (Ctrl+S)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition text-[11px] font-semibold active:scale-95 ${
            saveStatus === 'saved'
              ? 'bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100/90 border border-emerald-200/60'
              : saveStatus === 'saving'
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
          }`}
        >
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved</span>
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="animate-pulse">Saving...</span>
            </span>
          )}
          {saveStatus === 'reconnecting' && (
            <span className="flex items-center gap-1.5">
              <CloudOff className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
              <span>Offline</span>
            </span>
          )}
        </button>

        <div className="w-px h-4 bg-slate-200" />

        {/* Save & Export Options Popover Menu */}
        <div ref={exportMenuRef} className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            title="Save & Export Menu"
            className={`p-1 rounded-xl transition flex items-center gap-1 ${
              isExportMenuOpen ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute left-0 top-full mt-2 bg-white/95 backdrop-blur border border-slate-200 shadow-2xl rounded-2xl p-2 flex flex-col gap-1 min-w-[210px] z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Save & Export
              </div>

              <button
                onClick={() => {
                  if (onForceSave) onForceSave();
                  setIsExportMenuOpen(false);
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <div className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-blue-600" />
                  <span>Save Now</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {/* Vector SVG */}
              <button
                onClick={() => {
                  if (onExportSvg) onExportSvg();
                  setIsExportMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span>Export as SVG</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded-md">Vector</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Scalable vector graphics</span>
                </div>
              </button>

              {/* Multi-Page PDF */}
              <button
                onClick={() => {
                  if (onExportPdf) onExportPdf();
                  setIsExportMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span>Export as PDF</span>
                    <span className="text-[9px] bg-rose-100 text-rose-700 font-semibold px-1.5 py-0.5 rounded-md">Multi-Page</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Slide deck from frames or overview</span>
                </div>
              </button>

              {/* PNG Image */}
              <button
                onClick={() => {
                  if (onExportPng) onExportPng();
                  setIsExportMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <FileImage className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <div className="flex flex-col text-left">
                  <span>Export as PNG Image</span>
                  <span className="text-[10px] text-slate-400">Crisp high-resolution image</span>
                </div>
              </button>

              {/* JSON Backup */}
              <button
                onClick={() => {
                  if (onExportJson) onExportJson();
                  setIsExportMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <FileJson className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Export JSON Backup</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  jsonFileInputRef.current?.click();
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <FileUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Import JSON Backup</span>
              </button>
            </div>
          )}
        </div>

        {/* Upgrade Pill Button */}
        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="px-2.5 py-1 bg-[#1A1917] hover:bg-[#D9542C] text-[#FAFAF7] font-bold text-[11px] rounded-xl shadow-xs transition"
        >
          Upgrade
        </button>
      </div>

      {/* Top-Right Floating Capsule Pill */}
      <div className="flex items-center gap-2 bg-[#FAFAF7]/95 backdrop-blur border border-[#D9D8D5] px-3 py-1.5 rounded-2xl shadow-md pointer-events-auto text-[#1A1917] text-xs font-medium relative">
        {/* 1. Timer Button & Interactive Popover */}
        <div className="relative">
          <button
            onClick={() => setIsTimerOpen(!isTimerOpen)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition ${
              isTimerOpen
                ? 'bg-amber-100 text-amber-700 font-bold'
                : effectiveIsRunning
                ? 'bg-amber-500/15 text-amber-600 font-bold ring-1 ring-amber-400/50'
                : effectiveSeconds === 0 && roomTimer?.hasFinished
                ? 'bg-rose-500/20 text-rose-600 font-bold animate-pulse ring-1 ring-rose-400'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Synchronized Workshop Timer & Gong Alert"
          >
            <Timer className={`w-4 h-4 ${effectiveIsRunning ? 'animate-spin' : ''}`} style={effectiveIsRunning ? { animationDuration: '6s' } : {}} />
            {(effectiveIsRunning || (effectiveSeconds !== 300 && effectiveSeconds > 0) || effectiveSeconds === 0) && (
              <span className={`font-mono text-xs font-bold ${effectiveSeconds === 0 ? 'text-rose-600 animate-pulse' : 'text-amber-700'}`}>
                {formatTimerTime(effectiveSeconds)}
              </span>
            )}
          </button>

          {isTimerOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur border border-slate-200 shadow-2xl rounded-2xl p-4 flex flex-col items-center gap-3.5 min-w-[260px] z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between w-full border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Workshop Timer</span>
                </div>
                {roomTimer && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Synced
                  </span>
                )}
              </div>

              {/* Countdown Digits Display */}
              <div
                className={`w-full py-3 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                  effectiveSeconds === 0
                    ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                    : effectiveIsRunning
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900 shadow-inner'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="text-4xl font-mono font-bold tracking-tight">
                  {formatTimerTime(effectiveSeconds)}
                </div>
                {effectiveSeconds === 0 && (
                  <span className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                    <Bell className="w-3 h-3 animate-bounce" /> Time is up!
                  </span>
                )}
                {roomTimer?.startedBy && (
                  <span className="text-[10px] text-slate-400 mt-1">
                    By {roomTimer.startedBy}
                  </span>
                )}
              </div>

              {/* Action Buttons: Start/Pause & Reset */}
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={handleToggleTimer}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 transition ${
                    effectiveIsRunning
                      ? 'bg-amber-500 hover:bg-amber-600 active:scale-95'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  {effectiveIsRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{effectiveSeconds === 0 ? 'Restart' : 'Start'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleResetTimer(300)}
                  title="Reset to 5:00"
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="w-full pt-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
                  Quick Presets
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { label: '1m', sec: 60 },
                    { label: '3m', sec: 180 },
                    { label: '5m', sec: 300 },
                    { label: '10m', sec: 600 },
                    { label: '15m', sec: 900 },
                  ].map(({ label, sec }) => (
                    <button
                      key={sec}
                      onClick={() => {
                        handleResetTimer(sec);
                        if (onStartTimer) onStartTimer(sec);
                        else setIsLocalTimerRunning(true);
                      }}
                      className={`py-1 rounded-lg text-xs font-medium transition border ${
                        effectiveSeconds === sec && !effectiveIsRunning
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Cue Audio Test Trigger */}
              <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Audio Chime Cue:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => soundEffects.playChime()}
                    title="Play crystal singing bowl chime"
                    className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 hover:bg-purple-100 border border-purple-200/60 rounded-lg text-[10px] font-semibold text-purple-700 transition"
                  >
                    <Volume2 className="w-3 h-3 text-purple-600" />
                    <span>Chime</span>
                  </button>
                  <button
                    onClick={() => soundEffects.playDeepGong()}
                    title="Play deep meditation gong sound"
                    className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 rounded-lg text-[10px] font-semibold text-amber-700 transition"
                  >
                    <Volume2 className="w-3 h-3 text-amber-600" />
                    <span>Gong</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Comments Button & Drawer */}
        <div className="relative">
          <button
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className={`relative p-1.5 rounded-xl transition ${
              isCommentsOpen ? 'bg-pink-100 text-pink-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Comments & Discussion (C)"
          >
            <MessageSquare className="w-4 h-4" />
            {openCommentsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-pink-600 text-white rounded-full text-[9px] font-bold shadow-xs">
                {openCommentsCount}
              </span>
            )}
          </button>

          {isCommentsOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur border border-slate-200 shadow-2xl rounded-2xl p-3.5 flex flex-col gap-3 w-80 max-h-[460px] z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-pink-600" />
                  <span className="text-xs font-bold text-slate-800">Board Discussions</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded-md">
                    {commentThreads.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {onActivateCommentTool && (
                    <button
                      onClick={() => {
                        onActivateCommentTool();
                        setIsCommentsOpen(false);
                      }}
                      title="Drop comment pin on canvas (C)"
                      className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-semibold transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Pin</span>
                    </button>
                  )}
                  <button onClick={() => setIsCommentsOpen(false)} className="text-slate-400 hover:text-slate-600 p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs: Open / Resolved / All */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold text-slate-600">
                <button
                  onClick={() => setCommentsFilter('open')}
                  className={`py-1 rounded-lg transition ${
                    commentsFilter === 'open' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Open ({openCommentsCount})
                </button>
                <button
                  onClick={() => setCommentsFilter('resolved')}
                  className={`py-1 rounded-lg transition ${
                    commentsFilter === 'resolved' ? 'bg-white text-emerald-600 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Resolved ({resolvedCommentsCount})
                </button>
                <button
                  onClick={() => setCommentsFilter('all')}
                  className={`py-1 rounded-lg transition ${
                    commentsFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  All ({commentThreads.length})
                </button>
              </div>

              {/* Threads List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-60 text-xs">
                {filteredThreads.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 space-y-1">
                    <MessageSquare className="w-6 h-6 mx-auto opacity-30" />
                    <p className="text-xs">No {commentsFilter} comments.</p>
                    <p className="text-[10px] text-slate-400">Click &quot;New Pin&quot; or press C on the canvas to comment.</p>
                  </div>
                ) : (
                  filteredThreads.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectCommentThread && onSelectCommentThread(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer group ${
                        t.resolved
                          ? 'bg-slate-50/60 border-slate-200/60 opacity-75 hover:opacity-100'
                          : 'bg-white hover:bg-blue-50/50 border-slate-200 hover:border-blue-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px]">
                            {t.authorName.slice(0, 1).toUpperCase()}
                          </span>
                          <span>{t.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          {t.resolved && (
                            <span className="px-1 py-0.2 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold">
                              Resolved
                            </span>
                          )}
                          <span>{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        {t.text}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                        <span>{t.replies?.length ? `${t.replies.length} replies` : 'No replies'}</span>
                        <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5">
                          Jump to pin →
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Comment Input */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Drop a note on canvas..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && commentInput.trim()) {
                      if (onAddComment) onAddComment(commentInput.trim());
                      setCommentInput('');
                    }
                  }}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
                />
                <button
                  onClick={() => {
                    if (!commentInput.trim()) return;
                    if (onAddComment) onAddComment(commentInput.trim());
                    setCommentInput('');
                  }}
                  disabled={!commentInput.trim()}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Video Call Collaboration Overlay */}
        <div className="relative">
          <button
            onClick={() => setIsVideoOpen(!isVideoOpen)}
            className={`p-1.5 rounded-xl transition ${
              isVideoOpen ? 'bg-purple-100 text-purple-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Video & Audio Chat"
          >
            <Video className="w-4 h-4" />
          </button>

          {isVideoOpen && (
            <div className="absolute right-0 top-full mt-2 bg-slate-900 text-white shadow-2xl rounded-2xl p-3.5 flex flex-col gap-3 min-w-[200px] z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200">Live Voice / Video</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="flex items-center gap-2 py-1">
                <img src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full border border-purple-400" />
                <div>
                  <div className="text-xs font-semibold text-white">{user?.name}</div>
                  <div className="text-[10px] text-emerald-400 font-medium">Connected</div>
                </div>
              </div>

              <div className="flex items-center justify-around pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-xl transition ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className={`p-2 rounded-xl transition ${isVideoMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                >
                  {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsVideoOpen(false)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-slate-200" />

        {/* 4. Presentation Mode Toggle Button */}
        <button
          onClick={togglePresentationMode}
          className={`p-1.5 rounded-xl transition ${
            isPresentationMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title={isPresentationMode ? 'Exit Presentation Mode' : 'Presentation Mode'}
        >
          <Presentation className="w-4 h-4" />
        </button>

        {/* Active Collaborators Online Pill */}
        {presences.length > 0 && (
          <div className="flex items-center -space-x-2 mr-1 animate-in fade-in zoom-in-95 duration-200">
            {presences.slice(0, 4).map((p) => (
              <div
                key={p.id}
                title={`${p.name} (Online)`}
                style={{ borderColor: p.color }}
                className="w-7 h-7 rounded-full border-2 bg-white flex items-center justify-center overflow-hidden shadow-xs relative hover:scale-110 transition-transform"
              >
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span
                    style={{ backgroundColor: p.color }}
                    className="w-full h-full text-white text-[10px] font-bold flex items-center justify-center uppercase"
                  >
                    {p.name.slice(0, 2)}
                  </span>
                )}
              </div>
            ))}
            {presences.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white text-slate-600 text-[10px] font-bold flex items-center justify-center shadow-xs">
                +{presences.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Primary Brand Share Button */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A1917] hover:bg-[#D9542C] text-[#FAFAF7] font-semibold text-xs shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-[#FAFAF7]" />
          <span>Share</span>
        </button>

        {/* 5. Right Board Details & Collaborators Sidebar Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-xl transition ${
              isSidebarOpen ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Board Details & Settings"
          >
            <PanelRight className="w-4 h-4" />
          </button>

          {isSidebarOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur border border-slate-200 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 min-w-[240px] z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">Board Overview</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Canvas Theme:</span>
                  <button
                    onClick={toggleCanvasTheme}
                    className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 font-medium capitalize"
                  >
                    {canvasTheme === 'dark' || canvasTheme === 'blueprint' ? (
                      <Moon className="w-3 h-3 text-indigo-500" />
                    ) : (
                      <Sun className="w-3 h-3 text-amber-500" />
                    )}
                    <span>{canvasTheme}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Canvas Grid:</span>
                  <button
                    onClick={toggleGrid}
                    className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 font-medium capitalize"
                  >
                    <Grid className="w-3 h-3 text-slate-500" />
                    <span>{gridStyle}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Owner:</span>
                  <button
                    onClick={onOpenProfileSettings}
                    className="font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    {user?.name || 'You'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Access:</span>
                  <span className="font-semibold text-emerald-600">Full Access</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. User Profile Avatar with SankalpLabs Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-0.5 rounded-full hover:ring-2 hover:ring-blue-500 transition cursor-pointer"
            title="Account Menu"
          >
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
              alt={user?.name || 'User'}
              className="w-6 h-6 rounded-full border border-slate-200 object-cover"
            />
          </button>

          <ProfileDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onOpenProfileSettings={onOpenProfileSettings}
            onOpenAdminConsole={onOpenAdminConsole}
            onOpenTrash={onOpenTrash}
            onOpenLearningCenter={onOpenLearningCenter}
            onOpenAppsModal={onOpenAppsModal}
            onOpenDeveloperHub={onOpenDeveloperHub}
            onOpenMarketplace={onOpenMarketplace}
            onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          />
        </div>
      </div>

      {/* Upgrade Pro Plan Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">Upgrade to Pro Plan</h3>
              </div>
              <button onClick={() => setIsUpgradeModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Unlimited Whiteboard Canvases & Backups</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>High-Res PNG & Vector SVG Export</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Real-Time Multi-User Video Collaboration</span>
              </div>
            </div>

            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              Start 14-Day Free Trial
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
