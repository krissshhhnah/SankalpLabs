import { AuthResponse, UserProfile, BoardSummary, UploadResponse, ProjectSummary } from '@whiteboard/shared';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('wb_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }
  return res.json();
}

export async function demoLoginApi(): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Demo login failed');
  }
  return res.json();
}

export async function guestLoginApi(name?: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Guest login failed');
  }
  return res.json();
}

export async function registerApi(email: string, password: string, name: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }
  return res.json();
}

export async function getMeApi(): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function createBoardApi(name: string, projectId?: string): Promise<BoardSummary> {
  const res = await fetch(`${API_URL}/api/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ name, projectId }),
  });
  if (!res.ok) throw new Error('Failed to create board');
  return res.json();
}

export async function listBoardsApi(): Promise<BoardSummary[]> {
  const res = await fetch(`${API_URL}/api/boards`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch boards');
  return res.json();
}

export async function getBoardApi(id: string): Promise<BoardSummary> {
  const res = await fetch(`${API_URL}/api/boards/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Board not found or access denied');
  return res.json();
}

export async function deleteBoardApi(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/boards/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete board');
}

export async function uploadImageApi(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/uploads`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error('Image upload failed');
  return res.json();
}

export async function updateBoardApi(
  id: string,
  update: { name?: string; isPublic?: boolean; projectId?: string | null }
): Promise<BoardSummary> {
  const res = await fetch(`${API_URL}/api/boards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error('Failed to update board');
  return res.json();
}

export async function forceSaveBoardApi(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/api/boards/${id}/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to save board');
  return res.json();
}

export async function listProjectsApi(): Promise<ProjectSummary[]> {
  const res = await fetch(`${API_URL}/api/projects`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function createProjectApi(project: {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}): Promise<ProjectSummary> {
  const res = await fetch(`${API_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function deleteProjectApi(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete project');
}
