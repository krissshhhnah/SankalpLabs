import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MousePointer2,
  StickyNote,
  Square,
  RectangleHorizontal,
  Circle,
  Triangle,
  Diamond,
  Star,
  Hexagon,
  MessageSquare,
  ArrowRight,
  CornerUpRight,
  Minus,
  Type,
  GitCommitHorizontal,
  Pencil,
  PenTool,
  Paintbrush,
  Highlighter,
  Eraser,
  Check,
  Frame,
  Plus,
  Undo2,
  Redo2,
  Hand,
  Image as ImageIcon,
  ChevronRight,
  Code,
  Smile,
  Sticker,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { Tool, BoardObject, ImageObject } from '@whiteboard/shared';

interface ToolBarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onAddObject?: (obj: BoardObject) => void;
  isAiChatOpen?: boolean;
  onToggleAiChat?: () => void;
  onOpenAiModal?: () => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onAddObject,
  isAiChatOpen = false,
  onToggleAiChat,
  onOpenAiModal,
}) => {
  const {
    activeTool,
    setActiveTool,
    penStyle,
    setPenStyle,
    activeFillColor,
    setActiveFillColor,
    activeStrokeWidth,
    setActiveStrokeWidth,
    setSelectedIds,
  } = useUIStore();
  const [isShapesMenuOpen, setIsShapesMenuOpen] = useState(false);
  const [isPenMenuOpen, setIsPenMenuOpen] = useState(false);
  const [isMoreToolsOpen, setIsMoreToolsOpen] = useState(false);
  const [selectedShapeTool, setSelectedShapeTool] = useState<Tool>('rectangle');
  const shapesMenuRef = useRef<HTMLDivElement>(null);
  const penMenuRef = useRef<HTMLDivElement>(null);
  const moreToolsMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files).filter((file) => file.type.startsWith('image/'));

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        if (!src) return;

        const img = new Image();
        img.onload = () => {
          const originalWidth = img.naturalWidth || 400;
          const originalHeight = img.naturalHeight || 300;
          const aspectRatio = originalWidth / originalHeight;

          const width = Math.min(400, originalWidth);
          const height = Math.round(width / aspectRatio);

          const offsetX = index * 24 - width / 2;
          const offsetY = index * 24 - height / 2;

          const newImage: ImageObject = {
            id: `image-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            boardId: 'default',
            type: 'image',
            src,
            x: offsetX,
            y: offsetY,
            width,
            height,
            aspectRatio,
            originalWidth,
            originalHeight,
            rotation: 0,
            zIndex: Date.now(),
            locked: false,
            createdBy: 'user',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          if (onAddObject) onAddObject(newImage);
          setSelectedIds([newImage.id]);
          setActiveTool('select');
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddEmoji = (emoji: string) => {
    const newEmoji: BoardObject = {
      id: `text-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      boardId: 'default',
      type: 'text',
      x: -32,
      y: -32,
      width: 64,
      height: 64,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      createdBy: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      text: emoji,
      fontSize: 48,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      align: 'center',
    };
    if (onAddObject) onAddObject(newEmoji);
    setSelectedIds([newEmoji.id]);
    setIsMoreToolsOpen(false);
    setActiveTool('select');
  };

  const handleAddCommentPin = () => {
    setActiveTool('comment');
    setIsMoreToolsOpen(false);
  };

  const handleAddCodeSnippet = () => {
    const newCodeBlock: BoardObject = {
      id: `text-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      boardId: 'default',
      type: 'text',
      x: -120,
      y: -60,
      width: 240,
      height: 120,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      createdBy: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      text: '// Type your code here...\nfunction helloWorld() {\n  return "Whiteboard";\n}',
      fontSize: 14,
      fontFamily: 'monospace',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#38bdf8',
      backgroundColor: '#0f172a',
      align: 'left',
    };
    if (onAddObject) onAddObject(newCodeBlock);
    setSelectedIds([newCodeBlock.id]);
    setIsMoreToolsOpen(false);
    setActiveTool('select');
  };

  const handleAddMindmapNode = () => {
    const newNode: BoardObject = {
      id: `rounded-rectangle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      boardId: 'default',
      type: 'rounded-rectangle',
      x: -80,
      y: -40,
      width: 160,
      height: 80,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      createdBy: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fillColor: '#2563eb',
      strokeColor: '#60a5fa',
      strokeWidth: 3,
      opacity: 1,
      borderRadius: 20,
    };
    if (onAddObject) onAddObject(newNode);
    setSelectedIds([newNode.id]);
    setIsMoreToolsOpen(false);
    setActiveTool('select');
  };

  // Close flyout menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shapesMenuRef.current && !shapesMenuRef.current.contains(e.target as Node)) {
        setIsShapesMenuOpen(false);
      }
      if (penMenuRef.current && !penMenuRef.current.contains(e.target as Node)) {
        setIsPenMenuOpen(false);
      }
      if (moreToolsMenuRef.current && !moreToolsMenuRef.current.contains(e.target as Node)) {
        setIsMoreToolsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const basicShapes: { id: Tool; label: string; icon: React.ReactNode; shortcut?: string }[] = [
    { id: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" />, shortcut: 'R' },
    { id: 'rounded-rectangle', label: 'Rounded Rect', icon: <RectangleHorizontal className="w-4 h-4" /> },
    { id: 'ellipse', label: 'Circle / Ellipse', icon: <Circle className="w-4 h-4" />, shortcut: 'O' },
    { id: 'triangle', label: 'Triangle', icon: <Triangle className="w-4 h-4" /> },
    { id: 'diamond', label: 'Diamond', icon: <Diamond className="w-4 h-4" /> },
    { id: 'star', label: 'Star', icon: <Star className="w-4 h-4" /> },
    { id: 'hexagon', label: 'Hexagon', icon: <Hexagon className="w-4 h-4" /> },
    { id: 'bubble', label: 'Speech Bubble', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const lineShapes: { id: Tool; label: string; icon: React.ReactNode; shortcut?: string }[] = [
    { id: 'arrow', label: 'Straight Arrow', icon: <ArrowRight className="w-4 h-4" />, shortcut: 'A' },
    { id: 'curved-arrow', label: 'Curved Arrow', icon: <CornerUpRight className="w-4 h-4" /> },
    { id: 'line', label: 'Straight Line', icon: <Minus className="w-4 h-4" />, shortcut: 'L' },
  ];

  const penFormats: { id: 'pen' | 'highlighter' | 'marker' | 'dashed'; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'pen', label: 'Fine Pen', icon: <PenTool className="w-4 h-4 text-blue-600" />, desc: 'Thin precise vector stroke' },
    { id: 'marker', label: 'Marker', icon: <Paintbrush className="w-4 h-4 text-purple-600" />, desc: 'Bold opaque stroke' },
    { id: 'highlighter', label: 'Highlighter', icon: <Highlighter className="w-4 h-4 text-amber-500" />, desc: 'Translucent glowing stroke' },
    { id: 'dashed', label: 'Dashed Pen', icon: <Pencil className="w-4 h-4 text-slate-600" />, desc: 'Dashed line vector stroke' },
  ];

  const getShapeIcon = (toolId: Tool) => {
    switch (toolId) {
      case 'rounded-rectangle':
        return <RectangleHorizontal className="w-5 h-5" />;
      case 'ellipse':
        return <Circle className="w-5 h-5" />;
      case 'triangle':
        return <Triangle className="w-5 h-5" />;
      case 'diamond':
        return <Diamond className="w-5 h-5" />;
      case 'star':
        return <Star className="w-5 h-5" />;
      case 'hexagon':
        return <Hexagon className="w-5 h-5" />;
      case 'bubble':
        return <MessageSquare className="w-5 h-5" />;
      case 'arrow':
        return <ArrowRight className="w-5 h-5" />;
      case 'curved-arrow':
        return <CornerUpRight className="w-5 h-5" />;
      case 'line':
        return <Minus className="w-5 h-5" />;
      case 'rectangle':
      default:
        return <Square className="w-5 h-5" />;
    }
  };

  const isShapeActive = [
    'rectangle',
    'rounded-rectangle',
    'ellipse',
    'triangle',
    'diamond',
    'star',
    'hexagon',
    'bubble',
    'arrow',
    'curved-arrow',
    'line',
  ].includes(activeTool);
  const activeShapeTool = isShapeActive ? activeTool : selectedShapeTool;

  const handleSelectShape = (shapeId: Tool) => {
    setSelectedShapeTool(shapeId);
    setActiveTool(shapeId);
    setIsShapesMenuOpen(false);
  };

  return (
    <>
      {/* Main Tools Vertical Pill (Vertically Centered on Left) */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-40 pointer-events-auto select-none">
        <div className="bg-[#FAFAF7]/95 backdrop-blur border border-[#D9D8D5] shadow-md rounded-2xl p-1.5 flex flex-col gap-1 text-[#1A1917]">
        {/* Select Tool */}
        <button
          onClick={() => setActiveTool('select')}
          title="Select (V)"
          className={`group relative p-2 rounded-xl flex items-center justify-center transition ${
            activeTool === 'select'
              ? 'bg-[#1A1917] text-[#FAFAF7] shadow-xs'
              : 'text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE]'
          }`}
        >
          <MousePointer2 className="w-5 h-5 fill-current" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#1A1917] text-[#FAFAF7] rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
            Select (V)
          </span>
        </button>

        {/* Hand / Pan Tool */}
        <button
          onClick={() => setActiveTool('pan')}
          title="Hand / Pan (H)"
          className={`group relative p-2 rounded-xl flex items-center justify-center transition ${
            activeTool === 'pan'
              ? 'bg-[#1A1917] text-[#FAFAF7] shadow-xs'
              : 'text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE]'
          }`}
        >
          <Hand className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#1A1917] text-[#FAFAF7] rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
            Hand / Pan (H)
          </span>
        </button>

        {/* Sticky Note Tool */}
        <button
          onClick={() => setActiveTool('sticky')}
          title="Sticky Note (N)"
          className={`group relative p-2 rounded-xl flex items-center justify-center transition ${
            activeTool === 'sticky'
              ? 'bg-[#1A1917] text-[#FAFAF7] shadow-xs'
              : 'text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE]'
          }`}
        >
          <StickyNote className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
            Sticky Note (N)
          </span>
        </button>

        {/* Shapes Button with Interactive Flyout Sub-Menu */}
        <div ref={shapesMenuRef} className="relative">
          <button
            onClick={() => {
              setIsShapesMenuOpen(!isShapesMenuOpen);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsShapesMenuOpen(!isShapesMenuOpen);
            }}
            title="Shapes & Lines (Click to open shapes menu)"
            className={`group relative p-2 rounded-xl flex items-center justify-center transition ${
              isShapeActive
                ? 'bg-[#1A1917] text-[#FAFAF7] shadow-xs'
                : 'text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE]'
            }`}
          >
            {getShapeIcon(activeShapeTool)}
            <ChevronRight className="w-3 h-3 absolute -right-0.5 bottom-1 opacity-80" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#1A1917] text-[#FAFAF7] rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl z-50">
              Shapes & Lines (Click for popup menu)
            </span>
          </button>

          {/* Shapes Sub-Menu Popover */}
          {isShapesMenuOpen && (
            <div className="absolute left-full ml-3 top-0 bg-[#FAFAF7]/98 backdrop-blur border border-[#D9D8D5] shadow-2xl rounded-2xl p-3 flex flex-col gap-3 min-w-[240px] z-50 text-[#1A1917] animate-in fade-in zoom-in-95 duration-150">
              {/* Category 1: Basic Shapes */}
              <div>
                <div className="px-1 mb-2 text-[10px] font-bold text-[#5E5C56] uppercase tracking-wider">
                  Basic Shapes
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {basicShapes.map((opt) => {
                    const isSelected = activeTool === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectShape(opt.id)}
                        title={`${opt.label}${opt.shortcut ? ` (${opt.shortcut})` : ''}`}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium transition ${
                          isSelected
                            ? 'bg-[#1A1917] text-[#FAFAF7] shadow-xs scale-105'
                            : 'text-[#1A1917] hover:bg-[#F6E7DE] hover:text-[#A2502F]'
                        }`}
                      >
                        {opt.icon}
                        <span className="text-[10px] mt-1 truncate w-full text-center">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: Lines & Arrows */}
              <div className="border-t border-[#D9D8D5] pt-2">
                <div className="px-1 mb-2 text-[10px] font-bold text-[#5E5C56] uppercase tracking-wider">
                  Lines & Arrows
                </div>
                <div className="flex flex-col gap-1">
                  {lineShapes.map((opt) => {
                    const isSelected = activeTool === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectShape(opt.id)}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                          isSelected
                            ? 'bg-[#1A1917] text-[#FAFAF7] font-semibold shadow-xs'
                            : 'text-[#1A1917] hover:bg-[#F6E7DE] hover:text-[#A2502F]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {opt.icon}
                          <span>{opt.label}</span>
                        </div>
                        {opt.shortcut && (
                          <span className={`text-[10px] ${isSelected ? 'text-[#F6E7DE]' : 'text-[#5E5C56]'}`}>
                            ({opt.shortcut})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text Tool */}
        <button
          onClick={() => setActiveTool('text')}
          title="Text (T)"
          className={`group relative p-2 rounded-xl flex items-center justify-center transition ${
            activeTool === 'text'
              ? 'bg-[#1A1917] text-[#FAFAF7] shadow-xs'
              : 'text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE]'
          }`}
        >
          <Type className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#1A1917] text-[#FAFAF7] rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
            Text (T)
          </span>
        </button>

        {/* Connector Tool */}
        <button
          onClick={() => setActiveTool('connector')}
          title="Diagram Connection (C)"
          className={`group relative p-2 rounded-xl flex items-center justify-center transition ${
            activeTool === 'connector'
              ? 'bg-[#1A1917] text-[#FAFAF7] shadow-xs'
              : 'text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE]'
          }`}
        >
          <GitCommitHorizontal className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#1A1917] text-[#FAFAF7] rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
            Diagram Connection (C)
          </span>
        </button>

        {/* Pen / Draw Tool with Interactive Attached Popover */}
        <div ref={penMenuRef} className="relative">
          <button
            onClick={() => {
              if (activeTool === 'draw') {
                setIsPenMenuOpen(!isPenMenuOpen);
              } else {
                setActiveTool('draw');
                setIsPenMenuOpen(true);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsPenMenuOpen(!isPenMenuOpen);
            }}
            title="Pen, Highlighter & Eraser (Click for options)"
            className={`group relative p-2 rounded-xl flex items-center justify-center transition ${
              activeTool === 'draw'
                ? 'bg-[#1A1917] text-[#FAFAF7] shadow-xs'
                : 'text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE]'
            }`}
          >
            {penStyle === 'highlighter' ? (
              <Highlighter className="w-5 h-5" />
            ) : penStyle === 'eraser' ? (
              <Eraser className="w-5 h-5" />
            ) : (
              <Pencil className="w-5 h-5" />
            )}
            <ChevronRight className="w-3 h-3 absolute -right-0.5 bottom-1 opacity-80" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl z-50">
              Pen, Highlighter & Eraser (Click for menu)
            </span>
          </button>

          {/* Pen Tool Attached Popover Panel */}
          {isPenMenuOpen && (
            <div className="absolute left-full ml-3 top-0 bg-white/95 backdrop-blur border border-slate-200/90 shadow-2xl rounded-2xl p-3.5 flex flex-col gap-3.5 min-w-[260px] z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              {/* 1. Tool Mode Switcher (Pen, Highlighter, Eraser) */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Drawing Mode
                </div>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      setPenStyle('pen');
                      setActiveTool('draw');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      penStyle === 'pen' || penStyle === 'marker'
                        ? 'bg-white text-blue-600 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Pen</span>
                  </button>

                  <button
                    onClick={() => {
                      setPenStyle('highlighter');
                      setActiveTool('draw');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      penStyle === 'highlighter'
                        ? 'bg-white text-amber-600 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                    <span>Highlighter</span>
                  </button>

                  <button
                    onClick={() => {
                      setPenStyle('eraser');
                      setActiveTool('draw');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      penStyle === 'eraser'
                        ? 'bg-white text-rose-600 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Eraser</span>
                  </button>
                </div>
              </div>

              {/* 2. Thickness / Size Controls (visible for Pen, Highlighter & Eraser) */}
              <div className="border-t border-slate-100 pt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>{penStyle === 'eraser' ? 'Eraser Size' : 'Thickness'}</span>
                  <span className="font-semibold text-slate-800">{activeStrokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min={penStyle === 'eraser' ? '4' : '1'}
                  max={penStyle === 'eraser' ? '64' : '24'}
                  value={activeStrokeWidth}
                  onChange={(e) => setActiveStrokeWidth(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer outline-none"
                />
                <div className="flex items-center justify-between pt-1">
                  {(penStyle === 'eraser' ? [8, 16, 24, 40] : [2, 4, 8, 16]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setActiveStrokeWidth(size)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                        activeStrokeWidth === size
                          ? 'bg-blue-100 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Color Swatches (visible for Pen & Highlighter) */}
              {penStyle !== 'eraser' && (
                <div className="border-t border-slate-100 pt-2 flex flex-col gap-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Color
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      '#1A1917', // Ink Black
                      '#A2502F', // Terracotta
                      '#D9542C', // Vibrant Orange
                      '#F6E7DE', // Soft Blush
                      '#5E5C56', // Warm Grey
                      '#D9D8D5', // Soft Stone
                      '#FAFAF7', // Warm Ivory
                      '#3b82f6',
                      '#10b981',
                      '#ffffff',
                    ].map((color) => {
                      const isSelected = activeFillColor.toLowerCase() === color.toLowerCase();
                      const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fafaf7';
                      return (
                        <button
                          key={color}
                          onClick={() => setActiveFillColor(color)}
                          style={{ backgroundColor: color }}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition shadow-sm hover:scale-110 relative ${
                            isWhite ? 'border-slate-300' : 'border-transparent'
                          } ${isSelected ? 'ring-2 ring-[#D9542C] ring-offset-2 scale-105' : ''}`}
                        >
                          {isSelected && (
                            <Check
                              className={`w-3.5 h-3.5 ${isWhite ? 'text-slate-800' : 'text-white'}`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Direct Image / Asset Upload Tool */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Upload Image / Asset (Click, or Drag & Drop / Paste)"
          className="group relative p-2 rounded-xl flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl z-50">
            Upload Image / Asset
          </span>
        </button>

        {/* Comment Pin Tool */}
        <button
          onClick={() => setActiveTool('comment')}
          title="Comment Pin"
          className={`group relative p-2 rounded-xl flex items-center justify-center transition ${
            activeTool === 'comment'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl z-50">
            Comment Pin
          </span>
        </button>

        {/* More Tools (+ ) Flyout Popover */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <div ref={moreToolsMenuRef} className="relative">
          <button
            onClick={() => setIsMoreToolsOpen(!isMoreToolsOpen)}
            title="More Tools (+)"
            className={`group relative p-2 rounded-xl flex items-center justify-center transition ${
              isMoreToolsOpen
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl z-50">
              More Tools (+)
            </span>
          </button>

          {/* More Tools Popover Window */}
          {isMoreToolsOpen && (
            <div className="absolute left-full ml-3 bottom-0 bg-white/95 backdrop-blur border border-slate-200/90 shadow-2xl rounded-2xl p-3.5 flex flex-col gap-3.5 min-w-[290px] max-h-[calc(100vh-140px)] overflow-y-auto z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              {/* Category 1: Media & Containers */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Media & Containers
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveTool('image');
                      fileInputRef.current?.click();
                      setIsMoreToolsOpen(false);
                    }}
                    className="flex flex-col items-start p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 rounded-xl text-left transition group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                        Upload Image
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      Import PNG, JPG, SVG files
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTool('frame');
                      setIsMoreToolsOpen(false);
                    }}
                    className="flex flex-col items-start p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200/80 hover:border-purple-300 rounded-xl text-left transition group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Frame className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-purple-600">
                        Project Frame
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      Group elements in artboard
                    </span>
                  </button>
                </div>
              </div>

              {/* Category 2: Emojis & Reaction Stamps */}
              <div className="border-t border-slate-100 pt-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Emojis & Reaction Stamps
                </div>
                <div className="grid grid-cols-6 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                  {['🚀', '💡', '🔥', '👍', '❤️', '🎉', '⭐', '📌', '🎯', '💬', '⚡', '🎨'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddEmoji(emoji)}
                      title={`Insert ${emoji}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white hover:scale-125 hover:shadow-sm transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 3: Workplace Modules */}
              <div className="border-t border-slate-100 pt-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Workplace Modules
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={handleAddCommentPin}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-pink-50 border border-slate-200/80 hover:border-pink-300 rounded-xl text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-pink-500" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-pink-600">
                          Comment Thread Pin
                        </div>
                        <div className="text-[10px] text-slate-500">Add feedback comment card</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleAddCodeSnippet}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 rounded-xl text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Code className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-600">
                          Code Snippet Box
                        </div>
                        <div className="text-[10px] text-slate-500">Dark code card with monospace font</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleAddMindmapNode}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 rounded-xl text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Smile className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                          Mindmap Central Node
                        </div>
                        <div className="text-[10px] text-slate-500">Idea bubble for diagramming</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Bottom-Left Section: AI Assistant & Undo/Redo */}
      <div className="absolute left-3 bottom-3 z-40 pointer-events-auto select-none flex flex-col gap-2 items-center">
        {/* AI Assistant Button (Brought down from top) */}
        <div className="bg-[#FAFAF7]/95 backdrop-blur border border-[#D9D8D5] shadow-md rounded-2xl p-1.5 flex flex-col items-center">
          <button
            onClick={() => {
              if (onOpenAiModal) onOpenAiModal();
              else if (onToggleAiChat) onToggleAiChat();
            }}
            title="Sankalp AI Copilot (⌘K)"
            className={`group relative p-2 rounded-xl transition flex items-center justify-center cursor-pointer ${
              isAiChatOpen
                ? 'bg-[#1A1917] text-[#FAFAF7] shadow-sm ring-2 ring-[#D9542C]'
                : 'text-[#1A1917] hover:bg-[#F6E7DE] hover:text-[#A2502F]'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${isAiChatOpen ? 'fill-[#D9542C] text-[#D9542C]' : 'fill-[#F6E7DE] text-[#A2502F]'}`} />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#1A1917] text-[#FAFAF7] rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl z-50 flex items-center gap-1.5">
              <span>Sankalp AI Copilot</span>
              <kbd className="px-1 py-0.5 bg-[#5E5C56]/40 border border-[#D9D8D5]/30 rounded text-[9px] text-[#FAFAF7] font-mono">⌘K</kbd>
            </span>
          </button>
        </div>

        {/* Undo / Redo Pill */}
        <div className="bg-[#FAFAF7]/95 backdrop-blur border border-[#D9D8D5] shadow-md rounded-2xl p-1.5 flex flex-col gap-1 text-[#1A1917]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="group relative p-2 rounded-xl text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE] disabled:opacity-30 disabled:hover:bg-transparent transition flex items-center justify-center cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#1A1917] text-[#FAFAF7] rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
              Undo
            </span>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="group relative p-2 rounded-xl text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE] disabled:opacity-30 disabled:hover:bg-transparent transition flex items-center justify-center cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
              Redo
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
