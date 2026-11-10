import { create } from 'zustand';
import { Tool } from '@whiteboard/shared';

export type CanvasTheme = 'light' | 'dark' | 'sepia' | 'blueprint';
export type GridStyle = 'dotted' | 'lines' | 'crosses' | 'none';

interface UIState {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;

  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;

  editingTextId: string | null;
  setEditingTextId: (id: string | null) => void;

  connectorStartId: string | null;
  setConnectorStartId: (id: string | null) => void;

  canvasTheme: CanvasTheme;
  setCanvasTheme: (theme: CanvasTheme) => void;
  toggleCanvasTheme: () => void;

  gridStyle: GridStyle;
  setGridStyle: (style: GridStyle) => void;
  toggleGrid: () => void;

  activeColor: string;
  setActiveColor: (color: string) => void;

  activeFillColor: string;
  setActiveFillColor: (color: string) => void;

  activeStrokeWidth: number;
  setActiveStrokeWidth: (width: number) => void;

  penStyle: 'pen' | 'highlighter' | 'marker' | 'dashed' | 'eraser' | 'smart';
  setPenStyle: (style: 'pen' | 'highlighter' | 'marker' | 'dashed' | 'eraser' | 'smart') => void;

  activeFontSize: number;
  setActiveFontSize: (size: number) => void;

  activeTextColor: string;
  setActiveTextColor: (color: string) => void;

  isShareModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;

  saveStatus: 'saved' | 'saving' | 'offline' | 'reconnecting';
  setSaveStatus: (status: 'saved' | 'saving' | 'offline' | 'reconnecting') => void;

  isPresentationMode: boolean;
  setIsPresentationMode: (mode: boolean) => void;
  togglePresentationMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool, connectorStartId: null }),

  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),

  editingTextId: null,
  setEditingTextId: (id) => set({ editingTextId: id }),

  connectorStartId: null,
  setConnectorStartId: (id) => set({ connectorStartId: id }),

  canvasTheme: (localStorage.getItem('wb_canvas_theme') as CanvasTheme) || 'light',
  setCanvasTheme: (theme) => {
    localStorage.setItem('wb_canvas_theme', theme);
    set({ canvasTheme: theme });
  },
  toggleCanvasTheme: () =>
    set((state) => {
      const themes: CanvasTheme[] = ['light', 'dark', 'sepia', 'blueprint'];
      const nextTheme = themes[(themes.indexOf(state.canvasTheme) + 1) % themes.length];
      localStorage.setItem('wb_canvas_theme', nextTheme);
      return { canvasTheme: nextTheme };
    }),

  gridStyle: (localStorage.getItem('wb_canvas_grid') as GridStyle) || 'dotted',
  setGridStyle: (style) => {
    localStorage.setItem('wb_canvas_grid', style);
    set({ gridStyle: style });
  },
  toggleGrid: () =>
    set((state) => {
      const grids: GridStyle[] = ['dotted', 'lines', 'crosses', 'none'];
      const nextGrid = grids[(grids.indexOf(state.gridStyle) + 1) % grids.length];
      localStorage.setItem('wb_canvas_grid', nextGrid);
      return { gridStyle: nextGrid };
    }),

  activeColor: '#fef08a',
  setActiveColor: (color) => set({ activeColor: color }),

  activeFillColor: '#3b82f6',
  setActiveFillColor: (color) => set({ activeFillColor: color }),

  activeStrokeWidth: 2,
  setActiveStrokeWidth: (width) => set({ activeStrokeWidth: width }),

  penStyle: 'pen',
  setPenStyle: (style) => set({ penStyle: style }),

  activeFontSize: 16,
  setActiveFontSize: (size) => set({ activeFontSize: size }),

  activeTextColor: '#000000',
  setActiveTextColor: (color) => set({ activeTextColor: color }),

  isShareModalOpen: false,
  setShareModalOpen: (open) => set({ isShareModalOpen: open }),

  saveStatus: 'saved',
  setSaveStatus: (status) => set({ saveStatus: status }),

  isPresentationMode: false,
  setIsPresentationMode: (mode) => set({ isPresentationMode: mode }),
  togglePresentationMode: () => set((state) => ({ isPresentationMode: !state.isPresentationMode })),
}));
