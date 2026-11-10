import * as PIXI from 'pixi.js';
import { DrawingObject } from '@whiteboard/shared';

export class DrawingRenderer {
  public static render(g: PIXI.Graphics, obj: DrawingObject, isSelected: boolean): void {
    if (!obj.points || obj.points.length < 2) return;

    const strokeColor = parseInt((obj.strokeColor || '#3b82f6').replace('#', '0x'), 16);
    const finalColor = isSelected ? 0x2563eb : strokeColor;

    let width = obj.strokeWidth || 3;
    let opacity = obj.opacity ?? 1;

    switch (obj.penStyle) {
      case 'marker':
        width = Math.max(width, 6);
        opacity = 0.9;
        break;
      case 'highlighter':
        width = Math.max(width, 16);
        opacity = 0.45;
        break;
      case 'dashed':
        width = Math.max(width, 3);
        opacity = 1;
        break;
      case 'pen':
      default:
        width = Math.max(width, 2);
        opacity = 1;
        break;
    }

    g.lineStyle(width, finalColor, opacity);

    if (obj.penStyle === 'dashed') {
      // Render dashed line segments along points
      let currentLen = 0;
      const dashLen = 8;
      const gapLen = 6;
      let drawState = true;

      g.moveTo(obj.points[0].x, obj.points[0].y);

      for (let i = 1; i < obj.points.length; i++) {
        const prev = obj.points[i - 1];
        const curr = obj.points[i];
        const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);

        if (dist === 0) continue;

        let segProgress = 0;
        while (segProgress < dist) {
          const step = Math.min(dist - segProgress, drawState ? dashLen - currentLen : gapLen - currentLen);
          segProgress += step;
          currentLen += step;

          const t = segProgress / dist;
          const px = prev.x + (curr.x - prev.x) * t;
          const py = prev.y + (curr.y - prev.y) * t;

          if (drawState) {
            g.lineTo(px, py);
          } else {
            g.moveTo(px, py);
          }

          if ((drawState && currentLen >= dashLen) || (!drawState && currentLen >= gapLen)) {
            drawState = !drawState;
            currentLen = 0;
          }
        }
      }
    } else {
      g.moveTo(obj.points[0].x, obj.points[0].y);

      for (let i = 1; i < obj.points.length; i++) {
        g.lineTo(obj.points[i].x, obj.points[i].y);
      }
    }
  }
}
