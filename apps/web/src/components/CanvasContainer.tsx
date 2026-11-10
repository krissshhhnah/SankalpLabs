import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import {
  Camera,
  isPointInObject,
  isObjectIntersectingRect,
  getObjectBounds,
  getMultiObjectBounds,
  computeSmartGuides,
  AlignmentGuide,
  StickyRenderer,
  TextRenderer,
  ShapeRenderer,
  LineRenderer,
  DrawingRenderer,
  ConnectorRenderer,
  ImageRenderer,
  FrameRenderer,
  SelectionOverlay,
  BoundingBox,
} from '@whiteboard/canvas-engine';
import { useUIStore } from '../stores/uiStore';
import { BoardObject, Point, DrawingObject, ImageObject, TextObject } from '@whiteboard/shared';

interface CanvasContainerProps {
  camera: Camera;
  onCameraChange: () => void;
  objects: BoardObject[];
  onAddObject: (obj: BoardObject) => void;
  onUpdateObject: (id: string, update: Partial<BoardObject>) => void;
  onDeleteObject?: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onCanvasClickWithTool?: (tool: string, worldPoint: Point) => void;
  onPointerMove?: (worldPoint: Point | null) => void;
}

function hitTestHandle(
  worldPoint: Point,
  bounds: BoundingBox,
  zoom: number,
  isLineObject = false,
  isCurvedArrow = false,
  curvature?: number
): number {
  const handleRadius = 14 / zoom;

  if (isLineObject) {
    const len = bounds.width || 1;
    const defaultCurve = Math.max(30, Math.min(100, len * 0.35));
    const curveAmt = curvature !== undefined ? curvature : defaultCurve;
    const midY = bounds.centerY;

    const handles: { index: number; x: number; y: number }[] = [
      { index: 7, x: bounds.minX - 4, y: midY }, // 7: Left endpoint handle
      { index: 3, x: bounds.maxX + 4, y: midY }, // 3: Right endpoint handle
    ];

    if (isCurvedArrow) {
      // Handle 9: Curve control handle ON the curve line itself
      handles.push({ index: 9, x: bounds.centerX, y: midY - curveAmt / 2 });
    }

    for (const h of handles) {
      if (Math.hypot(worldPoint.x - h.x, worldPoint.y - h.y) <= handleRadius) {
        return h.index;
      }
    }
    return -1;
  }

  const handles = [
    { x: bounds.minX - 4, y: bounds.minY - 4 }, // 0: top-left
    { x: bounds.centerX, y: bounds.minY - 4 },  // 1: top-mid
    { x: bounds.maxX + 4, y: bounds.minY - 4 },  // 2: top-right
    { x: bounds.maxX + 4, y: bounds.centerY },   // 3: right-mid
    { x: bounds.maxX + 4, y: bounds.maxY + 4 },  // 4: bot-right
    { x: bounds.centerX, y: bounds.maxY + 4 },   // 5: bot-mid
    { x: bounds.minX - 4, y: bounds.maxY + 4 },  // 6: bot-left
    { x: bounds.minX - 4, y: bounds.centerY },  // 7: left-mid
    { x: bounds.centerX, y: bounds.minY - 24 }, // 8: top rotation axis handle
  ];

  for (let i = 0; i < handles.length; i++) {
    const dx = worldPoint.x - handles[i].x;
    const dy = worldPoint.y - handles[i].y;
    if (Math.hypot(dx, dy) <= handleRadius) {
      return i;
    }
  }
  return -1;
}

function distToSegmentSquared(p: Point, v: Point, w: Point): number {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return (p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.y - (v.y + t * (w.y - v.y))) ** 2;
}

export const CANVAS_THEMES: Record<string, {
  name: string;
  bgColor: number;
  bgCss: string;
  gridDottedColor: number;
  gridDottedAlpha: number;
  gridLineColor: number;
  gridLineAlpha: number;
  gridCrossColor: number;
  gridCrossAlpha: number;
  isDark: boolean;
}> = {
  light: {
    name: 'Warm Ivory',
    bgColor: 0xfafaf7,
    bgCss: '#fafaf7',
    gridDottedColor: 0x5e5c56,
    gridDottedAlpha: 0.35,
    gridLineColor: 0xd9d8d5,
    gridLineAlpha: 0.7,
    gridCrossColor: 0xd9d8d5,
    gridCrossAlpha: 0.8,
    isDark: false,
  },
  dark: {
    name: 'Deep Obsidian',
    bgColor: 0x0f172a,
    bgCss: '#0f172a',
    gridDottedColor: 0x475569,
    gridDottedAlpha: 0.7,
    gridLineColor: 0x1e293b,
    gridLineAlpha: 0.9,
    gridCrossColor: 0x334155,
    gridCrossAlpha: 0.9,
    isDark: true,
  },
  sepia: {
    name: 'Warm Parchment',
    bgColor: 0xfbf0d9,
    bgCss: '#fbf0d9',
    gridDottedColor: 0xcaba9f,
    gridDottedAlpha: 0.7,
    gridLineColor: 0xeddcc4,
    gridLineAlpha: 0.9,
    gridCrossColor: 0xdbcab0,
    gridCrossAlpha: 0.9,
    isDark: false,
  },
  blueprint: {
    name: 'CAD Blueprint',
    bgColor: 0x0c2340,
    bgCss: '#0c2340',
    gridDottedColor: 0x2563eb,
    gridDottedAlpha: 0.65,
    gridLineColor: 0x163e70,
    gridLineAlpha: 0.85,
    gridCrossColor: 0x3b82f6,
    gridCrossAlpha: 0.85,
    isDark: true,
  },
};

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  camera,
  onCameraChange,
  objects,
  onAddObject,
  onUpdateObject,
  onDeleteObject,
  onContextMenu,
  onCanvasClickWithTool,
  onPointerMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const stageContainerRef = useRef<PIXI.Container | null>(null);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  const liveGraphicsRef = useRef<PIXI.Graphics | null>(null);
  const textContainerRef = useRef<PIXI.Container | null>(null);
  const lastEraserPointRef = useRef<Point | null>(null);

  const {
    activeTool,
    setActiveTool,
    selectedIds,
    setSelectedIds,
    editingTextId,
    setEditingTextId,
    connectorStartId,
    setConnectorStartId,
    canvasTheme,
    gridStyle,
    activeColor,
    activeFillColor,
    activeStrokeWidth,
    penStyle,
    activeFontSize,
    activeTextColor,
  } = useUIStore();

  const [isPanning, setIsPanning] = useState(false);
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([]);
  const [activeDrawingPoints, setActiveDrawingPoints] = useState<Point[]>([]);
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });
  const draggingObjectId = useRef<string | null>(null);
  const dragOffset = useRef<Point>({ x: 0, y: 0 });

  // Selection Box Marquee & Multi-Object Dragging state
  const isSelectionMarquee = useRef(false);
  const marqueeStartWorldPoint = useRef<Point | null>(null);
  const initialSelectedIdsBeforeMarquee = useRef<string[]>([]);

  const isDraggingSelection = useRef(false);
  const dragStartMouseWorld = useRef<Point | null>(null);
  const dragStartObjectPositions = useRef<Map<string, Point>>(new Map());

  // Handle Resizing state
  const activeHandleIndex = useRef<number>(-1);
  const initialObjectBounds = useRef<{ id: string; x: number; y: number; width: number; height: number } | null>(null);

  // Freehand drawing state
  const isDrawing = useRef(false);
  const currentStrokePoints = useRef<Point[]>([]);
