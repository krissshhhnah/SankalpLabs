import React, { useEffect, useState, useRef } from 'react';
import { BoardSummary, BoardTemplate } from '@whiteboard/shared';
import {
  listBoardsApi,
  createBoardApi,
  deleteBoardApi,
  updateBoardApi,
  listProjectsApi,
  createProjectApi,
  deleteProjectApi,
} from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { BOARD_TEMPLATES } from '../data/templates';
import { ProfileDropdown } from '../components/ProfileDropdown';
import { BoardThumbnail } from '../components/BoardThumbnail';
import { StickyBanner } from '@/components/ui/sticky-banner';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationOnboardingModal } from '../components/NotificationOnboardingModal';
import { CanvaTrashIllustration } from '../components/CanvaTrashIllustration';
import { CanvaEmptyBoardsIllustration } from '../components/CanvaEmptyBoardsIllustration';
import { AnimatedNotificationBell } from '../components/AnimatedNotificationBell';
import {
  Search,
  Home,
  Star,
  FolderOpen,
  LayoutTemplate,
  Users,
  Plus,
  Sparkles,
  Grid,
  List,
  Clock,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Bell,
  HelpCircle,
  Settings,
  Crown,
  GitCommitHorizontal,
  Kanban,
  MapPin,
  Calendar,
  LayoutGrid,
  MoreVertical,
  MoreHorizontal,
  FolderPlus,
  Folder,
  Tag,
  X,
  Check,
  ArrowRight,
  Copy,
  Compass,
  Palette,
  Lightbulb,
  Cpu,
  BarChart3,
  Target,
  Zap,
  FileText,
  Layers,
  Briefcase,
  Presentation,
  Video,
  Share2,
  Maximize2,
  Upload,
  RotateCcw,
} from 'lucide-react';

interface ProjectFolder {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
}

const FOLDER_ICON_MAP: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  Compass,
  Palette,
  Lightbulb,
  Cpu,
  Folder,
  BarChart3,
  Target,
  Zap,
  FileText,
  Sparkles,
  Layers,
  Briefcase,
  '🚀': Compass,
  '🎨': Palette,
  '💡': Lightbulb,
  '⚙️': Cpu,
  '📁': Folder,
  '📊': BarChart3,
  '🎯': Target,
  '⚡': Zap,
  '📝': FileText,
  '🌟': Sparkles,
};

const getFolderIconComponent = (iconKey?: string): React.FC<{ className?: string; style?: React.CSSProperties }> => {
  if (iconKey && FOLDER_ICON_MAP[iconKey]) {
    return FOLDER_ICON_MAP[iconKey];
  }
  return Folder;
};

const DEFAULT_PROJECTS: ProjectFolder[] = [
  { id: 'proj-uiux', name: 'UI / UX Design', color: '#A2502F', icon: 'Palette', description: 'Wireframes, design systems, and flows' },
];

const PRESET_COLORS = ['#A2502F', '#D9542C', '#1A1917', '#5E5C56', '#D9D8D5', '#F6E7DE', '#10b981', '#f59e0b'];
const PRESET_ICONS = ['Folder', 'Compass', 'Palette', 'Lightbulb', 'Cpu', 'BarChart3', 'Target', 'Zap', 'FileText', 'Sparkles'];

