import WebSocket from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import { prisma } from '@whiteboard/database';

export interface Room {
  boardId: string;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  connections: Set<WebSocket>;
  saveTimeout: NodeJS.Timeout | null;
}

const rooms = new Map<string, Room>();

export async function getOrCreateRoom(boardId: string): Promise<Room> {
  let room = rooms.get(boardId);
  if (room) return room;

  const doc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(doc);

  room = {
    boardId,
    doc,
    awareness,
    connections: new Set(),
    saveTimeout: null,
  };

  // Load existing board objects and comments from database if present
  try {
    const dbObjects = await prisma.boardObject.findMany({
      where: { boardId },
    });

    if (dbObjects.length > 0) {
      const yMap = doc.getMap('objects');
      const yOrder = doc.getArray<string>('order');

      doc.transact(() => {
        dbObjects.forEach((obj: any) => {
          let customData = {};
          try {
            customData = typeof obj.data === 'string' ? JSON.parse(obj.data) : (obj.data || {});
          } catch (e) {}

          const fullObj = {
            id: obj.id,
            boardId: obj.boardId || boardId,
            type: obj.type,
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
            rotation: obj.rotation,
            zIndex: obj.zIndex,
            locked: obj.locked,
            createdBy: obj.createdBy,
            createdAt: obj.createdAt ? new Date(obj.createdAt).getTime() : Date.now(),
            updatedAt: obj.updatedAt ? new Date(obj.updatedAt).getTime() : Date.now(),
            ...customData,
          };

          const objYMap = new Y.Map();
          Object.entries(fullObj).forEach(([k, v]) => {
            if (v !== undefined) objYMap.set(k, v);
          });
          yMap.set(obj.id, objYMap);
          yOrder.push([obj.id]);
        });
      });
    }

    // Load comments into doc.getMap('comments')
    const dbComments = await prisma.boardComment.findMany({
      where: { boardId },
    });
    if (dbComments.length > 0) {
      const commentsMap = doc.getMap('comments');
      doc.transact(() => {
        dbComments.forEach((c: any) => {
          let extra = {};
          try {
            extra = typeof c.data === 'string' ? JSON.parse(c.data) : (c.data || {});
          } catch (e) {}
          const thread = {
            id: c.id,
            boardId: c.boardId || boardId,
            x: c.x,
            y: c.y,
            resolved: c.resolved,
            authorId: c.authorId,
            authorName: c.authorName,
            authorAvatar: c.authorAvatar,
            createdAt: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
            replies: c.replies || [],
            ...extra,
          };
          commentsMap.set(c.id, thread);
        });
      });
    }
  } catch (err) {
    console.error(`[RoomManager] Error loading board ${boardId} from database:`, err);
  }

  // Setup broadcast & debounced auto-save listener on Y.Doc changes
  doc.on('update', (update: Uint8Array, origin: any) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 0); // messageSync = 0
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);

    for (const conn of room!.connections) {
      if (conn !== origin && conn.readyState === WebSocket.OPEN) {
        conn.send(message);
      }
    }

    scheduleSave(room!);
  });

  // Setup broadcast listener on Awareness changes (cursor, presence)
  awareness.on('update', ({ added, updated, removed }: any, origin: any) => {
    const changedClients = added.concat(updated, removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 1); // messageAwareness = 1
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
    );
    const message = encoding.toUint8Array(encoder);

    for (const conn of room!.connections) {
      if (conn !== origin && conn.readyState === WebSocket.OPEN) {
        conn.send(message);
      }
    }
  });

  rooms.set(boardId, room);
  return room;
}

function scheduleSave(room: Room) {
  if (room.saveTimeout) {
    clearTimeout(room.saveTimeout);
  }

  room.saveTimeout = setTimeout(async () => {
    room.saveTimeout = null;
    await persistRoomToDatabase(room);
  }, 1000); // 1-second debounce batch save
}

