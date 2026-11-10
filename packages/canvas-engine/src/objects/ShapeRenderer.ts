import * as PIXI from 'pixi.js';
import { ShapeObject } from '@whiteboard/shared';

export class ShapeRenderer {
  public static render(g: PIXI.Graphics, obj: ShapeObject, isSelected: boolean): void {
    const fillColor = parseInt((obj.fillColor || '#3b82f6').replace('#', '0x'), 16);
    const strokeColor = parseInt((obj.strokeColor || '#ffffff').replace('#', '0x'), 16);
    const strokeWidth = isSelected ? 2 : obj.strokeWidth || 2;
    const finalStrokeColor = isSelected ? 0x3b82f6 : strokeColor;

    const hasRotation = obj.rotation && obj.rotation !== 0;
    if (hasRotation) {
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + obj.height / 2;
      const rad = (obj.rotation * Math.PI) / 180;
      const matrix = new PIXI.Matrix();
      matrix.translate(-cx, -cy);
      matrix.rotate(rad);
      matrix.translate(cx, cy);
      g.setMatrix(matrix);
    }

    const rawOpacity = obj.opacity !== undefined ? obj.opacity : 1;
    const fillStyle = obj.fillStyle || 'solid';

    let fillAlpha = rawOpacity;
    if (fillStyle === 'transparent') {
      fillAlpha = 0;
    } else if (fillStyle === 'semi') {
      fillAlpha = rawOpacity * 0.35;
    } else if (fillStyle === 'hachure' || fillStyle === 'dots') {
      fillAlpha = rawOpacity * 0.15;
    }

    g.beginFill(fillColor, fillAlpha);
    g.lineStyle(strokeWidth, finalStrokeColor, rawOpacity);

    if (obj.type === 'rectangle') {
      g.drawRoundedRect(obj.x, obj.y, obj.width, obj.height, obj.borderRadius || 4);
    } else if (obj.type === 'rounded-rectangle') {
      g.drawRoundedRect(obj.x, obj.y, obj.width, obj.height, obj.borderRadius || 18);
    } else if (obj.type === 'ellipse') {
      g.drawEllipse(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, obj.height / 2);
    } else if (obj.type === 'triangle') {
      const topX = obj.x + obj.width / 2;
      const topY = obj.y;
      const rightX = obj.x + obj.width;
      const rightY = obj.y + obj.height;
      const leftX = obj.x;
      const leftY = obj.y + obj.height;

      g.moveTo(topX, topY);
      g.lineTo(rightX, rightY);
      g.lineTo(leftX, leftY);
      g.lineTo(topX, topY);
    } else if (obj.type === 'diamond') {
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + obj.height / 2;
      g.moveTo(cx, obj.y);
      g.lineTo(obj.x + obj.width, cy);
      g.lineTo(cx, obj.y + obj.height);
      g.lineTo(obj.x, cy);
      g.lineTo(cx, obj.y);
    } else if (obj.type === 'hexagon') {
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + obj.height / 2;
      const rx = obj.width / 2;
      const ry = obj.height / 2;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6;
        const px = cx + rx * Math.cos(angle);
        const py = cy + ry * Math.sin(angle);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
    } else if (obj.type === 'star') {
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + obj.height / 2;
      const rx = obj.width / 2;
      const ry = obj.height / 2;
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const factor = i % 2 === 0 ? 1 : 0.42;
        const px = cx + rx * factor * Math.cos(angle);
        const py = cy + ry * factor * Math.sin(angle);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
    } else if (obj.type === 'bubble') {
      const bodyH = obj.height * 0.78;
      g.drawRoundedRect(obj.x, obj.y, obj.width, bodyH, 12);
      g.moveTo(obj.x + 24, obj.y + bodyH);
      g.lineTo(obj.x + 12, obj.y + obj.height);
      g.lineTo(obj.x + 40, obj.y + bodyH);
    }

    g.endFill();

    if (hasRotation) {
      g.setMatrix(new PIXI.Matrix());
    }
  }
}
