export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  organization?: string;
  industry?: string;
  role?: string;
  language?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface BoardSummary {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  projectId?: string | null;
  objectCount?: number;
  updatedAt: string;
  createdAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
}

export interface BoardMemberSummary {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
}

export interface UploadResponse {
  url: string;
  width: number;
  height: number;
}
