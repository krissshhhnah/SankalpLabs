import { BoardObject, Point } from '@whiteboard/shared';

export function isPointInObject(point: Point, obj: BoardObject): boolean {
  // If no rotation, simple AABB check
  if (!obj.rotation || obj.rotation === 0) {
    return (
      point.x >= obj.x &&
      point.x <= obj.x + obj.width &&
      point.y >= obj.y &&
      point.y <= obj.y + obj.height
    );
  }

  // Handle rotation transform check
  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;
  const rad = -obj.rotation * (Math.PI / 180);

  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const dx = point.x - cx;
  const dy = point.y - cy;

  const localX = cos * dx - sin * dy + cx;
  const localY = sin * dx + cos * dy + cy;

  return (
    localX >= obj.x &&
    localX <= obj.x + obj.width &&
    localY >= obj.y &&
    localY <= obj.y + obj.height
  );
}

export function isObjectInRect(
  obj: BoardObject,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  const rectMinX = Math.min(rect.x, rect.x + rect.width);
  const rectMaxX = Math.max(rect.x, rect.x + rect.width);
  const rectMinY = Math.min(rect.y, rect.y + rect.height);
  const rectMaxY = Math.max(rect.y, rect.y + rect.height);

  const objMinX = obj.x;
  const objMaxX = obj.x + obj.width;
  const objMinY = obj.y;
  const objMaxY = obj.y + obj.height;

  return (
    objMinX >= rectMinX &&
    objMaxX <= rectMaxX &&
    objMinY >= rectMinY &&
    objMaxY <= rectMaxY
  );
}

export function isObjectIntersectingRect(
  obj: BoardObject,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  const rectMinX = Math.min(rect.x, rect.x + rect.width);
  const rectMaxX = Math.max(rect.x, rect.x + rect.width);
  const rectMinY = Math.min(rect.y, rect.y + rect.height);
  const rectMaxY = Math.max(rect.y, rect.y + rect.height);

  if (obj.type === 'drawing' && (obj as any).points && (obj as any).points.length > 0) {
    const pts: Point[] = (obj as any).points;
    for (const p of pts) {
      if (p.x >= rectMinX && p.x <= rectMaxX && p.y >= rectMinY && p.y <= rectMaxY) {
        return true;
      }
    }
  }

  const objMinX = obj.x;
  const objMaxX = obj.x + obj.width;
  const objMinY = obj.y;
  const objMaxY = obj.y + obj.height;

  return (
    objMinX <= rectMaxX &&
    objMaxX >= rectMinX &&
    objMinY <= rectMaxY &&
    objMaxY >= rectMinY
  );
}

