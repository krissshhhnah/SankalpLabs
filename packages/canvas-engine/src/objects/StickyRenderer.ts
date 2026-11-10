import * as PIXI from 'pixi.js';
import { StickyObject } from '@whiteboard/shared';

export class StickyRenderer {
  public static render(
    g: PIXI.Graphics,
    textContainer: PIXI.Container,
    obj: StickyObject,
    isSelected: boolean,
    isEditing = false
  ): void {
    const fillColor = parseInt(obj.color.replace('#', '0x'), 16) || 0xfef08a;

    // Background shadow
    g.beginFill(0x000000, 0.15);
    g.drawRoundedRect(obj.x + 4, obj.y + 4, obj.width, obj.height, 8);
    g.endFill();

    // Sticky note body
    g.beginFill(fillColor);
    g.lineStyle(isSelected ? 2 : 1, isSelected ? 0x3b82f6 : 0x000000, isSelected ? 1 : 0.15);
    g.drawRoundedRect(obj.x, obj.y, obj.width, obj.height, 8);
    g.endFill();

    // Skip static PixiJS text when actively typing in overlay
    if (obj.text && !isEditing) {
      const align = obj.textAlign || (obj as any).align || 'center';
      const pixiText = new PIXI.Text(obj.text, {
        fontSize: obj.fontSize || 16,
        fontFamily: 'Inter, sans-serif',
        fontWeight: (obj as any).fontWeight || 'normal',
        fontStyle: (obj as any).fontStyle || 'normal',
        fill: parseInt((obj.textColor || '#000000').replace('#', '0x'), 16),
        align: align,
        wordWrap: true,
        wordWrapWidth: obj.width - 24,
      });

      if (align === 'center') {
        pixiText.x = obj.x + Math.max(12, (obj.width - pixiText.width) / 2);
      } else if (align === 'right') {
        pixiText.x = obj.x + Math.max(12, obj.width - 12 - pixiText.width);
      } else {
        pixiText.x = obj.x + 12;
      }

      pixiText.y = obj.y + 12;
      textContainer.addChild(pixiText);
    }
  }
}
