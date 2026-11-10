import * as PIXI from 'pixi.js';
import { ImageObject } from '@whiteboard/shared';

export class ImageRenderer {
  public static render(
    g: PIXI.Graphics,
    textContainer: PIXI.Container,
    obj: ImageObject,
    isSelected: boolean
  ): void {
    if (!obj.src) return;

    try {
      const texture = PIXI.Texture.from(obj.src);
      const sprite = new PIXI.Sprite(texture);
      sprite.width = obj.width;
      sprite.height = obj.height;

      if (obj.rotation && obj.rotation !== 0) {
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        sprite.anchor.set(0.5, 0.5);
        sprite.x = cx;
        sprite.y = cy;
        sprite.rotation = (obj.rotation * Math.PI) / 180;
      } else {
        sprite.anchor.set(0, 0);
        sprite.x = obj.x;
        sprite.y = obj.y;
      }

      textContainer.addChild(sprite);
    } catch (err) {
      // Fallback graphic if image fails to render
      g.beginFill(0x1e293b, 0.8);
      g.lineStyle(isSelected ? 2 : 1, isSelected ? 0x3b82f6 : 0x475569, isSelected ? 1 : 0.5);
      g.drawRoundedRect(obj.x, obj.y, obj.width, obj.height, 6);
      g.endFill();
    }

    if (isSelected) {
      g.lineStyle(2, 0x3b82f6, 1);
      if (obj.rotation && obj.rotation !== 0) {
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        const rad = (obj.rotation * Math.PI) / 180;
        const matrix = new PIXI.Matrix();
        matrix.translate(-cx, -cy);
        matrix.rotate(rad);
        matrix.translate(cx, cy);
        g.setMatrix(matrix);
        g.drawRect(obj.x, obj.y, obj.width, obj.height);
        g.setMatrix(new PIXI.Matrix());
      } else {
        g.drawRect(obj.x, obj.y, obj.width, obj.height);
      }
    }
  }
}

