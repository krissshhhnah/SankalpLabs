import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '@whiteboard/database';

export async function authRoutes(server: FastifyInstance) {
  server.post('/api/auth/register', async (request, reply) => {
    const { email, password, name } = request.body as any;

    if (!email || !password || !name) {
      return reply.status(400).send({ error: 'Email, password, and name are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(400).send({ error: 'User already exists with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    const token = server.jwt.sign({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: new Date(user.createdAt).toISOString(),
      },
    };
  });

  server.post('/api/auth/demo', async (request, reply) => {
    let user = await prisma.user.findUnique({ where: { id: 'user-admin-demo' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'user-admin-demo',
          email: 'admin@whiteboard.dev',
          name: 'Demo Admin',
          passwordHash: '$2a$10$ScnJBrsMPzr1GUORSFYXheTDmKIt4l4eFT3TGZOLIUmOPaleLYQoG',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoAdmin',
        },
      });
    }

    const token = server.jwt.sign({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: new Date(user.createdAt).toISOString(),
      },
    };
  });

  server.post('/api/auth/guest', async (request, reply) => {
    const { name } = (request.body as { name?: string }) || {};
    const guestNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery'];
    const randomName = guestNames[Math.floor(Math.random() * guestNames.length)];
    const chosenName = name && name.trim() ? name.trim() : `${randomName} (Guest)`;
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const token = server.jwt.sign({ userId: guestId, email: `${guestId}@whiteboard.dev` });

    return {
      token,
      user: {
        id: guestId,
        email: `${guestId}@whiteboard.dev`,
        name: chosenName,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(chosenName)}`,
        createdAt: new Date().toISOString(),
      },
    };
  });

  server.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const token = server.jwt.sign({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: new Date(user.createdAt).toISOString(),
      },
    };
  });

  server.get('/api/auth/me', async (request, reply) => {
    try {
      await request.jwtVerify();
      const payload = request.user as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: new Date(user.createdAt).toISOString(),
      };
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });
}
