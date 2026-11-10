# CANVAS ENGINE SPECIFICATION

## 1. Overview

The Canvas Engine (`packages/canvas-engine`) is a pure TypeScript library built on top of **PixiJS** for hardware-accelerated 2D web rendering. It operates completely independently of React's lifecycle.

---

## 2. World Coordinate System vs. Screen Viewport

All persistent board object positions are stored strictly in **WORLD COORDINATES** $(x, y) \in \mathbb{R}^2$.

The camera viewport matrix maps world coordinates to screen pixel space:

$$\text{screenX} = (\text{worldX} - \text{camera.x}) \times \text{camera.zoom}$$
$$\text{screenY} = (\text{worldY} - \text{camera.y}) \times \text{camera.zoom}$$

Reversed transformation:

$$\text{worldX} = \frac{\text{screenX}}{\text{camera.zoom}} + \text{camera.x}$$
$$\text{worldY} = \frac{\text{screenY}}{\text{camera.zoom}} + \text{camera.y}$$

---

## 3. Zoom-Around-Cursor Algorithm

Zooming must anchor precisely to the user's cursor position $(S_x, S_y)$:

1. Calculate world point under mouse before zoom:
   $$W_{\text{before}} = \text{screenToWorld}(S_x, S_y)$$
2. Update camera zoom level with clamping $[0.1, 5.0]$.
3. Calculate world point under mouse after zoom:
   $$W_{\text{after}} = \text{screenToWorld}(S_x, S_y)$$
4. Adjust camera position to maintain invariant $W_{\text{before}} = W_{\text{after}}$:
   $$\text{camera.x} += (W_{\text{before}}.x - W_{\text{after}}.x)$$
   $$\text{camera.y} += (W_{\text{before}}.y - W_{\text{after}}.y)$$

---

## 4. Renderers & Hit Testing

- **Renderers**: Individual renderer classes (`StickyRenderer`, `TextRenderer`, `ShapeRenderer`, `ImageRenderer`, `DrawingRenderer`, `ConnectorRenderer`, `FrameRenderer`) handle drawing and updating PixiJS DisplayObjects.
- **Hit Testing & Bounds**: Rotated bounding box calculation ($AABB$ and $OBB$) and Ray-Casting hit test algorithm for precise selection.
- **Selection Handles**: 8 resize handles (top-left, top, top-right, right, bottom-right, bottom, bottom-left, left) + 1 rotation handle.
