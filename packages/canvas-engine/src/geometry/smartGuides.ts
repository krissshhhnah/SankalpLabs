import { BoardObject, Point } from '@whiteboard/shared';

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number;
}

export interface SmartGuideResult {
  snappedX: number;
  snappedY: number;
  guides: AlignmentGuide[];
}

export function computeSmartGuides(
  target: { x: number; y: number; width: number; height: number },
  otherObjects: BoardObject[],
  threshold = 6
): SmartGuideResult {
  let snappedX = target.x;
  let snappedY = target.y;
  const guides: AlignmentGuide[] = [];

  const targetLeft = target.x;
  const targetCenterX = target.x + target.width / 2;
  const targetRight = target.x + target.width;

  const targetTop = target.y;
  const targetCenterY = target.y + target.height / 2;
  const targetBottom = target.y + target.height;

  for (const obj of otherObjects) {
    const objLeft = obj.x;
    const objCenterX = obj.x + obj.width / 2;
    const objRight = obj.x + obj.width;

    const objTop = obj.y;
    const objCenterY = obj.y + obj.height / 2;
    const objBottom = obj.y + obj.height;

    // Vertical Alignments (X axis)
    if (Math.abs(targetLeft - objLeft) <= threshold) {
      snappedX = objLeft;
      guides.push({ type: 'vertical', position: objLeft });
    } else if (Math.abs(targetCenterX - objCenterX) <= threshold) {
      snappedX = objCenterX - target.width / 2;
      guides.push({ type: 'vertical', position: objCenterX });
    } else if (Math.abs(targetRight - objRight) <= threshold) {
      snappedX = objRight - target.width;
      guides.push({ type: 'vertical', position: objRight });
    }

    // Horizontal Alignments (Y axis)
    if (Math.abs(targetTop - objTop) <= threshold) {
      snappedY = objTop;
      guides.push({ type: 'horizontal', position: objTop });
    } else if (Math.abs(targetCenterY - objCenterY) <= threshold) {
      snappedY = objCenterY - target.height / 2;
      guides.push({ type: 'horizontal', position: objCenterY });
    } else if (Math.abs(targetBottom - objBottom) <= threshold) {
      snappedY = objBottom - target.height;
      guides.push({ type: 'horizontal', position: objBottom });
    }
  }

  return { snappedX, snappedY, guides };
}
