# REAL-TIME COLLABORATION & CRDT SPECIFICATION

## 1. Overview

The platform uses **Yjs** (a high-performance Conflict-free Replicated Data Type framework) combined with WebSockets for real-time multiplayer state synchronization.

---

## 2. Document Architecture (`Y.Doc`)

Each board corresponds to a unique `Y.Doc`.
The document structure consists of:
- `yObjects`: `Y.Map<Y.Map<any>>` — Map of object IDs to object state maps.
- `yOrder`: `Y.Array<string>` — Array of object IDs defining z-index ordering.

---

## 3. Real-Time Awareness Protocol

User presence is ephemeral and managed via Yjs Awareness:
- `user`: `{ id: string, name: string, avatarUrl: string, color: string }`
- `cursor`: `{ x: number, y: number }` (World coordinates, throttled at ~30Hz)
- `selectedIds`: `string[]`
- `activeTool`: `string`

---

## 4. Undo / Redo Isolation

Local client undo actions are scoped using `Y.UndoManager` targeting `yObjects` and `yOrder`.
Actions performed by remote clients are excluded from the local undo stack, ensuring that pressing `Ctrl+Z` only reverts the local user's edits.
