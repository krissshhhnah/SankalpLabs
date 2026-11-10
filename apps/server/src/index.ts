import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import websocket from '@fastify/websocket';
import { authRoutes } from './api/auth';
import { boardRoutes } from './api/boards';
import { uploadRoutes } from './api/uploads';
import { aiRoutes } from './api/ai';
import { getOrCreateRoom } from './websocket/roomManager';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const PORT = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';

async function buildServer() {
  const server = Fastify({ logger: true });

  await server.register(cors, { origin: true });
  await server.register(jwt, { secret: JWT_SECRET });
  await server.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  await server.register(websocket);

  // Register API Routes
  await server.register(authRoutes);
  await server.register(boardRoutes);
  await server.register(uploadRoutes);
  await server.register(aiRoutes);

  // Root redirect to web application frontend
  server.get('/', async (req, reply) => {
    return reply.redirect('http://localhost:3000/');
  });

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'ok', server: 'whiteboard-api', timestamp: new Date().toISOString() };
  });

  // WebSocket route for real-time Yjs collaboration
  server.get('/ws/boards/:boardId', { websocket: true }, async (connection, req) => {
    const params = req.params as { boardId: string };
    const boardId = params.boardId;
    const socket = connection.socket;

    const room = await getOrCreateRoom(boardId);
    room.connections.add(socket);

    // 1. Send initial Sync step 1
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 0); // messageSync = 0
    syncProtocol.writeSyncStep1(encoder, room.doc);
    socket.send(encoding.toUint8Array(encoder));

    // 2. Send current awareness states if any exist
    const awarenessStates = room.awareness.getStates();
    if (awarenessStates.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, 1);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          room.awareness,
          Array.from(awarenessStates.keys())
        )
      );
      socket.send(encoding.toUint8Array(awarenessEncoder));
    }

    // Handle incoming WebSocket binary messages
    socket.on('message', (message: Buffer) => {
      try {
        const uint8Array = new Uint8Array(message);
        const decoder = decoding.createDecoder(uint8Array);
        const messageType = decoding.readVarUint(decoder);

        if (messageType === 0) {
          // Sync protocol message
          const replyEncoder = encoding.createEncoder();
          encoding.writeVarUint(replyEncoder, 0);
          syncProtocol.readSyncMessage(decoder, replyEncoder, room.doc, socket);

          if (encoding.length(replyEncoder) > 1) {
            socket.send(encoding.toUint8Array(replyEncoder));
          }
        } else if (messageType === 1) {
          // Awareness protocol message
          awarenessProtocol.applyAwarenessUpdate(
            room.awareness,
            decoding.readVarUint8Array(decoder),
            socket
          );
        }
      } catch (err) {
        console.error('[WebSocket] Message handling error:', err);
      }
    });

    socket.on('close', () => {
      room.connections.delete(socket);
    });
  });

  return server;
}

async function main() {
  const server = await buildServer();
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Whiteboard server listening on http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
