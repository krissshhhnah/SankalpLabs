import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { BoardObject, UserPresence, Point, BoardCommentThread, CommentReply } from '@whiteboard/shared';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { soundEffects } from '../utils/audioUtils';

const WS_URL = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:4000';

const USER_COLORS = [
  '#D9542C', // Vibrant Orange (Official Brand Cursor Color)
  '#A2502F', // Terracotta
  '#1A1917', // Ink Black
  '#2563eb',
  '#10b981',
  '#7c3aed',
  '#d97706',
];

export interface RoomTimerData {
  isRunning: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  endsAt: number | null;
  startedBy?: string;
  hasFinished?: boolean;
}

export function useCollaboration(boardId: string, initialObjects?: BoardObject[]) {
  const [objects, setObjects] = useState<BoardObject[]>([]);
  const [presences, setPresences] = useState<UserPresence[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Synchronized Room Workshop Timer state
  const [roomTimer, setRoomTimer] = useState<RoomTimerData>({
    isRunning: false,
    totalSeconds: 300,
    remainingSeconds: 300,
    endsAt: null,
    hasFinished: false,
  });
  const [timerRemaining, setTimerRemaining] = useState<number>(300);
  const [timerFinishedNotice, setTimerFinishedNotice] = useState<boolean>(false);
  const hasPlayedSoundRef = useRef<boolean>(false);

  // Synchronized Collaborative Comment Threads state
  const [commentThreads, setCommentThreads] = useState<BoardCommentThread[]>([]);

  const docRef = useRef<Y.Doc>(new Y.Doc());
  const providerRef = useRef<WebsocketProvider | null>(null);
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  const clipboardRef = useRef<BoardObject[]>([]);
  const initialObjectsRef = useRef<BoardObject[] | undefined>(initialObjects);

  const { setSaveStatus } = useUIStore();
  const { user } = useAuthStore();

  const userColor = useRef(USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);

  useEffect(() => {
    if (!boardId) return;

    const doc = docRef.current;
    const provider = new WebsocketProvider(`${WS_URL}/ws/boards`, boardId, doc);
    providerRef.current = provider;

    setSaveStatus('saving');

    const yMap = doc.getMap('objects');

    const checkAndSeedInitialObjects = () => {
      if (yMap.size === 0 && initialObjectsRef.current && initialObjectsRef.current.length > 0) {
        doc.transact(() => {
          initialObjectsRef.current!.forEach((newObj) => {
            const objYMap = new Y.Map();
            Object.entries(newObj).forEach(([k, v]) => {
              if (v !== undefined) objYMap.set(k, v);
            });
            yMap.set(newObj.id, objYMap as any);
          });
        }, doc.clientID);
      }
    };

    provider.on('status', (event: { status: 'connected' | 'connecting' | 'disconnected' }) => {
      if (event.status === 'connected') {
        setSaveStatus('saved');
        checkAndSeedInitialObjects();
      } else if (event.status === 'connecting') {
        setSaveStatus('saving');
      } else {
        setSaveStatus('reconnecting');
      }
    });

    // Sync roomState (collaborative workshop timer)
    const roomStateMap = doc.getMap('roomState');
    const syncRoomTimer = () => {
      const raw = roomStateMap.get('timer') as any;
      if (raw) {
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          setRoomTimer(parsed);
          if (parsed.isRunning && parsed.endsAt) {
            const left = Math.max(0, Math.ceil((parsed.endsAt - Date.now()) / 1000));
            setTimerRemaining(left);
            if (left > 0) {
              hasPlayedSoundRef.current = false;
            }
          } else {
            setTimerRemaining(parsed.remainingSeconds ?? parsed.totalSeconds ?? 300);
          }
        } catch (e) {
          console.error('Failed to parse room timer state:', e);
        }
      }
    };

    roomStateMap.observeDeep(syncRoomTimer);
    syncRoomTimer();

    // Sync real-time comments map
    const commentsMap = doc.getMap('comments');
    const syncComments = () => {
      const result: BoardCommentThread[] = [];
      commentsMap.forEach((val: any) => {
        if (!val) return;
        try {
          const parsed: BoardCommentThread = typeof val === 'string' ? JSON.parse(val) : (val.toJSON ? val.toJSON() : val);
          result.push(parsed);
        } catch (e) {
          console.error('Failed to parse comment thread:', e);
        }
      });
      result.sort((a, b) => b.createdAt - a.createdAt);
      setCommentThreads(result);
    };

    commentsMap.observeDeep(syncComments);
    syncComments();

    // Scoped UndoManager to revert only local user changes
    const undoManager = new Y.UndoManager(yMap, {
      trackedOrigins: new Set([doc.clientID]),
    });
    undoManagerRef.current = undoManager;

    const updateUndoStatus = () => {
      setCanUndo(undoManager.undoStack.length > 0);
      setCanRedo(undoManager.redoStack.length > 0);
    };

    undoManager.on('stack-item-added', updateUndoStatus);
    undoManager.on('stack-item-popped', updateUndoStatus);

    // Sync objects state sorted by zIndex
    const syncObjects = () => {
      checkAndSeedInitialObjects();
      const result: BoardObject[] = [];
      yMap.forEach((val: any) => {
        if (val && typeof val === 'object' && val.toJSON) {
          result.push(val.toJSON() as BoardObject);
        } else if (val && val.id) {
          result.push(val as BoardObject);
        }
      });
      result.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      setObjects(result);
    };

    yMap.observeDeep(syncObjects);
    syncObjects();

    // Setup Awareness (Presence & Cursor tracking)
    const awareness = provider.awareness;
    const clientID = doc.clientID;
    const clientSuffix = clientID.toString().slice(-4);
    const displayName = user?.name
      ? (user.name === 'Demo Admin' ? `Demo Admin #${clientSuffix}` : user.name)
      : `Guest #${clientSuffix}`;

    awareness.setLocalStateField('user', {
      id: `${user?.id || 'guest'}-${clientID}`,
      name: displayName,
      avatarUrl: user?.avatarUrl,
      color: userColor.current,
      cursor: null,
      selectedIds: [],
    });

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const presenceList: UserPresence[] = [];

      states.forEach((state: any, client: number) => {
        if (client !== clientID && state?.user) {
          presenceList.push({
            id: state.user.id || `client-${client}`,
            name: state.user.name || `User #${client.toString().slice(-4)}`,
            avatarUrl: state.user.avatarUrl,
            color: state.user.color || '#3b82f6',
            cursor: state.user.cursor || null,
            selectedIds: state.user.selectedIds || [],
            activeTool: 'select',
            lastSeen: Date.now(),
          });
        }
      });

      setPresences(presenceList);
    };

    awareness.on('change', handleAwarenessChange);

    // Real-time saving status listener on document mutations
    let saveDebounceTimer: any = null;
    const handleDocUpdate = () => {
      setSaveStatus('saving');
      if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
      saveDebounceTimer = setTimeout(() => {
        setSaveStatus('saved');
      }, 700);
    };

    doc.on('update', handleDocUpdate);

    return () => {
      if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
      doc.off('update', handleDocUpdate);
      awareness.off('change', handleAwarenessChange);
      provider.disconnect();
      doc.destroy();
    };
  }, [boardId]);

  // Object Operations via Yjs
  const addObject = (newObj: BoardObject) => {
    const doc = docRef.current;
    const yMap = doc.getMap('objects');

    doc.transact(() => {
      const objYMap = new Y.Map();
      Object.entries(newObj).forEach(([k, v]) => {
        if (v !== undefined) objYMap.set(k, v);
      });
      yMap.set(newObj.id, objYMap as any);
    }, doc.clientID);
  };

  const addObjects = (newObjs: BoardObject[]) => {
    const doc = docRef.current;
    const yMap = doc.getMap('objects');

    doc.transact(() => {
      newObjs.forEach((newObj) => {
        const objYMap = new Y.Map();
        Object.entries(newObj).forEach(([k, v]) => {
          if (v !== undefined) objYMap.set(k, v);
        });
        yMap.set(newObj.id, objYMap as any);
      });
    }, doc.clientID);
  };

  const updateObject = (id: string, update: Partial<BoardObject>) => {
    const doc = docRef.current;
    const yMap = doc.getMap('objects');

    doc.transact(() => {
      const existing = yMap.get(id) as Y.Map<any>;
      if (existing && existing.set) {
        Object.entries(update).forEach(([k, v]) => {
          if (v !== undefined) existing.set(k, v);
        });
      }
    }, doc.clientID);
  };

  const deleteObjects = (ids: string[]) => {
    const doc = docRef.current;
    const yMap = doc.getMap('objects');

    doc.transact(() => {
      ids.forEach((id) => yMap.delete(id));
    }, doc.clientID);
  };

  // Z-Index Ordering Controls
  const bringToFront = (ids: string[]) => {
    const maxZ = Math.max(0, ...objects.map((o) => o.zIndex || 0));
    ids.forEach((id, index) => {
      updateObject(id, { zIndex: maxZ + index + 1 });
    });
  };

  const sendToBack = (ids: string[]) => {
    const minZ = Math.min(0, ...objects.map((o) => o.zIndex || 0));
    ids.forEach((id, index) => {
      updateObject(id, { zIndex: minZ - ids.length + index });
    });
  };

  const toggleLock = (ids: string[]) => {
    ids.forEach((id) => {
      const obj = objects.find((o) => o.id === id);
      if (obj) {
        updateObject(id, { locked: !obj.locked });
      }
    });
  };

  // Undo / Redo
  const undo = () => {
    if (undoManagerRef.current && undoManagerRef.current.undoStack.length > 0) {
      undoManagerRef.current.undo();
    }
  };

  const redo = () => {
    if (undoManagerRef.current && undoManagerRef.current.redoStack.length > 0) {
      undoManagerRef.current.redo();
    }
  };

  // Copy / Paste / Duplicate
  const copySelected = (selectedIds: string[]) => {
    const toCopy = objects.filter((o) => selectedIds.includes(o.id));
    clipboardRef.current = JSON.parse(JSON.stringify(toCopy));
  };

  const pasteClipboard = (): string[] => {
    if (clipboardRef.current.length === 0) return [];
    const newIds: string[] = [];

    clipboardRef.current.forEach((obj) => {
      const newId = `${obj.type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      newIds.push(newId);

      const duplicatedObj: BoardObject = {
        ...obj,
        id: newId,
        x: obj.x + 24,
        y: obj.y + 24,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      if (duplicatedObj.type === 'drawing' && duplicatedObj.points) {
        duplicatedObj.points = duplicatedObj.points.map((p) => ({ x: p.x + 24, y: p.y + 24 }));
      }

      addObject(duplicatedObj);
    });

    return newIds;
  };

  const duplicateSelected = (selectedIds: string[]): string[] => {
    copySelected(selectedIds);
    return pasteClipboard();
  };

  // Broadcast cursor movements via Awareness
  const updateCursor = (worldCursor: Point | null) => {
    if (!providerRef.current) return;
    const awareness = providerRef.current.awareness;
    const local = awareness.getLocalState() || {};
    awareness.setLocalState({
      ...local,
      user: {
        ...local.user,
        cursor: worldCursor,
      },
    });
  };

  // Timer countdown tick effect
  useEffect(() => {
    let interval: any = null;
    if (roomTimer.isRunning && roomTimer.endsAt) {
      interval = setInterval(() => {
        const left = Math.max(0, Math.ceil((roomTimer.endsAt! - Date.now()) / 1000));
        setTimerRemaining(left);
        if (left === 0) {
          if (!hasPlayedSoundRef.current) {
            hasPlayedSoundRef.current = true;
            soundEffects.playChime();
            setTimerFinishedNotice(true);
          }
          clearInterval(interval);
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [roomTimer.isRunning, roomTimer.endsAt]);

  const startTimer = (seconds?: number) => {
    const doc = docRef.current;
    const roomStateMap = doc.getMap('roomState');
    const total = seconds ?? roomTimer.totalSeconds ?? 300;
    const remaining = seconds !== undefined ? seconds : (roomTimer.remainingSeconds > 0 ? roomTimer.remainingSeconds : total);
    const endsAt = Date.now() + remaining * 1000;
    hasPlayedSoundRef.current = false;
    setTimerFinishedNotice(false);

    const timerData: RoomTimerData = {
      isRunning: true,
      totalSeconds: total,
      remainingSeconds: remaining,
      endsAt,
      startedBy: user?.name || 'Collaborator',
      hasFinished: false,
    };
    roomStateMap.set('timer', JSON.stringify(timerData));
  };

  const pauseTimer = () => {
    const doc = docRef.current;
    const roomStateMap = doc.getMap('roomState');
    const remaining = roomTimer.endsAt ? Math.max(0, Math.ceil((roomTimer.endsAt - Date.now()) / 1000)) : timerRemaining;

    const timerData: RoomTimerData = {
      isRunning: false,
      totalSeconds: roomTimer.totalSeconds || 300,
      remainingSeconds: remaining,
      endsAt: null,
      startedBy: roomTimer.startedBy,
      hasFinished: remaining === 0,
    };
    roomStateMap.set('timer', JSON.stringify(timerData));
  };

  const resetTimer = (seconds?: number) => {
    const doc = docRef.current;
    const roomStateMap = doc.getMap('roomState');
    const target = seconds ?? roomTimer.totalSeconds ?? 300;
    hasPlayedSoundRef.current = false;
    setTimerFinishedNotice(false);

    const timerData: RoomTimerData = {
      isRunning: false,
      totalSeconds: target,
      remainingSeconds: target,
      endsAt: null,
      hasFinished: false,
    };
    roomStateMap.set('timer', JSON.stringify(timerData));
  };

  const dismissTimerNotice = () => {
    setTimerFinishedNotice(false);
  };

  // ── Collaborative Comment Thread Actions ──
  const addCommentThread = (data: {
    x: number;
    y: number;
    text: string;
    targetObjectId?: string;
    authorId?: string;
    authorName?: string;
    authorAvatar?: string;
    authorColor?: string;
  }): string => {
    const doc = docRef.current;
    const commentsMap = doc.getMap('comments');
    const id = `thread-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newThread: BoardCommentThread = {
      id,
      boardId,
      x: Math.round(data.x),
      y: Math.round(data.y),
      targetObjectId: data.targetObjectId,
      authorId: data.authorId || user?.id || 'guest',
      authorName: data.authorName || user?.name || 'Collaborator',
      authorAvatar: data.authorAvatar || user?.avatarUrl,
      authorColor: data.authorColor || '#ec4899',
      text: data.text,
      createdAt: Date.now(),
      resolved: false,
      replies: [],
    };
    commentsMap.set(id, JSON.stringify(newThread));
    return id;
  };

  const addCommentReply = (threadId: string, replyText: string) => {
    const doc = docRef.current;
    const commentsMap = doc.getMap('comments');
    const raw = commentsMap.get(threadId);
    if (!raw) return;
    try {
      const thread: BoardCommentThread = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const newReply: CommentReply = {
        id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        authorId: user?.id || 'guest',
        authorName: user?.name || 'Collaborator',
        authorAvatar: user?.avatarUrl,
        text: replyText,
        createdAt: Date.now(),
      };
      thread.replies = [...(thread.replies || []), newReply];
      commentsMap.set(threadId, JSON.stringify(thread));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleResolveCommentThread = (threadId: string) => {
    const doc = docRef.current;
    const commentsMap = doc.getMap('comments');
    const raw = commentsMap.get(threadId);
    if (!raw) return;
    try {
      const thread: BoardCommentThread = typeof raw === 'string' ? JSON.parse(raw) : raw;
      thread.resolved = !thread.resolved;
      thread.resolvedBy = thread.resolved ? (user?.name || 'Collaborator') : undefined;
      commentsMap.set(threadId, JSON.stringify(thread));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCommentThread = (threadId: string) => {
    const doc = docRef.current;
    const commentsMap = doc.getMap('comments');
    commentsMap.delete(threadId);
  };

  return {
    objects,
    presences,
    roomTimer,
    timerRemaining,
    timerFinishedNotice,
    startTimer,
    pauseTimer,
    resetTimer,
    dismissTimerNotice,
    commentThreads,
    addCommentThread,
    addCommentReply,
    toggleResolveCommentThread,
    deleteCommentThread,
    addObject,
    addObjects,
    updateObject,
    deleteObjects,
    bringToFront,
    sendToBack,
    toggleLock,
    undo,
    redo,
    canUndo,
    canRedo,
    copySelected,
    pasteClipboard,
    duplicateSelected,
    updateCursor,
  };
}
