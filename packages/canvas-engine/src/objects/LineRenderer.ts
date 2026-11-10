import * as PIXI from 'pixi.js';
import { LineObject, ArrowHeadStyle } from '@whiteboard/shared';

export class LineRenderer {
  private static drawEndpoint(
    g: PIXI.Graphics,
    x: number,
    y: number,
    angle: number,
    style: ArrowHeadStyle | undefined,
    color: number,
    width: number,
    alpha: number
  ): void {
    if (!style || style === 'none') return;

    const headLen = Math.max(12, Math.min(24, 8 + width * 1.5));
    g.lineStyle(0);
    g.beginFill(color, alpha);

    if (style === 'arrow' || style === 'triangle') {
      const arrowAngle = Math.PI / 6.5;
      g.moveTo(x, y);
      g.lineTo(x - headLen * Math.cos(angle - arrowAngle), y - headLen * Math.sin(angle - arrowAngle));
      g.lineTo(x - headLen * 0.72 * Math.cos(angle), y - headLen * 0.72 * Math.sin(angle));
      g.lineTo(x - headLen * Math.cos(angle + arrowAngle), y - headLen * Math.sin(angle + arrowAngle));
      g.closePath();
    } else if (style === 'circle') {
      const r = Math.max(4, width * 1.8);
      g.drawCircle(x, y, r);
    } else if (style === 'diamond') {
      const d = Math.max(6, width * 2);
      g.moveTo(x, y);
      g.lineTo(x - d * Math.cos(angle - Math.PI / 4), y - d * Math.sin(angle - Math.PI / 4));
      g.lineTo(x - d * 1.4 * Math.cos(angle), y - d * 1.4 * Math.sin(angle));
      g.lineTo(x - d * Math.cos(angle + Math.PI / 4), y - d * Math.sin(angle + Math.PI / 4));
      g.closePath();
    } else if (style === 'bar') {
      const barLen = Math.max(6, width * 2.5);
      const perpAngle = angle + Math.PI / 2;
      g.lineStyle(Math.max(2, width), color, alpha);
      g.moveTo(x + barLen * Math.cos(perpAngle), y + barLen * Math.sin(perpAngle));
      g.lineTo(x - barLen * Math.cos(perpAngle), y - barLen * Math.sin(perpAngle));
    }

    g.endFill();
  }

  private static drawDashedLine(
    g: PIXI.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    dash: number,
    gap: number
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist <= 0) return;

    const unitX = dx / dist;
    const unitY = dy / dist;

    let current = 0;
    let isDash = true;

    while (current < dist) {
      const step = isDash ? dash : gap;
      const next = Math.min(current + step, dist);
      if (isDash) {
        g.moveTo(x1 + unitX * current, y1 + unitY * current);
        g.lineTo(x1 + unitX * next, y1 + unitY * next);
      }
      current = next;
      isDash = !isDash;
    }
  }

  public static render(g: PIXI.Graphics, obj: LineObject, isSelected: boolean): void {
    const strokeColor = parseInt((obj.strokeColor || '#3b82f6').replace('#', '0x'), 16);
    const finalColor = isSelected ? 0x2563eb : strokeColor;
    const width = Math.max(1, Math.min(obj.strokeWidth || 3, 16));
    const alpha = obj.opacity !== undefined ? obj.opacity : 1;

    let startX: number;
    let startY: number;
    let endX: number;
    let endY: number;

    if (obj.startPoint && obj.endPoint) {
      startX = obj.startPoint.x;
      startY = obj.startPoint.y;
      endX = obj.endPoint.x;
      endY = obj.endPoint.y;
    } else {
      if (obj.width === 0 && obj.height !== 0) {
        startX = obj.x;
        endX = obj.x;
        startY = obj.y;
        endY = obj.y + obj.height;
      } else if (obj.height === 0 && obj.width !== 0) {
        startX = obj.x;
        endX = obj.x + obj.width;
        startY = obj.y;
        endY = obj.y;
      } else {
        startX = obj.x;
        endX = obj.x + obj.width;
        if (obj.type === 'line' || obj.type === 'arrow' || obj.type === 'curved-arrow') {
          const midY = obj.y + obj.height / 2;
          startY = midY;
          endY = midY;
        } else {
          startY = obj.y;
          endY = obj.y + obj.height;
        }
      }
    }

    const isCurved = obj.type === 'curved-arrow' || obj.style === 'curved';
    g.lineStyle(width, finalColor, alpha);

    let startAngle = 0;
    let endAngle = 0;

    if (isCurved) {
      // Perpendicular control point calculation for a smooth arc
      const dx = endX - startX;
      const dy = endY - startY;
      const len = Math.hypot(dx, dy) || 1;

      const nx = -dy / len;
      const ny = dx / len;
      const defaultCurve = Math.max(30, Math.min(100, len * 0.35));
      const curveAmount = obj.curvature !== undefined ? obj.curvature : defaultCurve;

      const controlX = startX + dx / 2 + nx * curveAmount;
      const controlY = startY + dy / 2 + ny * curveAmount;

      g.moveTo(startX, startY);
      g.quadraticCurveTo(controlX, controlY, endX, endY);

      endAngle = Math.atan2(endY - controlY, endX - controlX);
      startAngle = Math.atan2(startY - controlY, startX - controlX);
    } else {
      const dx = endX - startX;
      const dy = endY - startY;
      endAngle = Math.atan2(dy, dx);
      startAngle = Math.atan2(-dy, -dx);

      if (obj.strokeStyle === 'dashed') {
        this.drawDashedLine(g, startX, startY, endX, endY, 8, 6);
      } else if (obj.strokeStyle === 'dotted') {
        this.drawDashedLine(g, startX, startY, endX, endY, 3, 4);
      } else {
        g.moveTo(startX, startY);
        g.lineTo(endX, endY);
      }
    }

    // Default style resolution
    const effectiveEndStyle: ArrowHeadStyle =
      obj.endArrowStyle || (obj.type === 'arrow' || obj.type === 'curved-arrow' || obj.endArrow ? 'arrow' : 'none');
    const effectiveStartStyle: ArrowHeadStyle =
      obj.startArrowStyle || (obj.startArrow ? 'arrow' : 'none');

    // Draw start and end arrowheads/endpoints
    if (effectiveEndStyle !== 'none') {
      this.drawEndpoint(g, endX, endY, endAngle, effectiveEndStyle, finalColor, width, alpha);
    }
    if (effectiveStartStyle !== 'none') {
      this.drawEndpoint(g, startX, startY, startAngle, effectiveStartStyle, finalColor, width, alpha);
    }
  }
}