function formatRelativeTime(dateInput: string | Date | number): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Edited ${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `Edited ${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `Edited ${diffDay}d ago`;
  if (diffDay < 30) return `Edited ${Math.floor(diffDay / 7)}w ago`;
  return `Edited ${Math.floor(diffDay / 30)}mo ago`;
}

function getBoardTypeInfo(boardName: string): { icon: React.FC<{ className?: string; style?: React.CSSProperties }>; label: string; color: string } {
  const lower = boardName.toLowerCase();
  if (lower.includes('retro') || lower.includes("4 l's")) return { icon: Grid, label: 'Retrospective', color: '#10b981' };
  if (lower.includes('flowchart') || lower.includes('diagram') || lower.includes('architecture')) return { icon: GitCommitHorizontal, label: 'Flowchart', color: '#D9542C' };
  if (lower.includes('kanban') || lower.includes('todo') || lower.includes('sprint')) return { icon: Kanban, label: 'Sprint Board', color: '#D9542C' };
  if (lower.includes('roadmap') || lower.includes('product')) return { icon: Compass, label: 'Roadmap', color: '#A2502F' };
  if (lower.includes('presentation') || lower.includes('slide') || lower.includes('deck') || lower.includes('pitch')) return { icon: Presentation, label: 'Presentation', color: '#D9542C' };
  if (lower.includes('wireframe') || lower.includes('ui') || lower.includes('mockup')) return { icon: Layers, label: 'Wireframe', color: '#A2502F' };
  if (lower.includes('doc') || lower.includes('spec') || lower.includes('prd') || lower.includes('notes')) return { icon: FileText, label: 'Document', color: '#5E5C56' };
  if (lower.includes('ai') || lower.includes('prompt')) return { icon: Sparkles, label: 'AI Canvas', color: '#D9542C' };
  return { icon: LayoutGrid, label: 'Whiteboard', color: '#A2502F' };
}

interface DashboardPageProps {
  onSelectBoard: (boardId: string, initialObjects?: any[]) => void;
  onOpenProfileSettings: () => void;
  onOpenAdminConsole: () => void;
  onOpenTrash?: () => void;
  onOpenLearningCenter: () => void;
  onOpenAppsModal: () => void;
  onOpenDeveloperHub: () => void;
  onOpenMarketplace: () => void;
  onOpenLanding?: () => void;
  initialTab?: 'home' | 'starred' | 'projects' | 'templates' | 'shared' | 'trash';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectBoard,
  onOpenProfileSettings,
  onOpenAdminConsole,
  onOpenTrash,
  onOpenLearningCenter,
  onOpenAppsModal,
  onOpenDeveloperHub,
  onOpenMarketplace,
  onOpenLanding,
  initialTab,
}) => {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'starred' | 'projects' | 'templates' | 'shared' | 'trash'>(
    initialTab || 'home'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleBoardsCount, setVisibleBoardsCount] = useState<number>(10);

  // Canva Trash tab state
  const [trashSubTab, setTrashSubTab] = useState<'designs' | 'images' | 'videos' | 'files'>('designs');
  const [trashViewMode, setTrashViewMode] = useState<'grid' | 'table'>('grid');
  const [trashBoards, setTrashBoards] = useState<BoardSummary[]>(() => {
    try {
      const stored = localStorage.getItem('wb_trash_boards');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Projects & Folders state
  const [projects, setProjects] = useState<ProjectFolder[]>(() => {
    try {
      const stored = localStorage.getItem('wb_projects');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => {
            let col = p.color;
            if (col === '#8b5cf6' || col === '#6366f1' || col === '#3b82f6') col = '#A2502F';
            let icon = p.icon;
            if (icon === '🚀') icon = 'Compass';
            if (icon === '🎨') icon = 'Palette';
            if (icon === '💡') icon = 'Lightbulb';
            if (icon === '⚙️') icon = 'Cpu';
            if (icon === '📁') icon = 'Folder';
            return { ...p, color: col, icon };
          });
        }
      }
    } catch (e) {}
    return DEFAULT_PROJECTS;
  });

  const [boardProjectMap, setBoardProjectMap] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('wb_board_projects');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#A2502F');
  const [newProjectIcon, setNewProjectIcon] = useState('Folder');
  const [activeBoardMenuId, setActiveBoardMenuId] = useState<string | null>(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: 'permanent' | 'empty-trash' | 'project';
    boardId?: string;
    boardName?: string;
    projectId?: string;
    projectName?: string;
  }>({
    isOpen: false,
    type: 'empty-trash',
  });

  // Canva-style "moved to Trash" floating undo pill toast
  const [undoToast, setUndoToast] = useState<{
    visible: boolean;
    board: BoardSummary | null;
  }>({
    visible: false,
    board: null,
  });
  const undoToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [aceternityOpen, setAceternityOpen] = useState(false);

  const { user } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveBoardMenuId(null);
      }
    };
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const getLocalRecents = (): BoardSummary[] => {
    try {
      const recentsStr = localStorage.getItem('wb_recent_boards');
      if (recentsStr) {
        return JSON.parse(recentsStr);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  const saveLocalRecents = (list: BoardSummary[]) => {
    try {
      localStorage.setItem('wb_recent_boards', JSON.stringify(list.slice(0, 30)));
    } catch (e) {
      console.error(e);
    }
  };

  const loadBoards = async () => {
    setLoading(true);
    let apiBoards: BoardSummary[] = [];
    try {
      apiBoards = await listBoardsApi();
    } catch (e) {
      console.error('Failed to fetch boards from API, falling back to local recents:', e);
    }

    try {
      const projList = await listProjectsApi();
      if (projList) {
        setProjects(projList);
        localStorage.setItem('wb_projects', JSON.stringify(projList));
      }
    } catch (e) {
      console.warn('Projects API fallback:', e);
    }

    let finalBoards: BoardSummary[] = [];

    if (apiBoards && apiBoards.length > 0) {
      // Purge all stale dummy works from browser localStorage and use authoritative server boards
      finalBoards = apiBoards;
      saveLocalRecents(apiBoards);
    } else {
      // Fallback: only keep real worked boards with content
      const local = getLocalRecents().filter((b) => (b.objectCount === undefined || b.objectCount > 0));
      finalBoards = local;
    }

    setBoards(finalBoards);

    setBoardProjectMap(() => {
      const next: Record<string, string> = {};
      finalBoards.forEach((b) => {
        if (b.projectId) {
          next[b.id] = b.projectId;
        }
      });
      localStorage.setItem('wb_board_projects', JSON.stringify(next));
      return next;
    });

    setLoading(false);
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleCreateFromTemplate = async (template: BoardTemplate) => {
    const title = template.id === 'blank' ? 'Untitled Workspace' : template.title;
    let newBoard: BoardSummary;

    try {
      newBoard = await createBoardApi(title);
    } catch (e) {
      console.warn('Backend create failed, creating local board fallback:', e);
      newBoard = {
        id: `board-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: title,
        ownerId: user?.id || 'user-demo',
        ownerName: user?.name || 'Demo User',
        role: 'OWNER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (selectedProjectId) {
      setBoardProjectMap((prev) => {
        const next = { ...prev, [newBoard.id]: selectedProjectId };
        localStorage.setItem('wb_board_projects', JSON.stringify(next));
        return next;
      });
    }

    const existingRecents = getLocalRecents().filter((b) => b.id !== newBoard.id);
    const updatedRecents = [newBoard, ...existingRecents];
    saveLocalRecents(updatedRecents);
    setBoards(updatedRecents);

    onSelectBoard(newBoard.id, template.objects);
  };

  const handleDuplicateBoard = (e: React.MouseEvent, b: BoardSummary) => {
    e.stopPropagation();
    const duplicated: BoardSummary = {
      ...b,
      id: `board-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${b.name} (Copy)`,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...boards];
    setBoards(updated);
    saveLocalRecents(updated);

    if (boardProjectMap[b.id]) {
      setBoardProjectMap((prev) => {
        const next = { ...prev, [duplicated.id]: prev[b.id] };
        localStorage.setItem('wb_board_projects', JSON.stringify(next));
        return next;
      });
    }
    setActiveBoardMenuId(null);
  };

  const handleDeleteBoard = (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    const boardToTrash = boards.find((b) => b.id === boardId);
    if (!boardToTrash) return;

    // Remove from active boards
    const updated = boards.filter((b) => b.id !== boardId);
    setBoards(updated);
    saveLocalRecents(updated);

    // Add to trash list
    setTrashBoards((prev) => {
      const next = [boardToTrash, ...prev.filter((b) => b.id !== boardId)];
      try {
        localStorage.setItem('wb_trash_boards', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });

    setActiveBoardMenuId(null);

    // Show Canva-style "moved to Trash" floating undo pill toast
    if (undoToastTimerRef.current) {
      clearTimeout(undoToastTimerRef.current);
    }
    setUndoToast({
      visible: true,
      board: boardToTrash,
    });
    undoToastTimerRef.current = setTimeout(() => {
      setUndoToast({ visible: false, board: null });
    }, 5000);
  };

  const handleUndoTrash = () => {
    if (!undoToast.board) return;
    const board = undoToast.board;

    // Remove from trash
    setTrashBoards((prev) => {
      const next = prev.filter((b) => b.id !== board.id);
      try {
        localStorage.setItem('wb_trash_boards', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });

    // Add back to active boards
    setBoards((prev) => {
      const next = [board, ...prev.filter((b) => b.id !== board.id)];
      saveLocalRecents(next);
      return next;
    });

    if (undoToastTimerRef.current) {
      clearTimeout(undoToastTimerRef.current);
    }
    setUndoToast({ visible: false, board: null });
  };

  const handleRestoreBoard = (e: React.MouseEvent, board: BoardSummary) => {
    e.stopPropagation();
    // Remove from trash
    setTrashBoards((prev) => {
      const next = prev.filter((b) => b.id !== board.id);
      try {
        localStorage.setItem('wb_trash_boards', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });

    // Add back to active boards
    setBoards((prev) => {
      const next = [board, ...prev.filter((b) => b.id !== board.id)];
      saveLocalRecents(next);
      return next;
    });
  };

  const executePermanentDelete = async (boardId: string) => {
    try {
      await deleteBoardApi(boardId);
    } catch (err) {
      console.warn('Permanent delete on server:', err);
    }

    setTrashBoards((prev) => {
      const next = prev.filter((b) => b.id !== boardId);
      try {
        localStorage.setItem('wb_trash_boards', JSON.stringify(next));
        localStorage.removeItem(`wb_thumb_${boardId}`);
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const requestPermanentDelete = (e: React.MouseEvent, boardId: string, boardName: string) => {
    e.stopPropagation();
    setActiveBoardMenuId(null);
    setDeleteConfirmState({
      isOpen: true,
      type: 'permanent',
      boardId,
      boardName,
    });
  };

  const executeEmptyTrash = async () => {
    for (const b of trashBoards) {
      try {
        await deleteBoardApi(b.id);
        localStorage.removeItem(`wb_thumb_${b.id}`);
      } catch (err) {
        console.error(err);
      }
    }
    setTrashBoards([]);
    try {
      localStorage.setItem('wb_trash_boards', JSON.stringify([]));
    } catch (err) {
      console.error(err);
    }
  };

  const requestEmptyTrash = () => {
    setDeleteConfirmState({
      isOpen: true,
      type: 'empty-trash',
    });
  };

  const executeDeleteProject = async (projId: string) => {
    try {
      await deleteProjectApi(projId);
    } catch (err) {
      console.warn('Failed to delete project on server:', err);
    }
    const updated = projects.filter((p) => p.id !== projId);
    setProjects(updated);
    localStorage.setItem('wb_projects', JSON.stringify(updated));
    if (selectedProjectId === projId) setSelectedProjectId(null);
  };

  const requestDeleteProject = (e: React.MouseEvent, projId: string, projName: string) => {
    e.stopPropagation();
    setDeleteConfirmState({
      isOpen: true,
      type: 'project',
      projectId: projId,
      projectName: projName,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmState.type === 'permanent' && deleteConfirmState.boardId) {
      await executePermanentDelete(deleteConfirmState.boardId);
    } else if (deleteConfirmState.type === 'empty-trash') {
      await executeEmptyTrash();
    } else if (deleteConfirmState.type === 'project' && deleteConfirmState.projectId) {
      await executeDeleteProject(deleteConfirmState.projectId);
    }
    setDeleteConfirmState({ isOpen: false, type: 'empty-trash' });
  };

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAssignProject = async (e: React.MouseEvent, boardId: string, projectId: string | null) => {
    e.stopPropagation();
    try {
      await updateBoardApi(boardId, { projectId });
    } catch (err) {
      console.warn('Failed to update board project on server:', err);
    }
    setBoardProjectMap((prev) => {
      const next = { ...prev };
      if (projectId) {
        next[boardId] = projectId;
      } else {
        delete next[boardId];
      }
      localStorage.setItem('wb_board_projects', JSON.stringify(next));
      return next;
    });
    setActiveBoardMenuId(null);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const created = await createProjectApi({
        name: newProjectName.trim(),
        color: newProjectColor,
        icon: newProjectIcon,
        description: 'Custom team project workspace',
      });
      const updated = [...projects, created];
      setProjects(updated);
      localStorage.setItem('wb_projects', JSON.stringify(updated));
      setSelectedProjectId(created.id);
    } catch (e) {
      const newProj: ProjectFolder = {
        id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: newProjectName.trim(),
        color: newProjectColor,
        icon: newProjectIcon,
        description: 'Custom team project workspace',
      };
      const updated = [...projects, newProj];
      setProjects(updated);
      localStorage.setItem('wb_projects', JSON.stringify(updated));
      setSelectedProjectId(newProj.id);
    }
    setNewProjectName('');
    setIsNewProjectModalOpen(false);
  };

  const handleDeleteProject = async (e: React.MouseEvent, projId: string) => {
    e.stopPropagation();
    try {
      await deleteProjectApi(projId);
    } catch (err) {
      console.warn('Failed to delete project on server:', err);
    }
    const updated = projects.filter((p) => p.id !== projId);
    setProjects(updated);
    localStorage.setItem('wb_projects', JSON.stringify(updated));
    if (selectedProjectId === projId) setSelectedProjectId(null);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const importedObjects = data.objects || (Array.isArray(data) ? data : []);
        const title = data.boardName || file.name.replace(/\.[^/.]+$/, '') || 'Imported Workspace';
        const newBoard = await createBoardApi(title);
        onSelectBoard(newBoard.id, importedObjects);
      } catch (err) {
        console.error('Failed to import JSON board:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const CANVA_CATEGORIES = [
    {
      id: 'whiteboard',
      label: 'Whiteboard',
      icon: LayoutGrid,
      colorClass: 'bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200/90 border-emerald-200/80',
      templateId: 'blank',
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: LayoutTemplate,
      colorClass: 'bg-purple-100/80 text-purple-700 hover:bg-purple-200/90 border-purple-200/80',
      action: 'templates',
    },
    {
      id: 'presentation',
      label: 'Presentation',
      icon: Presentation,
      colorClass: 'bg-amber-100/80 text-amber-700 hover:bg-amber-200/90 border-amber-200/80',
      templateId: 'presentation',
    },
    {
      id: 'flowchart',
      label: 'Flowchart',
      icon: GitCommitHorizontal,
      colorClass: 'bg-blue-100/80 text-blue-700 hover:bg-blue-200/90 border-blue-200/80',
      templateId: 'flowchart',
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm',
      icon: Lightbulb,
      colorClass: 'bg-violet-100/80 text-violet-700 hover:bg-violet-200/90 border-violet-200/80',
      templateId: 'mindmap',
    },
    {
      id: 'retrospective',
      label: 'Sprint Retro',
      icon: Grid,
      colorClass: 'bg-teal-100/80 text-teal-700 hover:bg-teal-200/90 border-teal-200/80',
      templateId: 'retrospective',
    },
    {
      id: 'wireframe',
      label: 'Wireframe',
      icon: Layers,
      colorClass: 'bg-rose-100/80 text-rose-700 hover:bg-rose-200/90 border-rose-200/80',
      templateId: 'wireframe',
    },
    {
      id: 'ai',
      label: 'Magic AI',
      icon: Sparkles,
      colorClass: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md hover:from-purple-500 hover:to-indigo-500 border-transparent',
      badge: 'NEW',
      templateId: 'ai-playground',
    },
    {
      id: 'upload',
      label: 'Upload',
      icon: Upload,
      colorClass: 'bg-sky-100/80 text-sky-700 hover:bg-sky-200/90 border-sky-200/80',
      action: 'upload',
    },
  ];

  const handleCategoryClick = (cat: typeof CANVA_CATEGORIES[0]) => {
    if (cat.action === 'templates') {
      setActiveTab('templates');
      return;
    }
    if (cat.action === 'upload') {
      fileInputRef.current?.click();
      return;
    }
    if (cat.templateId) {
      const tmpl = BOARD_TEMPLATES.find((t) => t.id === cat.templateId) || BOARD_TEMPLATES[0];
      handleCreateFromTemplate(tmpl);
    }
  };

  const filteredBoards = boards.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'starred') {
      return starredIds.has(b.id);
    }
    if (activeTab === 'shared') {
      return b.role !== 'OWNER';
    }
    if (selectedProjectId) {
      return boardProjectMap[b.id] === selectedProjectId;
    }
    return true;
  });

  const displayedBoards = filteredBoards.slice(0, visibleBoardsCount);

  const userName = user?.name || 'User';
  const userInitials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="h-screen h-[100dvh] bg-[#FAFAF7] text-[#1A1917] font-sans flex flex-col overflow-hidden">
      {/* Hidden File Input for Board JSON Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".json"
        className="hidden"
      />

      {/* Aceternity UI Sticky Banner for Notifications Onboarding */}
      <StickyBanner className="bg-gradient-to-r from-[#A2502F] via-[#D9542C] to-[#A2502F] shrink-0 z-30 py-2">
        <div className="mx-0 max-w-[92%] text-xs sm:text-sm text-white drop-shadow-sm flex items-center justify-center gap-3 flex-wrap text-center">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-white/20 text-white inline-flex">
              <AnimatedNotificationBell size={15} hasUnread={false} className="text-white" />
            </span>
            <span className="font-medium">
              {notificationPermission === 'granted'
                ? "Live collaboration alerts are active! You'll receive real-time notifications for team mentions & invites."
                : "Never miss team feedback! Turn on desktop notifications for live mentions, sticky comments & room invites."}
            </span>
          </div>

          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1917] text-[#FAFAF7] hover:bg-[#2e2d2a] font-bold rounded-full text-xs shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <span>{notificationPermission === 'granted' ? 'Notification Settings' : 'Turn on notifications'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </StickyBanner>

      {/* ═══════════════ TOP BAR ═══════════════ */}
      <header className="h-14 bg-[#FAFAF7] border-b border-[#D9D8D5] flex items-center justify-between px-6 gap-4 shrink-0 z-20">
        {/* Left: Logo */}
        <div className="flex items-center shrink-0 cursor-pointer pl-1 select-none" onClick={() => setActiveTab('home')}>
          <img
            src="/sankalplabs-by-kk.png"
            alt="SankalpLabs"
            className="h-8 sm:h-9 w-auto object-contain hover:opacity-90 transition duration-150"
          />
        </div>

        {/* Right: Pro Plan Badge, Help, Notifications, Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenLearningCenter()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-800 border border-amber-300/60 rounded-full text-xs font-bold transition shadow-2xs"
            title="Try Whiteboard Pro"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Try it free for 30 days</span>
            <span className="sm:hidden">Pro</span>
          </button>

          <button
            onClick={onOpenLearningCenter}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            title="Help & Learning Center"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition relative group cursor-pointer flex items-center justify-center"
            title="Desktop Notifications"
          >
            <AnimatedNotificationBell
              size={18}
              hasUnread={notificationPermission !== 'granted'}
            />
          </button>

          {/* Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 ml-1 hover:opacity-85 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#1A1917] flex items-center justify-center text-[#FAFAF7] text-xs font-bold shadow-xs border border-[#D9D8D5]">
                {userInitials}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <ProfileDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              onOpenProfileSettings={onOpenProfileSettings}
              onOpenAdminConsole={onOpenAdminConsole}
              onOpenTrash={() => setActiveTab('trash')}
              onOpenLearningCenter={onOpenLearningCenter}
              onOpenAppsModal={onOpenAppsModal}
              onOpenDeveloperHub={onOpenDeveloperHub}
              onOpenMarketplace={onOpenMarketplace}
              onOpenUpgrade={() => {}}
              onOpenLanding={onOpenLanding}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ═══════════════ ACETERNITY EXPANDABLE SIDEBAR ═══════════════ */}
        <Sidebar open={aceternityOpen} setOpen={setAceternityOpen}>
          <SidebarBody className="justify-between gap-6 border-r border-[#D9D8D5] bg-[#FAFAF7] select-none overflow-x-hidden">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {/* Primary Nav Links */}
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'home' as const, icon: Home, label: 'Home' },
                  { id: 'starred' as const, icon: Star, label: 'Starred' },
                  { id: 'projects' as const, icon: FolderOpen, label: 'Projects & Folders' },
                  { id: 'templates' as const, icon: LayoutTemplate, label: 'Templates' },
                  { id: 'shared' as const, icon: Users, label: 'Shared with me' },
                  { id: 'trash' as const, icon: Trash2, label: 'Trash' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id !== 'projects') setSelectedProjectId(null);
                    }}
                    className={`group relative flex items-center h-10 w-full rounded-xl px-2.5 transition-colors duration-150 cursor-pointer overflow-hidden select-none text-left gap-3 ${
                      activeTab === item.id
                        ? 'bg-[#F6E7DE] text-[#A2502F] font-semibold'
                        : 'text-[#5E5C56] hover:text-[#1A1917] hover:bg-[#F6E7DE]/50'
                    }`}
                    title={item.label}
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <item.icon className={`w-[19px] h-[19px] shrink-0 transition-colors ${activeTab === item.id ? 'text-[#A2502F]' : 'text-[#5E5C56] group-hover:text-[#1A1917]'}`} />
                    </div>
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: aceternityOpen ? 1 : 0,
                        x: aceternityOpen ? 0 : -8,
                      }}
                      transition={{
                        duration: aceternityOpen ? 0.22 : 0.12,
                        ease: "easeInOut",
                      }}
                      className="truncate whitespace-nowrap overflow-hidden text-sm font-medium select-none pointer-events-none"
                    >
                      {item.label}
                    </motion.span>
                  </button>
                ))}
              </div>

              {/* Quick Workspaces Folders */}
              <motion.div
                initial={false}
                animate={{
                  opacity: aceternityOpen ? 1 : 0,
                  height: aceternityOpen ? "auto" : 0,
                }}
                transition={{
                  opacity: { duration: aceternityOpen ? 0.22 : 0.12 },
                  height: { duration: 0.25, ease: "easeInOut" },
                }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Workspaces</span>
                    <button
                      onClick={() => setIsNewProjectModalOpen(true)}
                      className="p-1 text-[#5E5C56] hover:text-[#A2502F] hover:bg-[#F6E7DE]/50 rounded-lg transition cursor-pointer"
                      title="Create New Project Folder"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {projects.map((p) => {
                      const count = boards.filter((b) => boardProjectMap[b.id] === p.id).length;
                      const isSelected = selectedProjectId === p.id;
                      const IconComp = getFolderIconComponent(p.icon);
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedProjectId(isSelected ? null : p.id);
                            setActiveTab('home');
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-medium transition text-left cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bg-[#F6E7DE] text-[#A2502F] font-semibold ring-1 ring-[#A2502F]/30'
                              : 'text-[#5E5C56] hover:bg-[#F6E7DE]/50 hover:text-[#1A1917]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <IconComp className="w-3.5 h-3.5 shrink-0" style={{ color: p.color }} />
                            <span className="truncate whitespace-nowrap">{p.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full bg-slate-100 shrink-0">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom: Settings ONLY */}
            <div className="pt-3 border-t border-slate-100 overflow-hidden">
              <button
                onClick={onOpenProfileSettings}
                className="group relative flex items-center h-10 w-full rounded-xl px-2.5 transition-colors duration-150 cursor-pointer overflow-hidden select-none text-slate-600 hover:text-slate-900 hover:bg-slate-50 gap-3 text-left"
                title="Settings"
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  <Settings className="w-[19px] h-[19px] shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <motion.span
                  initial={false}
                  animate={{
                    opacity: aceternityOpen ? 1 : 0,
                    x: aceternityOpen ? 0 : -8,
                  }}
                  transition={{
                    duration: aceternityOpen ? 0.22 : 0.12,
                    ease: "easeInOut",
                  }}
                  className="truncate whitespace-nowrap overflow-hidden text-sm font-medium select-none pointer-events-none"
                >
                  Settings
                </motion.span>
              </button>
            </div>
          </SidebarBody>
        </Sidebar>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <main className="flex-1 min-h-0 h-full overflow-y-auto p-6 md:p-10 pb-24 space-y-10 overscroll-contain">
          {/* ═══════════════ SANKALP BRAND HERO SHOWCASE BANNER ═══════════════ */}
          {activeTab === 'home' && (
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#F6E7DE]/50 via-[#FAFAF7] to-white border border-[#D9D8D5] p-8 md:p-12 shadow-xs">
              {/* Soft Brand Glow Gradients */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#A2502F]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D9542C]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

              <div className="relative flex flex-col items-center text-center max-w-3xl mx-auto">
                {/* Product Headline */}
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1A1917] leading-[1.15]">
                  What will you <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A2502F] via-[#D9542C] to-[#A2502F]">brainstorm & build</span> today?
                </h2>

                {/* Relevant Tagline */}
                <p className="mt-3 text-sm md:text-base text-[#5E5C56] font-normal max-w-xl">
                  The infinite collaborative workspace to diagram, map workflows, and build together in real time.
                </p>

                {/* Segmented Switcher Pills: Home / Templates */}
                <div className="mt-5 inline-flex items-center p-1 bg-white/95 backdrop-blur rounded-full border border-[#D9D8D5] shadow-2xs gap-1.5">
                  <button
                    onClick={() => setActiveTab('home')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition bg-[#F6E7DE] text-[#A2502F] shadow-2xs border border-[#A2502F]/20"
                  >
                    <Home className="w-3.5 h-3.5 text-[#A2502F]" />
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('templates')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition text-[#5E5C56] hover:text-[#1A1917]"
                  >
                    <LayoutTemplate className="w-3.5 h-3.5 text-[#5E5C56]" />
                    <span>Templates</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('projects')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Projects</span>
                  </button>
                </div>

                {/* Main Wide Canva Search Bar on Page */}
                <div className="relative w-full max-w-2xl mt-6">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search anything (boards, templates, diagrams, documents)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-full pl-14 pr-14 py-4 text-sm md:text-base text-slate-800 placeholder-slate-400 outline-none shadow-md shadow-indigo-500/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Canva Category Icon Buttons Carousel */}
              <div className="relative mt-10">
                <div className="flex items-start gap-6 sm:gap-7 md:gap-8 overflow-x-auto pt-4 pb-3 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden justify-start md:justify-center">
                  {CANVA_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className="group flex flex-col items-center cursor-pointer select-none shrink-0 transition-transform"
                    >
                      <div className="relative">
                        <div
                          className={`w-15 h-15 sm:w-16 sm:h-16 md:w-[68px] md:h-[68px] rounded-full flex items-center justify-center border transition-all duration-200 group-hover:scale-105 group-hover:shadow-md active:scale-95 shadow-2xs ${cat.colorClass}`}
                        >
                          <cat.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px]" />
                        </div>

                        {cat.badge && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-[9px] leading-tight rounded-full shadow-md uppercase tracking-wider z-30 pointer-events-none ring-2 ring-white whitespace-nowrap">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <span className="mt-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 group-hover:text-slate-950 transition text-center tracking-tight truncate max-w-[84px]">
                        {cat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ DEDICATED PROJECTS TAB VIEW ═══════════════ */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Project Folders & Workspaces</h3>
                  <p className="text-xs text-slate-500">Organize your boards into dedicated folders and team spaces</p>
                </div>
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A1917] hover:bg-[#D9542C] text-[#FAFAF7] rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>New Folder</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {projects.map((p) => {
                  const count = boards.filter((b) => boardProjectMap[b.id] === p.id).length;
                  const isSelected = selectedProjectId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProjectId(isSelected ? null : p.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between h-36 relative group shadow-sm ${
                        isSelected
                          ? 'bg-[#F6E7DE]/60 border-[#A2502F] shadow-md ring-2 ring-[#A2502F]/20'
                          : 'bg-white border-[#D9D8D5] hover:border-[#A2502F] hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="p-2.5 rounded-xl border border-[#D9D8D5]/60 shadow-2xs flex items-center justify-center"
                            style={{ backgroundColor: `${p.color}15`, color: p.color }}
                          >
                            {(() => {
                              const IconComp = getFolderIconComponent(p.icon);
                              return <IconComp className="w-5 h-5" />;
                            })()}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-[#1A1917]">{p.name}</h4>
                            <span className="text-[11px] text-[#5E5C56] font-medium">{count} boards</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => requestDeleteProject(e, p.id, p.name)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded-lg transition"
                          title="Delete folder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-[#5E5C56] line-clamp-2 mt-2">{p.description || 'Workspace folder'}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#D9D8D5]/60 text-[11px] text-[#A2502F] font-semibold">
                        <span>{isSelected ? 'Viewing folder boards' : 'Filter by folder'}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════ DEDICATED TEMPLATES TAB VIEW ═══════════════ */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Whiteboard Template Gallery</h3>
                  <p className="text-xs text-slate-500">Kickstart your brainstorms, retrospectives, roadmaps, presentations, and wireframes</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate(BOARD_TEMPLATES[0])}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A1917] hover:bg-[#D9542C] text-[#FAFAF7] rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Blank Canvas</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {BOARD_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleCreateFromTemplate(tmpl)}
                    className="bg-white rounded-2xl border border-[#D9D8D5] hover:border-[#A2502F] p-5 flex flex-col justify-between hover:shadow-xl transition cursor-pointer group"
                  >
                    <div>
                      <div className="w-full aspect-[16/9] rounded-xl bg-[#FAFAF7] border border-[#D9D8D5] flex items-center justify-center mb-4 group-hover:bg-[#F6E7DE]/50 transition">
                        <Sparkles className="w-8 h-8 text-[#A2502F] group-hover:scale-110 transition" />
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-[#1A1917] text-sm">{tmpl.title}</h4>
                        {tmpl.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F6E7DE] text-[#A2502F]">
                            {tmpl.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5E5C56] line-clamp-2">{tmpl.description}</p>
                    </div>

                    <button className="mt-4 w-full py-2 bg-[#FAFAF7] group-hover:bg-[#1A1917] group-hover:text-[#FAFAF7] rounded-xl text-xs font-semibold text-[#1A1917] transition border border-[#D9D8D5]">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════ CANVA SECTION: TRASH (CANVA FULL-PAGE VIEW) ═══════════════ */}
          {activeTab === 'trash' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Canva Trash Header Bar */}
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  Trash
                </h2>

                <div className="flex items-center gap-2.5">
                  {trashBoards.length > 0 && trashSubTab === 'designs' && (
                    <button
                      onClick={requestEmptyTrash}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/90 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Empty trash</span>
                    </button>
                  )}

                  {/* View Mode Switcher Button (Matching Canva List/Grid Toggle) */}
                  <button
                    onClick={() => setTrashViewMode((prev) => (prev === 'grid' ? 'table' : 'grid'))}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition cursor-pointer"
                    title={trashViewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
                  >
                    {trashViewMode === 'grid' ? (
                      <List className="w-4 h-4" />
                    ) : (
                      <Grid className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Canva Sub-Tabs Row: Designs, Images, Videos, Files */}
              <div className="flex items-center gap-6 border-b border-slate-200/90 text-sm">
                {[
                  { id: 'designs' as const, label: 'Designs' },
                  { id: 'images' as const, label: 'Images' },
                  { id: 'videos' as const, label: 'Videos' },
                  { id: 'files' as const, label: 'Files' },
                ].map((tab) => {
                  const isActive = trashSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTrashSubTab(tab.id)}
                      className={`pb-2.5 transition text-sm font-medium relative cursor-pointer ${
                        isActive
                          ? 'text-purple-700 font-semibold border-b-2 border-purple-600 -mb-[1px]'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Trash Sub-Tab Content */}
              {trashSubTab === 'designs' ? (
                trashBoards.length === 0 ? (
                  /* Canva Empty State 1:1 Matching User Reference Image */
                  <div className="flex flex-col items-center justify-center py-20 text-center select-none">
                    <CanvaTrashIllustration size={165} />
                    <h3 className="text-xl font-bold text-slate-900 mt-6 tracking-tight">
                      Any designs you trash will end up here
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-md">
                      You'll have 30 days to restore them before they're automatically deleted from Trash.{' '}
                      <button
                        onClick={onOpenLearningCenter}
                        className="text-purple-600 hover:text-purple-700 hover:underline font-semibold cursor-pointer"
                      >
                        Learn more
                      </button>
                    </p>
                  </div>
                ) : trashViewMode === 'table' ? (
                  /* Table View of Trashed Designs */
                  <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <table className="w-full text-left text-sm text-slate-700 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                          <th className="py-3 px-5">Design Name</th>
                          <th className="py-3 px-5">Status</th>
                          <th className="py-3 px-5">Owner</th>
                          <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {trashBoards.map((b) => {
                          const typeInfo = getBoardTypeInfo(b.name);
                          const TypeIcon = typeInfo.icon;
                          return (
                            <tr key={b.id} className="hover:bg-slate-50/80 transition group">
                              <td className="py-3.5 px-5 flex items-center gap-3">
                                <span className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                                  <TypeIcon className="w-4 h-4" />
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-700">
                                    {b.name}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {formatRelativeTime(b.updatedAt)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                                  In Trash
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-slate-600 text-xs font-medium">
                                {b.ownerName}
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={(e) => handleRestoreBoard(e, b)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition cursor-pointer"
                                    title="Restore design"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Restore</span>
                                  </button>
                                  <button
                                    onClick={(e) => requestPermanentDelete(e, b.id, b.name)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                                    title="Delete permanently"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete permanently</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Grid View of Trashed Designs */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {trashBoards.map((b) => {
                      const typeInfo = getBoardTypeInfo(b.name);
                      const TypeIcon = typeInfo.icon;
                      return (
                        <div
                          key={b.id}
                          className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden relative"
                        >
                          {/* Thumbnail with slight gray overlay */}
                          <div className="relative p-2 pb-0 opacity-80 group-hover:opacity-100 transition">
                            <BoardThumbnail board={b} />
                            <span className="absolute top-3.5 left-3.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs">
                              In Trash
                            </span>
                          </div>

                          <div className="p-3.5 pt-3 flex flex-col justify-between flex-1">
                            <div>
                              <h4 className="font-semibold text-slate-800 text-sm truncate" title={b.name}>
                                {b.name}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                                <TypeIcon className="w-3.5 h-3.5" style={{ color: typeInfo.color }} />
                                <span>{formatRelativeTime(b.updatedAt)}</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                onClick={(e) => handleRestoreBoard(e, b)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={(e) => requestPermanentDelete(e, b.id, b.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Empty State for other subtabs (Images, Videos, Files) */
                <div className="flex flex-col items-center justify-center py-20 text-center select-none">
                  <CanvaTrashIllustration size={165} />
                  <h3 className="text-xl font-bold text-slate-900 mt-6 tracking-tight capitalize">
                    Any {trashSubTab} you trash will end up here
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md">
                    You'll have 30 days to restore them before they're automatically deleted from Trash.{' '}
                    <button
                      onClick={onOpenLearningCenter}
                      className="text-purple-600 hover:text-purple-700 hover:underline font-semibold cursor-pointer"
                    >
                      Learn more
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ CANVA SECTION: CONTINUE DESIGNING ═══════════════ */}
          {activeTab !== 'templates' && activeTab !== 'trash' && (
            <div className="space-y-4">
              {/* Header: "Continue designing" + Category Filter Pills + View Switcher + "See all" */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                    {activeTab === 'starred'
                      ? 'Starred boards'
                      : activeTab === 'shared'
                      ? 'Shared with me'
                      : selectedProjectId
                      ? `Boards in ${projects.find((p) => p.id === selectedProjectId)?.name || 'Project'}`
                      : 'Continue designing'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Conditional "See all" action when truncated or filtered */}
                  {(selectedProjectId !== null || displayedBoards.length < filteredBoards.length) && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedProjectId(null);
                          setActiveTab('home');
                          setVisibleBoardsCount(boards.length);
                        }}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        See all
                      </button>
                      <div className="h-4 w-px bg-slate-200" />
                    </>
                  )}

                  {/* Canva Segmented Grid vs Table Switcher */}
                  <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white text-slate-900 shadow-xs font-medium'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Grid View (Live Thumbnails)"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === 'table'
                          ? 'bg-white text-slate-900 shadow-xs font-medium'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Table View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-filter row: Project Folder Pills */}
              <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                    selectedProjectId === null
                      ? 'bg-[#1A1917] text-[#FAFAF7] shadow-xs'
                      : 'bg-white text-[#5E5C56] border border-[#D9D8D5] hover:bg-[#F6E7DE]/50 hover:text-[#1A1917]'
                  }`}
                >
                  All ({boards.length})
                </button>

                {projects.map((p) => {
                  const count = boards.filter((b) => boardProjectMap[b.id] === p.id).length;
                  const isSelected = selectedProjectId === p.id;
                  const IconComp = getFolderIconComponent(p.icon);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProjectId(isSelected ? null : p.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition border shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#F6E7DE] text-[#A2502F] border-[#A2502F]/30 shadow-xs'
                          : 'bg-white text-[#5E5C56] border-[#D9D8D5] hover:bg-[#F6E7DE]/50 hover:text-[#1A1917]'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" style={{ color: p.color }} />
                      <span>{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#5E5C56] hover:text-[#A2502F] hover:bg-[#F6E7DE]/50 transition border border-dashed border-[#D9D8D5] shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Folder</span>
                </button>
              </div>

              {/* Boards Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredBoards.length === 0 ? (
                /* Canva Empty State 1:1 Matching User Illustration Style */
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center select-none animate-in fade-in duration-200">
                  <CanvaEmptyBoardsIllustration size={165} />
                  <h3 className="text-xl font-bold text-slate-900 mt-6 tracking-tight">
                    {searchQuery
                      ? `No designs found for "${searchQuery}"`
                      : activeTab === 'starred'
                      ? 'No starred designs yet'
                      : activeTab === 'shared'
                      ? 'No designs shared with you'
                      : selectedProjectId
                      ? 'This workspace is empty'
                      : 'Any designs you create will end up here'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md">
                    {searchQuery
                      ? 'Try searching with different keywords or check for typos.'
                      : activeTab === 'starred'
                      ? 'Star your favorite boards to quickly access them anytime from here.'
                      : activeTab === 'shared'
                      ? 'Boards shared with you by other team members will appear in this space.'
                      : selectedProjectId
                      ? 'Move existing canvases into this project folder or create a new one to get started.'
                      : 'Start from a blank canvas or choose a pre-built template to bring your ideas to life.'}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        Clear search
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCreateFromTemplate(BOARD_TEMPLATES[0])}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer hover:shadow-indigo-200 active:scale-98"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create a design</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : viewMode === 'table' ? (
                /* Table View */
                <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <table className="w-full text-left text-sm text-slate-700 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-5">Name</th>
                        <th className="py-3 px-5">Project Folder</th>
                        <th className="py-3 px-5">Status</th>
                        <th className="py-3 px-5">Last Edited</th>
                        <th className="py-3 px-5">Owner</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedBoards.map((b) => {
                        const projId = boardProjectMap[b.id];
                        const proj = projects.find((p) => p.id === projId);
                        const typeInfo = getBoardTypeInfo(b.name);
                        const TypeIcon = typeInfo.icon;
                        return (
                          <tr
                            key={b.id}
                            onClick={() => onSelectBoard(b.id)}
                            className="hover:bg-slate-50 transition cursor-pointer group"
                          >
                            <td className="py-3.5 px-5 flex items-center gap-3">
                              <button onClick={(e) => toggleStar(e, b.id)} className="text-slate-300 hover:text-amber-500 transition">
                                <Star className={`w-4 h-4 ${starredIds.has(b.id) ? 'fill-amber-400 text-amber-500' : ''}`} />
                              </button>
                              <div className="flex items-center gap-2.5">
                                <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                                  <TypeIcon className="w-4 h-4" style={{ color: typeInfo.color }} />
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-[#1A1917] group-hover:text-[#A2502F] transition">
                                    {b.name}
                                  </span>
                                  <span className="text-[11px] text-[#5E5C56]">By {b.ownerName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              {proj ? (() => {
                                const IconComp = getFolderIconComponent(proj.icon);
                                return (
                                  <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                                    style={{ backgroundColor: `${proj.color}15`, color: proj.color }}
                                  >
                                    <IconComp className="w-3.5 h-3.5" />
                                    <span>{proj.name}</span>
                                  </span>
                                );
                              })() : (
                                <span className="text-xs text-slate-400 italic">No folder</span>
                              )}
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                <span className="text-emerald-600 text-xs font-medium">
                                  {b.objectCount ? `${b.objectCount} items` : 'Saved'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 text-slate-500 text-xs">
                              {formatRelativeTime(b.updatedAt)}
                            </td>
                            <td className="py-3.5 px-5 text-slate-700 font-medium">{b.ownerName}</td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                onClick={(e) => handleDeleteBoard(e, b.id)}
                                title="Delete Board"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Canva-Style Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {displayedBoards.map((b) => {
                    const projId = boardProjectMap[b.id];
                    const proj = projects.find((p) => p.id === projId);
                    const typeInfo = getBoardTypeInfo(b.name);
                    const TypeIcon = typeInfo.icon;
                    return (
                      <div
                        key={b.id}
                        onClick={() => onSelectBoard(b.id)}
                        className={`group bg-white rounded-2xl border border-[#D9D8D5] hover:border-[#A2502F] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col relative ${
                          activeBoardMenuId === b.id ? 'z-40 overflow-visible' : 'z-0 overflow-hidden'
                        }`}
                      >
                        {/* Canvas Live / Procedural Thumbnail */}
                        <div className="relative p-2 pb-0">
                          <BoardThumbnail board={b} />

                          {/* Top-Right Quick Actions: Star, Delete & Menu */}
                          <div className="absolute top-3.5 right-3.5 flex items-center gap-1 z-10">
                            <button
                              onClick={(e) => toggleStar(e, b.id)}
                              className="p-1.5 rounded-lg bg-white/95 backdrop-blur shadow-xs hover:bg-white text-slate-400 hover:text-amber-500 transition"
                              title="Star board"
                            >
                              <Star className={`w-3.5 h-3.5 ${starredIds.has(b.id) ? 'fill-amber-400 text-amber-500' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteBoard(e, b.id)}
                              className="p-1.5 rounded-lg bg-white/95 backdrop-blur shadow-xs hover:bg-white text-slate-400 hover:text-rose-600 transition opacity-0 group-hover:opacity-100"
                              title="Delete board"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveBoardMenuId(activeBoardMenuId === b.id ? null : b.id);
                              }}
                              className={`p-1.5 rounded-lg backdrop-blur shadow-xs transition ${
                                activeBoardMenuId === b.id
                                  ? 'bg-[#1A1917] text-[#FAFAF7]'
                                  : 'bg-white/95 hover:bg-white text-[#5E5C56] hover:text-[#1A1917]'
                              }`}
                              title="Board options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Project Tag Pill on Thumbnail Bottom */}
                          {proj && (() => {
                            const IconComp = getFolderIconComponent(proj.icon);
                            return (
                              <div className="absolute bottom-1.5 left-3 z-10">
                                <span
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1.5 backdrop-blur bg-white/95 border border-[#D9D8D5]"
                                  style={{ color: proj.color }}
                                >
                                  <IconComp className="w-3 h-3" />
                                  <span>{proj.name}</span>
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Card Info Details (Canva Style) */}
                        <div className="p-3.5 pt-3 flex flex-col justify-between flex-1">
                          <h4 className="font-semibold text-[#1A1917] text-sm group-hover:text-[#A2502F] transition truncate pr-1" title={b.name}>
                            {b.name}
                          </h4>

                          {/* Subtitle row: Category icon + label + • Edited X ago + Member bubbles */}
                          <div className="flex items-center justify-between text-[11px] text-[#5E5C56] mt-2 pt-2 border-t border-slate-100/90">
                            <div className="flex items-center gap-1.5 truncate">
                              <TypeIcon className="w-3.5 h-3.5 shrink-0" style={{ color: typeInfo.color }} />
                              <span className="font-medium truncate">{typeInfo.label}</span>
                              <span className="text-[#D9D8D5]">•</span>
                              <span className="text-[#5E5C56] shrink-0">{formatRelativeTime(b.updatedAt)}</span>
                            </div>

                            {/* Collaborator Initials Circle Badge & Object Count */}
                            <div className="flex items-center gap-1.5 shrink-0 ml-1">
                              {b.objectCount !== undefined && b.objectCount > 0 && (
                                <span className="text-[10px] font-medium text-[#5E5C56] bg-[#F6E7DE]/50 px-1.5 py-0.5 rounded-md" title={`${b.objectCount} canvas elements`}>
                                  {b.objectCount} {b.objectCount === 1 ? 'item' : 'items'}
                                </span>
                              )}
                              <div
                                title={`Owner: ${b.ownerName}`}
                                className="w-5 h-5 rounded-full bg-[#F6E7DE] text-[#A2502F] font-bold text-[9px] flex items-center justify-center border border-white"
                              >
                                {b.ownerName?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Popover Menu for Assigning Project, Duplicating & Deleting */}
                        {activeBoardMenuId === b.id && (
                          <div
                            ref={menuRef}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-10 right-3 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2.5 z-50 min-w-[200px] animate-in fade-in zoom-in-95 duration-150 text-slate-800 text-xs"
                          >
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Move to Project
                            </div>
                            <div className="space-y-0.5 max-h-32 overflow-y-auto pr-1">
                              <button
                                onClick={(e) => handleAssignProject(e, b.id, null)}
                                className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-left transition ${
                                  !boardProjectMap[b.id] ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <span>None (Unassigned)</span>
                                {!boardProjectMap[b.id] && <Check className="w-3 h-3" />}
                              </button>
                              {projects.map((p) => {
                                const isAssigned = boardProjectMap[b.id] === p.id;
                                const IconComp = getFolderIconComponent(p.icon);
                                return (
                                  <button
                                    key={p.id}
                                    onClick={(e) => handleAssignProject(e, b.id, p.id)}
                                    className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-left transition ${
                                      isAssigned ? 'bg-[#F6E7DE] text-[#A2502F] font-semibold' : 'hover:bg-slate-100 text-[#1A1917]'
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5 truncate">
                                      <IconComp className="w-3.5 h-3.5 shrink-0" style={{ color: p.color }} />
                                      <span className="truncate">{p.name}</span>
                                    </span>
                                    {isAssigned && <Check className="w-3 h-3" />}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="my-1.5 border-t border-slate-100" />

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateBoard(e, b);
                                setActiveBoardMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition font-medium text-left"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Duplicate Board</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveBoardMenuId(null);
                                handleDeleteBoard(e, b.id);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition font-medium text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete Board</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Canva "Show more" button */}
              {displayedBoards.length < filteredBoards.length && (
                <div className="flex justify-center pt-6 pb-10">
                  <button
                    onClick={() => setVisibleBoardsCount((prev) => prev + 10)}
                    className="px-8 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition active:scale-95"
                  >
                    Show more
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════ NEW PROJECT FOLDER MODAL ═══════════════ */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#A2502F]" />
                <h3 className="text-lg font-bold text-[#1A1917]">New Project Folder</h3>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Folder Name</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Mobile App V2, Marketing Campaign..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  className="w-full bg-slate-50 border border-[#D9D8D5] rounded-xl px-3 py-2 text-sm text-[#1A1917] outline-none focus:border-[#A2502F] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1917] mb-1.5">Pick Icon</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_ICONS.map((iconKey) => {
                    const IconComp = getFolderIconComponent(iconKey);
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setNewProjectIcon(iconKey)}
                        className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
                          newProjectIcon === iconKey
                            ? 'bg-[#F6E7DE] border-[#A2502F] text-[#A2502F] scale-105 shadow-sm ring-2 ring-[#A2502F]/20'
                            : 'bg-slate-50 border-[#D9D8D5] text-[#5E5C56] hover:bg-[#F6E7DE]/40 hover:text-[#1A1917]'
                        }`}
                        title={iconKey}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1917] mb-1.5">Color Tag</label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setNewProjectColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-6 h-6 rounded-full transition transform ${
                        newProjectColor === col ? 'scale-125 ring-2 ring-offset-2 ring-[#1A1917]' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D9D8D5]">
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5E5C56] hover:bg-[#F6E7DE]/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-[#1A1917] hover:bg-[#D9542C] disabled:opacity-50 text-[#FAFAF7] rounded-xl text-xs font-semibold shadow-sm transition"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CANVA "MOVED TO TRASH" UNDO TOAST PILL ═══════════════ */}
      <AnimatePresence>
        {undoToast.visible && undoToast.board && (
          <div className="fixed top-28 inset-x-0 z-[60] flex justify-center pointer-events-none px-4 md:pl-[68px]">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 bg-[#18191b] text-white rounded-full shadow-2xl border border-white/10 select-none backdrop-blur-md"
            >
              {/* White Circular Thumbnail Preview */}
              <div className="w-7 h-7 rounded-full overflow-hidden bg-white shrink-0 border border-white/20 flex items-center justify-center p-0.5 shadow-2xs">
                {(() => {
                  const thumb = typeof window !== 'undefined' ? localStorage.getItem(`wb_thumb_${undoToast.board.id}`) : null;
                  if (thumb) {
                    return <img src={thumb} alt="" className="w-full h-full object-cover rounded-full" />;
                  }
                  return (
                    <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center">
                      <Grid className="w-3.5 h-3.5 text-slate-700" />
                    </div>
                  );
                })()}
              </div>

              {/* Title / Status Message */}
              <span className="text-xs font-semibold text-white/95 max-w-[280px] sm:max-w-xs truncate">
                "{undoToast.board.name}" moved to Trash
              </span>

              {/* Undo Action Button */}
              <button
                onClick={handleUndoTrash}
                className="px-3.5 py-1 rounded-full border border-white/30 hover:border-white/60 hover:bg-white/15 text-white text-xs font-semibold transition active:scale-95 cursor-pointer ml-1 shadow-2xs"
              >
                Undo
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════ CLEAR TRASH / PERMANENT DELETE CONFIRMATION MODAL ═══════════════ */}
      {deleteConfirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    deleteConfirmState.type === 'permanent' || deleteConfirmState.type === 'empty-trash'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {deleteConfirmState.type === 'permanent' || deleteConfirmState.type === 'empty-trash' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {deleteConfirmState.type === 'permanent'
                      ? 'Delete board permanently?'
                      : deleteConfirmState.type === 'project'
                      ? 'Delete project folder?'
                      : 'Empty all trash?'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {deleteConfirmState.type === 'project'
                      ? 'Boards inside will not be deleted, only unassigned.'
                      : 'This action is irreversible and cannot be undone.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmState({ isOpen: false, type: 'empty-trash' })}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {deleteConfirmState.type === 'permanent' ? (
                <>
                  <span className="font-semibold text-rose-700">Warning:</span> <span className="font-semibold text-slate-900">"{deleteConfirmState.boardName}"</span> and all of its canvas elements, layers, and revision history will be permanently deleted.
                </>
              ) : deleteConfirmState.type === 'project' ? (
                <>
                  Are you sure you want to delete the project folder <span className="font-semibold text-slate-900">"{deleteConfirmState.projectName}"</span>?
                </>
              ) : (
                <>
                  <span className="font-semibold text-rose-700">Warning:</span> All <span className="font-semibold text-slate-900">{trashBoards.length}</span> designs in trash will be permanently deleted forever.
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmState({ isOpen: false, type: 'empty-trash' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-rose-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {deleteConfirmState.type === 'permanent'
                    ? 'Delete Permanently'
                    : deleteConfirmState.type === 'project'
                    ? 'Delete Folder'
                    : 'Empty Trash'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Notifications Onboarding Flow Modal */}
      <NotificationOnboardingModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onPermissionGranted={() => setNotificationPermission('granted')}
      />
    </div>
  );
};
