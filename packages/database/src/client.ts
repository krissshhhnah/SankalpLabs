// In-memory & file-backed database layer avoiding Prisma native engine binary requirements
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

function getDbFilePath(): string {
  const candidates = [
    path.join(process.cwd(), 'apps', 'server', 'dev-db-store.json'),
    path.join(process.cwd(), 'dev-db-store.json'),
    path.join(__dirname, '..', '..', '..', 'apps', 'server', 'dev-db-store.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(process.cwd(), 'apps', 'server', 'dev-db-store.json');
}

const DB_FILE = getDbFilePath();

interface DbState {
  users: any[];
  boards: any[];
  boardMembers: any[];
  boardObjects: any[];
  boardInvites: any[];
  boardComments: any[];
  projects: any[];
}

const DEFAULT_PROJECTS = [
  { id: 'proj-uiux', name: 'UI / UX Design', color: '#8b5cf6', icon: 'Palette', description: 'Wireframes, design systems, and flows', userId: 'user-admin-demo', createdAt: new Date() },
];

function loadDb(): DbState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.boardComments) parsed.boardComments = [];
      if (!parsed.projects) parsed.projects = [...DEFAULT_PROJECTS];
      return parsed;
    }
  } catch (e) {}

  // Seed default admin demo user
  const adminUser = {
    id: 'user-admin-demo',
    email: 'admin@whiteboard.dev',
    name: 'Demo Admin',
    passwordHash: bcrypt.hashSync('password123', 10),
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoAdmin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultBoard = {
    id: 'demo-board-1',
    name: 'Collaborative Architecture Workspace',
    ownerId: adminUser.id,
    isPublic: true,
    projectId: 'proj-arch',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultMember = {
    id: 'bm-demo-1',
    boardId: defaultBoard.id,
    userId: adminUser.id,
    role: 'OWNER',
    createdAt: new Date(),
  };

  const state: DbState = {
    users: [adminUser],
    boards: [defaultBoard],
    boardMembers: [defaultMember],
    boardObjects: [],
    boardInvites: [],
    boardComments: [],
    projects: [...DEFAULT_PROJECTS],
  };

  saveDb(state);
  return state;
}

function saveDb(state: DbState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  } catch (e) {}
}

const dbState = loadDb();

