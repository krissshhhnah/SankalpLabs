import * as PIXI from 'pixi.js';
import { FrameObject } from '@whiteboard/shared';

export class FrameRenderer {
  public static render(
    g: PIXI.Graphics,
    textContainer: PIXI.Container,
    obj: FrameObject,
    isSelected: boolean
  ): void {
    const fillColor = parseInt((obj.fillColor || '#1e293b').replace('#', '0x'), 16);
    const strokeColor = parseInt((obj.strokeColor || '#64748b').replace('#', '0x'), 16);

    // Frame body background
    g.beginFill(fillColor, 0.2);
    g.lineStyle(isSelected ? 2 : 1, isSelected ? 0x3b82f6 : strokeColor, isSelected ? 1 : 0.6);
    g.drawRoundedRect(obj.x, obj.y, obj.width, obj.height, 12);
    g.endFill();

    // Frame Header Title Bar
    const titleText = new PIXI.Text(obj.title || 'Untitled Frame', {
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fill: 0x94a3b8,
    });
    titleText.x = obj.x + 12;
    titleText.y = obj.y - 24;
    textContainer.addChild(titleText);
  }
}
