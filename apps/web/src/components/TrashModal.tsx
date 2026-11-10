import React, { useState, useEffect } from 'react';
import { BoardSummary } from '@whiteboard/shared';
import { X, Trash2, RefreshCw, AlertCircle } from 'lucide-react';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreBoard?: (board: BoardSummary) => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({ isOpen, onClose, onRestoreBoard }) => {
  const [deletedBoards, setDeletedBoards] = useState<BoardSummary[]>([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const trashStr = localStorage.getItem('wb_trash_boards');
        if (trashStr) {
          setDeletedBoards(JSON.parse(trashStr));
        } else {
          // Initialize sample deleted boards if empty
          const sampleTrash: BoardSummary[] = [
            {
              id: 'trash-1',
              name: 'Draft Roadmap 2025',
              ownerId: 'user-demo',
              ownerName: 'Krishnendu Prasanth',
              role: 'OWNER',
              createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
              updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
            {
              id: 'trash-2',
              name: 'Brainstorming - Product V2',
              ownerId: 'user-demo',
              ownerName: 'Krishnendu Prasanth',
              role: 'OWNER',
              createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
              updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
            },
          ];
          localStorage.setItem('wb_trash_boards', JSON.stringify(sampleTrash));
          setDeletedBoards(sampleTrash);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRestore = (board: BoardSummary) => {
    const updatedTrash = deletedBoards.filter((b) => b.id !== board.id);
    setDeletedBoards(updatedTrash);
    localStorage.setItem('wb_trash_boards', JSON.stringify(updatedTrash));

    // Add back to recents
    try {
      const recentsStr = localStorage.getItem('wb_recent_boards');
      const recents: BoardSummary[] = recentsStr ? JSON.parse(recentsStr) : [];
      const updatedRecents = [board, ...recents.filter((b) => b.id !== board.id)];
      localStorage.setItem('wb_recent_boards', JSON.stringify(updatedRecents));
    } catch (e) {
      console.error(e);
    }

    if (onRestoreBoard) onRestoreBoard(board);
  };

  const handlePermanentDelete = (id: string) => {
    const updatedTrash = deletedBoards.filter((b) => b.id !== id);
    setDeletedBoards(updatedTrash);
    localStorage.setItem('wb_trash_boards', JSON.stringify(updatedTrash));
  };

  const handleEmptyTrash = () => {
    setDeletedBoards([]);
    localStorage.setItem('wb_trash_boards', JSON.stringify([]));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] select-none">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Trash</h3>
              <p className="text-xs text-slate-400">Items in trash are stored for 30 days before permanent removal</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {deletedBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-medium">Trash is empty</p>
            </div>
          ) : (
            deletedBoards.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-slate-800">{b.name}</span>
                  <span className="text-[10px] text-slate-400">
                    Deleted on {new Date(b.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(b)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(b.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl transition"
                    title="Delete Forever"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {deletedBoards.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={handleEmptyTrash}
              className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
            >
              Empty Trash Now
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
