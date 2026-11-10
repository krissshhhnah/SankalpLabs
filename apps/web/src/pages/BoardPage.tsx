import React, { useState, useEffect } from 'react';
import { Camera } from '@whiteboard/canvas-engine';
import { TopBar } from '../components/TopBar';
import { ToolBar } from '../components/ToolBar';
import { PropertyBar } from '../components/PropertyBar';
import { CanvasContainer } from '../components/CanvasContainer';
import { LiveCursorsOverlay } from '../components/LiveCursorsOverlay';
import { Minimap } from '../components/Minimap';
import { ShareModal } from '../components/ShareModal';
import { ContextMenu } from '../components/ContextMenu';
import { AiAssistantChat } from '../components/AiAssistantChat';
import { NextStepSuggestionsOverlay } from '../components/NextStepSuggestionsOverlay';
import { PresentationOverlay } from '../components/PresentationOverlay';
import { CommentPinsOverlay } from '../components/CommentPinsOverlay';
import { useCollaboration } from '../hooks/useCollaboration';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { getBoardApi, updateBoardApi, forceSaveBoardApi } from '../services/api';
import { exportSvg, exportMultiPagePdf, exportHighResPng } from '../utils/exportUtils';
import { soundEffects } from '../utils/audioUtils';
import { ShortcutsModal } from '../components/ShortcutsModal';
import { ArrowLeft, Eye, CheckCircle, Bell, X, Volume2 } from 'lucide-react';

interface BoardPageProps {
  boardId: string;
  initialObjects?: any[];
  onBackToDashboard: () => void;
  onOpenProfileSettings?: () => void;
  onOpenAdminConsole?: () => void;
  onOpenTrash?: () => void;
  onOpenLearningCenter?: () => void;
  onOpenAppsModal?: () => void;
  onOpenDeveloperHub?: () => void;
  onOpenMarketplace?: () => void;
}

