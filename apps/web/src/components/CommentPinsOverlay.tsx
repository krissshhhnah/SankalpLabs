import React, { useState, useRef, useEffect } from 'react';
import { Camera } from '@whiteboard/canvas-engine';
import { BoardCommentThread } from '@whiteboard/shared';
import {
  MessageSquare,
  Check,
  Send,
  X,
  Trash2,
  CornerDownRight,
  RotateCcw,
} from 'lucide-react';

interface CommentPinsOverlayProps {
  commentThreads: BoardCommentThread[];
  camera: Camera;
  activeThreadId: string | null;
  onSelectThread: (id: string | null) => void;
  onAddReply: (threadId: string, text: string) => void;
  onToggleResolve: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  pendingPinPos: { x: number; y: number } | null;
  onConfirmPendingPin: (text: string) => void;
  onCancelPendingPin: () => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
}

export const CommentPinsOverlay: React.FC<CommentPinsOverlayProps> = ({
  commentThreads,
  camera,
  activeThreadId,
  onSelectThread,
  onAddReply,
  onToggleResolve,
  onDeleteThread,
  pendingPinPos,
  onConfirmPendingPin,
  onCancelPendingPin,
  currentUserName = 'You',
}) => {
  const [replyInput, setReplyInput] = useState('');
  const [newCommentInput, setNewCommentInput] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const newPinCardRef = useRef<HTMLDivElement>(null);

  const activeThread = commentThreads.find((t) => t.id === activeThreadId);

  // Format relative timestamp
  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Close thread card on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingPinPos) {
          onCancelPendingPin();
          setNewCommentInput('');
        } else if (activeThreadId) {
          onSelectThread(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeThreadId, pendingPinPos, onCancelPendingPin, onSelectThread]);

  const handleSendReply = () => {
    if (!replyInput.trim() || !activeThreadId) return;
    onAddReply(activeThreadId, replyInput.trim());
    setReplyInput('');
  };

  const handlePostNewComment = () => {
    if (!newCommentInput.trim()) return;
    onConfirmPendingPin(newCommentInput.trim());
    setNewCommentInput('');
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* ── Render all spatial comment pins on the canvas ── */}
      {commentThreads.map((thread) => {
        const screenPos = camera.worldToScreen({ x: thread.x, y: thread.y });
        const isActive = thread.id === activeThreadId;
        const totalReplies = thread.replies?.length || 0;

        return (
          <div
            key={thread.id}
            style={{
              transform: `translate(${screenPos.x}px, ${screenPos.y}px)`,
            }}
            className="absolute left-0 top-0 pointer-events-auto transition-transform duration-75"
          >
            {/* The Pin Bubble */}
            <button
              onClick={() => onSelectThread(isActive ? null : thread.id)}
              title={`${thread.authorName}: ${thread.text}`}
              className={`relative -translate-x-1/2 -translate-y-full mb-1 flex items-center justify-center transition group shadow-lg ${
                thread.resolved ? 'opacity-60 hover:opacity-100' : 'opacity-100'
              }`}
            >
              {/* Pin Head */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 transition-all ${
                  isActive
                    ? 'bg-blue-600 border-white text-white scale-110 ring-4 ring-blue-400/40'
                    : thread.resolved
                    ? 'bg-emerald-600 border-white text-white'
                    : 'bg-white border-blue-600 text-blue-700 hover:scale-110'
                }`}
              >
                {thread.resolved ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : thread.authorAvatar ? (
                  <img
                    src={thread.authorAvatar}
                    alt={thread.authorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{thread.authorName.slice(0, 1).toUpperCase()}</span>
                )}
              </div>

              {/* Pin Downward Teardrop Stem */}
              <div
                className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] absolute -bottom-1 left-1/2 -translate-x-1/2 ${
                  isActive
                    ? 'border-t-blue-600'
                    : thread.resolved
                    ? 'border-t-emerald-600'
                    : 'border-t-blue-600'
                }`}
              />

              {/* Reply count badge */}
              {totalReplies > 0 && !thread.resolved && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-bold shadow-sm">
                  {totalReplies}
                </span>
              )}
            </button>
          </div>
        );
      })}

      {/* ── Active Thread Discussion Card Popover ── */}
      {activeThread && (() => {
        const screenPos = camera.worldToScreen({ x: activeThread.x, y: activeThread.y });

        return (
          <div
            ref={popoverRef}
            style={{
              left: `${Math.min(window.innerWidth - 340, Math.max(20, screenPos.x + 20))}px`,
              top: `${Math.min(window.innerHeight - 420, Math.max(70, screenPos.y - 40))}px`,
            }}
            className="absolute pointer-events-auto w-80 bg-white/95 backdrop-blur border border-slate-200/90 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800"
          >
            {/* Header: Author & Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {activeThread.authorAvatar ? (
                    <img src={activeThread.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    activeThread.authorName.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {activeThread.authorName}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {formatTime(activeThread.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Resolve / Reopen Button */}
                <button
                  onClick={() => onToggleResolve(activeThread.id)}
                  title={activeThread.resolved ? 'Reopen Thread' : 'Resolve Thread'}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
                    activeThread.resolved
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {activeThread.resolved ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reopen</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Resolve</span>
                    </>
                  )}
                </button>

                {/* Delete button */}
                <button
                  onClick={() => {
                    onDeleteThread(activeThread.id);
                    onSelectThread(null);
                  }}
                  title="Delete Thread"
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Close popover */}
                <button
                  onClick={() => onSelectThread(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Resolved Notice Banner if resolved */}
            {activeThread.resolved && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-medium text-emerald-800">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Marked as resolved {activeThread.resolvedBy ? `by ${activeThread.resolvedBy}` : ''}</span>
              </div>
            )}

            {/* Thread Original Comment */}
            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
              {activeThread.text}
            </p>

            {/* Replies List */}
            {activeThread.replies && activeThread.replies.length > 0 && (
              <div className="border-t border-slate-100 pt-2.5 space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {activeThread.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {reply.authorName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="font-semibold text-slate-800">{reply.authorName}</span>
                        <span className="text-slate-400">{formatTime(reply.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-normal">
                        {reply.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input Bar */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Reply to thread..."
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyInput.trim()}
                title="Send Reply (Enter)"
                className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Pending Pin Composer (When user clicks on canvas to drop a new comment) ── */}
      {pendingPinPos && (() => {
        const screenPos = camera.worldToScreen({ x: pendingPinPos.x, y: pendingPinPos.y });

        return (
          <>
            {/* The Pulsing Marker */}
            <div
              style={{
                transform: `translate(${screenPos.x}px, ${screenPos.y}px)`,
              }}
              className="absolute left-0 top-0 pointer-events-auto"
            >
              <div className="relative -translate-x-1/2 -translate-y-full mb-1 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-xl animate-bounce">
                  <MessageSquare className="w-4 h-4 fill-white" />
                </div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-blue-600 absolute -bottom-1 left-1/2 -translate-x-1/2" />
              </div>
            </div>

            {/* The New Thread Composer Card */}
            <div
              ref={newPinCardRef}
              style={{
                left: `${Math.min(window.innerWidth - 340, Math.max(20, screenPos.x + 20))}px`,
                top: `${Math.min(window.innerHeight - 250, Math.max(70, screenPos.y - 40))}px`,
              }}
              className="absolute pointer-events-auto w-80 bg-white/95 backdrop-blur border border-slate-200/90 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>New Comment Thread</span>
                </div>
                <button
                  onClick={onCancelPendingPin}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                autoFocus
                rows={3}
                placeholder="Leave feedback or a note here..."
                value={newCommentInput}
                onChange={(e) => setNewCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                    e.preventDefault();
                    handlePostNewComment();
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white resize-none transition"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  Press Enter to submit
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onCancelPendingPin}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostNewComment}
                    disabled={!newCommentInput.trim()}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    <span>Post</span>
                    <CornerDownRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};
