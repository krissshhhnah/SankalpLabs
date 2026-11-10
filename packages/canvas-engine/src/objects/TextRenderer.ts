import * as PIXI from 'pixi.js';
import { TextObject } from '@whiteboard/shared';

export class TextRenderer {
  public static render(
    g: PIXI.Graphics,
    textContainer: PIXI.Container,
    obj: TextObject,
    isSelected = false,
    isEditing = false
  ): void {
    const hasBackground = !!obj.backgroundColor && obj.backgroundColor !== 'transparent';
    if (hasBackground) {
      const bgColor = parseInt(obj.backgroundColor!.replace('#', '0x'), 16);
      g.beginFill(bgColor, 1);
      g.lineStyle(isSelected ? 2 : 1, isSelected ? 0x3b82f6 : 0x334155, isSelected ? 1 : 0.4);
      g.drawRoundedRect(obj.x, obj.y, obj.width, obj.height, 8);
      g.endFill();
    } else if (isSelected) {
      g.lineStyle(2, 0x3b82f6, 1);
      g.drawRect(obj.x, obj.y, obj.width, obj.height);
    }

    if (!obj.text || isEditing) return;

    const align = obj.align || (obj as any).textAlign || 'left';
    const padding = hasBackground ? 12 : 0;

    const pixiText = new PIXI.Text(obj.text, {
      fontSize: obj.fontSize || 18,
      fontFamily: obj.fontFamily || 'Inter, sans-serif',
      fontWeight: obj.fontWeight || 'normal',
      fontStyle: obj.fontStyle || 'normal',
      fill: parseInt((obj.color || '#000000').replace('#', '0x'), 16),
      align: align === 'justify' ? 'left' : align,
      wordWrap: true,
      wordWrapWidth: Math.max(10, obj.width - padding * 2),
    });

    if (align === 'center') {
      pixiText.x = obj.x + Math.max(padding, (obj.width - pixiText.width) / 2);
    } else if (align === 'right') {
      pixiText.x = obj.x + Math.max(padding, obj.width - padding - pixiText.width);
    } else {
      pixiText.x = obj.x + padding;
    }

    pixiText.y = obj.y + padding;
    textContainer.addChild(pixiText);
  }
}