export const BoardPage: React.FC<BoardPageProps> = ({
  boardId,
  initialObjects,
  onBackToDashboard,
  onOpenProfileSettings,
  onOpenAdminConsole,
  onOpenTrash,
  onOpenLearningCenter,
  onOpenAppsModal,
  onOpenDeveloperHub,
  onOpenMarketplace,
}) => {
  const [boardName, setBoardName] = useState('Collaborative Workspace');
  const [userRole, setUserRole] = useState<'OWNER' | 'EDITOR' | 'VIEWER'>('EDITOR');
  const [camera, setCamera] = useState(() => new Camera(0, 0, 1));
  const [, setCameraTick] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Right-click context menu state
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // AI Assistant Chat Drawer state (Slides in from the right)
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // Keyboard Shortcuts Cheatsheet Modal state
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Active Comment Thread & Pending Pin states
  const [activeCommentThreadId, setActiveCommentThreadId] = useState<string | null>(null);
  const [pendingPinPos, setPendingPinPos] = useState<{ x: number; y: number } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const {
    selectedIds,
    setSelectedIds,
    isPresentationMode,
    setIsPresentationMode,
    setSaveStatus,
    canvasTheme,
    toggleCanvasTheme,
    toggleGrid,
    setActiveTool,
  } = useUIStore();
  const {
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
  } = useCollaboration(boardId, initialObjects);

  useEffect(() => {
    getBoardApi(boardId)
      .then((b) => {
        setBoardName(b.name);
        setUserRole(b.role || 'EDITOR');
      })
      .catch((e) => console.error(e));
  }, [boardId]);

  // Store / Sync active board to LocalStorage recents history
  useEffect(() => {
    if (!boardId) return;
    try {
      const recentsStr = localStorage.getItem('wb_recent_boards');
      const recents: any[] = recentsStr ? JSON.parse(recentsStr) : [];
      const filtered = recents.filter((b) => b.id !== boardId);
      const updated = [
        {
          id: boardId,
          name: boardName,
          ownerId: 'user-demo',
          ownerName: 'Demo User',
          role: userRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...filtered,
      ];
      localStorage.setItem('wb_recent_boards', JSON.stringify(updated.slice(0, 30)));
    } catch (e) {
      console.error(e);
    }
  }, [boardId, boardName, userRole]);

  const handleCameraChange = () => {
    setCameraTick((t) => t + 1);
  };

  // Safe object creation ensuring active boardId
  const handleAddObject = (newObj: any) => {
    if (userRole === 'VIEWER') return;
    addObject({ ...newObj, boardId });
  };

  // Safe multi-object creation for AI generator
  const handleAddObjects = (newObjs: any[]) => {
    if (userRole === 'VIEWER') return;
    const scoped = newObjs.map((o) => ({ ...o, boardId }));
    addObjects(scoped);
  };

  // Global Cmd+K / Ctrl+K listener: opens/toggles right-side sliding AI Chat
  useEffect(() => {
    const handleAiShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAiChatOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleAiShortcut);
    return () => window.removeEventListener('keydown', handleAiShortcut);
  }, []);

  // Auto-flush save on page close or reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
        navigator.sendBeacon(`${API_URL}/api/boards/${boardId}/save`);
      } catch (e) {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [boardId]);

  const authUser = useAuthStore((state) => state.user);
  const currentUserName = authUser?.name || 'Demo User';
  const currentUserAvatar = authUser?.avatarUrl;
  const currentUserId = authUser?.id || 'demo-user';

  const handleJumpToCommentPin = (threadId: string) => {
    const thread = commentThreads.find((t) => t.id === threadId);
    if (thread) {
      camera.x = thread.x;
      camera.y = thread.y;
      handleCameraChange();
      setActiveCommentThreadId(threadId);
    }
  };

  const handleCreateCommentThread = (text: string) => {
    if (!pendingPinPos) return;
    const threadId = addCommentThread({
      x: Math.round(pendingPinPos.x),
      y: Math.round(pendingPinPos.y),
      text,
      authorId: currentUserId,
      authorName: currentUserName,
      authorAvatar: currentUserAvatar,
      authorColor: '#ec4899',
    });
    setPendingPinPos(null);
    setActiveCommentThreadId(threadId);
    setActiveTool('select');
    showToast('Comment pin placed!');
  };

  const handleCanvasClickWithTool = (tool: string, worldPoint: { x: number; y: number }) => {
    if (tool === 'comment') {
      setPendingPinPos(worldPoint);
    }
  };

  const handleAddComment = (text: string) => {
    const threadId = addCommentThread({
      x: Math.round(camera.x),
      y: Math.round(camera.y),
      text,
      authorId: currentUserId,
      authorName: currentUserName,
      authorAvatar: currentUserAvatar,
      authorColor: '#ec4899',
    });
    setActiveCommentThreadId(threadId);
    showToast('Added comment to whiteboard!');
  };


  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      deleteObjects(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleCopy = () => {
    if (selectedIds.length > 0) copySelected(selectedIds);
  };

  const handlePaste = () => {
    pasteClipboard();
  };

  const handleDuplicate = () => {
    if (selectedIds.length > 0) duplicateSelected(selectedIds);
  };

  const handleRenameBoard = async (newName: string) => {
    setBoardName(newName);
    try {
      const recentsStr = localStorage.getItem('wb_recent_boards');
      if (recentsStr) {
        const recents: any[] = JSON.parse(recentsStr);
        const idx = recents.findIndex((b) => b.id === boardId);
        if (idx !== -1) {
          recents[idx].name = newName;
          recents[idx].updatedAt = new Date().toISOString();
          localStorage.setItem('wb_recent_boards', JSON.stringify(recents));
        }
      }
    } catch (e) {}

    try {
      await updateBoardApi(boardId, { name: newName });
      showToast('Board renamed & saved!');
    } catch (e) {
      console.error(e);
      showToast('Board renamed locally');
    }
  };

  const captureThumbnail = () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas || !boardId) return;
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 360;
      thumbCanvas.height = 225;
      const ctx = thumbCanvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = getThemeBg();
      ctx.fillRect(0, 0, 360, 225);
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 360, 225);
      const dataUrl = thumbCanvas.toDataURL('image/jpeg', 0.65);
      localStorage.setItem(`wb_thumb_${boardId}`, dataUrl);
    } catch (e) {
      // Ignored if canvas tainted
    }
  };

  const handleForceSave = async () => {
    setSaveStatus('saving');
    captureThumbnail();
    try {
      await forceSaveBoardApi(boardId);
      setTimeout(() => {
        setSaveStatus('saved');
        showToast('All changes saved to cloud!');
      }, 350);
    } catch (e) {
      setTimeout(() => {
        setSaveStatus('saved');
        showToast('Saved locally & queued for sync');
      }, 350);
    }
  };

  const handleBackToDashboard = async () => {
    setSaveStatus('saving');
    captureThumbnail();
    try {
      await forceSaveBoardApi(boardId);
    } catch (e) {}
    onBackToDashboard();
  };

  const getThemeBg = () => {
    return canvasTheme === 'dark'
      ? '#0f172a'
      : canvasTheme === 'blueprint'
      ? '#0c2340'
      : canvasTheme === 'sepia'
      ? '#fbf0d9'
      : '#f8fafc';
  };

  const handleExportPng = async () => {
    try {
      showToast('Generating high-res PNG...');
      await exportHighResPng(boardName, objects, 2, { background: getThemeBg() });
      showToast('Exported Retina PNG image!');
    } catch (e) {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${boardName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_canvas.png`;
      link.href = dataUrl;
      link.click();
      showToast('Exported board as PNG image!');
    }
  };

  const handleExportSvg = () => {
    try {
      exportSvg(boardName, objects, { background: getThemeBg() });
      showToast('Exported vector SVG successfully!');
    } catch (e) {
      console.error(e);
      showToast('Failed to export SVG.');
    }
  };

  const handleExportPdf = async () => {
    try {
      showToast('Generating presentation PDF...');
      await exportMultiPagePdf(boardName, objects, (msg) => showToast(msg));
      showToast('Exported presentation PDF successfully!');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate PDF.');
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(objects, null, 2));
    const link = document.createElement('a');
    link.download = `${boardName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_backup.whiteboard.json`;
    link.href = dataStr;
    link.click();
    showToast('Exported board JSON backup!');
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedObjects = JSON.parse(content);
        if (Array.isArray(importedObjects)) {
          let count = 0;
          importedObjects.forEach((obj) => {
            if (obj.id && obj.type) {
              count++;
              addObject({
                ...obj,
                id: `${obj.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              });
            }
          });
          showToast(`Imported ${count} objects onto canvas!`);
        }
      } catch (err) {
        showToast('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onDuplicate: handleDuplicate,
    onDelete: handleDeleteSelected,
    onSelectAll: () => setSelectedIds(objects.filter((o) => !o.locked).map((o) => o.id)),
    onSave: handleForceSave,
    onOpenShortcuts: () => setIsShortcutsOpen((prev) => !prev),
    onToggleTheme: toggleCanvasTheme,
    onToggleGrid: toggleGrid,
  });

  const selectedObjects = objects.filter((o) => selectedIds.includes(o.id));
  const isSelectedLocked = selectedObjects.length > 0 && selectedObjects.every((o) => o.locked);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!e.clipboardData || !e.clipboardData.items) return;

      const items = Array.from(e.clipboardData.items);
      const imageItems = items.filter((item) => item.type.startsWith('image/'));

      imageItems.forEach((item, index) => {
        const blob = item.getAsFile();
        if (!blob) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          if (!src) return;

          const img = new Image();
          img.onload = () => {
            const originalWidth = img.naturalWidth || 400;
            const originalHeight = img.naturalHeight || 300;
            const aspectRatio = originalWidth / originalHeight;

            const width = Math.min(400, originalWidth);
            const height = Math.round(width / aspectRatio);

            const newImage: any = {
              id: `image-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              boardId: 'default',
              type: 'image',
              src,
              x: camera.x + index * 24 - width / 2,
              y: camera.y + index * 24 - height / 2,
              width,
              height,
              aspectRatio,
              originalWidth,
              originalHeight,
              rotation: 0,
              zIndex: objects.length + index + 1,
              locked: false,
              createdBy: 'user',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            addObject(newImage);
            setSelectedIds([newImage.id]);
          };
          img.src = src;
        };
        reader.readAsDataURL(blob);
      });
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [camera, objects.length, addObject, setSelectedIds]);

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden font-sans transition-colors duration-300 ${
        canvasTheme === 'dark' || canvasTheme === 'blueprint' ? 'dark' : ''
      }`}
      style={{
        backgroundColor:
          canvasTheme === 'dark'
            ? '#0f172a'
            : canvasTheme === 'blueprint'
            ? '#0c2340'
            : canvasTheme === 'sepia'
            ? '#fbf0d9'
            : '#FAFAF7',
      }}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-2xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workshop Timer Finished Alert Notification */}
      {timerFinishedNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="p-1 bg-white/20 rounded-lg">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight">Workshop Session Timer Finished!</span>
            <span className="text-[11px] text-white/90">Time is up for this collaborative segment</span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => soundEffects.playChime()}
              title="Replay gong chime sound"
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={dismissTimerNotice}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl transition text-[11px] font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      {!isPresentationMode && (
        <TopBar
          boardName={boardName}
          onRenameBoard={handleRenameBoard}
          onBackToDashboard={handleBackToDashboard}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onForceSave={handleForceSave}
          onExportPng={handleExportPng}
          onExportSvg={handleExportSvg}
          onExportPdf={handleExportPdf}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onOpenProfileSettings={onOpenProfileSettings}
          onOpenAdminConsole={onOpenAdminConsole}
          onOpenTrash={onOpenTrash}
          onOpenLearningCenter={onOpenLearningCenter}
          onOpenAppsModal={onOpenAppsModal}
          onOpenDeveloperHub={onOpenDeveloperHub}
          onOpenMarketplace={onOpenMarketplace}
          roomTimer={roomTimer}
          timerRemaining={timerRemaining}
          onStartTimer={startTimer}
          onPauseTimer={pauseTimer}
          onResetTimer={resetTimer}
          presences={presences}
          commentThreads={commentThreads}
          onSelectCommentThread={handleJumpToCommentPin}
          onActivateCommentTool={() => setActiveTool('comment')}
        />
      )}

      {/* Viewer Mode Banner */}
      {!isPresentationMode && userRole === 'VIEWER' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-600 shadow-md">
          <Eye className="w-3.5 h-3.5" />
          <span>Read-Only Viewer Mode</span>
        </div>
      )}

      {/* Toolbar & Property Inspector */}
      {!isPresentationMode && userRole !== 'VIEWER' && (
        <ToolBar
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onAddObject={addObject}
          isAiChatOpen={isAiChatOpen}
          onToggleAiChat={() => setIsAiChatOpen((prev) => !prev)}
          onOpenAiModal={() => setIsAiChatOpen(true)}
        />
      )}
      {!isPresentationMode && userRole !== 'VIEWER' && (
        <PropertyBar
          objects={objects}
          onDeleteSelected={handleDeleteSelected}
          onUpdateObject={updateObject}
          onBringToFront={() => bringToFront(selectedIds)}
          onSendToBack={() => sendToBack(selectedIds)}
          onToggleLock={() => toggleLock(selectedIds)}
          onDuplicate={() => duplicateSelected(selectedIds)}
        />
      )}
      <ShareModal boardId={boardId} />

      {/* AI Assistant Chat Room (Smoothly Slides in from Right) */}
      {!isPresentationMode && (
        <AiAssistantChat
          isOpen={isAiChatOpen}
          onClose={() => setIsAiChatOpen(false)}
          onAddObject={handleAddObject}
          onAddObjects={handleAddObjects}
          onUpdateObject={updateObject}
          boardId={boardId}
          camera={{ x: camera.x, y: camera.y, zoom: camera.zoom }}
          objects={objects}
          selectedIds={selectedIds}
        />
      )}

      {/* Interactive Presentation Mode Overlay */}
      <PresentationOverlay
        isOpen={isPresentationMode}
        onClose={() => setIsPresentationMode(false)}
        objects={objects}
        camera={camera}
        onCameraChange={handleCameraChange}
        onAddObject={handleAddObject}
      />

      {/* Native Right-Click Context Menu */}
      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          selectedCount={selectedIds.length}
          isLocked={isSelectedLocked}
          onClose={() => setContextMenuPos(null)}
          onOpenAi={() => setIsAiChatOpen(true)}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onDuplicate={handleDuplicate}
          onLockToggle={() => toggleLock(selectedIds)}
          onBringToFront={() => bringToFront(selectedIds)}
          onSendToBack={() => sendToBack(selectedIds)}
          onDelete={handleDeleteSelected}
        />
      )}

      {/* Live Cursors Overlay for Real-Time Presence */}
      <LiveCursorsOverlay camera={camera} presences={presences} />

      {/* Canvas Layer */}
      <CanvasContainer
        camera={camera}
        onCameraChange={handleCameraChange}
        objects={objects}
        onAddObject={handleAddObject}
        onUpdateObject={userRole !== 'VIEWER' ? updateObject : () => {}}
        onDeleteObject={userRole !== 'VIEWER' ? (id) => deleteObjects([id]) : () => {}}
        onCanvasClickWithTool={handleCanvasClickWithTool}
        onPointerMove={updateCursor}
        onContextMenu={(e) => {
          setContextMenuPos({ x: e.clientX, y: e.clientY });
        }}
      />

      {/* Real-time Collaborative Comment Pins & Threaded Discussions Overlay */}
      {!isPresentationMode && (
        <CommentPinsOverlay
          camera={camera}
          commentThreads={commentThreads}
          activeThreadId={activeCommentThreadId}
          onSelectThread={setActiveCommentThreadId}
          onAddReply={addCommentReply}
          onToggleResolve={toggleResolveCommentThread}
          onDeleteThread={deleteCommentThread}
          pendingPinPos={pendingPinPos}
          onConfirmPendingPin={handleCreateCommentThread}
          onCancelPendingPin={() => {
            setPendingPinPos(null);
            setActiveTool('select');
          }}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatar}
        />
      )}

      {/* Context-Aware Next-Step Autocomplete Overlay */}
      {!isPresentationMode && selectedObjects.length === 1 && (
        <NextStepSuggestionsOverlay
          selectedObject={selectedObjects[0]}
          camera={camera}
          boardId={boardId}
          existingCount={objects.length}
          onAddObjects={handleAddObjects}
          onSelectNewNode={(id) => setSelectedIds([id])}
        />
      )}

      {/* Viewport Minimap */}
      {!isPresentationMode && (
        <Minimap
          camera={camera}
          onZoomIn={() => {
            camera.setZoom(camera.zoom * 1.2);
            handleCameraChange();
          }}
          onZoomOut={() => {
            camera.setZoom(camera.zoom / 1.2);
            handleCameraChange();
          }}
          onResetZoom={() => {
            camera.x = 0;
            camera.y = 0;
            camera.setZoom(1);
            handleCameraChange();
          }}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />
      )}

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
