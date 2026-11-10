import { Point, Camera as ICamera, ViewportBounds } from '@whiteboard/shared';

export interface CameraOptions {
  minZoom?: number;
  maxZoom?: number;
}

export class Camera implements ICamera {
  public x: number;
  public y: number;
  public zoom: number;
  public minZoom: number;
  public maxZoom: number;

  constructor(x = 0, y = 0, zoom = 1, options: CameraOptions = {}) {
    this.x = x;
    this.y = y;
    this.zoom = zoom;
    this.minZoom = options.minZoom ?? 0.05;
    this.maxZoom = options.maxZoom ?? 5.0;
  }

  public screenToWorld(screenPoint: Point): Point {
    return {
      x: screenPoint.x / this.zoom + this.x,
      y: screenPoint.y / this.zoom + this.y,
    };
  }

  public worldToScreen(worldPoint: Point): Point {
    return {
      x: (worldPoint.x - this.x) * this.zoom,
      y: (worldPoint.y - this.y) * this.zoom,
    };
  }

  public panBy(deltaScreenX: number, deltaScreenY: number): void {
    this.x -= deltaScreenX / this.zoom;
    this.y -= deltaScreenY / this.zoom;
  }

  public zoomAroundCursor(screenMouse: Point, deltaZoom: number): void {
    const worldBefore = this.screenToWorld(screenMouse);
    const targetZoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, this.zoom * (1 + deltaZoom))
    );

    if (targetZoom === this.zoom) return;

    this.zoom = targetZoom;
    const worldAfter = this.screenToWorld(screenMouse);

    this.x += worldBefore.x - worldAfter.x;
    this.y += worldBefore.y - worldAfter.y;
  }

  public setZoom(zoom: number, centerScreenPoint?: Point): void {
    if (centerScreenPoint) {
      const currentWorld = this.screenToWorld(centerScreenPoint);
      this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
      const newWorld = this.screenToWorld(centerScreenPoint);
      this.x += currentWorld.x - newWorld.x;
      this.y += currentWorld.y - newWorld.y;
    } else {
      this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
    }
  }

  public getViewportBounds(screenWidth: number, screenHeight: number): ViewportBounds {
    const topLeft = this.screenToWorld({ x: 0, y: 0 });
    const bottomRight = this.screenToWorld({ x: screenWidth, y: screenHeight });
    return {
      minX: topLeft.x,
      minY: topLeft.y,
      maxX: bottomRight.x,
      maxY: bottomRight.y,
    };
  }

  public clone(): Camera {
    return new Camera(this.x, this.y, this.zoom, {
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
    });
  }
}
