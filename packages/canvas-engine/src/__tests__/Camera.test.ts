import { describe, it, expect } from 'vitest';
import { Camera } from '../camera/Camera';
import { isPointInObject } from '../geometry/hitTest';
import { BoardObject } from '@whiteboard/shared';

describe('Camera Engine Mathematics', () => {
  it('correctly converts screen coordinates to world coordinates at 1x zoom', () => {
    const camera = new Camera(100, 200, 1.0);
    const screenPoint = { x: 300, y: 400 };

    const worldPoint = camera.screenToWorld(screenPoint);
    expect(worldPoint).toEqual({ x: 400, y: 600 });
  });

  it('correctly converts world coordinates to screen coordinates at 2x zoom', () => {
    const camera = new Camera(50, 50, 2.0);
    const worldPoint = { x: 100, y: 150 };

    const screenPoint = camera.worldToScreen(worldPoint);
    expect(screenPoint).toEqual({ x: 100, y: 200 });
  });

  it('maintains mouse cursor world coordinate invariant during zoomAroundCursor', () => {
    const camera = new Camera(0, 0, 1.0);
    const mouseScreen = { x: 400, y: 300 };

    const worldBefore = camera.screenToWorld(mouseScreen);
    camera.zoomAroundCursor(mouseScreen, 0.5); // Zoom in by 50%
    const worldAfter = camera.screenToWorld(mouseScreen);

    expect(worldBefore.x).toBeCloseTo(worldAfter.x, 4);
    expect(worldBefore.y).toBeCloseTo(worldAfter.y, 4);
  });

  it('correctly pans camera by screen delta', () => {
    const camera = new Camera(100, 100, 2.0);
    camera.panBy(40, 20);

    expect(camera.x).toBe(80);
    expect(camera.y).toBe(90);
  });
});

describe('Geometry Hit Testing', () => {
  const dummySticky: BoardObject = {
    id: 'sticky-1',
    boardId: 'default',
    type: 'sticky',
    x: 100,
    y: 200,
    width: 150,
    height: 150,
    rotation: 0,
    zIndex: 1,
    locked: false,
    createdBy: 'user',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    color: '#fef08a',
    text: 'Test Sticky',
    fontSize: 16,
    textAlign: 'center',
    textColor: '#000000',
  };

  it('returns true for points inside bounding box', () => {
    expect(isPointInObject({ x: 150, y: 250 }, dummySticky)).toBe(true);
  });

  it('returns false for points outside bounding box', () => {
    expect(isPointInObject({ x: 50, y: 50 }, dummySticky)).toBe(false);
  });
});
