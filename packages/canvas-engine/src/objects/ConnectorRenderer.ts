import * as PIXI from 'pixi.js';
import { ConnectorObject, BoardObject, Point, ArrowHeadStyle } from '@whiteboard/shared';
import { getAnchorPoint, calculateElbowPath } from '../geometry/connectorMath';

export class ConnectorRenderer {
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

    const headLen = Math.max(12, Math.min(22, 8 + width * 1.5));
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

  public static render(
    g: PIXI.Graphics,
    obj: ConnectorObject,
    allObjectsMap: Map<string, BoardObject>,
    isSelected: boolean
  ): void {
    let startPoint: Point = obj.fromPoint || { x: obj.x, y: obj.y };
    let endPoint: Point = obj.toPoint || { x: obj.x + obj.width, y: obj.y + obj.height };

    if (obj.fromObject && allObjectsMap.has(obj.fromObject)) {
      const fromObj = allObjectsMap.get(obj.fromObject)!;
      startPoint = getAnchorPoint(fromObj, obj.fromAnchor || 'center');
    }

    if (obj.toObject && allObjectsMap.has(obj.toObject)) {
      const toObj = allObjectsMap.get(obj.toObject)!;
      endPoint = getAnchorPoint(toObj, obj.toAnchor || 'center');
    }

    const strokeColor = parseInt((obj.strokeColor || '#94a3b8').replace('#', '0x'), 16);
    const finalColor = isSelected ? 0x3b82f6 : strokeColor;
    const width = obj.strokeWidth || 2;
    const alpha = obj.opacity !== undefined ? obj.opacity : 1;

    g.lineStyle(width, finalColor, alpha);

    let endAngle = 0;
    let startAngle = 0;

    if (obj.style === 'elbow') {
      const points = calculateElbowPath(startPoint, endPoint);
      if (obj.strokeStyle === 'dashed') {
        for (let i = 0; i < points.length - 1; i++) {
          this.drawDashedLine(g, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 8, 6);
        }
      } else if (obj.strokeStyle === 'dotted') {
        for (let i = 0; i < points.length - 1; i++) {
          this.drawDashedLine(g, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 3, 4);
        }
      } else {
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          g.lineTo(points[i].x, points[i].y);
        }
      }

      if (points.length >= 2) {
        const last = points[points.length - 1];
        const prev = points[points.length - 2];
        endAngle = Math.atan2(last.y - prev.y, last.x - prev.x);

        const first = points[0];
        const second = points[1];
        startAngle = Math.atan2(first.y - second.y, first.x - second.x);
      }
    } else {
      endAngle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
      startAngle = Math.atan2(startPoint.y - endPoint.y, startPoint.x - endPoint.x);

      if (obj.strokeStyle === 'dashed') {
        this.drawDashedLine(g, startPoint.x, startPoint.y, endPoint.x, endPoint.y, 8, 6);
      } else if (obj.strokeStyle === 'dotted') {
        this.drawDashedLine(g, startPoint.x, startPoint.y, endPoint.x, endPoint.y, 3, 4);
      } else {
        g.moveTo(startPoint.x, startPoint.y);
        g.lineTo(endPoint.x, endPoint.y);
      }
    }

    const effectiveEndStyle: ArrowHeadStyle =
      obj.endArrowStyle || (obj.endArrow !== false ? 'arrow' : 'none');
    const effectiveStartStyle: ArrowHeadStyle =
      obj.startArrowStyle || (obj.startArrow ? 'arrow' : 'none');

    if (effectiveEndStyle !== 'none') {
      this.drawEndpoint(g, endPoint.x, endPoint.y, endAngle, effectiveEndStyle, finalColor, width, alpha);
    }
    if (effectiveStartStyle !== 'none') {
      this.drawEndpoint(g, startPoint.x, startPoint.y, startAngle, effectiveStartStyle, finalColor, width, alpha);
    }
  }
}
