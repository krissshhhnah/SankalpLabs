import { BoardObject, StickyObject, ShapeObject } from '@whiteboard/shared';

export interface OrganizedResult {
  updatedObjects: Array<{ id: string; x: number; y: number }>;
  newFrames?: BoardObject[];
}

/**
 * Tidy-up / Grid Alignment
 * Re-arranges messy scattered objects into an organized, evenly distributed grid
 */
export function organizeInGrid(
  objectsToOrganize: BoardObject[],
  columns: number = 4,
  gapX: number = 24,
  gapY: number = 24
): OrganizedResult {
  if (objectsToOrganize.length === 0) return { updatedObjects: [] };

  // Calculate start anchor based on min coordinates of current objects
  let minX = Infinity;
  let minY = Infinity;
  let avgWidth = 0;
  let avgHeight = 0;

  objectsToOrganize.forEach((obj) => {
    if (obj.x < minX) minX = obj.x;
    if (obj.y < minY) minY = obj.y;
    avgWidth += obj.width || 180;
    avgHeight += obj.height || 140;
  });

  avgWidth = Math.round(avgWidth / objectsToOrganize.length);
  avgHeight = Math.round(avgHeight / objectsToOrganize.length);

  const updated: Array<{ id: string; x: number; y: number }> = [];

  objectsToOrganize.forEach((obj, idx) => {
    const col = idx % columns;
    const row = Math.floor(idx / columns);
    const targetX = minX + col * (avgWidth + gapX);
    const targetY = minY + row * (avgHeight + gapY);

    updated.push({
      id: obj.id,
      x: targetX,
      y: targetY,
    });
  });

  return { updatedObjects: updated };
}

/**
 * Cluster / Group By Color into Swimlane Columns
 */
export function organizeByColorOrCategory(
  objectsToOrganize: BoardObject[],
  boardId: string,
  startZIndex: number = 100
): OrganizedResult {
  if (objectsToOrganize.length === 0) return { updatedObjects: [] };

  // Group objects by color (for sticky notes) or fillColor (for shapes)
  const groups = new Map<string, BoardObject[]>();

  objectsToOrganize.forEach((obj) => {
    let key = 'Default';
    if (obj.type === 'sticky') {
      key = (obj as StickyObject).color || '#fef08a';
    } else if ('fillColor' in obj) {
      key = (obj as ShapeObject).fillColor || '#eff6ff';
    }
    const list = groups.get(key) || [];
    list.push(obj);
    groups.set(key, list);
  });

  let minX = Infinity;
  let minY = Infinity;
  objectsToOrganize.forEach((obj) => {
    if (obj.x < minX) minX = obj.x;
    if (obj.y < minY) minY = obj.y;
  });

  const updated: Array<{ id: string; x: number; y: number }> = [];
  const colWidth = 220;
  const colGap = 40;
  const rowHeight = 160;
  const rowGap = 20;

  let colIdx = 0;
  groups.forEach((items, groupKey) => {
    const colX = minX + colIdx * (colWidth + colGap);

    items.forEach((item, rowIdx) => {
      const itemY = minY + 50 + rowIdx * (rowHeight + rowGap);
      updated.push({
        id: item.id,
        x: colX,
        y: itemY,
      });
    });

    colIdx++;
  });

  return {
    updatedObjects: updated,
  };
}

