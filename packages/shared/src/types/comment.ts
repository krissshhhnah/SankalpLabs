export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorColor?: string;
  text: string;
  createdAt: number;
}

export interface BoardCommentThread {
  id: string;
  boardId: string;
  x: number;
  y: number;
  targetObjectId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorColor?: string;
  text: string;
  createdAt: number;
  resolved: boolean;
  resolvedBy?: string;
  replies: CommentReply[];
}
