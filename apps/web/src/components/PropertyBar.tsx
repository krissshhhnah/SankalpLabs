import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { BoardObject, ArrowHeadStyle, ShapeFillStyle, StrokeStyle } from '@whiteboard/shared';
import {
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalSpaceBetween,
  AlignVerticalSpaceBetween,
  List,
  ListOrdered,
  Link as LinkIcon,
  Highlighter,
  MessageSquare,
  Lock,
  Unlock,
  MoreVertical,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Check,
  Palette,
  Boxes,
  Eye,
  PaintBucket,
  Minus,
  MoveRight,
  Spline,
  Square,
  Circle,
  Shapes,
  Image as ImageIcon,
} from 'lucide-react';

interface PropertyBarProps {
  objects?: BoardObject[];
  onDeleteSelected?: () => void;
  onUpdateObject?: (id: string, update: any) => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onToggleLock?: () => void;
  onDuplicate?: () => void;
}

export const PropertyBar: React.FC<PropertyBarProps> = ({
  objects = [],
  onDeleteSelected,
  onUpdateObject,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onDuplicate,
}) => {
  const {
    activeTool,
    selectedIds,
    editingTextId,
    activeTextColor,
    setActiveTextColor,
    activeFontSize,
    setActiveFontSize,
  } = useUIStore();

  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [isAlignDropdownOpen, setIsAlignDropdownOpen] = useState(false);
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [isBgColorOpen, setIsBgColorOpen] = useState(false);
  const [isFillColorOpen, setIsFillColorOpen] = useState(false);
  const [isStrokeColorOpen, setIsStrokeColorOpen] = useState(false);
  const [isStrokeWidthOpen, setIsStrokeWidthOpen] = useState(false);
  const [isFillPatternOpen, setIsFillPatternOpen] = useState(false);
  const [isArrowHeadOpen, setIsArrowHeadOpen] = useState(false);
  const [isOpacityOpen, setIsOpacityOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const [linkInput, setLinkInput] = useState('');

  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const alignMenuRef = useRef<HTMLDivElement>(null);
  const textColorMenuRef = useRef<HTMLDivElement>(null);
  const bgColorMenuRef = useRef<HTMLDivElement>(null);
  const fillColorMenuRef = useRef<HTMLDivElement>(null);
  const strokeColorMenuRef = useRef<HTMLDivElement>(null);
  const strokeWidthMenuRef = useRef<HTMLDivElement>(null);
  const fillPatternMenuRef = useRef<HTMLDivElement>(null);
  const arrowHeadMenuRef = useRef<HTMLDivElement>(null);
  const opacityMenuRef = useRef<HTMLDivElement>(null);
  const linkMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close flyout popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (fontMenuRef.current && !fontMenuRef.current.contains(target)) setIsFontDropdownOpen(false);
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(target)) setIsSizeDropdownOpen(false);
      if (alignMenuRef.current && !alignMenuRef.current.contains(target)) setIsAlignDropdownOpen(false);
      if (textColorMenuRef.current && !textColorMenuRef.current.contains(target)) setIsTextColorOpen(false);
      if (bgColorMenuRef.current && !bgColorMenuRef.current.contains(target)) setIsBgColorOpen(false);
      if (fillColorMenuRef.current && !fillColorMenuRef.current.contains(target)) setIsFillColorOpen(false);
      if (strokeColorMenuRef.current && !strokeColorMenuRef.current.contains(target)) setIsStrokeColorOpen(false);
      if (strokeWidthMenuRef.current && !strokeWidthMenuRef.current.contains(target)) setIsStrokeWidthOpen(false);
      if (fillPatternMenuRef.current && !fillPatternMenuRef.current.contains(target)) setIsFillPatternOpen(false);
      if (arrowHeadMenuRef.current && !arrowHeadMenuRef.current.contains(target)) setIsArrowHeadOpen(false);
      if (opacityMenuRef.current && !opacityMenuRef.current.contains(target)) setIsOpacityOpen(false);
      if (linkMenuRef.current && !linkMenuRef.current.contains(target)) setIsLinkOpen(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) setIsMoreOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMultiSelect = selectedIds.length > 1;
  const selectedObjects = objects.filter((o) => selectedIds.includes(o.id));

  // Alignment handlers for multi-selection
  const handleAlign = (alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
    if (!onUpdateObject || selectedObjects.length < 2) return;
    const now = Date.now();

    if (alignment === 'left') {
      const minX = Math.min(...selectedObjects.map((o) => o.x));
      selectedObjects.forEach((o) => {
        if (!o.locked) onUpdateObject(o.id, { x: minX, updatedAt: now });
      });
    } else if (alignment === 'center-h') {
      const minX = Math.min(...selectedObjects.map((o) => o.x));
      const maxX = Math.max(...selectedObjects.map((o) => o.x + (o.width || 0)));
      const centerX = (minX + maxX) / 2;
      selectedObjects.forEach((o) => {
        if (!o.locked) onUpdateObject(o.id, { x: Math.round(centerX - (o.width || 0) / 2), updatedAt: now });
      });
    } else if (alignment === 'right') {
      const maxX = Math.max(...selectedObjects.map((o) => o.x + (o.width || 0)));
      selectedObjects.forEach((o) => {
        if (!o.locked) onUpdateObject(o.id, { x: Math.round(maxX - (o.width || 0)), updatedAt: now });
      });
    } else if (alignment === 'top') {
      const minY = Math.min(...selectedObjects.map((o) => o.y));
      selectedObjects.forEach((o) => {
        if (!o.locked) onUpdateObject(o.id, { y: minY, updatedAt: now });
      });
    } else if (alignment === 'center-v') {
      const minY = Math.min(...selectedObjects.map((o) => o.y));
      const maxY = Math.max(...selectedObjects.map((o) => o.y + (o.height || 0)));
      const centerY = (minY + maxY) / 2;
      selectedObjects.forEach((o) => {
        if (!o.locked) onUpdateObject(o.id, { y: Math.round(centerY - (o.height || 0) / 2), updatedAt: now });
      });
    } else if (alignment === 'bottom') {
      const maxY = Math.max(...selectedObjects.map((o) => o.y + (o.height || 0)));
      selectedObjects.forEach((o) => {
        if (!o.locked) onUpdateObject(o.id, { y: Math.round(maxY - (o.height || 0)), updatedAt: now });
      });
    }
  };

  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    if (!onUpdateObject || selectedObjects.length < 3) return;
    const now = Date.now();

    if (direction === 'horizontal') {
      const sorted = [...selectedObjects].sort(
        (a, b) => a.x + (a.width || 0) / 2 - (b.x + (b.width || 0) / 2)
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const span = last.x + (last.width || 0) - first.x;
      const totalWidth = sorted.reduce((sum, o) => sum + (o.width || 0), 0);
      const gap = (span - totalWidth) / (sorted.length - 1);

      let currentX = first.x;
      sorted.forEach((o) => {
        if (!o.locked) {
          onUpdateObject(o.id, { x: Math.round(currentX), updatedAt: now });
        }
        currentX += (o.width || 0) + gap;
      });
    } else {
      const sorted = [...selectedObjects].sort(
        (a, b) => a.y + (a.height || 0) / 2 - (b.y + (b.height || 0) / 2)
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const span = last.y + (last.height || 0) - first.y;
      const totalHeight = sorted.reduce((sum, o) => sum + (o.height || 0), 0);
      const gap = (span - totalHeight) / (sorted.length - 1);

      let currentY = first.y;
      sorted.forEach((o) => {
        if (!o.locked) {
          onUpdateObject(o.id, { y: Math.round(currentY), updatedAt: now });
        }
        currentY += (o.height || 0) + gap;
      });
    }
  };

  const handleBatchColor = (color: string) => {
    if (!onUpdateObject) return;
    const now = Date.now();
    selectedObjects.forEach((o) => {
      if (o.locked) return;
      if (o.type === 'sticky') {
        onUpdateObject(o.id, { color, updatedAt: now });
      } else if (o.type === 'text') {
        onUpdateObject(o.id, { color, updatedAt: now });
      } else if ('fillColor' in o) {
        onUpdateObject(o.id, { fillColor: color, updatedAt: now });
      } else if ('strokeColor' in o) {
        onUpdateObject(o.id, { strokeColor: color, updatedAt: now });
      }
    });
  };

  // 1. Multiple Objects Selection Toolbar
  if (isMultiSelect && selectedObjects.length >= 2) {
    const allLocked = selectedObjects.every((o) => o.locked);
    const canDistribute = selectedObjects.length >= 3;

    return (
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-white/95 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 text-slate-700 select-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
          <Boxes className="w-3.5 h-3.5" />
          <span>{selectedObjects.length} items</span>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Horizontal Alignment */}
        <div className="flex items-center gap-0.5">
          <button onClick={() => handleAlign('left')} title="Align Left" className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
            <AlignStartVertical className="w-4 h-4" />
          </button>
          <button onClick={() => handleAlign('center-h')} title="Align Center Horizontal" className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
            <AlignCenterHorizontal className="w-4 h-4" />
          </button>
          <button onClick={() => handleAlign('right')} title="Align Right" className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
            <AlignEndVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Vertical Alignment */}
        <div className="flex items-center gap-0.5">
          <button onClick={() => handleAlign('top')} title="Align Top" className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
            <AlignStartHorizontal className="w-4 h-4" />
          </button>
          <button onClick={() => handleAlign('center-v')} title="Align Center Vertical" className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
            <AlignCenterVertical className="w-4 h-4" />
          </button>
          <button onClick={() => handleAlign('bottom')} title="Align Bottom" className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
            <AlignEndHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Distribution */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => handleDistribute('horizontal')}
            disabled={!canDistribute}
            title={canDistribute ? 'Distribute Horizontally' : 'Select 3 or more items to distribute'}
            className={`p-1.5 rounded-lg transition ${canDistribute ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-300 cursor-not-allowed'}`}
          >
            <AlignHorizontalSpaceBetween className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDistribute('vertical')}
            disabled={!canDistribute}
            title={canDistribute ? 'Distribute Vertically' : 'Select 3 or more items to distribute'}
            className={`p-1.5 rounded-lg transition ${canDistribute ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-300 cursor-not-allowed'}`}
          >
            <AlignVerticalSpaceBetween className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Batch Color */}
        <div ref={bgColorMenuRef} className="relative">
          <button
            onClick={() => setIsBgColorOpen(!isBgColorOpen)}
            title="Batch Change Color"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1"
          >
            <Palette className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isBgColorOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-2.5 grid grid-cols-5 gap-1.5 min-w-[150px] z-50 animate-in fade-in zoom-in-95 duration-100">
              {['#F6E7DE', '#FAFAF7', '#D9D8D5', '#1A1917', '#A2502F', '#D9542C', '#5E5C56', '#fef08a', '#bbf7d0', '#bfdbfe'].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    handleBatchColor(color);
                    setIsBgColorOpen(false);
                  }}
                  style={{ backgroundColor: color }}
                  className="w-6 h-6 rounded-full border border-slate-300 hover:scale-110 transition shadow-sm"
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Lock/Unlock */}
        <button
          onClick={onToggleLock}
          title={allLocked ? 'Unlock All' : 'Lock All'}
          className={`p-1.5 rounded-lg transition ${allLocked ? 'bg-amber-100 text-amber-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          {allLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>

        {/* More Actions */}
        <div ref={moreMenuRef} className="relative">
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            title="More Batch Actions"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMoreOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-1.5 flex flex-col gap-0.5 min-w-[160px] z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              {onDuplicate && (
                <button onClick={() => { onDuplicate(); setIsMoreOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition">
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate All</span>
                </button>
              )}
              {onBringToFront && (
                <button onClick={() => { onBringToFront(); setIsMoreOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition">
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Bring All to Front</span>
                </button>
              )}
              {onSendToBack && (
                <button onClick={() => { onSendToBack(); setIsMoreOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition">
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Send All to Back</span>
                </button>
              )}
              {onDeleteSelected && (
                <button onClick={() => { onDeleteSelected(); setIsMoreOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition border-t border-slate-100 mt-0.5 pt-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Single Object Selection
  const activeTargetId = editingTextId || (selectedIds.length === 1 ? selectedIds[0] : null);
  const targetObj = objects.find((o) => o.id === activeTargetId);

  if (!targetObj && selectedIds.length === 0 && activeTool !== 'text') return null;

  const isTextOnly = targetObj?.type === 'text' || activeTool === 'text';
  const isSticky = targetObj?.type === 'sticky';
  const isShape = targetObj && [
    'rectangle',
    'rounded-rectangle',
    'ellipse',
    'triangle',
    'diamond',
    'star',
    'hexagon',
    'bubble',
  ].includes(targetObj.type);
  const isLineOrArrow = targetObj && ['line', 'arrow', 'curved-arrow'].includes(targetObj.type);
  const isConnector = targetObj?.type === 'connector';
  const isLineOrConnector = isLineOrArrow || isConnector;
  const isImage = targetObj?.type === 'image';

  // Fonts available
  const fontFamilies = [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Abril Fatface', family: "'Abril Fatface', display" },
    { name: 'Roboto', family: 'Roboto, sans-serif' },
    { name: 'Outfit', family: 'Outfit, sans-serif' },
    { name: 'Playfair Display', family: "'Playfair Display', serif" },
    { name: 'Caveat', family: 'Caveat, cursive' },
    { name: 'Fira Code', family: "'Fira Code', monospace" },
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 72];
  const colorSwatches = [
    '#1A1917', // Ink Black
    '#FAFAF7', // Warm Ivory
    '#A2502F', // Terracotta
    '#D9542C', // Vibrant Orange
    '#F6E7DE', // Soft Blush
    '#5E5C56', // Warm Grey
    '#D9D8D5', // Soft Stone
    '#3b82f6',
    '#10b981',
    '#ef4444',
  ];
  const stickyBgColors = ['#F6E7DE', '#FAFAF7', '#D9D8D5', '#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#ffffff'];

  // Current values
  const currentFontFamily = (targetObj as any)?.fontFamily || 'Inter, sans-serif';
  const currentFontName = fontFamilies.find((f) => f.family === currentFontFamily)?.name || 'Inter';
  const currentFontSize = (targetObj as any)?.fontSize || activeFontSize || 18;
  const isBold = (targetObj as any)?.fontWeight === 'bold';
  const isItalic = (targetObj as any)?.fontStyle === 'italic';
  const isUnderline = (targetObj as any)?.textDecoration === 'underline';
  const isStrikethrough = (targetObj as any)?.textDecoration === 'line-through';
  const currentAlign = (targetObj as any)?.textAlign || (targetObj as any)?.align || (isSticky ? 'center' : 'left');
  const currentTextColor = targetObj
    ? targetObj.type === 'sticky'
      ? (targetObj as any).textColor || '#000000'
      : (targetObj as any)?.color || '#000000'
    : activeTextColor || '#000000';
  const currentBgColor = targetObj?.type === 'sticky' ? (targetObj as any).color : (targetObj as any)?.backgroundColor || 'transparent';
  const currentFillColor = (targetObj as any)?.fillColor || '#3b82f6';
  const currentStrokeColor = (targetObj as any)?.strokeColor || '#1e293b';
  const currentStrokeWidth = (targetObj as any)?.strokeWidth || 2;
  const currentFillStyle: ShapeFillStyle = (targetObj as any)?.fillStyle || 'solid';
  const currentEndArrowStyle: ArrowHeadStyle = (targetObj as any)?.endArrowStyle || 'arrow';
  const currentStartArrowStyle: ArrowHeadStyle = (targetObj as any)?.startArrowStyle || 'none';
  const currentOpacity = Math.round(((targetObj as any)?.opacity !== undefined ? (targetObj as any).opacity : 1) * 100);
  const isLocked = targetObj?.locked || false;

  const updateProp = (key: string, val: any) => {
    if (key === 'color' || key === 'textColor') setActiveTextColor(val);
    if (key === 'fontSize') setActiveFontSize(val);

    if (!onUpdateObject) return;
    const idsToUpdate = activeTargetId ? [activeTargetId] : selectedIds;
    idsToUpdate.forEach((id) => {
      const payload: any = { [key]: val, updatedAt: Date.now() };
      if (key === 'align') payload['textAlign'] = val;
      if (key === 'textAlign') payload['align'] = val;
      if (key === 'color' && targetObj?.type === 'sticky') payload['color'] = val;
      if (key === 'textColor' && targetObj?.type === 'sticky') payload['textColor'] = val;
      onUpdateObject(id, payload);
    });
  };

  const toggleListFormat = (type: 'bullet' | 'numbered') => {
    if (!targetObj || !onUpdateObject || !(targetObj as any).text) return;
    const lines = ((targetObj as any).text as string).split('\n');
    let newText = '';

    const hasBullets = lines.every((l) => l.trim().startsWith('• '));
    const hasNumbers = lines.every((l) => /^\d+\.\s/.test(l.trim()));

    if (type === 'bullet') {
      if (hasBullets) {
        newText = lines.map((l) => l.replace(/^•\s*/, '')).join('\n');
      } else {
        newText = lines.map((l) => `• ${l.replace(/^(\d+\.\s*|•\s*)/, '')}`).join('\n');
      }
    } else {
      if (hasNumbers) {
        newText = lines.map((l) => l.replace(/^\d+\.\s*/, '')).join('\n');
      } else {
        newText = lines.map((l, idx) => `${idx + 1}. ${l.replace(/^(\d+\.\s*|•\s*)/, '')}`).join('\n');
      }
    }
    updateProp('text', newText);
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-white/95 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 text-slate-700 select-none">
      {/* ── Type Icon ── */}
      <div className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center">
        {isShape ? (
          <Shapes className="w-4 h-4 text-blue-600" />
        ) : isLineOrConnector ? (
          <MoveRight className="w-4 h-4 text-indigo-600" />
        ) : isImage ? (
          <ImageIcon className="w-4 h-4 text-purple-600" />
        ) : (
          <Type className="w-4 h-4 text-slate-700" />
        )}
      </div>

      <div className="w-px h-5 bg-slate-200" />

      {/* ── A. Shape Specific Controls ── */}
      {isShape && (
        <>
          {/* Fill Color Picker */}
          <div ref={fillColorMenuRef} className="relative">
            <button
              onClick={() => setIsFillColorOpen(!isFillColorOpen)}
              title="Shape Fill Color"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span className="w-4 h-4 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: currentFillColor }} />
              <span className="text-[11px] font-mono">{currentFillColor}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isFillColorOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-2.5 grid grid-cols-5 gap-1.5 min-w-[150px] z-50 animate-in fade-in zoom-in-95 duration-100">
                {colorSwatches.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      updateProp('fillColor', col);
                      setIsFillColorOpen(false);
                    }}
                    style={{ backgroundColor: col }}
                    className="w-6 h-6 rounded-full border border-slate-300 hover:scale-110 transition shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200" />

          {/* Fill Pattern / Style (Solid, Semi, Transparent, Hachure, Dots) */}
          <div ref={fillPatternMenuRef} className="relative">
            <button
              onClick={() => setIsFillPatternOpen(!isFillPatternOpen)}
              title="Shape Fill Style"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 transition capitalize"
            >
              <PaintBucket className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentFillStyle}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isFillPatternOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-1.5 flex flex-col gap-0.5 min-w-[140px] z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                {[
                  { id: 'solid', label: 'Solid Color' },
                  { id: 'semi', label: 'Semi Glass (35%)' },
                  { id: 'transparent', label: 'Outline Only' },
                  { id: 'hachure', label: 'Hatched Pattern' },
                  { id: 'dots', label: 'Dotted Pattern' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      updateProp('fillStyle', s.id);
                      setIsFillPatternOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      currentFillStyle === s.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{s.label}</span>
                    {currentFillStyle === s.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200" />

          {/* Stroke Color Picker */}
          <div ref={strokeColorMenuRef} className="relative">
            <button
              onClick={() => setIsStrokeColorOpen(!isStrokeColorOpen)}
              title="Stroke Color"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-700" style={{ borderColor: currentStrokeColor }} />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isStrokeColorOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-2.5 grid grid-cols-5 gap-1.5 min-w-[150px] z-50 animate-in fade-in zoom-in-95 duration-100">
                {colorSwatches.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      updateProp('strokeColor', col);
                      setIsStrokeColorOpen(false);
                    }}
                    style={{ backgroundColor: col }}
                    className="w-6 h-6 rounded-full border border-slate-300 hover:scale-110 transition shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stroke Width Selector */}
          <div ref={strokeWidthMenuRef} className="relative">
            <button
              onClick={() => setIsStrokeWidthOpen(!isStrokeWidthOpen)}
              title="Stroke Thickness"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition text-xs font-semibold"
            >
              <span>{currentStrokeWidth}px</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isStrokeWidthOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-1.5 flex flex-col gap-0.5 min-w-[110px] z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                {[1, 2, 4, 8].map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      updateProp('strokeWidth', w);
                      setIsStrokeWidthOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                      currentStrokeWidth === w ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-0.5 bg-slate-700 rounded-full" style={{ height: `${w}px` }} />
                      <span>{w}px</span>
                    </div>
                    {currentStrokeWidth === w && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200" />
        </>
      )}

      {/* ── B. Line, Arrow & Connector Controls ── */}
      {isLineOrConnector && (
        <>
          {/* Stroke Color */}
          <div ref={strokeColorMenuRef} className="relative">
            <button
              onClick={() => setIsStrokeColorOpen(!isStrokeColorOpen)}
              title="Line / Arrow Color"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              <span className="w-4 h-4 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: currentStrokeColor }} />
              <span className="text-[11px] font-mono">{currentStrokeColor}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isStrokeColorOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-2.5 grid grid-cols-5 gap-1.5 min-w-[150px] z-50 animate-in fade-in zoom-in-95 duration-100">
                {colorSwatches.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      updateProp('strokeColor', col);
                      setIsStrokeColorOpen(false);
                    }}
                    style={{ backgroundColor: col }}
                    className="w-6 h-6 rounded-full border border-slate-300 hover:scale-110 transition shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stroke Thickness */}
          <div ref={strokeWidthMenuRef} className="relative">
            <button
              onClick={() => setIsStrokeWidthOpen(!isStrokeWidthOpen)}
              title="Line Thickness"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition text-xs font-semibold"
            >
              <span>{currentStrokeWidth}px</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isStrokeWidthOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-1.5 flex flex-col gap-0.5 min-w-[110px] z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                {[1, 2, 4, 8, 12].map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      updateProp('strokeWidth', w);
                      setIsStrokeWidthOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                      currentStrokeWidth === w ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 bg-slate-700 rounded-full" style={{ height: `${Math.min(6, w)}px` }} />
                      <span>{w}px</span>
                    </div>
                    {currentStrokeWidth === w && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200" />

          {/* End Arrowhead Style */}
          <div ref={arrowHeadMenuRef} className="relative">
            <button
              onClick={() => setIsArrowHeadOpen(!isArrowHeadOpen)}
              title="Arrow Endpoints Style"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 transition capitalize"
            >
              <MoveRight className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentEndArrowStyle}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isArrowHeadOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-1.5 flex flex-col gap-0.5 min-w-[150px] z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Cap</div>
                {[
                  { id: 'arrow', label: 'Arrowhead' },
                  { id: 'circle', label: 'Circle Dot' },
                  { id: 'diamond', label: 'Diamond' },
                  { id: 'bar', label: 'Perpendicular Bar' },
                  { id: 'none', label: 'Plain Line' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      updateProp('endArrowStyle', s.id);
                      updateProp('endArrow', s.id !== 'none');
                      setIsArrowHeadOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      currentEndArrowStyle === s.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{s.label}</span>
                    {currentEndArrowStyle === s.id && <Check className="w-3 h-3" />}
                  </button>
                ))}

                <div className="my-1 border-t border-slate-100" />

                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Cap</div>
                {[
                  { id: 'none', label: 'None' },
                  { id: 'arrow', label: 'Arrowhead' },
                  { id: 'circle', label: 'Circle Dot' },
                  { id: 'diamond', label: 'Diamond' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      updateProp('startArrowStyle', s.id);
                      updateProp('startArrow', s.id !== 'none');
                      setIsArrowHeadOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      currentStartArrowStyle === s.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{s.label}</span>
                    {currentStartArrowStyle === s.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Curve / Elbow Routing Toggle */}
          <button
            onClick={() => {
              if (isConnector) {
                const newStyle = (targetObj as any)?.style === 'elbow' ? 'straight' : 'elbow';
                updateProp('style', newStyle);
              } else {
                const newStyle = (targetObj as any)?.style === 'curved' ? 'straight' : 'curved';
                updateProp('style', newStyle);
              }
            }}
            title={isConnector ? 'Toggle Elbow / Straight' : 'Toggle Curved / Straight'}
            className={`p-1.5 rounded-lg text-xs font-semibold transition ${
              (targetObj as any)?.style === 'curved' || (targetObj as any)?.style === 'elbow'
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Spline className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200" />
        </>
      )}

      {/* ── C. Text & Sticky Controls ── */}
      {(isTextOnly || isSticky) && (
        <>
          {/* Font Family (Text Only) */}
          {isTextOnly && (
            <div ref={fontMenuRef} className="relative">
              <button
                onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 transition truncate max-w-[130px]"
                style={{ fontFamily: currentFontFamily }}
              >
                <span className="truncate">{currentFontName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isFontDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-1.5 flex flex-col gap-0.5 min-w-[160px] z-50 animate-in fade-in zoom-in-95 duration-100">
                  {fontFamilies.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => {
                        updateProp('fontFamily', f.family);
                        setIsFontDropdownOpen(false);
                      }}
                      style={{ fontFamily: f.family }}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                        currentFontName === f.name ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{f.name}</span>
                      {currentFontName === f.name && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Font Size Stepper */}
          <div ref={sizeMenuRef} className="relative flex items-center gap-0.5 bg-slate-100/80 rounded-lg p-0.5">
            <button onClick={() => updateProp('fontSize', Math.max(8, currentFontSize - 2))} className="p-1 text-slate-600 hover:bg-white hover:text-slate-900 rounded-md transition">
              <ChevronDown className="w-3 h-3" />
            </button>
            <button onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)} className="px-1.5 text-xs font-semibold text-slate-800 hover:text-blue-600">
              {currentFontSize}
            </button>
            <button onClick={() => updateProp('fontSize', Math.min(120, currentFontSize + 2))} className="p-1 text-slate-600 hover:bg-white hover:text-slate-900 rounded-md transition">
              <ChevronUp className="w-3 h-3" />
            </button>

            {isSizeDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-1.5 grid grid-cols-3 gap-1 min-w-[120px] z-50 animate-in fade-in zoom-in-95 duration-100">
                {fontSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      updateProp('fontSize', sz);
                      setIsSizeDropdownOpen(false);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs text-center font-medium transition ${
                      currentFontSize === sz ? 'bg-blue-600 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => updateProp('fontWeight', isBold ? 'normal' : 'bold')}
              title="Bold (Ctrl+B)"
              className={`p-1.5 rounded-lg transition ${isBold ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateProp('fontStyle', isItalic ? 'normal' : 'italic')}
              title="Italic (Ctrl+I)"
              className={`p-1.5 rounded-lg transition ${isItalic ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateProp('textDecoration', isUnderline ? 'none' : 'underline')}
              title="Underline (Ctrl+U)"
              className={`p-1.5 rounded-lg transition ${isUnderline ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateProp('textDecoration', isStrikethrough ? 'none' : 'line-through')}
              title="Strikethrough"
              className={`p-1.5 rounded-lg transition ${isStrikethrough ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200" />

          {/* Text Alignment */}
          <div ref={alignMenuRef} className="relative">
            <button
              onClick={() => setIsAlignDropdownOpen(!isAlignDropdownOpen)}
              title="Text Alignment"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-0.5"
            >
              {currentAlign === 'center' ? (
                <AlignCenter className="w-4 h-4" />
              ) : currentAlign === 'right' ? (
                <AlignRight className="w-4 h-4" />
              ) : (
                <AlignLeft className="w-4 h-4" />
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isAlignDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-1 flex items-center gap-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { updateProp('align', 'left'); setIsAlignDropdownOpen(false); }}
                  className={`p-1.5 rounded-lg transition ${currentAlign === 'left' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { updateProp('align', 'center'); setIsAlignDropdownOpen(false); }}
                  className={`p-1.5 rounded-lg transition ${currentAlign === 'center' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { updateProp('align', 'right'); setIsAlignDropdownOpen(false); }}
                  className={`p-1.5 rounded-lg transition ${currentAlign === 'right' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* List Controls */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => toggleListFormat('bullet')} title="Bullet List" className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => toggleListFormat('numbered')} title="Numbered List" className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200" />

          {/* Text Color Picker */}
          <div ref={textColorMenuRef} className="relative">
            <button
              onClick={() => setIsTextColorOpen(!isTextColorOpen)}
              title="Text Color"
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition flex flex-col items-center justify-center relative"
            >
              <span className="text-sm font-black leading-none">A</span>
              <span className="w-3.5 h-1 rounded-full mt-0.5" style={{ backgroundColor: currentTextColor }} />
            </button>

            {isTextColorOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-2.5 grid grid-cols-5 gap-1.5 min-w-[150px] z-50 animate-in fade-in zoom-in-95 duration-100">
                {colorSwatches.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      updateProp(targetObj?.type === 'sticky' ? 'textColor' : 'color', color);
                      setIsTextColorOpen(false);
                    }}
                    style={{ backgroundColor: color }}
                    className="w-6 h-6 rounded-full border border-slate-300 hover:scale-110 transition shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Background Highlight Color Picker */}
          <div ref={bgColorMenuRef} className="relative">
            <button
              onClick={() => setIsBgColorOpen(!isBgColorOpen)}
              title="Background / Highlight Color"
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition flex items-center justify-center"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            {isBgColorOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-2.5 grid grid-cols-5 gap-1.5 min-w-[150px] z-50 animate-in fade-in zoom-in-95 duration-100">
                {stickyBgColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      updateProp(targetObj?.type === 'sticky' ? 'color' : 'backgroundColor', color);
                      setIsBgColorOpen(false);
                    }}
                    style={{ backgroundColor: color }}
                    className="w-6 h-6 rounded-full border border-slate-300 hover:scale-110 transition shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200" />
        </>
      )}

      {/* ── C2. Image / Asset Specific Controls ── */}
      {isImage && (
        <>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-[11px] font-mono font-medium text-slate-600">
            <span>{Math.round(targetObj.width)} × {Math.round(targetObj.height)}</span>
          </div>

          <button
            onClick={() => {
              if (!targetObj || !onUpdateObject) return;
              const origW = (targetObj as any).originalWidth || targetObj.width;
              const origH = (targetObj as any).originalHeight || targetObj.height;
              onUpdateObject(targetObj.id, {
                width: origW,
                height: origH,
                updatedAt: Date.now(),
              });
            }}
            title="Reset to Original Resolution"
            className="px-2 py-1 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition whitespace-nowrap"
          >
            Reset Size
          </button>

          <button
            onClick={() => {
              if (!targetObj || !onUpdateObject) return;
              onUpdateObject(targetObj.id, {
                zIndex: 0,
                locked: true,
                updatedAt: Date.now(),
              });
            }}
            title="Lock as Canvas Background Layer"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition whitespace-nowrap"
          >
            <Lock className="w-3 h-3" />
            <span>Set as Background</span>
          </button>

          <div className="w-px h-5 bg-slate-200" />
        </>
      )}

      {/* ── D. Universal Opacity Slider for ALL Objects ── */}
      <div ref={opacityMenuRef} className="relative">
        <button
          onClick={() => setIsOpacityOpen(!isOpacityOpen)}
          title="Object Opacity"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition text-xs font-semibold"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentOpacity}%</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isOpacityOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-3 min-w-[160px] z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Opacity</span>
              <span>{currentOpacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={currentOpacity}
              onChange={(e) => updateProp('opacity', Number(e.target.value) / 100)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex items-center justify-between gap-1 pt-1 text-[10px]">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => updateProp('opacity', pct / 100)}
                  className={`px-1.5 py-0.5 rounded border ${
                    currentOpacity === pct
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-slate-200" />

      {/* Lock / Unlock */}
      <button
        onClick={onToggleLock}
        title={isLocked ? 'Unlock Object' : 'Lock Object'}
        className={`p-1.5 rounded-lg transition ${isLocked ? 'bg-amber-100 text-amber-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
      >
        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
      </button>

      {/* More Options (...) */}
      <div ref={moreMenuRef} className="relative">
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          title="More Actions"
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isMoreOpen && (
          <div className="absolute right-0 top-full mt-1.5 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-1.5 flex flex-col gap-0.5 min-w-[160px] z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
            {onDuplicate && (
              <button onClick={() => { onDuplicate(); setIsMoreOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition">
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
            )}
            {onBringToFront && (
              <button onClick={() => { onBringToFront(); setIsMoreOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition">
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Bring to Front</span>
              </button>
            )}
            {onSendToBack && (
              <button onClick={() => { onSendToBack(); setIsMoreOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition">
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Send to Back</span>
              </button>
            )}
            {onDeleteSelected && (
              <button onClick={() => { onDeleteSelected(); setIsMoreOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition border-t border-slate-100 mt-0.5 pt-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
