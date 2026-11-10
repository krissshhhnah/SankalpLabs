import { Point } from './object';
import { Tool } from './tool';

export interface UserPresence {
  id: string;
  name: string;
  avatarUrl?: string;
  color: string;
  cursor: Point | null;
  selectedIds: string[];
  activeTool: Tool;
  lastSeen: number;
}
