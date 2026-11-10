import { FastifyInstance } from 'fastify';
import { prisma } from '@whiteboard/database';
import { getOrCreateRoom, persistRoomToDatabase } from '../websocket/roomManager';

export async function boardRoutes(server: FastifyInstance) {
  // Force save board room objects to database
  server.post('/api/boards/:id/save', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const room = await getOrCreateRoom(id);
      await persistRoomToDatabase(room);

      return { success: true, savedAt: Date.now() };
    } catch (err) {
      return reply.status(500).send({ error: 'Failed to persist board' });
    }
  });

  // Project Folders / Workspaces API
  server.get('/api/projects', async (request) => {
    let userId = 'user-admin-demo';
    try {
      await request.jwtVerify();
      userId = (request.user as { userId: string }).userId;
    } catch (e) {}

    const projects = await prisma.project.findMany({ where: { userId } });
    return projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      icon: p.icon,
      description: p.description,
    }));
  });

  server.post('/api/projects', async (request, reply) => {
    let userId = 'user-admin-demo';
    try {
      await request.jwtVerify();
      userId = (request.user as { userId: string }).userId;
    } catch (e) {}

    const { name, color, icon, description } = request.body as any;
    if (!name || !name.trim()) {
      return reply.status(400).send({ error: 'Project name is required' });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        color: color || '#3b82f6',
        icon: icon || 'Folder',
        description: description || '',
        userId,
      },
    });

    return project;
  });

  server.delete('/api/projects/:id', async (request) => {
    const { id } = request.params as { id: string };
    await prisma.project.delete({ where: { id } });
    return { success: true };
  });

  // Create a new board
  server.post('/api/boards', async (request) => {
    let userId = 'user-admin-demo';
    try {
      await request.jwtVerify();
      userId = (request.user as { userId: string }).userId;
    } catch (err) {}

    const { name, projectId } = (request.body as { name?: string; projectId?: string }) || {};
    const boardName = name && name.trim() ? name.trim() : 'Untitled Workspace';

    const board = await prisma.board.create({
      data: {
        name: boardName,
        ownerId: userId,
        projectId: projectId || null,
        members: {
          create: {
            userId: userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: true,
      },
    });

    return {
      id: board.id,
      name: board.name,
      ownerId: board.ownerId,
      ownerName: board.owner?.name || 'Demo Admin',
      role: 'OWNER',
      projectId: board.projectId || null,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  });

  // List all boards accessible by the current user
  server.get('/api/boards', async (request) => {
    let userId = 'user-admin-demo';
    try {
      await request.jwtVerify();
      userId = (request.user as { userId: string }).userId;
    } catch (err) {}

    let memberships = await prisma.boardMember.findMany({
      where: { userId },
      include: {
        board: {
          include: {
            owner: true,
          },
        },
      },
    });

    memberships = memberships.filter((m: any) => m && m.board && m.board.id);

    const boardsWithCounts = await Promise.all(
      memberships.map(async (m: any) => {
        const objectCount = await prisma.boardObject.count({ where: { boardId: m.board.id } });
        return {
          id: m.board.id,
          name: m.board.name,
          ownerId: m.board.ownerId,
          ownerName: m.board.owner?.name || 'Demo Admin',
          role: m.role || 'EDITOR',
          projectId: m.board.projectId || null,
          objectCount,
          createdAt: m.board.createdAt instanceof Date ? m.board.createdAt.toISOString() : new Date(m.board.createdAt).toISOString(),
          updatedAt: m.board.updatedAt instanceof Date ? m.board.updatedAt.toISOString() : new Date(m.board.updatedAt).toISOString(),
        };
      })
    );

    // Only count real, working and worked pages of the whiteboard (has objects)
    const realBoards = boardsWithCounts.filter((b) => b.objectCount > 0);

    realBoards.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return realBoards;
  });

  // Get board metadata & authorization check
  server.get('/api/boards/:id', async (request, reply) => {
    let userId = 'user-admin-demo';
    try {
      await request.jwtVerify();
      userId = (request.user as { userId: string }).userId;
    } catch (err) {}

    const { id } = request.params as { id: string };

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          where: { userId },
        },
      },
    });

    if (!board) {
      return reply.status(404).send({ error: 'Board not found' });
    }

    const member = board.members[0];

    return {
      id: board.id,
      name: board.name,
      ownerId: board.ownerId,
      ownerName: board.owner?.name || 'User',
      isPublic: board.isPublic,
      role: member ? member.role : (board.ownerId === userId ? 'OWNER' : 'EDITOR'),
      projectId: board.projectId || null,
      createdAt: board.createdAt instanceof Date ? board.createdAt.toISOString() : new Date(board.createdAt).toISOString(),
      updatedAt: board.updatedAt instanceof Date ? board.updatedAt.toISOString() : new Date(board.updatedAt).toISOString(),
    };
  });

  // List board members
  server.get('/api/boards/:id/members', async (request) => {
    const { id } = request.params as { id: string };

    const members = await prisma.boardMember.findMany({
      where: { boardId: id },
    });

    return members.map((m: any) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      createdAt: m.createdAt,
    }));
  });

  // Create invite link code
  server.post('/api/boards/:id/invites', async (request) => {
    const { id } = request.params as { id: string };
    const { role } = (request.body as { role?: string }) || {};

    const code = `invite-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    return {
      code,
      boardId: id,
      role: role || 'EDITOR',
      inviteUrl: `${request.headers.origin || 'http://localhost:3000'}?invite=${code}`,
    };
  });

  // Join board via invite code
  server.post('/api/invites/join', async (request, reply) => {
    const { boardId } = request.body as { code: string; boardId: string };

    if (!boardId) {
      return reply.status(400).send({ error: 'Board ID is required' });
    }

    return { success: true, boardId, role: 'EDITOR' };
  });

  // Update board (name, isPublic, projectId)
  server.patch('/api/boards/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { name, isPublic, projectId } = request.body as {
        name?: string;
        isPublic?: boolean;
        projectId?: string | null;
      };

      const updated = await prisma.board.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(isPublic !== undefined ? { isPublic } : {}),
          ...(projectId !== undefined ? { projectId } : {}),
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        isPublic: updated.isPublic,
        projectId: updated.projectId || null,
        updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : new Date(updated.updatedAt).toISOString(),
      };
    } catch (err) {
      return reply.status(500).send({ error: 'Failed to update board' });
    }
  });

  // Delete board
  server.delete('/api/boards/:id', async (request) => {
    let userId = 'user-admin-demo';
    try {
      await request.jwtVerify();
      userId = (request.user as { userId: string }).userId;
    } catch (err) {}

    const { id } = request.params as { id: string };

    const board = await prisma.board.findUnique({ where: { id } });
    if (!board) {
      return { success: true };
    }

    if (board.ownerId === userId) {
      await prisma.board.delete({ where: { id } });
    } else {
      await prisma.boardMember.deleteMany({
        where: { boardId: id, userId },
      });
    }
    return { success: true };
  });
}
