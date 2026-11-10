import * as PIXI from 'pixi.js';
import { BoundingBox } from '../geometry/bounds';

export class SelectionOverlay {
  public static render(
    g: PIXI.Graphics,
    bounds: BoundingBox,
    isLineObject = false,
    isCurvedArrow = false,
    curvature?: number
  ): void {
    const handleSize = 8;
    const half = handleSize / 2;

    const hasRotation = !isLineObject && bounds.rotation && bounds.rotation !== 0;
    if (hasRotation) {
      const cx = bounds.centerX;
      const cy = bounds.centerY;
      const rad = (bounds.rotation! * Math.PI) / 180;
      const matrix = new PIXI.Matrix();
      matrix.translate(-cx, -cy);
      matrix.rotate(rad);
      matrix.translate(cx, cy);
      g.setMatrix(matrix);
    }

    if (isLineObject) {
      // 1. Sleek Line Selection Overlay (Horizontal line axis + Left & Right endpoint handles)
      const midY = bounds.centerY;
      g.lineStyle(1.5, 0x3b82f6, 0.8);
      g.moveTo(bounds.minX - 4, midY);
      g.lineTo(bounds.maxX + 4, midY);

      // Left and Right square handles
      const lineHandles = [
        { x: bounds.minX - 4, y: midY },
        { x: bounds.maxX + 4, y: midY },
      ];

      lineHandles.forEach((h) => {
        g.beginFill(0xffffff);
        g.lineStyle(1.5, 0x3b82f6, 1);
        g.drawRect(h.x - half, h.y - half, handleSize, handleSize);
        g.endFill();
      });

      // 2. Square handle ON the curved arrow line itself
      if (isCurvedArrow) {
        const len = bounds.width || 1;
        const defaultCurve = Math.max(30, Math.min(100, len * 0.35));
        const curveAmt = curvature !== undefined ? curvature : defaultCurve;

        // Position ON the curve line at t = 0.5 (apex)
        const ctrlX = bounds.centerX;
        const ctrlY = bounds.centerY - curveAmt / 2;

        // Guide stem from center line to curve control apex
        g.lineStyle(1, 0x3b82f6, 0.5);
        g.moveTo(bounds.centerX, midY);
        g.lineTo(ctrlX, ctrlY);

        // White square handle with blue border ON the curve line
        g.beginFill(0xffffff);
        g.lineStyle(2, 0x3b82f6, 1);
        g.drawRect(ctrlX - half - 1, ctrlY - half - 1, handleSize + 2, handleSize + 2);
        g.endFill();
      }
    } else {
      // 8-handle Bounding Box for Shapes, Stickies, Text, Frames
      g.lineStyle(1.5, 0x3b82f6, 1);
      g.drawRect(bounds.minX - 4, bounds.minY - 4, bounds.width + 8, bounds.height + 8);

      const handles = [
        { x: bounds.minX - 4, y: bounds.minY - 4 },
        { x: bounds.centerX, y: bounds.minY - 4 },
        { x: bounds.maxX + 4, y: bounds.minY - 4 },
        { x: bounds.maxX + 4, y: bounds.centerY },
        { x: bounds.maxX + 4, y: bounds.maxY + 4 },
        { x: bounds.centerX, y: bounds.maxY + 4 },
        { x: bounds.minX - 4, y: bounds.maxY + 4 },
        { x: bounds.minX - 4, y: bounds.centerY },
      ];

      handles.forEach((h) => {
        g.beginFill(0xffffff);
        g.lineStyle(1, 0x3b82f6, 1);
        g.drawRect(h.x - half, h.y - half, handleSize, handleSize);
        g.endFill();
      });

      // Top Rotation Axis Handle (stem + blue circle node)
      const rotStemY = bounds.minY - 24;
      g.lineStyle(1, 0x3b82f6, 1);
      g.moveTo(bounds.centerX, bounds.minY - 4);
      g.lineTo(bounds.centerX, rotStemY);

      g.beginFill(0x3b82f6);
      g.lineStyle(1, 0xffffff, 1);
      g.drawCircle(bounds.centerX, rotStemY, 5);
      g.endFill();
    }

    if (hasRotation) {
      g.setMatrix(new PIXI.Matrix());
    }
  }
}
