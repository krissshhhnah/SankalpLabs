# ARCHITECTURE SPECIFICATION — COLLABORATIVE INFINITE CANVAS PLATFORM

## 1. Executive Overview

This document specifies the system architecture for the Collaborative Infinite Canvas Platform — a modern, production-grade real-time collaborative visual workspace inspired by Miro's interaction model.

The platform is designed around five core pillars:
1. **World Coordinate System & Camera Physics**: Infinite 2D Cartesian world coordinate space transformed smoothly to screen viewports.
2. **Dedicated Canvas Engine (PixiJS)**: Hardware-accelerated GPU rendering detached from React's virtual DOM reconciliation loop.
3. **CRDT State Synchronization (Yjs + WebSockets)**: Conflict-free replicated data types ensuring real-time multi-user synchronization and offline-first resilience.
4. **Decoupled Backend Architecture (Fastify + Prisma + Redis/PostgreSQL)**: Scalable Node.js service handling authentication, board persistence, permissions, and WebSocket room isolation.
5. **Typed Object Model**: Strictly typed discriminated union architecture for all canvas object types.

---

## 2. System Topology

```
                                 ┌─────────────────────────────────┐
                                 │       React + Vite Frontend     │
                                 │                                 │
                                 │  ┌───────────┐  ┌────────────┐  │
                                 │  │ React UI  │  │ PixiJS GPU │  │
                                 │  │ (Panels)  │  │ Canvas     │  │
                                 │  └─────┬─────┘  └─────▲──────┘  │
                                 │        │ Zustand      │         │
                                 │        └───────┬──────┘         │
                                 │                │                │
                                 │          ┌─────▼─────┐          │
                                 │          │ Y.Doc     │          │
                                 │          │ CRDT      │          │
                                 └──────────┴─────┬─────┴──────────┘
                                                  │
                                       WebSocket (Y-Websocket)
                                                  │
                                 ┌────────────────▼────────────────┐
                                 │     Node.js Fastify Backend     │
                                 │                                 │
                                 │  ┌───────────────────────────┐  │
                                 │  │ WebSocket Room Manager    │  │
                                 │  └─────────────┬─────────────┘  │
                                 │                │                │
                                 │  ┌─────────────▼─────────────┐  │
                                 │  │ Debounced Snapshot Syncer │  │
                                 │  └─────────────┬─────────────┘  │
                                 └────────────────┼────────────────┘
                                                  │
                                        ┌─────────┴─────────┐
                                        │                   │
                                 ┌──────▼───────┐    ┌──────▼───────┐
                                 │ PostgreSQL   │    │ S3 Object    │
                                 │ Database     │    │ Storage      │
                                 └──────────────┘    └──────────────┘
```

---

## 3. Monorepo Package Structure

```
d:/whiteboard
├── apps/
│   ├── web/                     # React 18 + Vite + Tailwind CSS frontend application
│   └── server/                  # Fastify REST API & WebSocket Yjs server
├── packages/
│   ├── canvas-engine/           # Pure PixiJS infinite canvas engine & geometry math
│   ├── collaboration/           # Yjs CRDT binding & Awareness protocols
│   ├── database/                # Prisma schema & database access client
│   ├── shared/                  # Shared TypeScript types, Zod schemas, constants
│   └── ui/                      # Shared UI design tokens & icons
├── docs/                        # Technical architecture documentation
```

---

## 4. State Management Separation

To prevent unnecessary React re-renders while achieving 60 FPS canvas performance, state is strictly partitioned into four domains:

| State Domain | Storage Layer | React Re-render Impact | Example Data |
| :--- | :--- | :--- | :--- |
| **Persistent Board State** | `Y.Doc` + PostgreSQL | Zero (PixiJS renders directly) | Board objects, coordinates, z-index, shapes |
| **Local UI State** | Zustand (`uiStore`) | Component-scoped | Active tool, selected property color, dialog visibilities |
| **Local Camera State** | PixiJS Camera / `cameraStore` | Zero (direct GPU matrix transform) | Camera X, Camera Y, Zoom factor |
| **Realtime Presence** | Yjs Awareness protocol | Viewport / overlay only | Remote cursor positions, user selection borders, name tags |

---

## 5. Development Phases

- **Phase 0**: Architecture Specifications & Documentation (Current)
- **Phase 1**: Monorepo Setup & Foundation
- **Phase 2**: Canvas Engine & Camera Physics (PixiJS Viewport, Pan/Zoom around cursor)
- **Phase 3**: Object Model & Renderers (Sticky, Text, Shapes, Connector, Freehand, Image, Frame)
- **Phase 4**: Database & REST API Persistence (Prisma, Fastify Auth/Board CRUD, S3 upload)
- **Phase 5**: Real-Time Collaboration & Presence (Yjs WebSockets, Live Cursors, Selections)
- **Phase 6**: Advanced Editing & Shortcuts (Undo/Redo isolation, Copy/Paste/Duplicate, Keyboard bindings)
- **Phase 7**: Permissions & Sharing (Role-based access control, Share modal)
- **Phase 8**: Performance & Viewport Culling (Spatial culling, batch rendering)
- **Phase 9**: Polish, Accessibility & End-to-End Verification