export async function persistRoomToDatabase(room: Room) {
  try {
    const yMap = room.doc.getMap('objects');
    const objectEntries: Array<[string, any]> = Array.from(yMap.entries() as any);
    const activeIds: string[] = [];

    // Ensure parent board record exists
    const existingBoard = await prisma.board.findUnique({ where: { id: room.boardId } });
    if (!existingBoard) {
      await prisma.board.create({
        data: {
          id: room.boardId,
          name: 'Collaborative Workspace',
          ownerId: 'user-admin-demo',
          isPublic: true,
        },
      });
    }

    for (const [id, objYMap] of objectEntries) {
      let raw: any = {};
      if (objYMap && typeof objYMap.toJSON === 'function') {
        raw = objYMap.toJSON();
      } else if (objYMap && typeof objYMap.forEach === 'function') {
        objYMap.forEach((val: any, key: string) => {
          raw[key] = val && typeof val.toJSON === 'function' ? val.toJSON() : val;
        });
      } else if (objYMap && typeof objYMap === 'object') {
        raw = { ...objYMap };
      }

      const {
        id: objId,
        boardId,
        type,
        x,
        y,
        width,
        height,
        rotation,
        zIndex,
        locked,
        createdBy,
        createdAt,
        updatedAt,
        ...customData
      } = raw;

      const targetId = objId || id;
      if (!targetId || !type || x === undefined || y === undefined) continue;

      activeIds.push(targetId);

      await prisma.boardObject.upsert({
        where: { id: targetId },
        create: {
          id: targetId,
          boardId: room.boardId,
          type,
          x: Number(x) || 0,
          y: Number(y) || 0,
          width: Number(width) || 100,
          height: Number(height) || 100,
          rotation: Number(rotation) || 0,
          zIndex: Number(zIndex) || 0,
          locked: Boolean(locked),
          createdBy: String(createdBy || 'system'),
          data: JSON.stringify(customData),
        },
        update: {
          boardId: room.boardId,
          type,
          x: Number(x) || 0,
          y: Number(y) || 0,
          width: Number(width) || 100,
          height: Number(height) || 100,
          rotation: Number(rotation) || 0,
          zIndex: Number(zIndex) || 0,
          locked: Boolean(locked),
          data: JSON.stringify(customData),
        },
      });
    }

    // Clean up objects that were deleted from the whiteboard
    if (activeIds.length > 0) {
      await prisma.boardObject.deleteMany({
        where: {
          boardId: room.boardId,
          id: { notIn: activeIds },
        },
      });
    } else {
      await prisma.boardObject.deleteMany({
        where: {
          boardId: room.boardId,
        },
      });
    }

    // Persist comment threads
    const commentsMap = room.doc.getMap('comments');
    const commentEntries: Array<[string, any]> = Array.from(commentsMap.entries() as any);
    const activeCommentIds: string[] = [];

    for (const [id, commVal] of commentEntries) {
      let comm: any = commVal;
      if (comm && typeof comm.toJSON === 'function') comm = comm.toJSON();
      if (!comm || !comm.id) continue;

      activeCommentIds.push(comm.id);

      const { id: cId, boardId, x, y, resolved, authorId, authorName, authorAvatar, createdAt, replies, ...extraData } = comm;

      await prisma.boardComment.upsert({
        where: { id: cId },
        create: {
          id: cId,
          boardId: room.boardId,
          x: Number(x) || 0,
          y: Number(y) || 0,
          resolved: Boolean(resolved),
          authorId: String(authorId || ''),
          authorName: String(authorName || 'Collaborator'),
          authorAvatar: authorAvatar || null,
          replies: replies || [],
          data: JSON.stringify(extraData),
        },
        update: {
          boardId: room.boardId,
          x: Number(x) || 0,
          y: Number(y) || 0,
          resolved: Boolean(resolved),
          authorId: String(authorId || ''),
          authorName: String(authorName || 'Collaborator'),
          authorAvatar: authorAvatar || null,
          replies: replies || [],
          data: JSON.stringify(extraData),
        },
      });
    }

    if (activeCommentIds.length > 0) {
      await prisma.boardComment.deleteMany({
        where: {
          boardId: room.boardId,
          id: { notIn: activeCommentIds },
        },
      });
    } else {
      await prisma.boardComment.deleteMany({
        where: {
          boardId: room.boardId,
        },
      });
    }

    await prisma.board.update({
      where: { id: room.boardId },
      data: { updatedAt: new Date() },
    });
  } catch (err) {
    console.error(`[RoomManager] Error persisting room ${room.boardId}:`, err);
  }
}