interface EraserCircle {
  cx: number;
  cy: number;
  radius: number;
}

function getCircleSegmentIntersection(
  A: Point,
  B: Point,
  cx: number,
  cy: number,
  radius: number,
  isEntering: boolean
): Point {
  const vx = B.x - A.x;
  const vy = B.y - A.y;
  const dx = A.x - cx;
  const dy = A.y - cy;

  const a = vx * vx + vy * vy;
  if (a === 0) return A;

  const b = 2 * (dx * vx + dy * vy);
  const c = dx * dx + dy * dy - radius * radius;

  const disc = b * b - 4 * a * c;
  if (disc < 0) return isEntering ? B : A;

  const sqrtDisc = Math.sqrt(disc);
  const t = isEntering ? (-b - sqrtDisc) / (2 * a) : (-b + sqrtDisc) / (2 * a);
  const clampedT = Math.max(0, Math.min(1, t));

  return {
    x: A.x + clampedT * vx,
    y: A.y + clampedT * vy,
  };
}

function clipDrawingObjectWithCircles(
  obj: DrawingObject,
  circles: EraserCircle[]
): DrawingObject[] | null {
  if (!obj.points || obj.points.length === 0 || circles.length === 0) return null;

  const strokeWidth = obj.strokeWidth || 3;
  const halfWidth = strokeWidth / 2;

  const minX = Math.min(...obj.points.map((p) => p.x)) - halfWidth;
  const maxX = Math.max(...obj.points.map((p) => p.x)) + halfWidth;
  const minY = Math.min(...obj.points.map((p) => p.y)) - halfWidth;
  const maxY = Math.max(...obj.points.map((p) => p.y)) + halfWidth;

  const activeCircles = circles.filter((c) => {
    const effR = c.radius + halfWidth;
    return (
      c.cx + effR >= minX &&
      c.cx - effR <= maxX &&
      c.cy + effR >= minY &&
      c.cy - effR <= maxY
    );
  });

  if (activeCircles.length === 0) return null;

  const getErasingCircleForPoint = (pt: Point): EraserCircle | null => {
    for (const c of activeCircles) {
      const effR = c.radius + halfWidth;
      if ((pt.x - c.cx) ** 2 + (pt.y - c.cy) ** 2 <= effR * effR) {
        return c;
      }
    }
    return null;
  };

  const getErasingCircleForSegment = (p1: Point, p2: Point): EraserCircle | null => {
    for (const c of activeCircles) {
      const effR = c.radius + halfWidth;
      if (distToSegmentSquared({ x: c.cx, y: c.cy }, p1, p2) <= effR * effR) {
        return c;
      }
    }
    return null;
  };

  let hit = false;
  for (const pt of obj.points) {
    if (getErasingCircleForPoint(pt) !== null) {
      hit = true;
      break;
    }
  }

  if (!hit && obj.points.length > 1) {
    for (let i = 1; i < obj.points.length; i++) {
      if (getErasingCircleForSegment(obj.points[i - 1], obj.points[i]) !== null) {
        hit = true;
        break;
      }
    }
  }

  if (!hit) return null;

  const subArrays: Point[][] = [];
  let currentChunk: Point[] = [];

  for (let i = 0; i < obj.points.length; i++) {
    const pt = obj.points[i];
    const erasingCirclePt = getErasingCircleForPoint(pt);

    if (i === 0) {
      if (!erasingCirclePt) {
        currentChunk.push(pt);
      }
      continue;
    }

    const prevPt = obj.points[i - 1];
    const erasingCirclePrev = getErasingCircleForPoint(prevPt);

    if (!erasingCirclePrev && erasingCirclePt) {
      const effR = erasingCirclePt.radius + halfWidth;
      const entryPt = getCircleSegmentIntersection(prevPt, pt, erasingCirclePt.cx, erasingCirclePt.cy, effR, true);
      currentChunk.push(entryPt);
      if (currentChunk.length >= 2) {
        subArrays.push(currentChunk);
      }
      currentChunk = [];
    } else if (erasingCirclePrev && !erasingCirclePt) {
      const effR = erasingCirclePrev.radius + halfWidth;
      const exitPt = getCircleSegmentIntersection(prevPt, pt, erasingCirclePrev.cx, erasingCirclePrev.cy, effR, false);
      currentChunk = [exitPt, pt];
    } else if (!erasingCirclePrev && !erasingCirclePt) {
      const segCircle = getErasingCircleForSegment(prevPt, pt);
      if (segCircle) {
        const effR = segCircle.radius + halfWidth;
        const entryPt = getCircleSegmentIntersection(prevPt, pt, segCircle.cx, segCircle.cy, effR, true);
        const exitPt = getCircleSegmentIntersection(prevPt, pt, segCircle.cx, segCircle.cy, effR, false);

        currentChunk.push(entryPt);
        if (currentChunk.length >= 2) {
          subArrays.push(currentChunk);
        }
        currentChunk = [exitPt, pt];
      } else {
        currentChunk.push(pt);
      }
    }
  }

  if (currentChunk.length >= 2) {
    subArrays.push(currentChunk);
  }

  const result: DrawingObject[] = [];
  for (const pts of subArrays) {
    if (pts.length < 2) continue;
    const sMinX = Math.min(...pts.map((p) => p.x));
    const sMaxX = Math.max(...pts.map((p) => p.x));
    const sMinY = Math.min(...pts.map((p) => p.y));
    const sMaxY = Math.max(...pts.map((p) => p.y));

    result.push({
      ...obj,
      id: `drawing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      x: sMinX,
      y: sMinY,
      width: Math.max(5, sMaxX - sMinX),
      height: Math.max(5, sMaxY - sMinY),
      points: pts,
      updatedAt: Date.now(),
    });
  }

  return result;
}

  const activeWorkingObjectsRef = useRef<BoardObject[]>([]);
  const originalErasedObjectIdsRef = useRef<Set<string>>(new Set());

  const renderCanvasGraphics = (targetObjects: BoardObject[]) => {
    if (!graphicsRef.current || !stageContainerRef.current || !textContainerRef.current) return;

    stageContainerRef.current.scale.set(camera.zoom, camera.zoom);
    stageContainerRef.current.position.set(-camera.x * camera.zoom, -camera.y * camera.zoom);

    const g = graphicsRef.current;
    g.clear();

    const tContainer = textContainerRef.current;
    tContainer.removeChildren();

    // 1. Grid rendering
    const gridSize = 40;
    const bounds = camera.getViewportBounds(
      containerRef.current?.clientWidth || 1000,
      containerRef.current?.clientHeight || 800
    );

    const startX = Math.floor(bounds.minX / gridSize) * gridSize;
    const endX = Math.ceil(bounds.maxX / gridSize) * gridSize;
    const startY = Math.floor(bounds.minY / gridSize) * gridSize;
    const endY = Math.ceil(bounds.maxY / gridSize) * gridSize;

    const themeConfig = CANVAS_THEMES[canvasTheme] || CANVAS_THEMES.light;

    if (gridStyle === 'dotted') {
      g.beginFill(themeConfig.gridDottedColor, themeConfig.gridDottedAlpha);
      for (let x = startX; x <= endX; x += gridSize) {
        for (let y = startY; y <= endY; y += gridSize) {
          g.drawCircle(x, y, 1.2);
        }
      }
      g.endFill();
    } else if (gridStyle === 'lines') {
      g.lineStyle(1, themeConfig.gridLineColor, themeConfig.gridLineAlpha);
      for (let x = startX; x <= endX; x += gridSize) {
        g.moveTo(x, startY);
        g.lineTo(x, endY);
      }
      for (let y = startY; y <= endY; y += gridSize) {
        g.moveTo(startX, y);
        g.lineTo(endX, y);
      }
    } else if (gridStyle === 'crosses') {
      g.lineStyle(1.2, themeConfig.gridCrossColor, themeConfig.gridCrossAlpha);
      const arm = 3.5;
      for (let x = startX; x <= endX; x += gridSize) {
        for (let y = startY; y <= endY; y += gridSize) {
          g.moveTo(x - arm, y);
          g.lineTo(x + arm, y);
          g.moveTo(x, y - arm);
          g.lineTo(x, y + arm);
        }
      }
    }

    const objectsMap = new Map(targetObjects.map((o) => [o.id, o]));

    // 2. Render Visible Objects
    const visibleObjects = targetObjects.filter((obj) => {
      if (obj.type === 'connector') return true;
      const padding = 50;
      return (
        obj.x + obj.width + padding >= bounds.minX &&
        obj.x - padding <= bounds.maxX &&
        obj.y + obj.height + padding >= bounds.minY &&
        obj.y - padding <= bounds.maxY
      );
    });

    visibleObjects.forEach((obj) => {
      const isSelected = selectedIds.includes(obj.id) || connectorStartId === obj.id;
      const isEditing = editingTextId === obj.id;

      switch (obj.type) {
        case 'sticky':
          StickyRenderer.render(g, tContainer, obj, isSelected, isEditing);
          break;
        case 'text':
          TextRenderer.render(g, tContainer, obj as TextObject, isSelected, isEditing);
          break;
        case 'rectangle':
        case 'rounded-rectangle':
        case 'ellipse':
        case 'triangle':
        case 'diamond':
        case 'star':
        case 'hexagon':
        case 'bubble':
          ShapeRenderer.render(g, obj, isSelected);
          break;
        case 'line':
        case 'arrow':
        case 'curved-arrow':
          LineRenderer.render(g, obj, isSelected);
          break;
        case 'drawing':
          DrawingRenderer.render(g, obj, isSelected);
          break;
        case 'connector':
          ConnectorRenderer.render(g, obj, objectsMap, isSelected);
          break;
        case 'image':
          ImageRenderer.render(g, tContainer, obj as ImageObject, isSelected);
          break;
        case 'frame':
          FrameRenderer.render(g, tContainer, obj, isSelected);
          break;
      }
    });

    // 3. Render Smart Alignment Guides
    if (activeGuides.length > 0) {
      g.lineStyle(1, 0xec4899, 0.8);
      activeGuides.forEach((guide) => {
        if (guide.type === 'vertical') {
          g.moveTo(guide.position, bounds.minY);
          g.lineTo(guide.position, bounds.maxY);
        } else {
          g.moveTo(bounds.minX, guide.position);
          g.lineTo(bounds.maxX, guide.position);
        }
      });
    }

    // 4. Render Selection Bounding Box & Transformation Handles
    const selectedObjects = targetObjects.filter((o) => selectedIds.includes(o.id));
    if (selectedObjects.length > 0) {
      const selBounds = getMultiObjectBounds(selectedObjects);
      if (selBounds) {
        const isLine = selectedObjects.length === 1 && (selectedObjects[0].type === 'line' || selectedObjects[0].type === 'arrow' || selectedObjects[0].type === 'curved-arrow');
        const isCurved = selectedObjects.length === 1 && (selectedObjects[0].type === 'curved-arrow' || (selectedObjects[0] as any).style === 'curved');
        const curvature = isCurved ? (selectedObjects[0] as any).curvature : undefined;
        SelectionOverlay.render(g, selBounds, isLine, isCurved, curvature);
      }
    }
  };

  const processLocalEraserPass = (currentWorldPoint: Point, eraserRadius: number) => {
    const circles: EraserCircle[] = [];

    if (lastEraserPointRef.current) {
      const prev = lastEraserPointRef.current;
      const dist = Math.hypot(currentWorldPoint.x - prev.x, currentWorldPoint.y - prev.y);
      const stepSize = Math.max(4, eraserRadius / 2);
      const steps = Math.floor(dist / stepSize);

      if (steps > 1) {
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          circles.push({
            cx: prev.x + (currentWorldPoint.x - prev.x) * t,
            cy: prev.y + (currentWorldPoint.y - prev.y) * t,
            radius: eraserRadius,
          });
        }
      } else {
        circles.push({ cx: currentWorldPoint.x, cy: currentWorldPoint.y, radius: eraserRadius });
      }
    } else {
      circles.push({ cx: currentWorldPoint.x, cy: currentWorldPoint.y, radius: eraserRadius });
    }

    lastEraserPointRef.current = currentWorldPoint;

    const currentObjs = activeWorkingObjectsRef.current;
    const nextObjects: BoardObject[] = [];
    let modified = false;

    for (const obj of currentObjs) {
      if (obj.type !== 'drawing') {
        nextObjects.push(obj);
        continue;
      }

      const clipped = clipDrawingObjectWithCircles(obj as DrawingObject, circles);
      if (clipped === null) {
        nextObjects.push(obj);
      } else {
        modified = true;
        if (objects.some((orig) => orig.id === obj.id)) {
          originalErasedObjectIdsRef.current.add(obj.id);
        }
        nextObjects.push(...clipped);
      }
    }

    if (modified) {
      activeWorkingObjectsRef.current = nextObjects;
      renderCanvasGraphics(nextObjects);
    }
  };

  // Initialize PixiJS Application
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const currentTheme = (localStorage.getItem('wb_canvas_theme') || 'light') as string;
    const initialBgColor = CANVAS_THEMES[currentTheme]?.bgColor || 0xfafaf7;

    const app = new PIXI.Application({
      width,
      height,
      backgroundColor: initialBgColor,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      preserveDrawingBuffer: true,
    });

    containerRef.current.appendChild(app.view as unknown as Node);
    appRef.current = app;

    const stageContainer = new PIXI.Container();
    app.stage.addChild(stageContainer);
    stageContainerRef.current = stageContainer;

    const graphics = new PIXI.Graphics();
    stageContainer.addChild(graphics);
    graphicsRef.current = graphics;

    const liveGraphics = new PIXI.Graphics();
    stageContainer.addChild(liveGraphics);
    liveGraphicsRef.current = liveGraphics;

    const textContainer = new PIXI.Container();
    stageContainer.addChild(textContainer);
    textContainerRef.current = textContainer;

    const handleResize = () => {
      if (!containerRef.current || !app) return;
      app.renderer.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      onCameraChange();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true, { children: true });
    };
  }, []);

  // Dynamically update PixiJS canvas background on canvasTheme change
  useEffect(() => {
    if (appRef.current) {
      const config = CANVAS_THEMES[canvasTheme] || CANVAS_THEMES.light;
      (appRef.current.renderer as any).background.color = config.bgColor;
      renderCanvasGraphics(objects);
    }
  }, [canvasTheme]);

  // Update canvas graphics on objects, camera, selection, gridStyle, or editingTextId change
  useEffect(() => {
    activeWorkingObjectsRef.current = objects;
    renderCanvasGraphics(objects);
  }, [
    camera.x,
    camera.y,
    camera.zoom,
    objects,
    selectedIds,
    connectorStartId,
    canvasTheme,
    gridStyle,
    activeGuides,
    editingTextId,
    activeDrawingPoints,
    activeFillColor,
    activeStrokeWidth,
    penStyle,
  ]);

  // Wheel listener for smooth Zoom Around Cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenMouse: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const deltaZoom = e.deltaY < 0 ? 0.1 : -0.1;
    camera.zoomAroundCursor(screenMouse, deltaZoom);
    onCameraChange();
  };

  // Double-Click handler for Quick Sticky & Text Editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const worldPoint = camera.screenToWorld(screenPoint);

    if (onPointerMove) {
      onPointerMove(worldPoint);
    }

    const hitObj = [...objects].reverse().find((obj) => isPointInObject(worldPoint, obj));
    if (hitObj && !hitObj.locked && (hitObj.type === 'sticky' || hitObj.type === 'text')) {
      draggingObjectId.current = null;
      setEditingTextId(hitObj.id);
      return;
    }

    // Double-click on blank canvas: Quick Sticky Note creation at cursor
    if (!hitObj && (activeTool === 'select' || activeTool === 'sticky')) {
      const stickyW = 150;
      const stickyH = 150;
      const newSticky: BoardObject = {
        id: `sticky-${Date.now()}`,
        boardId: 'default',
        type: 'sticky',
        x: Math.round(worldPoint.x - stickyW / 2),
        y: Math.round(worldPoint.y - stickyH / 2),
        width: stickyW,
        height: stickyH,
        rotation: 0,
        zIndex: objects.length + 1,
        locked: false,
        createdBy: 'user',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        color: activeColor || '#fef08a',
        text: '',
        fontSize: 16,
        textAlign: 'center',
        textColor: '#000000',
      };
      onAddObject(newSticky);
      setSelectedIds([newSticky.id]);
      setEditingTextId(newSticky.id);
      setActiveTool('select');
    }
  };

  // Mouse Down handler
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const worldPoint = camera.screenToWorld(screenPoint);

    if (onPointerMove) {
      onPointerMove(worldPoint);
    }

    lastMousePos.current = screenPoint;

    if (e.button === 1 || activeTool === 'pan') {
      setIsPanning(true);
      return;
    }

    const selectedObjects = objects.filter((o) => selectedIds.includes(o.id));
    if (selectedObjects.length === 1 && !selectedObjects[0].locked) {
      const targetObj = selectedObjects[0];
      const isLine = targetObj.type === 'line' || targetObj.type === 'arrow' || targetObj.type === 'curved-arrow';
      const isCurved = targetObj.type === 'curved-arrow' || (targetObj as any).style === 'curved';
      const selBounds = getMultiObjectBounds(selectedObjects);
      if (selBounds) {
        const handleIdx = hitTestHandle(worldPoint, selBounds, camera.zoom, isLine, isCurved, (targetObj as any).curvature);
        if (handleIdx !== -1) {
          activeHandleIndex.current = handleIdx;
          initialObjectBounds.current = {
            id: targetObj.id,
            x: targetObj.x,
            y: targetObj.y,
            width: targetObj.width,
            height: targetObj.height,
          };
          return;
        }
      }
    }

    if (activeTool === 'connector') {
      const hitObj = [...objects].reverse().find((obj) => isPointInObject(worldPoint, obj));
      if (hitObj) {
        if (!connectorStartId) {
          setConnectorStartId(hitObj.id);
        } else if (connectorStartId !== hitObj.id) {
          const newConnector: BoardObject = {
            id: `connector-${Date.now()}`,
            boardId: 'default',
            type: 'connector',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0,
            zIndex: objects.length + 1,
            locked: false,
            createdBy: 'user',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            fromObject: connectorStartId,
            fromAnchor: 'right',
            toObject: hitObj.id,
            toAnchor: 'left',
            strokeColor: activeFillColor || '#3b82f6',
            strokeWidth: activeStrokeWidth || 2,
            style: 'elbow',
            endArrow: true,
          };
          onAddObject(newConnector);
          setConnectorStartId(null);
          setActiveTool('select');
        }
      }
      return;
    }

    if (activeTool === 'comment') {
      if (onCanvasClickWithTool) {
        onCanvasClickWithTool('comment', worldPoint);
      }
      return;
    }

    if (activeTool === 'select') {
      const hitObj = [...objects].reverse().find((obj) => isPointInObject(worldPoint, obj));

      if (hitObj) {
        if (editingTextId === hitObj.id) {
          return;
        }

        let newSelectedIds = selectedIds;
        if (e.shiftKey) {
          newSelectedIds = selectedIds.includes(hitObj.id)
            ? selectedIds.filter((id) => id !== hitObj.id)
            : [...selectedIds, hitObj.id];
          setSelectedIds(newSelectedIds);
        } else {
          // If clicking on an object not in selection, select only it.
          // If clicking on an object ALREADY selected in a multi-selection, preserve group selection.
          if (!selectedIds.includes(hitObj.id)) {
            newSelectedIds = [hitObj.id];
            setSelectedIds(newSelectedIds);
          }
        }

        // Setup multi-object dragging for selected unlocked objects
        const targetObjsToDrag = objects.filter((o) => newSelectedIds.includes(o.id) && !o.locked);
        if (targetObjsToDrag.length > 0) {
          isDraggingSelection.current = true;
          dragStartMouseWorld.current = worldPoint;
          const posMap = new Map<string, Point>();
          targetObjsToDrag.forEach((o) => posMap.set(o.id, { x: o.x, y: o.y }));
          dragStartObjectPositions.current = posMap;
        }
      } else {
        // Clicked on empty canvas space -> Start Marquee Box Selection
        if (!e.shiftKey) {
          setSelectedIds([]);
          initialSelectedIdsBeforeMarquee.current = [];
        } else {
          initialSelectedIdsBeforeMarquee.current = [...selectedIds];
        }

        isSelectionMarquee.current = true;
        marqueeStartWorldPoint.current = worldPoint;
      }
      return;
    }

    if (activeTool === 'draw') {
      isDrawing.current = true;
      currentStrokePoints.current = [worldPoint];

      if (penStyle === 'eraser') {
        const eraserRadius = Math.max(activeStrokeWidth || 16, 4);
        lastEraserPointRef.current = null;
        processLocalEraserPass(worldPoint, eraserRadius);
      } else if (liveGraphicsRef.current) {
        const lg = liveGraphicsRef.current;
        lg.clear();
        const strokeColor = parseInt((activeFillColor || '#3b82f6').replace('#', '0x'), 16);
        const opacity = penStyle === 'highlighter' ? 0.45 : 1;
        const width = penStyle === 'highlighter' ? Math.max(activeStrokeWidth, 14) : penStyle === 'marker' ? Math.max(activeStrokeWidth, 6) : Math.max(activeStrokeWidth, 2);
        lg.lineStyle(width, strokeColor, opacity);
        lg.moveTo(worldPoint.x, worldPoint.y);
        appRef.current?.render();
      }
      return;
    }

    // Creating new objects
    if (activeTool === 'sticky') {
      const newSticky: BoardObject = {
        id: `sticky-${Date.now()}`,
        boardId: 'default',
        type: 'sticky',
        x: worldPoint.x - 75,
        y: worldPoint.y - 75,
        width: 150,
        height: 150,
        rotation: 0,
        zIndex: objects.length + 1,
        locked: false,
        createdBy: 'user',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        color: activeColor,
        text: 'Sticky Note',
        fontSize: 16,
        textAlign: 'center',
        textColor: '#000000',
      };
      onAddObject(newSticky);
      setSelectedIds([newSticky.id]);
      setActiveTool('select');
    } else if (activeTool === 'text') {
      const newText: BoardObject = {
        id: `text-${Date.now()}`,
        boardId: 'default',
        type: 'text',
        x: worldPoint.x,
        y: worldPoint.y,
        width: 200,
        height: 40,
        rotation: 0,
        zIndex: objects.length + 1,
        locked: false,
        createdBy: 'user',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        text: 'Type text here',
        fontSize: activeFontSize || 18,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: activeTextColor || '#000000',
        align: 'left',
      };
      onAddObject(newText);
      setSelectedIds([newText.id]);
      setEditingTextId(newText.id);
      setActiveTool('select');
    } else if (
      activeTool === 'rectangle' ||
      activeTool === 'rounded-rectangle' ||
      activeTool === 'ellipse' ||
      activeTool === 'triangle' ||
      activeTool === 'diamond' ||
      activeTool === 'star' ||
      activeTool === 'hexagon' ||
      activeTool === 'bubble'
    ) {
      const newShape: BoardObject = {
        id: `${activeTool}-${Date.now()}`,
        boardId: 'default',
        type: activeTool,
        x: worldPoint.x - 75,
        y: worldPoint.y - 50,
        width: 150,
        height: 100,
        rotation: 0,
        zIndex: objects.length + 1,
        locked: false,
        createdBy: 'user',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fillColor: activeFillColor,
        strokeColor: '#ffffff',
        strokeWidth: activeStrokeWidth,
        opacity: 1,
      };
      onAddObject(newShape);
      setSelectedIds([newShape.id]);
      setActiveTool('select');
    } else if (activeTool === 'arrow' || activeTool === 'curved-arrow' || activeTool === 'line') {
      const newLine: BoardObject = {
        id: `${activeTool}-${Date.now()}`,
        boardId: 'default',
        type: activeTool,
        x: worldPoint.x - 80,
        y: worldPoint.y,
        width: 160,
        height: 0,
        rotation: 0,
        zIndex: objects.length + 1,
        locked: false,
        createdBy: 'user',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        strokeColor: activeFillColor || '#3b82f6',
        strokeWidth: Math.min(activeStrokeWidth || 3, 4),
        startArrow: false,
        endArrow: activeTool === 'arrow' || activeTool === 'curved-arrow',
        style: activeTool === 'curved-arrow' ? 'curved' : 'straight',
      };
      onAddObject(newLine);
      setSelectedIds([newLine.id]);
      setActiveTool('select');
    } else if (activeTool === 'frame') {
      const newFrame: BoardObject = {
        id: `frame-${Date.now()}`,
        boardId: 'default',
        type: 'frame',
        x: worldPoint.x - 200,
        y: worldPoint.y - 150,
        width: 400,
        height: 300,
        rotation: 0,
        zIndex: 0,
        locked: false,
        createdBy: 'user',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title: 'PROJECT FRAME',
        fillColor: '#1e293b',
        strokeColor: '#64748b',
        childIds: [],
      };
      onAddObject(newFrame);
      setSelectedIds([newFrame.id]);
      setActiveTool('select');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const worldPoint = camera.screenToWorld(screenPoint);

    if (onPointerMove) {
      onPointerMove(worldPoint);
    }

    if (isPanning) {
      const deltaX = screenPoint.x - lastMousePos.current.x;
      const deltaY = screenPoint.y - lastMousePos.current.y;
      camera.panBy(deltaX, deltaY);
      onCameraChange();
    } else if (activeHandleIndex.current !== -1 && initialObjectBounds.current) {
      const hIdx = activeHandleIndex.current;
      const init = initialObjectBounds.current;
      const targetObj = objects.find((o) => o.id === init.id);

      if (hIdx === 8 && targetObj) {
        // Handle 8: Top Rotation Axis Handle
        const bounds = getObjectBounds(targetObj);
        const angleRad = Math.atan2(worldPoint.y - bounds.centerY, worldPoint.x - bounds.centerX);
        let angleDeg = Math.round(angleRad * (180 / Math.PI) + 90);
        if (e.shiftKey) {
          angleDeg = Math.round(angleDeg / 15) * 15;
        }
        if (angleDeg < 0) angleDeg += 360;
        onUpdateObject(init.id, { rotation: angleDeg, updatedAt: Date.now() });
        return;
      }

      if (hIdx === 9 && targetObj) {
        // Handle 9: Curved Arrow Axis Control Handle ON the curve line itself
        const bounds = getObjectBounds(targetObj);
        const newCurve = Math.round((bounds.centerY - worldPoint.y) * 2);
        onUpdateObject(init.id, { curvature: newCurve, updatedAt: Date.now() });
        return;
      }

      const initRight = init.x + init.width;
      const initBottom = init.y + init.height;

      let newX = init.x;
      let newY = init.y;
      let newWidth = init.width;
      let newHeight = init.height;

      const isCorner = [0, 2, 4, 6].includes(hIdx);
      const isImage = targetObj?.type === 'image';
      // For images, corner drag locks aspect ratio by default (holding Shift unlocks freeform).
      // For other objects, holding Shift locks aspect ratio.
      const lockAspect = isCorner && (isImage ? !e.shiftKey : e.shiftKey);
      const aspect = (targetObj as any)?.aspectRatio || (init.width / init.height) || 1;

      if (lockAspect) {
        if (hIdx === 4) { // bot-right (anchored top-left)
          const rawW = Math.max(20, worldPoint.x - init.x);
          const rawH = Math.max(20, worldPoint.y - init.y);
          if (rawW / init.width > rawH / init.height) {
            newWidth = rawW;
            newHeight = Math.max(20, Math.round(newWidth / aspect));
          } else {
            newHeight = rawH;
            newWidth = Math.max(20, Math.round(newHeight * aspect));
          }
          newX = init.x;
          newY = init.y;
        } else if (hIdx === 2) { // top-right (anchored bot-left)
          const rawW = Math.max(20, worldPoint.x - init.x);
          const rawH = Math.max(20, initBottom - worldPoint.y);
          if (rawW / init.width > rawH / init.height) {
            newWidth = rawW;
            newHeight = Math.max(20, Math.round(newWidth / aspect));
          } else {
            newHeight = rawH;
            newWidth = Math.max(20, Math.round(newHeight * aspect));
          }
          newX = init.x;
          newY = initBottom - newHeight;
        } else if (hIdx === 0) { // top-left (anchored bot-right)
          const rawW = Math.max(20, initRight - worldPoint.x);
          const rawH = Math.max(20, initBottom - worldPoint.y);
          if (rawW / init.width > rawH / init.height) {
            newWidth = rawW;
            newHeight = Math.max(20, Math.round(newWidth / aspect));
          } else {
            newHeight = rawH;
            newWidth = Math.max(20, Math.round(newHeight * aspect));
          }
          newX = initRight - newWidth;
          newY = initBottom - newHeight;
        } else if (hIdx === 6) { // bot-left (anchored top-right)
          const rawW = Math.max(20, initRight - worldPoint.x);
          const rawH = Math.max(20, worldPoint.y - init.y);
          if (rawW / init.width > rawH / init.height) {
            newWidth = rawW;
            newHeight = Math.max(20, Math.round(newWidth / aspect));
          } else {
            newHeight = rawH;
            newWidth = Math.max(20, Math.round(newHeight * aspect));
          }
          newX = initRight - newWidth;
          newY = init.y;
        }
      } else {
        if (hIdx === 4) { // bot-right
          newWidth = Math.max(20, worldPoint.x - init.x);
          newHeight = Math.max(20, worldPoint.y - init.y);
        } else if (hIdx === 3) { // right-mid
          newWidth = Math.max(20, worldPoint.x - init.x);
        } else if (hIdx === 5) { // bot-mid
          newHeight = Math.max(20, worldPoint.y - init.y);
        } else if (hIdx === 0) { // top-left
          newWidth = Math.max(20, initRight - worldPoint.x);
          newX = initRight - newWidth;
          newHeight = Math.max(20, initBottom - worldPoint.y);
          newY = initBottom - newHeight;
        } else if (hIdx === 2) { // top-right
          newWidth = Math.max(20, worldPoint.x - init.x);
          newHeight = Math.max(20, initBottom - worldPoint.y);
          newY = initBottom - newHeight;
        } else if (hIdx === 6) { // bot-left
          newWidth = Math.max(20, initRight - worldPoint.x);
          newX = initRight - newWidth;
          newHeight = Math.max(20, worldPoint.y - init.y);
        } else if (hIdx === 1) { // top-mid
          newHeight = Math.max(20, initBottom - worldPoint.y);
          newY = initBottom - newHeight;
        } else if (hIdx === 7) { // left-mid
          newWidth = Math.max(20, initRight - worldPoint.x);
          newX = initRight - newWidth;
        }
      }

      onUpdateObject(init.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        updatedAt: Date.now(),
      });
    } else if (isDraggingSelection.current && dragStartMouseWorld.current) {
      const deltaX = worldPoint.x - dragStartMouseWorld.current.x;
      const deltaY = worldPoint.y - dragStartMouseWorld.current.y;

      dragStartObjectPositions.current.forEach((startPos, id) => {
        onUpdateObject(id, {
          x: startPos.x + deltaX,
          y: startPos.y + deltaY,
          updatedAt: Date.now(),
        });
      });
    } else if (isSelectionMarquee.current && marqueeStartWorldPoint.current) {
      const start = marqueeStartWorldPoint.current;
      const minX = Math.min(start.x, worldPoint.x);
      const maxX = Math.max(start.x, worldPoint.x);
      const minY = Math.min(start.y, worldPoint.y);
      const maxY = Math.max(start.y, worldPoint.y);
      const rect = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };

      if (liveGraphicsRef.current) {
        const lg = liveGraphicsRef.current;
        lg.clear();
        lg.lineStyle(1.5 / camera.zoom, 0x3b82f6, 0.9);
        lg.beginFill(0x3b82f6, 0.12);
        lg.drawRect(rect.x, rect.y, rect.width, rect.height);
        lg.endFill();
        appRef.current?.render();
      }

      const intersectedIds = objects
        .filter((o) => !o.locked && isObjectIntersectingRect(o, rect))
        .map((o) => o.id);

      if (e.shiftKey) {
        const combined = new Set([...initialSelectedIdsBeforeMarquee.current, ...intersectedIds]);
        setSelectedIds(Array.from(combined));
      } else {
        setSelectedIds(intersectedIds);
      }
    } else if (draggingObjectId.current) {
      const rawTargetX = worldPoint.x - dragOffset.current.x;
      const rawTargetY = worldPoint.y - dragOffset.current.y;

      const targetObj = objects.find((o) => o.id === draggingObjectId.current);
      if (targetObj) {
        const otherObjects = objects.filter((o) => o.id !== targetObj.id);
        const guideResult = computeSmartGuides(
          { x: rawTargetX, y: rawTargetY, width: targetObj.width, height: targetObj.height },
          otherObjects
        );

        setActiveGuides(guideResult.guides);
        onUpdateObject(draggingObjectId.current, {
          x: guideResult.snappedX,
          y: guideResult.snappedY,
          updatedAt: Date.now(),
        });
      }
    } else if (activeTool === 'draw' && penStyle === 'eraser') {
      const eraserRadius = Math.max(activeStrokeWidth || 16, 4);
      if (liveGraphicsRef.current) {
        const lg = liveGraphicsRef.current;
        lg.clear();
        lg.lineStyle(2 / camera.zoom, 0x0f172a, 0.7);
        lg.drawCircle(worldPoint.x, worldPoint.y, eraserRadius);
        lg.lineStyle(1 / camera.zoom, 0xffffff, 0.9);
        lg.beginFill(0xef4444, 0.15);
        lg.drawCircle(worldPoint.x, worldPoint.y, eraserRadius);
        lg.endFill();
        appRef.current?.render();
      }
      if (isDrawing.current) {
        processLocalEraserPass(worldPoint, eraserRadius);
      }
    } else if (isDrawing.current) {
      if (currentStrokePoints.current.length > 0) {
        const lastPt = currentStrokePoints.current[currentStrokePoints.current.length - 1];
        const dist = Math.hypot(worldPoint.x - lastPt.x, worldPoint.y - lastPt.y);
        if (dist > 3) {
          const steps = Math.floor(dist / 3);
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            currentStrokePoints.current.push({
              x: lastPt.x + (worldPoint.x - lastPt.x) * t,
              y: lastPt.y + (worldPoint.y - lastPt.y) * t,
            });
          }
        } else {
          currentStrokePoints.current.push(worldPoint);
        }
      } else {
        currentStrokePoints.current.push(worldPoint);
      }

      if (liveGraphicsRef.current) {
        const lg = liveGraphicsRef.current;
        lg.clear();
        const strokeColor = parseInt((activeFillColor || '#3b82f6').replace('#', '0x'), 16);
        const opacity = penStyle === 'highlighter' ? 0.45 : 1;
        const width = penStyle === 'highlighter' ? Math.max(activeStrokeWidth, 14) : penStyle === 'marker' ? Math.max(activeStrokeWidth, 6) : Math.max(activeStrokeWidth, 2);
        lg.lineStyle(width, strokeColor, opacity);

        const pts = currentStrokePoints.current;
        if (pts.length > 0) {
          lg.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            lg.lineTo(pts[i].x, pts[i].y);
          }
        }
        appRef.current?.render();
      }
    }

    lastMousePos.current = screenPoint;
  };

  const handleMouseUp = () => {
    if (liveGraphicsRef.current) {
      liveGraphicsRef.current.clear();
      appRef.current?.render();
    }

    if (isSelectionMarquee.current) {
      isSelectionMarquee.current = false;
      marqueeStartWorldPoint.current = null;
    }

    if (isDraggingSelection.current) {
      isDraggingSelection.current = false;
      dragStartMouseWorld.current = null;
      dragStartObjectPositions.current.clear();
    }

    if (isDrawing.current && penStyle === 'eraser') {
      lastEraserPointRef.current = null;
      if (originalErasedObjectIdsRef.current.size > 0) {
        const activeIds = new Set(activeWorkingObjectsRef.current.map((o) => o.id));

        originalErasedObjectIdsRef.current.forEach((origId) => {
          if (!activeIds.has(origId) && onDeleteObject) {
            onDeleteObject(origId);
          }
        });

        const existingIds = new Set(objects.map((o) => o.id));
        activeWorkingObjectsRef.current.forEach((obj) => {
          if (!existingIds.has(obj.id)) {
            onAddObject(obj);
          }
        });

        originalErasedObjectIdsRef.current.clear();
      }
    }

    if (isDrawing.current && currentStrokePoints.current.length > 1 && penStyle !== 'eraser') {
      const pts = currentStrokePoints.current;
      const minX = Math.min(...pts.map((p) => p.x));
      const minY = Math.min(...pts.map((p) => p.y));
      const maxX = Math.max(...pts.map((p) => p.x));
      const maxY = Math.max(...pts.map((p) => p.y));
      const width = maxX - minX || 10;
      const height = maxY - minY || 10;

      if (penStyle === 'smart') {
        // Smart Pen Shape Recognition
        const startEndDist = Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
        const isClosed = startEndDist < Math.max(width, height) * 0.45;
        const aspect = width / height;

        const recognizedType = isClosed
          ? Math.abs(aspect - 1) < 0.4
            ? 'ellipse'
            : 'rectangle'
          : 'triangle';

        const smartShape: BoardObject = {
          id: `${recognizedType}-${Date.now()}`,
          boardId: 'default',
          type: recognizedType as any,
          x: minX,
          y: minY,
          width: Math.max(80, width),
          height: Math.max(60, height),
          rotation: 0,
          zIndex: objects.length + 1,
          locked: false,
          createdBy: 'user',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          fillColor: activeFillColor || '#3b82f6',
          strokeColor: '#ffffff',
          strokeWidth: activeStrokeWidth || 3,
          opacity: 1,
        };
        onAddObject(smartShape);
      } else {
        const newDrawing: BoardObject = {
          id: `drawing-${Date.now()}`,
          boardId: 'default',
          type: 'drawing',
          x: minX,
          y: minY,
          width: width,
          height: height,
          rotation: 0,
          zIndex: objects.length + 1,
          locked: false,
          createdBy: 'user',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          points: [...pts],
          strokeColor: activeFillColor || '#3b82f6',
          strokeWidth: activeStrokeWidth || 3,
          penStyle: penStyle || 'pen',
          opacity: penStyle === 'highlighter' ? 0.45 : 1,
        };
        onAddObject(newDrawing);
      }
    }

    isDrawing.current = false;
    currentStrokePoints.current = [];
    setActiveDrawingPoints([]);
    setIsPanning(false);
    draggingObjectId.current = null;
    activeHandleIndex.current = -1;
    initialObjectBounds.current = null;
    setActiveGuides([]);
  };

  const getCanvasCursor = () => {
    if (isPanning || activeTool === 'pan') return 'grab';
    if (activeTool === 'select') return 'default';
    if (activeTool === 'comment') {
      return `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNMjEgMTVjMC01LTQtOS05LTlTMyAxMCAzIDE1YzAgMS43LjUgMy4zIDEuNCA0LjdMMiAyMmwyLjMtMi40QzguMSAyMC41IDEwIDIxIDEyIDIxYzUgMCA5LTQgOS02eiIgZmlsbD0iIzI1NjNlYiIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvc3ZnPg==") 12 22, crosshair`;
    }
    if (activeTool === 'draw') {
      if (penStyle === 'highlighter') {
        return `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNNCAyMGw0LTQgMTItMTItNC00TDQgMTJ2OHoiIGZpbGw9IiNmNTllMGIiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMCAyNGw2LTMtMy02LTMgOXoiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+") 2 22, crosshair`;
      }
      if (penStyle === 'eraser') {
        return `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNNyAyMUwzIDE3IDE2IDRsNCA0LTEz IDEzeiIgZmlsbD0iI2Y0M2Y1ZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvc3ZnPg==") 2 22, crosshair`;
      }
      // Pen / Marker / Smart Pen
      return `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNMTcuNSAyLjVhMi4xMjEgMi4xMjEgMCAwIDEgMyAzTDcgMTkuNSAyIDIxbDEuNS01TDE3LjUgMi41eiIgZmlsbD0iIzI1NjNlYiIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjIiIGN5PSIyMSIgcj0iMS41IiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==") 2 22, crosshair`;
    }
    return 'crosshair';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const dropWorldPoint = camera.screenToWorld({ x: clientX, y: clientY });

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));

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

          const offsetX = dropWorldPoint.x + index * 24 - width / 2;
          const offsetY = dropWorldPoint.y + index * 24 - height / 2;

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
            zIndex: objects.length + index + 1,
            locked: false,
            createdBy: 'user',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          onAddObject(newImage);
          setSelectedIds([newImage.id]);
          useUIStore.getState().setActiveTool('select');
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  // Find currently editing object if active
  const editingObj = objects.find((o) => o.id === editingTextId);
  let editingScreenPos: Point = { x: 0, y: 0 };
  if (editingObj) {
    editingScreenPos = camera.worldToScreen({ x: editingObj.x, y: editingObj.y });
  }

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => onPointerMove?.(null)}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onContextMenu) onContextMenu(e);
      }}
      style={{ cursor: getCanvasCursor() }}
      className="w-full h-full relative"
    >
      {/* Seamless Inline Text Editor Overlay (Zero double text overlap & zero scrollbars) */}
      {editingObj && (
        <textarea
          autoFocus
          ref={(el) => {
            if (el) el.focus();
          }}
          value={(editingObj as any).text || ''}
          onChange={(e) => onUpdateObject(editingObj.id, { text: e.target.value })}
          onBlur={() => setEditingTextId(null)}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditingTextId(null);
              return;
            }

            // Tab-to-Clone: Create next companion sticky note to the right
            if (e.key === 'Tab' && editingObj.type === 'sticky') {
              e.preventDefault();
              const nextId = `sticky-${Date.now()}`;
              const nextSticky: BoardObject = {
                id: nextId,
                boardId: editingObj.boardId || 'default',
                type: 'sticky',
                x: editingObj.x + editingObj.width + 24,
                y: editingObj.y,
                width: editingObj.width,
                height: editingObj.height,
                rotation: 0,
                zIndex: objects.length + 1,
                locked: false,
                createdBy: 'user',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                color: (editingObj as any).color || activeColor || '#fef08a',
                text: '',
                fontSize: (editingObj as any).fontSize || 16,
                textAlign: (editingObj as any).textAlign || 'center',
                textColor: (editingObj as any).textColor || '#000000',
              };
              onAddObject(nextSticky);
              setSelectedIds([nextId]);
              setEditingTextId(nextId);
              return;
            }

            // Shift+Enter: Create companion sticky note directly below
            if (e.key === 'Enter' && e.shiftKey && editingObj.type === 'sticky') {
              e.preventDefault();
              const nextId = `sticky-${Date.now()}`;
              const nextSticky: BoardObject = {
                id: nextId,
                boardId: editingObj.boardId || 'default',
                type: 'sticky',
                x: editingObj.x,
                y: editingObj.y + editingObj.height + 24,
                width: editingObj.width,
                height: editingObj.height,
                rotation: 0,
                zIndex: objects.length + 1,
                locked: false,
                createdBy: 'user',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                color: (editingObj as any).color || activeColor || '#fef08a',
                text: '',
                fontSize: (editingObj as any).fontSize || 16,
                textAlign: (editingObj as any).textAlign || 'center',
                textColor: (editingObj as any).textColor || '#000000',
              };
              onAddObject(nextSticky);
              setSelectedIds([nextId]);
              setEditingTextId(nextId);
              return;
            }
          }}
          style={{
            position: 'absolute',
            left: `${editingScreenPos.x + (editingObj.type === 'sticky' || ((editingObj as any).backgroundColor && (editingObj as any).backgroundColor !== 'transparent') ? 12 * camera.zoom : 0)}px`,
            top: `${editingScreenPos.y + (editingObj.type === 'sticky' || ((editingObj as any).backgroundColor && (editingObj as any).backgroundColor !== 'transparent') ? 12 * camera.zoom : 0)}px`,
            width: `${(editingObj.width - (editingObj.type === 'sticky' || ((editingObj as any).backgroundColor && (editingObj as any).backgroundColor !== 'transparent') ? 24 : 0)) * camera.zoom}px`,
            height: `${(editingObj.height - (editingObj.type === 'sticky' || ((editingObj as any).backgroundColor && (editingObj as any).backgroundColor !== 'transparent') ? 24 : 0)) * camera.zoom}px`,
            fontSize: `${((editingObj as any).fontSize || (editingObj.type === 'sticky' ? 16 : 18)) * camera.zoom}px`,
            fontFamily: (editingObj as any).fontFamily || 'Inter, sans-serif',
            fontWeight: (editingObj as any).fontWeight || 'normal',
            fontStyle: (editingObj as any).fontStyle || 'normal',
            textDecoration: (editingObj as any).textDecoration || 'none',
            color: editingObj.type === 'sticky' ? (editingObj as any).textColor || '#000000' : (editingObj as any).color || '#000000',
            backgroundColor: (editingObj as any).backgroundColor || 'transparent',
            textAlign: (editingObj as any).textAlign || (editingObj as any).align || (editingObj.type === 'sticky' ? 'center' : 'left'),
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            boxShadow: 'none',
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
};
