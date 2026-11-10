import * as Y from 'yjs';
import { BoardObject } from '@whiteboard/shared';

export function createBoardDoc(): Y.Doc {
  const doc = new Y.Doc();
  return doc;
}

export function getObjectsMap(doc: Y.Doc): Y.Map<Y.Map<any>> {
  return doc.getMap('objects');
}

export function getOrderArray(doc: Y.Doc): Y.Array<string> {
  return doc.getArray('order');
}

export function boardObjectToYMap(obj: BoardObject): Y.Map<any> {
  const yMap = new Y.Map<any>();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      yMap.set(key, value);
    }
  });
  return yMap;
}

export function yMapToBoardObject(yMap: Y.Map<any>): BoardObject {
  const obj: any = {};
  yMap.forEach((value, key) => {
    obj[key] = value;
  });
  return obj as BoardObject;
}
