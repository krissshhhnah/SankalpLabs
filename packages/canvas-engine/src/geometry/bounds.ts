import { BoardObject, Point } from '@whiteboard/shared';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  rotation?: number;
}

export function getObjectBounds(obj: BoardObject): BoundingBox {
  const minX = obj.x;
  const minY = obj.y;
  const maxX = obj.x + obj.width;
  const maxY = obj.y + obj.height;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: obj.width,
    height: obj.height,
    centerX: obj.x + obj.width / 2,
    centerY: obj.y + obj.height / 2,
    rotation: obj.rotation,
  };
}

export function getMultiObjectBounds(objects: BoardObject[]): BoundingBox | null {
  if (objects.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const obj of objects) {
    const b = getObjectBounds(obj);
    if (b.minX < minX) minX = b.minX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.maxY > maxY) maxY = b.maxY;
  }

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: minX + width / 2,
    centerY: minY + height / 2,
    rotation: objects.length === 1 ? objects[0].rotation : undefined,
  };
}