export const prisma: any = {
  user: {
    async findUnique({ where }: any) {
      if (where.email) return dbState.users.find((u) => u.email === where.email) || null;
      if (where.id) return dbState.users.find((u) => u.id === where.id) || null;
      return null;
    },
    async create({ data }: any) {
      const user = {
        id: data.id || `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dbState.users.push(user);
      saveDb(dbState);
      return user;
    },
  },
  board: {
    async findUnique({ where, include }: any) {
      const board = dbState.boards.find((b) => b.id === where.id);
      if (!board) return null;
      const copy = { ...board };
      if (include?.owner) {
        copy.owner = dbState.users.find((u) => u.id === board.ownerId);
      }
      if (include?.members) {
        copy.members = dbState.boardMembers.filter((m) => m.boardId === board.id);
        if (where.members?.where?.userId) {
          copy.members = copy.members.filter((m: any) => m.userId === where.members.where.userId);
        }
      }
      return copy;
    },
    async create({ data, include }: any) {
      const board = {
        id: data.id || `board-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: data.name,
        ownerId: data.ownerId,
        isPublic: Boolean(data.isPublic),
        projectId: data.projectId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dbState.boards.push(board);

      if (data.members?.create) {
        dbState.boardMembers.push({
          id: `bm-${Date.now()}`,
          boardId: board.id,
          userId: data.members.create.userId,
          role: data.members.create.role || 'OWNER',
          createdAt: new Date(),
        });
      }
      saveDb(dbState);

      const copy: any = { ...board };
      if (include?.owner) {
        copy.owner = dbState.users.find((u) => u.id === board.ownerId);
      }
      return copy;
    },
    async update({ where, data }: any) {
      let idx = dbState.boards.findIndex((b) => b.id === where.id);
      if (idx !== -1) {
        dbState.boards[idx] = { ...dbState.boards[idx], ...data, updatedAt: new Date() };
        saveDb(dbState);
        return dbState.boards[idx];
      } else {
        const newBoard = {
          id: where.id,
          name: data.name || 'Untitled Workspace',
          ownerId: 'user-admin-demo',
          isPublic: true,
          projectId: data.projectId || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        dbState.boards.push(newBoard);
        saveDb(dbState);
        return newBoard;
      }
    },
    async delete({ where }: any) {
      dbState.boards = dbState.boards.filter((b) => b.id !== where.id);
      saveDb(dbState);
      return { success: true };
    },
  },
  boardMember: {
    async findMany({ where, include }: any) {
      let members = dbState.boardMembers;
      if (where?.userId) members = members.filter((m) => m.userId === where.userId);
      if (where?.boardId) members = members.filter((m) => m.boardId === where.boardId);

      return members.map((m) => {
        const copy = { ...m };
        if (include?.board) {
          copy.board = dbState.boards.find((b) => b.id === m.boardId);
          if (include?.board?.include?.owner && copy.board) {
            copy.board.owner = dbState.users.find((u) => u.id === copy.board.ownerId);
          }
        }
        return copy;
      });
    },
    async findUnique({ where }: any) {
      if (where.boardId_userId) {
        return (
          dbState.boardMembers.find(
            (m) =>
              m.boardId === where.boardId_userId.boardId &&
              m.userId === where.boardId_userId.userId
          ) || null
        );
      }
      return null;
    },
  },
  boardObject: {
    async count({ where }: any) {
      if (where?.boardId) {
        return dbState.boardObjects.filter((o) => o.boardId === where.boardId).length;
      }
      return dbState.boardObjects.length;
    },
    async findMany({ where }: any) {
      return dbState.boardObjects.filter((o) => o.boardId === where.boardId);
    },
    async upsert({ where, create, update }: any) {
      const idx = dbState.boardObjects.findIndex((o) => o.id === where.id);
      if (idx !== -1) {
        dbState.boardObjects[idx] = { ...dbState.boardObjects[idx], ...update, updatedAt: new Date() };
        saveDb(dbState);
        return dbState.boardObjects[idx];
      } else {
        const obj = { ...create, createdAt: new Date(), updatedAt: new Date() };
        dbState.boardObjects.push(obj);
        saveDb(dbState);
        return obj;
      }
    },
    async deleteMany({ where }: any) {
      if (where?.boardId && where?.id?.notIn) {
        const keepSet = new Set(where.id.notIn);
        dbState.boardObjects = dbState.boardObjects.filter(
          (o) => !(o.boardId === where.boardId && !keepSet.has(o.id))
        );
      } else if (where?.boardId) {
        dbState.boardObjects = dbState.boardObjects.filter((o) => o.boardId !== where.boardId);
      } else if (where?.id?.in) {
        const inSet = new Set(where.id.in);
        dbState.boardObjects = dbState.boardObjects.filter((o) => !inSet.has(o.id));
      }
      saveDb(dbState);
      return { count: 1 };
    },
    async delete({ where }: any) {
      dbState.boardObjects = dbState.boardObjects.filter((o) => o.id !== where.id);
      saveDb(dbState);
      return { success: true };
    },
  },
  boardComment: {
    async findMany({ where }: any) {
      let comments = dbState.boardComments || [];
      if (where?.boardId) {
        comments = comments.filter((c: any) => c.boardId === where.boardId);
      }
      return comments;
    },
    async upsert({ where, create, update }: any) {
      if (!dbState.boardComments) dbState.boardComments = [];
      const idx = dbState.boardComments.findIndex((c: any) => c.id === where.id);
      if (idx !== -1) {
        dbState.boardComments[idx] = { ...dbState.boardComments[idx], ...update, updatedAt: new Date() };
        saveDb(dbState);
        return dbState.boardComments[idx];
      } else {
        const comm = { ...create, createdAt: new Date(), updatedAt: new Date() };
        dbState.boardComments.push(comm);
        saveDb(dbState);
        return comm;
      }
    },
    async deleteMany({ where }: any) {
      if (!dbState.boardComments) dbState.boardComments = [];
      if (where?.boardId && where?.id?.notIn) {
        const keepSet = new Set(where.id.notIn);
        dbState.boardComments = dbState.boardComments.filter(
          (c: any) => !(c.boardId === where.boardId && !keepSet.has(c.id))
        );
      } else if (where?.boardId) {
        dbState.boardComments = dbState.boardComments.filter((c: any) => c.boardId !== where.boardId);
      } else if (where?.id?.in) {
        const inSet = new Set(where.id.in);
        dbState.boardComments = dbState.boardComments.filter((c: any) => !inSet.has(c.id));
      }
      saveDb(dbState);
      return { count: 1 };
    },
    async delete({ where }: any) {
      if (!dbState.boardComments) dbState.boardComments = [];
      dbState.boardComments = dbState.boardComments.filter((c: any) => c.id !== where.id);
      saveDb(dbState);
      return { success: true };
    },
  },
  project: {
    async findMany({ where }: any) {
      let projects = dbState.projects || [];
      if (where?.userId) {
        projects = projects.filter((p: any) => p.userId === where.userId || !p.userId);
      }
      return projects;
    },
    async findUnique({ where }: any) {
      return (dbState.projects || []).find((p: any) => p.id === where.id) || null;
    },
    async create({ data }: any) {
      if (!dbState.projects) dbState.projects = [];
      const project = {
        id: data.id || `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: data.name,
        color: data.color || '#3b82f6',
        icon: data.icon || 'Folder',
        description: data.description || '',
        userId: data.userId || 'user-admin-demo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dbState.projects.push(project);
      saveDb(dbState);
      return project;
    },
    async delete({ where }: any) {
      if (!dbState.projects) dbState.projects = [];
      dbState.projects = dbState.projects.filter((p: any) => p.id !== where.id);
      // Remove project assignment from boards that had this project
      dbState.boards.forEach((b) => {
        if (b.projectId === where.id) b.projectId = null;
      });
      saveDb(dbState);
      return { success: true };
    },
  },
};
