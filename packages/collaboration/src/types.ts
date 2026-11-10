import { UserPresence, BoardObject } from '@whiteboard/shared';

export interface CollaborationRoomState {
  boardId: string;
  presences: Map<number, UserPresence>;
  objects: Map<string, BoardObject>;
}
