import { BoardObject, Point, ConnectorAnchor } from '@whiteboard/shared';

export function getAnchorPoint(obj: BoardObject, anchor: ConnectorAnchor): Point {
  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;

  switch (anchor) {
    case 'top':
      return { x: cx, y: obj.y };
    case 'right':
      return { x: obj.x + obj.width, y: cy };
    case 'bottom':
      return { x: cx, y: obj.y + obj.height };
    case 'left':
      return { x: obj.x, y: cy };
    case 'center':
    default:
      return { x: cx, y: cy };
  }
}

export function calculateElbowPath(start: Point, end: Point): Point[] {
  const midX = (start.x + end.x) / 2;
  return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
}
